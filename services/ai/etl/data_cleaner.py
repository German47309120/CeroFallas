"""
Módulo de Limpieza y Estandarización de Datos
Calcula métricas clásicas de ingeniería de confiabilidad (MTBF, MTTR, Disponibilidad).
"""
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import json
import re
import pandas as pd
import numpy as np
from datetime import datetime
from CeroFallasAI.config import (
    DATA_DIR,
    EQUIPOS_CANONICOS
)

class CeroFallasCleaner:
    def __init__(self):
        self.raw_corr_path = DATA_DIR / "raw_correctivos.json"
        self.raw_prev_path = DATA_DIR / "raw_preventivos.json"

    def parsear_equipo(self, texto: str) -> str:
        """Estandariza el nombre del equipo a partir del texto ingresado en el formulario."""
        if not texto or not isinstance(texto, str):
            return "GENERAL"
        texto_norm = texto.upper()
        for eq in EQUIPOS_CANONICOS:
            if eq in texto_norm:
                return eq
        if "BATI" in texto_norm:
            return "BATIDORA"
        if "SILO" in texto_norm:
            return "SILO"
        if "MIX" in texto_norm:
            return "SUPERMIX"
        if "PRENS" in texto_norm:
            return "PRENSA"
        if "FILT" in texto_norm:
            return "FILTRACION"
        return "OTRO_EQUIPO"

    def normalizar_linea(self, nodo_nombre: str) -> str:
        """Convierte TIMEL1, PREVL1, etc. en formato canónico LINEA_1."""
        match = re.search(r'L(\d)', nodo_nombre.upper())
        if match:
            return f"LINEA_{match.group(1)}"
        if "ABAST" in nodo_nombre.upper():
            return "LINEA_ABASTECIMIENTO"
        if "AUTO" in nodo_nombre.upper():
            return "LINEA_AUTOMOTRIZ"
        return "LINEA_GENERAL"

    def procesar_correctivos(self) -> pd.DataFrame:
        """Carga, limpia y estructura todos los registros de correctivos."""
        if not self.raw_corr_path.exists():
            raise FileNotFoundError(f"No se encontró el archivo: {self.raw_corr_path}")

        with open(self.raw_corr_path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)

        registros = []
        for nodo, items in raw_data.items():
            linea = self.normalizar_linea(nodo)
            for record_id, data in items.items():
                if not isinstance(data, dict):
                    continue
                
                fecha_str = data.get("FECHA", "")
                falla_raw = data.get("FALLA", "")
                minutos_raw = data.get("MINUTOS", 0)
                turno_raw = data.get("TURNO", "1")
                tecnico = data.get("NOMBRE", "SIN_NOMBRE")
                descripcion = data.get("DESCRIPCION", "")
                
                try:
                    fecha_dt = pd.to_datetime(fecha_str, format="%d/%m/%Y")
                except Exception:
                    try:
                        fecha_dt = pd.to_datetime(fecha_str)
                    except Exception:
                        continue

                try:
                    minutos = float(minutos_raw)
                except (ValueError, TypeError):
                    minutos = 0.0

                equipo = self.parsear_equipo(falla_raw)

                registros.append({
                    "id": record_id,
                    "nodo_origen": nodo,
                    "linea": linea,
                    "equipo": equipo,
                    "fecha": fecha_dt,
                    "turno": str(turno_raw).strip(),
                    "falla_descripcion": falla_raw,
                    "detalle_tecnico": descripcion,
                    "minutos_paro": minutos,
                    "tecnico": tecnico,
                    "tipo_evento": "CORRECTIVO"
                })

        df_corr = pd.DataFrame(registros)
        if not df_corr.empty:
            df_corr = df_corr.sort_values(by=["linea", "equipo", "fecha"]).reset_index(drop=True)
        
        output_path = DATA_DIR / "clean_correctivos.csv"
        df_corr.to_csv(output_path, index=False, encoding="utf-8")
        print(f"[OK] Correctivos procesados: {len(df_corr)} registros guardados en {output_path.name}")
        return df_corr

    def procesar_preventivos(self) -> pd.DataFrame:
        """Carga, limpia y estructura todos los registros de preventivos."""
        if not self.raw_prev_path.exists():
            raise FileNotFoundError(f"No se encontró el archivo: {self.raw_prev_path}")

        with open(self.raw_prev_path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)

        registros = []
        for nodo, items in raw_data.items():
            linea = self.normalizar_linea(nodo)
            for record_id, data in items.items():
                if not isinstance(data, dict):
                    continue
                
                fecha_str = data.get("FECHA", "")
                mantto_raw = data.get("MANTTO", "")
                minutos_raw = data.get("MINUTOS", 0)
                turno_raw = data.get("TURNO", "1")
                tecnico = data.get("NOMBRE", "SIN_NOMBRE")
                descripcion = data.get("DESCRIPCION", "")
                
                try:
                    fecha_dt = pd.to_datetime(fecha_str, format="%d/%m/%Y")
                except Exception:
                    try:
                        fecha_dt = pd.to_datetime(fecha_str)
                    except Exception:
                        continue

                try:
                    minutos = float(minutos_raw)
                except (ValueError, TypeError):
                    minutos = 0.0

                equipo = self.parsear_equipo(mantto_raw)

                registros.append({
                    "id": record_id,
                    "nodo_origen": nodo,
                    "linea": linea,
                    "equipo": equipo,
                    "fecha": fecha_dt,
                    "turno": str(turno_raw).strip(),
                    "tipo_mantenimiento": mantto_raw,
                    "detalle_tecnico": descripcion,
                    "minutos_intervencion": minutos,
                    "tecnico": tecnico,
                    "tipo_evento": "PREVENTIVO"
                })

        df_prev = pd.DataFrame(registros)
        if not df_prev.empty:
            df_prev = df_prev.sort_values(by=["linea", "equipo", "fecha"]).reset_index(drop=True)
        
        output_path = DATA_DIR / "clean_preventivos.csv"
        df_prev.to_csv(output_path, index=False, encoding="utf-8")
        print(f"[OK] Preventivos procesados: {len(df_prev)} registros guardados en {output_path.name}")
        return df_prev

    def calcular_metricas_confiabilidad(self, df_corr: pd.DataFrame) -> pd.DataFrame:
        """Calcula MTTR, MTBF y Disponibilidad Operativa."""
        metricas = []
        grupos = df_corr.groupby(["linea", "equipo"])

        for (linea, equipo), grupo in grupos:
            num_fallas = len(grupo)
            total_horas_paro = grupo["minutos_paro"].sum() / 60.0
            
            min_fecha = grupo["fecha"].min()
            max_fecha = grupo["fecha"].max()
            dias_totales = max(1, (max_fecha - min_fecha).days)
            horas_totales_periodo = dias_totales * 16.0
            
            horas_operacion_neta = max(1.0, horas_totales_periodo - total_horas_paro)
            
            mttr = (total_horas_paro / num_fallas) if num_fallas > 0 else 0.0
            mtbf = (horas_operacion_neta / num_fallas) if num_fallas > 0 else horas_operacion_neta
            disponibilidad = (mtbf / (mtbf + mttr)) if (mtbf + mttr) > 0 else 1.0

            metricas.append({
                "linea": linea,
                "equipo": equipo,
                "total_fallas_registradas": num_fallas,
                "horas_totales_paro": round(total_horas_paro, 2),
                "dias_observacion": dias_totales,
                "MTTR_horas": round(mttr, 2),
                "MTBF_horas": round(mtbf, 2),
                "disponibilidad_operacional_pct": round(disponibilidad * 100, 2)
            })

        df_metricas = pd.DataFrame(metricas).sort_values(by=["linea", "disponibilidad_operacional_pct"])
        out_path = DATA_DIR / "resumen_confiabilidad_equipos.csv"
        df_metricas.to_csv(out_path, index=False, encoding="utf-8")
        print(f"[OK] Metricas de confiabilidad (MTBF, MTTR, Disp) guardadas en {out_path.name}")
        return df_metricas

if __name__ == "__main__":
    cleaner = CeroFallasCleaner()
    df_c = cleaner.procesar_correctivos()
    df_p = cleaner.procesar_preventivos()
    df_m = cleaner.calcular_metricas_confiabilidad(df_c)
