from __future__ import annotations

import argparse
import csv
import math
import random
from datetime import date, timedelta
from pathlib import Path

from schema import REQUIRED_COLUMNS

EQUIPMENT_TYPES = ["airlay", "pulsonadora", "mezcladora", "cortadora", "compactadora", "montacargas"]
AREAS = ["linea-1", "linea-2", "linea-3", "linea-4", "abastecimiento", "mantenimiento"]
SHIFTS = ["turno-1", "turno-2", "mixto"]


def build_rows(total: int, seed: int = 20260905) -> list[dict]:
    rng = random.Random(seed)
    start = date(2025, 1, 1)
    rows = []
    for index in range(total):
        age = round(rng.uniform(0.5, 14), 1)
        hours = round(rng.uniform(80, 620), 1)
        overdue = max(0, int(rng.gauss(5, 12)))
        correctives = min(12, max(0, int(rng.gauss(2.2, 2))))
        incidents = min(10, max(0, int(rng.gauss(1.4, 1.6))))
        average_minutes = max(10, int(rng.gauss(65 + correctives * 8, 28)))
        days_preventive = max(0, int(rng.gauss(25 + overdue, 18)))
        inspection_failures = min(8, max(0, int(rng.gauss(0.7 + incidents * 0.35, 1.2))))
        equipment_type = rng.choice(EQUIPMENT_TYPES)
        shift = rng.choices(SHIFTS, weights=[45, 40, 15], k=1)[0]
        risk_score = (
            -4.6 + age * 0.10 + hours * 0.0022 + overdue * 0.035 + correctives * 0.30
            + incidents * 0.24 + average_minutes * 0.004 + days_preventive * 0.012
            + inspection_failures * 0.38 + (0.28 if shift == "turno-2" else 0)
        )
        probability = 1 / (1 + math.exp(-risk_score))
        rows.append({
            "record_id": f"synthetic-{index + 1:05d}",
            "equipment_id": f"demo-equipment-{index % 40 + 1:02d}",
            "cutoff_date": (start + timedelta(days=index)).isoformat(),
            "data_origin": "synthetic_demo",
            "equipment_type": equipment_type,
            "area_id": rng.choice(AREAS),
            "shift_id": shift,
            "age_years": age,
            "operating_hours_30d": hours,
            "preventive_overdue_days": overdue,
            "corrective_count_30d": correctives,
            "incident_count_30d": incidents,
            "avg_corrective_minutes_90d": average_minutes,
            "days_since_last_preventive": days_preventive,
            "last_inspection_failures": inspection_failures,
            "failure_next_30d": int(rng.random() < probability),
        })
    return rows


def main() -> None:
    parser = argparse.ArgumentParser(description="Genera datos sintéticos; nunca representa planta real.")
    parser.add_argument("--output", default=".local/predictive-demo.csv")
    parser.add_argument("--rows", type=int, default=1200)
    args = parser.parse_args()
    if args.rows < 200:
        raise SystemExit("Se requieren al menos 200 filas para la demostración temporal.")
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    rows = build_rows(args.rows)
    with output.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=REQUIRED_COLUMNS)
        writer.writeheader()
        writer.writerows(rows)
    positives = sum(row["failure_next_30d"] for row in rows)
    print(f"Dataset sintético generado: {len(rows)} filas, {positives} eventos objetivo. Archivo local: {output}")


if __name__ == "__main__":
    main()
