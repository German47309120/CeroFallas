"""
Módulo de Despliegue e Inferencia en Producción (MLOps)
Calcula el Score de Riesgo de Falla actualizado por equipo,
sincroniza con Firebase y genera el dataset para Power BI.
"""
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import json
import joblib
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from CeroFallasAI.config import (
    DATA_DIR,
    MODELS_DIR,
    FIREBASE_CONFIG,
    POWERBI_EXPORT_CSV,
    UMBRAL_RIESGO_BAJO,
    UMBRAL_RIESGO_MEDIO,
    EQUIPOS_CANONICOS
)

RECOMENDACIONES_EQUIPOS = {
    "BATIDORA": {
        "CRITICO": "Riesgo Critico: Inspeccion urgente de sellos mecanicos, eje principal y nivel de aceite de reductor antes del proximo turno.",
        "MEDIO": "Riesgo Medio: Verificar lubricacion de chumaceras y ajustar tension de correas motrices en la siguiente parada programada.",
        "BAJO": "Operacion Normal: Mantener plan de lubricacion estandar."
    },
    "SILO": {
        "CRITICO": "Riesgo Critico: Revisar sensor de nivel, valvula rotativa de descarga y filtro de mangas por posible obstruccion.",
        "MEDIO": "Riesgo Medio: Limpieza de compuertas y comprobacion de estanqueidad de empaques.",
        "BAJO": "Operacion Normal: Parametros de presion dentro de tolerancia."
    },
    "SUPERMIX": {
        "CRITICO": "Riesgo Critico: Alta vibracion detectada. Calibrar balanceo dinamico de paletas y chequear torque de tornillos prisioneros.",
        "MEDIO": "Riesgo Medio: Engrase preventivo de rodamientos de apoyo y revision de sellos de estanqueidad.",
        "BAJO": "Operacion Normal: Condicion de mezcla optima."
    },
    "PRENSA": {
        "CRITICO": "Riesgo Critico: Fuga de presion hidraulica inminente. Revisar pistones principales, mangueras de alta presion y servo-valvula.",
        "MEDIO": "Riesgo Medio: Purgar circuito hidraulico y verificar temperatura del fluido en tanque.",
        "BAJO": "Operacion Normal: Fuerza de prensado nominal estable."
    },
    "FILTRACION": {
        "CRITICO": "Riesgo Critico: Caida de presion critica en manifold. Reemplazo inmediato de elementos filtrantes y retrolavado.",
        "MEDIO": "Riesgo Medio: Medir diferencial de presion y programar cambio de cartuchos.",
        "BAJO": "Operacion Normal: Flujo y turbidez conformes."
    },
    "EXEL": {
        "CRITICO": "Riesgo Critico: Desalineacion en guias mecanicas. Calibracion inmediata y revision de guias lineales.",
        "MEDIO": "Riesgo Medio: Limpieza y engrase de husillos y sensores inductivos.",
        "BAJO": "Operacion Normal: Desplazamiento suave y sin juego."
    }
}

