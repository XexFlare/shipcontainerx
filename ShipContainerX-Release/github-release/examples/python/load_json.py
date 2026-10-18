"""Reads the JSON file with field-level provenance. No third-party packages needed.

    python examples/python/load_json.py
"""

import json
from pathlib import Path

payload = json.loads((Path(__file__).resolve().parents[2] / "data" / "shipcontainerx.json").read_text(encoding="utf-8"))
print(payload["version"], payload["record_count"])
hc = next(r for r in payload["records"] if r["id"] == "40-hc-dry")
print(hc["fields_detail"]["internal_length_mm"])
