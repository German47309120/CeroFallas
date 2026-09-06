import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from generate_demo_dataset import build_rows
from schema import TARGET, validate_records


class PredictiveSchemaTests(unittest.TestCase):
    def test_demo_generator_is_reproducible_and_valid(self):
        first = build_rows(250)
        second = build_rows(250)
        self.assertEqual(first, second)
        self.assertEqual(validate_records(first), [])
        self.assertGreater(sum(row[TARGET] for row in first), 0)
        self.assertLess(sum(row[TARGET] for row in first), len(first))

    def test_rejects_missing_invalid_and_negative_values(self):
        row = build_rows(1)[0]
        row.pop("equipment_id")
        row["age_years"] = -1
        row[TARGET] = 3
        issues = validate_records([row])
        self.assertTrue(any("equipment_id" in issue for issue in issues))

    def test_rejects_unknown_origin(self):
        row = build_rows(1)[0]
        row["data_origin"] = "production_guess"
        self.assertTrue(any("data_origin" in issue for issue in validate_records([row])))


if __name__ == "__main__":
    unittest.main()