class RiskPredictorAndSync:
    def __init__(self, id_token: str = None):
        self.model_path = MODELS_DIR / "modelo_avanzado_rf.pkl"
        self.corr_path = DATA_DIR / "clean_correctivos.csv"
        self.prev_path = DATA_DIR / "clean_preventivos.csv"
        self.db_url = FIREBASE_CONFIG["databaseURL"].rstrip("/")
        self.id_token = id_token

    def obtener_estado_actual_equipos(self) -> pd.DataFrame:
        df_corr = pd.read_csv(self.corr_path)
        df_prev = pd.read_csv(self.prev_path)
        df_corr["fecha"] = pd.to_datetime(df_corr["fecha"])
        df_prev["fecha"] = pd.to_datetime(df_prev["fecha"])

        fecha_hoy = pd.Timestamp.now().normalize()
        lineas = ["LINEA_1", "LINEA_2", "LINEA_3", "LINEA_4"]
        
        filas = []
        for linea in lineas:
            for equipo in EQUIPOS_CANONICOS:
                corr_eq = df_corr[(df_corr["linea"] == linea) & (df_corr["equipo"] == equipo)].sort_values("fecha")
                prev_eq = df_prev[(df_prev["linea"] == linea) & (df_prev["equipo"] == equipo)].sort_values("fecha")

                corr_fechas = [f.normalize() for f in corr_eq["fecha"]]
                prev_fechas = [f.normalize() for f in prev_eq["fecha"]]

                dias_ultimo_prev = (fecha_hoy - prev_fechas[-1]).days if prev_fechas else 90
                dias_ultimo_corr = (fecha_hoy - corr_fechas[-1]).days if corr_fechas else 90

                fallas_7d = sum(1 for f in corr_fechas if 0 <= (fecha_hoy - f).days <= 7)
                fallas_15d = sum(1 for f in corr_fechas if 0 <= (fecha_hoy - f).days <= 15)
                fallas_30d = sum(1 for f in corr_fechas if 0 <= (fecha_hoy - f).days <= 30)
                fallas_60d = sum(1 for f in corr_fechas if 0 <= (fecha_hoy - f).days <= 60)

                corr_30d_df = corr_eq[corr_eq["fecha"] >= (fecha_hoy - pd.Timedelta(days=30))]
                minutos_30d = corr_30d_df["minutos_paro"].sum() if not corr_30d_df.empty else 0.0

                prev_60d = sum(1 for f in prev_fechas if 0 <= (fecha_hoy - f).days <= 60)

                ritmo_mensual = (fallas_30d / 4.0) + 0.1
                ratio_aceleracion = fallas_7d / ritmo_mensual
                ratio_proteccion = prev_60d / (fallas_60d + 1.0)

                filas.append({
                    "linea": linea,
                    "equipo": equipo,
                    "fecha_evaluacion": fecha_hoy.strftime("%Y-%m-%d"),
                    "dias_desde_ultimo_prev": dias_ultimo_prev,
                    "dias_desde_ultimo_corr": dias_ultimo_corr,
                    "fallas_ultimos_7d": fallas_7d,
                    "fallas_ultimos_15d": fallas_15d,
                    "fallas_ultimos_30d": fallas_30d,
                    "fallas_ultimos_60d": fallas_60d,
                    "minutos_paro_ultimos_30d": round(minutos_30d, 1),
                    "preventivos_ultimos_60d": prev_60d,
                    "ratio_aceleracion_fallas": round(ratio_aceleracion, 2),
                    "ratio_proteccion_prev": round(ratio_proteccion, 2),
                    "dia_semana": fecha_hoy.weekday(),
                    "mes": fecha_hoy.month
                })

        return pd.DataFrame(filas)

    def ejecutar_inferencia_y_sincronizar(self) -> pd.DataFrame:
        if not self.model_path.exists():
            raise FileNotFoundError("El modelo entrenado no existe. Ejecute train_models.py primero.")

        model = joblib.load(self.model_path)
        df_estado = self.obtener_estado_actual_equipos()

        num_features = [
            "dias_desde_ultimo_prev", "dias_desde_ultimo_corr", "fallas_ultimos_7d",
            "fallas_ultimos_15d", "fallas_ultimos_30d", "fallas_ultimos_60d",
            "minutos_paro_ultimos_30d", "preventivos_ultimos_60d",
            "ratio_aceleracion_fallas", "ratio_proteccion_prev",
            "dia_semana", "mes"
        ]
        cat_features = ["linea", "equipo"]

        X = df_estado[num_features + cat_features]
        probas = model.predict_proba(X)[:, 1]

        resultados = []
        payload_firebase = {}

        for idx, row in df_estado.iterrows():
            prob = float(probas[idx])
            risk_score_pct = round(prob * 100.0, 1)

            if prob >= UMBRAL_RIESGO_MEDIO:
                nivel_riesgo = "CRITICO"
                semaforo = "ROJO"
            elif prob >= UMBRAL_RIESGO_BAJO:
                nivel_riesgo = "MEDIO"
                semaforo = "AMARILLO"
            else:
                nivel_riesgo = "BAJO"
                semaforo = "VERDE"

            recom_map = RECOMENDACIONES_EQUIPOS.get(row["equipo"], {})
            recomendacion = recom_map.get(
                nivel_riesgo,
                f"Inspeccion preventiva programada para {row['equipo']} segun plan de mantenimiento."
            )

            res_item = {
                "Linea": row["linea"],
                "Equipo": row["equipo"],
                "Probabilidad_Falla_7d": round(prob, 4),
                "Score_Riesgo_Pct": risk_score_pct,
                "Nivel_Riesgo": nivel_riesgo,
                "Semaforo": semaforo,
                "Dias_Sin_Preventivo": row["dias_desde_ultimo_prev"],
                "Dias_Sin_Falla": row["dias_desde_ultimo_corr"],
                "Fallas_30d": row["fallas_ultimos_30d"],
                "Minutos_Paro_30d": row["minutos_paro_ultimos_30d"],
                "Recomendacion_Prescriptiva": recomendacion,
                "Fecha_Actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            resultados.append(res_item)

            if row["linea"] not in payload_firebase:
                payload_firebase[row["linea"]] = {}
            payload_firebase[row["linea"]][row["equipo"]] = res_item

        df_salida = pd.DataFrame(resultados)
        
        df_salida.to_csv(POWERBI_EXPORT_CSV, index=False, encoding="utf-8")
        print(f"[OK] Dataset para Power BI exportado: {POWERBI_EXPORT_CSV.name}")

        with open(DATA_DIR / "ultimas_predicciones_riesgo.json", "w", encoding="utf-8") as f:
            json.dump(payload_firebase, f, indent=2, ensure_ascii=False)

        self._sincronizar_firebase(payload_firebase)

        return df_salida

    def _sincronizar_firebase(self, payload: dict):
        url = f"{self.db_url}/PREDICCIONES_RIESGO.json"
        params = {}
        if self.id_token:
            params["auth"] = self.id_token

        try:
            resp = requests.put(url, json=payload, params=params, timeout=5)
            if resp.status_code == 200:
                print("[OK] Sincronizacion exitosa con Firebase: nodo /PREDICCIONES_RIESGO actualizado.")
            elif resp.status_code == 401:
                print("[INFO] Firebase requiere token de autenticacion. Datos guardados en buffer local y Power BI CSV.")
            else:
                print(f"[WARN] Firebase respondio con codigo {resp.status_code}")
        except Exception as e:
            print(f"[INFO] Conexion remota a Firebase omitida ({e}). Los resultados estan listos en Power BI CSV.")

if __name__ == "__main__":
    sync = RiskPredictorAndSync()
    df_res = sync.ejecutar_inferencia_y_sincronizar()
