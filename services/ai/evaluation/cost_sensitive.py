"""
Módulo de Evaluación Costo-Sensible e Impacto Operacional
Cuantifica el Retorno de Inversión (ROI) y ahorro económico comparando
el Mantenimiento Reactivo, Preventivo Tradicional y Predictivo CeroFallas AI.
"""
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix

from CeroFallasAI.config import (
    DATASET_ANALITICO_CSV,
    MODELS_DIR,
    REPORTS_DIR,
    COSTO_FALSO_POSITIVO,
    COSTO_FALSO_NEGATIVO,
    COSTO_VERDADERO_POSITIVO,
    COSTO_VERDADERO_NEGATIVO
)

class CostSensitiveEvaluator:
    def __init__(self):
        self.dataset_path = DATASET_ANALITICO_CSV
        self.model_path = MODELS_DIR / "modelo_avanzado_rf.pkl"

    def evaluar_politicas_mantenimiento(self):
        """Calcula los costos totales y ahorro económico de cada política de mantenimiento."""
        df = pd.read_csv(self.dataset_path)
        model = joblib.load(self.model_path)

        num_features = [
            "dias_desde_ultimo_prev", "dias_desde_ultimo_corr", "fallas_ultimos_7d",
            "fallas_ultimos_15d", "fallas_ultimos_30d", "fallas_ultimos_60d",
            "minutos_paro_ultimos_30d", "preventivos_ultimos_60d",
            "ratio_aceleracion_fallas", "ratio_proteccion_prev",
            "dia_semana", "mes"
        ]
        cat_features = ["linea", "equipo"]
        
        X = df[num_features + cat_features]
        y_true = df["target_falla_7d"].values
        y_pred = model.predict(X)
        y_proba = model.predict_proba(X)[:, 1]

        cm = confusion_matrix(y_true, y_pred)
        tn, fp, fn, tp = cm.ravel()

        total_eventos = len(y_true)
        total_fallas_reales = int(np.sum(y_true))

        # 1. Política Reactiva (Run to Fail)
        costo_reactivo = total_fallas_reales * COSTO_FALSO_NEGATIVO

        # 2. Política Preventiva Tradicional por Calendario
        num_equipos_unicos = df[["linea", "equipo"]].drop_duplicates().shape[0]
        costo_preventivo_rigido = (num_equipos_unicos * 24 * COSTO_FALSO_POSITIVO) + (0.35 * total_fallas_reales * COSTO_FALSO_NEGATIVO)

        # 3. Política CeroFallas AI (Predictivo)
        costo_cerofallas_ai = (tp * COSTO_VERDADERO_POSITIVO) + (fp * COSTO_FALSO_POSITIVO) + (fn * COSTO_FALSO_NEGATIVO) + (tn * COSTO_VERDADERO_NEGATIVO)

        ahorro_vs_reactivo = costo_reactivo - costo_cerofallas_ai
        pct_ahorro_vs_reactivo = (ahorro_vs_reactivo / costo_reactivo) * 100

        resumen_costos = {
            "Total_Observaciones_Evaluadas": int(total_eventos),
            "Fallas_Reales_Registradas": int(total_fallas_reales),
            "Verdaderos_Positivos_TP (Fallas Anticipadas)": int(tp),
            "Falsos_Positivos_FP (Alertas con Inspeccion OK)": int(fp),
            "Falsos_Negativos_FN (Fallas No Anticipadas)": int(fn),
            "Verdaderos_Negativos_TN (Operacion Normal)": int(tn),
            "Costo_Politica_Reactiva_USD": round(float(costo_reactivo), 2),
            "Costo_Preventivo_Calendario_USD": round(float(costo_preventivo_rigido), 2),
            "Costo_CeroFallas_AI_USD": round(float(costo_cerofallas_ai), 2),
            "Ahorro_Economico_Estimado_USD": round(float(ahorro_vs_reactivo), 2),
            "Porcentaje_Ahorro_Operativo": round(float(pct_ahorro_vs_reactivo), 2)
        }

        df_resumen = pd.DataFrame([resumen_costos])
        df_resumen.to_csv(REPORTS_DIR / "impacto_economico_mantenimiento.csv", index=False, encoding="utf-8")

        self._graficar_resultados(cm, resumen_costos, y_true, y_proba)

        print("\n" + "=" * 65)
        print("ANALISIS DE IMPACTO ECONOMICO Y OPERACIONAL")
        print("=" * 65)
        for k, v in resumen_costos.items():
            print(f" - {k}: {v}")
        print("=" * 65)

        return resumen_costos

    def _graficar_resultados(self, cm, resumen, y_true, y_proba):
        sns.set_theme(style="whitegrid")

        # 1. Matriz de Confusión
        fig, ax = plt.subplots(figsize=(6, 5))
        sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", cbar=False, ax=ax,
                    xticklabels=["Sin Falla (0)", "Falla (1)"],
                    yticklabels=["Sin Falla (0)", "Falla (1)"])
        ax.set_title("Matriz de Confusion: CeroFallas AI (Predictivo)", fontsize=12, fontweight="bold", pad=12)
        ax.set_xlabel("Prediccion del Modelo", fontsize=10)
        ax.set_ylabel("Condicion Real en Planta", fontsize=10)
        plt.tight_layout()
        fig.savefig(REPORTS_DIR / "matriz_confusion_predictivo.png", dpi=300)
        plt.close(fig)

        # 2. Gráfico de Comparación de Costos
        fig, ax = plt.subplots(figsize=(7, 4.5))
        politicas = ["1. Reactivo (Run-to-Fail)", "2. Preventivo Calendario", "3. CeroFallas AI"]
        costos = [
            resumen["Costo_Politica_Reactiva_USD"],
            resumen["Costo_Preventivo_Calendario_USD"],
            resumen["Costo_CeroFallas_AI_USD"]
        ]
        colores = ["#e74c3c", "#f39c12", "#27ae60"]
        barras = ax.bar(politicas, costos, color=colores, width=0.55, edgecolor="black", linewidth=0.8)
        
        for barra in barras:
            yval = barra.get_height()
            ax.text(barra.get_x() + barra.get_width()/2.0, yval + max(costos)*0.02,
                    f"${yval:,.0f} USD", ha='center', va='bottom', fontsize=9, fontweight='bold')

        ax.set_title("Comparacion de Costos Operativos Totales por Politica", fontsize=12, fontweight="bold", pad=12)
        ax.set_ylabel("Costo Total Estimado ($ USD)", fontsize=10)
        ax.set_ylim(0, max(costos) * 1.18)
        plt.tight_layout()
        fig.savefig(REPORTS_DIR / "comparativa_costos_mantenimiento.png", dpi=300)
        plt.close(fig)

        print(f"[OK] Graficos exportados para la memoria de grado en: {REPORTS_DIR}")

if __name__ == "__main__":
    evaluator = CostSensitiveEvaluator()
    evaluator.evaluar_politicas_mantenimiento()
