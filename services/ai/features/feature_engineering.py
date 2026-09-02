"""
Módulo de Ingeniería de Características (Feature Engineering)
Construye el dataset analítico con variables dinámicas temporales,
ventanas móviles de fallas y la variable objetivo para Machine Learning.
"""
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from CeroFallasAI.config import (
    DATA_DIR,
    DATASET_ANALITICO_CSV,
    HORIZONTE_PREDICCION_DIAS,
    VENTANAS_ROLLING_DIAS
)

class FeatureEngineer:
    def __init__(self):
        self.corr_path = DATA_DIR / "clean_correctivos.csv"
        self.prev_path = DATA_DIR / "clean_preventivos.csv"

    def construir_panel_temporal(self) -> pd.DataFrame:
        """Crea un panel temporal diario por equipo y línea."""
        if not self.corr_path.exists() or not self.prev_path.exists():
            raise FileNotFoundError("Primero debe ejecutar la extracción y limpieza de datos.")

        df_corr = pd.read_csv(self.corr_path)
        df_prev = pd.read_csv(self.prev_path)

        df_corr["fecha"] = pd.to_datetime(df_corr["fecha"])
        df_prev["fecha"] = pd.to_datetime(df_prev["fecha"])

        min_date = min(df_corr["fecha"].min(), df_prev["fecha"].min())
        max_date = max(df_corr["fecha"].max(), df_prev["fecha"].max())

        equipos_lineas = df_corr[["linea", "equipo"]].drop_duplicates().to_dict(orient="records")
        if not equipos_lineas:
            equipos_lineas = df_prev[["linea", "equipo"]].drop_duplicates().to_dict(orient="records")

        fechas_rango = pd.date_range(start=min_date, end=max_date, freq="D")
        filas_panel = []

        print(f"[INFO] Procesando serie temporal panel ({len(equipos_lineas)} equipos x {len(fechas_rango)} dias)...")

        for el in equipos_lineas:
            linea = el["linea"]
            equipo = el["equipo"]

            corr_eq = df_corr[(df_corr["linea"] == linea) & (df_corr["equipo"] == equipo)].sort_values("fecha")
            prev_eq = df_prev[(df_prev["linea"] == linea) & (df_prev["equipo"] == equipo)].sort_values("fecha")

            corr_fechas = set(corr_eq["fecha"].dt.normalize())
            prev_fechas = set(prev_eq["fecha"].dt.normalize())
            
            corr_min_map = corr_eq.groupby(corr_eq["fecha"].dt.normalize())["minutos_paro"].sum().to_dict()

            corr_fechas_list = sorted(list(corr_fechas))
            prev_fechas_list = sorted(list(prev_fechas))

            for fecha_actual in fechas_rango:
                fecha_norm = fecha_actual.normalize()

                if (fecha_norm - min_date).days < 30:
                    continue

                prev_anteriores = [f for f in prev_fechas_list if f <= fecha_norm]
                dias_ultimo_prev = (fecha_norm - prev_anteriores[-1]).days if prev_anteriores else 90

                corr_anteriores = [f for f in corr_fechas_list if f <= fecha_norm]
                dias_ultimo_corr = (fecha_norm - corr_anteriores[-1]).days if corr_anteriores else 90

                fallas_7d = sum(1 for f in corr_anteriores if 0 <= (fecha_norm - f).days <= 7)
                fallas_15d = sum(1 for f in corr_anteriores if 0 <= (fecha_norm - f).days <= 15)
                fallas_30d = sum(1 for f in corr_anteriores if 0 <= (fecha_norm - f).days <= 30)
                fallas_60d = sum(1 for f in corr_anteriores if 0 <= (fecha_norm - f).days <= 60)

                minutos_paro_30d = sum(
                    corr_min_map.get(f, 0.0) for f in corr_anteriores if 0 <= (fecha_norm - f).days <= 30
                )

                prev_60d = sum(1 for f in prev_anteriores if 0 <= (fecha_norm - f).days <= 60)

                ritmo_mensual = (fallas_30d / 4.0) + 0.1
                ratio_aceleracion = fallas_7d / ritmo_mensual
                ratio_proteccion = prev_60d / (fallas_60d + 1.0)

                fecha_limite_futura = fecha_norm + timedelta(days=HORIZONTE_PREDICCION_DIAS)
                if fecha_limite_futura > max_date:
                    continue

                falla_futura = any(fecha_norm < f <= fecha_limite_futura for f in corr_fechas_list)
                target_y = 1 if falla_futura else 0

                filas_panel.append({
                    "fecha": fecha_norm.strftime("%Y-%m-%d"),
                    "linea": linea,
                    "equipo": equipo,
                    "dias_desde_ultimo_prev": dias_ultimo_prev,
                    "dias_desde_ultimo_corr": dias_ultimo_corr,
                    "fallas_ultimos_7d": fallas_7d,
                    "fallas_ultimos_15d": fallas_15d,
                    "fallas_ultimos_30d": fallas_30d,
                    "fallas_ultimos_60d": fallas_60d,
                    "minutos_paro_ultimos_30d": round(minutos_paro_30d, 1),
                    "preventivos_ultimos_60d": prev_60d,
                    "ratio_aceleracion_fallas": round(ratio_aceleracion, 2),
                    "ratio_proteccion_prev": round(ratio_proteccion, 2),
                    "dia_semana": fecha_norm.weekday(),
                    "mes": fecha_norm.month,
                    "target_falla_7d": target_y
                })

        df_panel = pd.DataFrame(filas_panel)
        df_panel.to_csv(DATASET_ANALITICO_CSV, index=False, encoding="utf-8")
        
        balance_y = df_panel["target_falla_7d"].value_counts(normalize=True).to_dict()
        print(f"[OK] Dataset analitico generado con {len(df_panel)} observaciones.")
        print(f"[DISTRIBUCION Y] Falla en 7d: {balance_y}")
        return df_panel

if __name__ == "__main__":
    fe = FeatureEngineer()
    df = fe.construir_panel_temporal()
