from __future__ import annotations

from datetime import date

NUMERIC_FEATURES = [
    "age_years",
    "operating_hours_30d",
    "preventive_overdue_days",
    "corrective_count_30d",
    "incident_count_30d",
    "avg_corrective_minutes_90d",
    "days_since_last_preventive",
    "last_inspection_failures",
]
CATEGORICAL_FEATURES = ["equipment_type", "area_id", "shift_id"]
TARGET = "failure_next_30d"
REQUIRED_COLUMNS = [
    "record_id",
    "equipment_id",
    "cutoff_date",
    "data_origin",
    *CATEGORICAL_FEATURES,
    *NUMERIC_FEATURES,
    TARGET,
]
ALLOWED_ORIGINS = {"synthetic_demo", "real_authorized"}


def validate_records(records: list[dict]) -> list[str]:
    issues: list[str] = []
    if not records:
        return ["El dataset está vacío."]
    for index, row in enumerate(records, start=2):
        missing = [column for column in REQUIRED_COLUMNS if column not in row or row[column] in (None, "")]
        if missing:
            issues.append(f"Fila {index}: faltan {', '.join(missing)}.")
            continue
        try:
            date.fromisoformat(str(row["cutoff_date"]))
        except ValueError:
            issues.append(f"Fila {index}: cutoff_date inválida.")
        if row["data_origin"] not in ALLOWED_ORIGINS:
            issues.append(f"Fila {index}: data_origin no permitido.")
        for column in NUMERIC_FEATURES:
            try:
                value = float(row[column])
                if value < 0:
                    issues.append(f"Fila {index}: {column} no puede ser negativo.")
            except (TypeError, ValueError):
                issues.append(f"Fila {index}: {column} no es numérico.")
        try:
            target = int(row[TARGET])
            if target not in (0, 1):
                raise ValueError
        except (TypeError, ValueError):
            issues.append(f"Fila {index}: {TARGET} debe ser 0 o 1.")
    return issues
