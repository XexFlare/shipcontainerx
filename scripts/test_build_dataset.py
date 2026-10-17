"""Build and validation tests. Run with: python -m unittest discover scripts"""
import copy
import tempfile
import unittest
from pathlib import Path

import build_dataset as b

RECORD = """# Test box

| Field | Value | Confidence | Source | Notes |
|---|---|---|---|---|
| name | Test box |  |  |  |
| category | dry |  |  |  |
| iso_size_type | 22G1 | CONFIRMED | HL-01 |  |
| nominal_length_ft | 20 |  |  |  |
| internal_length_mm | 5,900 | STRONG | HL-01, HL-02 | thousands separator allowed |
| capacity_m3 | 33.2 | STRONG | HL-01 |  |

## Typical cargo

| Cargo | Why | Source |
|---|---|---|
| general_cargo | Any general cargo | HL-01 |

**Research status:** VERIFIED
**Last verified:** 2026-10-17
"""


class ParseTest(unittest.TestCase):
    def test_record_fields_cargo_and_provenance(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "test-box.md"
            path.write_text(RECORD, encoding="utf-8")
            original = b.RESEARCH
            b.RESEARCH = Path(d)
            try:
                r = b.parse_type(path)
            finally:
                b.RESEARCH = original
        self.assertEqual(r["id"], "test-box")
        self.assertEqual(r["internal_length_mm"], 5900)
        self.assertEqual(r["capacity_m3"], 33.2)
        self.assertEqual(r["typical_cargo"], [{"category": "general_cargo", "why": "Any general cargo", "source_ids": ["HL-01"]}])
        self.assertEqual(r["source_ids"], ["HL-01", "HL-02"])
        self.assertEqual(r["fields_detail"]["internal_length_mm"]["confidence"], "STRONG")
        self.assertEqual(r["research_status"], "VERIFIED")


class CorpusTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.records = [b.parse_type(p) for p in sorted((b.RESEARCH / "types").glob("*.md"))]
        cls.sources = b.parse_sources()

    def test_corpus_is_clean(self):
        self.assertEqual(b.validate(self.records, self.sources), {})

    def test_plan_types_are_present(self):
        codes = {r["iso_size_type"] for r in self.records}
        for code in ["22G1", "42G1", "45G1", "L5G1", "22R1", "45R1", "22U1", "42U1", "22P3", "45P3"]:
            self.assertIn(code, codes)
        self.assertIn("tank", {r["category"] for r in self.records})

    def test_payload_is_gross_minus_tare(self):
        for r in self.records:
            if r["max_gross_kg"] and r["tare_kg"]:
                self.assertEqual(r["max_gross_kg"] - r["tare_kg"], r["max_payload_kg"], r["id"])

    def test_validation_catches_bad_records(self):
        bad = copy.deepcopy(self.records[0])
        bad["max_payload_kg"] += 1
        bad["typical_cargo"] = []
        bad["source_ids"] = ["XX-99"]
        issues = b.validate([bad], self.sources)
        self.assertIn("payload_not_gross_minus_tare", issues)
        self.assertIn("no_typical_cargo", issues)
        self.assertIn("source_not_in_register", issues)


if __name__ == "__main__":
    unittest.main()
