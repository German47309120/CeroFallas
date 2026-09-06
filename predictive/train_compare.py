from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, confusion_matrix, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from schema import CATEGORICAL_FEATURES, NUMERIC_FEATURES, TARGET, validate_records


def pipeline_for(model) -> Pipeline:
    transform = ColumnTransformer([
        ("numeric", Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), NUMERIC_FEATURES),
        ("categorical", Pipeline([("impute", SimpleImputer(strategy="most_frequent")), ("encode", OneHotEncoder(handle_unknown="ignore"))]), CATEGORICAL_FEATURES),
    ])
    return Pipeline([("features", transform), ("model", model)])


def metrics_for(model: Pipeline, features: pd.DataFrame, target: pd.Series) -> dict:
    probability = model.predict_proba(features)[:, 1]
    prediction = (probability >= 0.5).astype(int)
    return {
        "roc_auc": round(float(roc_auc_score(target, probability)), 4),
        "pr_auc": round(float(average_precision_score(target, probability)), 4),
        "precision": round(float(precision_score(target, prediction, zero_division=0)), 4),
        "recall": round(float(recall_score(target, prediction, zero_division=0)), 4),
        "f1": round(float(f1_score(target, prediction, zero_division=0)), 4),
        "confusion_matrix": confusion_matrix(target, prediction, labels=[0, 1]).tolist(),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Compara modelos con división temporal y sin afirmar validez productiva.")
    parser.add_argument("--input", default=".local/predictive-demo.csv")
    parser.add_argument("--output", default=".local/predictive-results.json")
    args = parser.parse_args()
    frame = pd.read_csv(args.input)
    issues = validate_records(frame.to_dict(orient="records"))
    if issues:
        raise SystemExit("Dataset inválido:\n- " + "\n- ".join(issues[:20]))
    frame["cutoff_date"] = pd.to_datetime(frame["cutoff_date"], errors="raise")
    frame = frame.sort_values(["cutoff_date", "record_id"]).reset_index(drop=True)
    boundary = int(len(frame) * 0.8)
    train, test = frame.iloc[:boundary], frame.iloc[boundary:]
    if train[TARGET].nunique() < 2 or test[TARGET].nunique() < 2:
        raise SystemExit("Entrenamiento y prueba requieren ambas clases.")
    feature_names = [*NUMERIC_FEATURES, *CATEGORICAL_FEATURES]
    candidates = {
        "logistic_regression": LogisticRegression(max_iter=1000, class_weight="balanced", random_state=20260905),
        "random_forest": RandomForestClassifier(n_estimators=250, min_samples_leaf=5, class_weight="balanced", random_state=20260905, n_jobs=-1),
    }
    results = {}
    for name, estimator in candidates.items():
        model = pipeline_for(estimator)
        model.fit(train[feature_names], train[TARGET])
        results[name] = metrics_for(model, test[feature_names], test[TARGET])
    winner = max(results, key=lambda name: results[name]["pr_auc"])
    report = {
        "status": "demonstration_only",
        "data_origin": sorted(frame["data_origin"].unique().tolist()),
        "warning": "Métricas sintéticas: no representan desempeño en Novafiber ni autorizan decisiones de mantenimiento.",
        "split": "temporal_80_20",
        "rows": {"total": len(frame), "train": len(train), "test": len(test)},
        "target_rate": round(float(frame[TARGET].mean()), 4),
        "selection_metric": "pr_auc",
        "best_demo_candidate": winner,
        "models": results,
    }
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Comparación sintética completada. Mejor candidato demo por PR-AUC: {winner}. Resultado local: {output}")


if __name__ == "__main__":
    main()
