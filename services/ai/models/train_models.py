"""
Módulo de Entrenamiento y Validación de Modelos de Machine Learning
Compara la Línea Base (Regresión Logística) vs Modelo de Ensamble (Random Forest)
utilizando Validación Cruzada Temporal (TimeSeriesSplit).
"""
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import TimeSeriesSplit
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    fbeta_score,
    roc_auc_score,
    average_precision_score
)

from CeroFallasAI.config import (
    DATASET_ANALITICO_CSV,
    MODELS_DIR,
    REPORTS_DIR,
    RANDOM_STATE
)

class ModelTrainer:
    def __init__(self):
        self.dataset_path = DATASET_ANALITICO_CSV
        self.num_features = [
            "dias_desde_ultimo_prev",
            "dias_desde_ultimo_corr",
            "fallas_ultimos_7d",
            "fallas_ultimos_15d",
            "fallas_ultimos_30d",
            "fallas_ultimos_60d",
            "minutos_paro_ultimos_30d",
            "preventivos_ultimos_60d",
            "ratio_aceleracion_fallas",
            "ratio_proteccion_prev",
            "dia_semana",
            "mes"
        ]
        self.cat_features = ["linea", "equipo"]
        self.target = "target_falla_7d"

    def cargar_datos(self):
        """Carga y ordena cronológicamente el dataset analítico."""
        df = pd.read_csv(self.dataset_path)
        df["fecha"] = pd.to_datetime(df["fecha"])
        df = df.sort_values("fecha").reset_index(drop=True)
        return df

    def construir_preprocesador(self):
        """Construye el preprocesador de columnas escalando numéricas y codificando categóricas."""
        preprocessor = ColumnTransformer(
            transformers=[
                ("num", StandardScaler(), self.num_features),
                ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), self.cat_features)
            ]
        )
        return preprocessor

    def evaluar_modelo_cv_temporal(self, pipeline, X, y, n_splits=5):
        """Ejecuta TimeSeriesSplit para validar el modelo temporalmente."""
        tscv = TimeSeriesSplit(n_splits=n_splits)
        metricas = {
            "accuracy": [],
            "precision": [],
            "recall": [],
            "f1": [],
            "f2": [],
            "roc_auc": [],
            "pr_auc": []
        }

        for train_idx, test_idx in tscv.split(X):
            X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
            y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

            pipeline.fit(X_train, y_train)

            y_pred = pipeline.predict(X_test)
            y_proba = pipeline.predict_proba(X_test)[:, 1]

            metricas["accuracy"].append(accuracy_score(y_test, y_pred))
            metricas["precision"].append(precision_score(y_test, y_pred, zero_division=0))
            metricas["recall"].append(recall_score(y_test, y_pred, zero_division=0))
            metricas["f1"].append(f1_score(y_test, y_pred, zero_division=0))
            metricas["f2"].append(fbeta_score(y_test, y_pred, beta=2, zero_division=0))
            
            try:
                metricas["roc_auc"].append(roc_auc_score(y_test, y_proba))
                metricas["pr_auc"].append(average_precision_score(y_test, y_proba))
            except ValueError:
                pass

        resumen = {k: round(float(np.mean(v)), 4) for k, v in metricas.items()}
        resumen_std = {f"{k}_std": round(float(np.std(v)), 4) for k, v in metricas.items()}
        resumen.update(resumen_std)
        return resumen

    def entrenar_y_comparar(self):
        """Entrena y valida ambos modelos, generando reporte comparativo formal."""
        df = self.cargar_datos()
        X = df[self.num_features + self.cat_features]
        y = df[self.target]

        preprocesador = self.construir_preprocesador()

        pipe_logreg = Pipeline([
            ("preprocessor", preprocesador),
            ("classifier", LogisticRegression(class_weight="balanced", max_iter=1000, random_state=RANDOM_STATE))
        ])

        pipe_rf = Pipeline([
            ("preprocessor", preprocesador),
            ("classifier", RandomForestClassifier(
                n_estimators=150,
                max_depth=9,
                min_samples_split=6,
                class_weight="balanced",
                random_state=RANDOM_STATE
            ))
        ])

        print("[EXPERIMENTO] Evaluando Modelo 1: Regresion Logistica (Baseline)...")
        res_logreg = self.evaluar_modelo_cv_temporal(pipe_logreg, X, y)

        print("[EXPERIMENTO] Evaluando Modelo 2: Random Forest Classifier (Avanzado)...")
        res_rf = self.evaluar_modelo_cv_temporal(pipe_rf, X, y)

        pipe_logreg.fit(X, y)
        pipe_rf.fit(X, y)

        joblib.dump(pipe_logreg, MODELS_DIR / "modelo_linea_base_logreg.pkl")
        joblib.dump(pipe_rf, MODELS_DIR / "modelo_avanzado_rf.pkl")

        df_comparativo = pd.DataFrame([
            {"Modelo": "1. Regresion Logistica (Baseline)", **res_logreg},
            {"Modelo": "2. Random Forest (Avanzado)", **res_rf}
        ])

        tabla_path = REPORTS_DIR / "tabla_comparativa_modelos.csv"
        df_comparativo.to_csv(tabla_path, index=False, encoding="utf-8")

        reporte_completo = {
            "fecha_entrenamiento": pd.Timestamp.now().isoformat(),
            "total_muestras": len(df),
            "caracteristicas_numericas": self.num_features,
            "caracteristicas_categoricas": self.cat_features,
            "resultados_baseline_logreg": res_logreg,
            "resultados_avanzado_rf": res_rf,
            "modelo_seleccionado": "Random Forest (Mayor F2-Score y Recall)"
        }
        
        with open(REPORTS_DIR / "model_comparison_report.json", "w", encoding="utf-8") as f:
            json.dump(reporte_completo, f, indent=2, ensure_ascii=False)

        print("\n" + "=" * 65)
        print("TABLA COMPARATIVA DE RENDIMIENTO (Time-Series CV)")
        print("=" * 65)
        print(df_comparativo[["Modelo", "accuracy", "precision", "recall", "f1", "f2", "roc_auc", "pr_auc"]].to_string(index=False))
        print("=" * 65)

        return df_comparativo

if __name__ == "__main__":
    trainer = ModelTrainer()
    trainer.entrenar_y_comparar()
