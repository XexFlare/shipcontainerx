"""Build ShipContainerX Data/ and reports/ from ShipContainerX-Research/ShipContainerX.

The research lives in a separate local repo (default ../ShipContainerX-Research, or set
SHIPCONTAINERX_RESEARCH_DIR). It is never published.

Usage: python scripts/build_dataset.py
Parquet needs pandas and pyarrow; without them the other formats are still written.
"""
import csv
import json
import os
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RESEARCH_REPO = Path(os.environ.get("SHIPCONTAINERX_RESEARCH_DIR") or ROOT.parent / "ShipContainerX-Research")
RESEARCH = RESEARCH_REPO / "ShipContainerX"
DATA = ROOT / "Data"
REPORTS = ROOT / "reports"

DATASET = "ShipContainerX"
VERSION = "1.0.0"
GENERATED = "2026-10-17"
LICENSE = "CC-BY-4.0"
CONFIDENCE = ["CONFIRMED", "STRONG", "SUPPORTED"]
STATUSES = ["VERIFIED", "PARTIAL"]
CATEGORIES = ["dry", "reefer", "open_top", "hardtop", "flat_rack", "platform", "tank"]

INT_FIELDS = [
    "nominal_length_ft",
    "external_length_mm", "external_width_mm", "external_height_mm",
    "internal_length_mm", "internal_width_mm", "internal_height_mm", "max_stow_height_mm",
    "door_width_mm", "door_height_mm", "roof_opening_length_mm", "roof_opening_width_mm",
    "deck_height_mm", "max_gross_kg", "tare_kg", "max_payload_kg",
    "temperature_min_c", "temperature_max_c",
]
FLOAT_FIELDS = ["capacity_m3"]
TEXT_FIELDS = [
    "name", "category", "iso_size_type", "iso_type_group", "height_class",
    "floor", "power_supply", "special_features",
]
FIELDS = ["id", *TEXT_FIELDS[:5], *INT_FIELDS, *FLOAT_FIELDS, *TEXT_FIELDS[5:]]
CSV_FIELDS = [*FIELDS, "typical_cargo", "research_status", "last_verified", "source_ids", "record_path"]

ROW_RE = re.compile(r"^\|(.+)\|\s*$")
SOURCE_ID_RE = re.compile(r"\b[A-Z]{2,4}-\d{2}\b")
ISO_SIZE_TYPE_RE = re.compile(r"^[0-9A-Z]{2}[A-Z][0-9]$")
ISO_TYPE_GROUP_RE = re.compile(r"^[0-9A-Z]{2}[A-Z]{2}$")


def table_rows(lines):
    rows = []
    for line in lines:
        m = ROW_RE.match(line.strip())
        if not m:
            continue
        cells = [c.strip() for c in m.group(1).split("|")]
        if all(re.fullmatch(r":?-{3,}:?", c) for c in cells) or cells[0] in ("Field", "Cargo", "ID", "Item"):
            continue
        rows.append(cells)
    return rows


def source_ids(text):
    return sorted(set(SOURCE_ID_RE.findall(text or "")))


def parse_value(field, raw):
    if raw == "":
        return None
    if field in INT_FIELDS:
        return int(raw.replace(",", ""))
    if field in FLOAT_FIELDS:
        return float(raw.replace(",", ""))
    return raw


def parse_type(path):
    text = path.read_text(encoding="utf-8")
    head, _, cargo_part = text.partition("## Typical cargo")
    record = {"id": path.stem}
    detail = {}
    for cells in table_rows(head.splitlines()):
        if len(cells) != 5:
            raise ValueError(f"{path.name}: expected 5 columns, got {cells}")
        field, raw, confidence, source, notes = cells
        record[field] = parse_value(field, raw)
        detail[field] = {"value": record[field], "confidence": confidence or None, "source_ids": source_ids(source), "notes": notes or None}
    cargo = []
    for cells in table_rows(cargo_part.splitlines()):
        if len(cells) != 3:
            raise ValueError(f"{path.name}: typical cargo rows need 3 columns, got {cells}")
        cargo.append({"category": cells[0], "why": cells[1], "source_ids": source_ids(cells[2])})
    status = re.search(r"\*\*Research status:\*\*\s*(\w+)", text)
    verified = re.search(r"\*\*Last verified:\*\*\s*([\d-]+)", text)
    out = {f: record.get(f) for f in FIELDS}
    out["typical_cargo"] = cargo
    out["research_status"] = status.group(1) if status else None
    out["last_verified"] = verified.group(1) if verified else None
    ids = {s for d in detail.values() for s in d["source_ids"]} | {s for c in cargo for s in c["source_ids"]}
    out["source_ids"] = sorted(ids)
    out["record_path"] = "research/ShipContainerX/" + path.relative_to(RESEARCH).as_posix()
    out["fields_detail"] = detail
    unknown = set(record) - set(FIELDS)
    if unknown:
        raise ValueError(f"{path.name}: unknown fields {sorted(unknown)}")
    return out


def parse_sources():
    rows = table_rows((RESEARCH / "sources.md").read_text(encoding="utf-8").splitlines())
    keys = ["source_id", "title", "url", "type", "tier", "accessed", "establishes"]
    return [dict(zip(keys, r)) for r in rows if len(r) == 7]


def validate(records, sources):
    issues = {}

    def add(code, item):
        issues.setdefault(code, []).append(item)

    known = {s["source_id"] for s in sources}
    for sid, n in Counter(s["source_id"] for s in sources).items():
        if n > 1:
            add("duplicate_source_id", sid)
    for rid, n in Counter(r["id"] for r in records).items():
        if n > 1:
            add("duplicate_id", rid)
    for r in records:
        rid = r["id"]
        for f in ("name", "category", "nominal_length_ft", "research_status", "last_verified"):
            if r.get(f) in (None, ""):
                add("missing_required_field", (rid, f))
        if r["category"] not in CATEGORIES:
            add("unknown_category", (rid, r["category"]))
        if r["research_status"] not in STATUSES:
            add("unknown_research_status", (rid, r["research_status"]))
        if r["iso_size_type"] and not ISO_SIZE_TYPE_RE.match(r["iso_size_type"]):
            add("bad_iso_size_type", (rid, r["iso_size_type"]))
        if r["iso_type_group"] and not ISO_TYPE_GROUP_RE.match(r["iso_type_group"]):
            add("bad_iso_type_group", (rid, r["iso_type_group"]))
        for sid in r["source_ids"]:
            if sid not in known:
                add("source_not_in_register", (rid, sid))
        for f, d in r["fields_detail"].items():
            if d["value"] is not None and f not in ("name", "category", "nominal_length_ft", "height_class"):
                if not d["source_ids"]:
                    add("value_without_source", (rid, f))
                if d["confidence"] not in CONFIDENCE:
                    add("bad_confidence", (rid, f, d["confidence"]))
        if not r["typical_cargo"]:
            add("no_typical_cargo", rid)
        for c in r["typical_cargo"]:
            if not c["source_ids"]:
                add("cargo_without_source", (rid, c["category"]))
        g, t, p = r["max_gross_kg"], r["tare_kg"], r["max_payload_kg"]
        if None not in (g, t, p) and g - t != p:
            add("payload_not_gross_minus_tare", (rid, g, t, p))
        for dim in ("length", "width", "height"):
            inside, outside = r[f"internal_{dim}_mm"], r[f"external_{dim}_mm"]
            if inside is not None and outside is not None and inside >= outside:
                add("internal_not_smaller_than_external", (rid, dim))
        # Reefer insides are measured between linings and from the T-bar floor, so doors can be larger.
        for door, inside in (("door_width_mm", "internal_width_mm"), ("door_height_mm", "internal_height_mm")):
            if r["category"] != "reefer" and r[door] is not None and r[inside] is not None and r[door] > r[inside] + 5:
                add("door_larger_than_inside", (rid, door))
        if r["capacity_m3"] and r["internal_length_mm"] and r["internal_width_mm"] and r["internal_height_mm"]:
            box = r["internal_length_mm"] * r["internal_width_mm"] * r["internal_height_mm"] / 1e9
            if abs(box - r["capacity_m3"]) / r["capacity_m3"] > 0.03:
                add("capacity_differs_from_dimensions", (rid, r["capacity_m3"], round(box, 1)))
        if r["category"] == "reefer" and (r["temperature_min_c"] is None or r["temperature_max_c"] is None):
            add("reefer_without_temperature_range", rid)
    return issues


def flat(r):
    row = {f: r.get(f) for f in CSV_FIELDS}
    row["typical_cargo"] = "; ".join(c["category"] for c in r["typical_cargo"])
    row["source_ids"] = "; ".join(r["source_ids"])
    return row


def main():
    records = [parse_type(p) for p in sorted((RESEARCH / "types").glob("*.md"))]
    sources = parse_sources()
    DATA.mkdir(exist_ok=True)
    REPORTS.mkdir(exist_ok=True)

    meta = {
        "dataset": DATASET,
        "version": VERSION,
        "generated": GENERATED,
        "license": LICENSE,
        "description": "ISO container types: dimensions, door and roof openings, weights, capacity, ISO 6346 codes and typical cargo, each value cited.",
        "note": "Values are representative series from carrier fleets; individual containers vary by manufacturer and series. Max payload = max gross minus tare.",
        "vocabularies": {"category": CATEGORIES, "confidence": CONFIDENCE, "research_status": STATUSES},
        "record_count": len(records),
    }
    (DATA / "shipcontainerx.json").write_text(json.dumps({**meta, "records": records}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    with (DATA / "shipcontainerx.jsonl").open("w", encoding="utf-8", newline="\n") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    with (DATA / "shipcontainerx.csv").open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=CSV_FIELDS)
        w.writeheader()
        w.writerows(flat(r) for r in records)
    with (DATA / "sources.csv").open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(sources[0]))
        w.writeheader()
        w.writerows(sources)
    try:
        import pandas as pd

        pd.DataFrame([flat(r) for r in records], columns=CSV_FIELDS).astype({f: "Int64" for f in INT_FIELDS}).to_parquet(
            DATA / "shipcontainerx.parquet", index=False
        )
        parquet = True
    except ImportError:
        parquet = False

    issues = validate(records, sources)
    (REPORTS / "validation_report.json").write_text(json.dumps(issues, indent=2, ensure_ascii=False, default=str) + "\n", encoding="utf-8")
    summary = {
        **{k: meta[k] for k in ("dataset", "version", "generated")},
        "records": len(records),
        "by_category": dict(Counter(r["category"] for r in records)),
        "by_research_status": dict(Counter(r["research_status"] for r in records)),
        "sources": len(sources),
        "field_completeness": {f: sum(1 for r in records if r.get(f) is not None) for f in FIELDS},
        "validation_issue_counts": {k: len(v) for k, v in issues.items()},
        "parquet_written": parquet,
    }
    (REPORTS / "dataset_summary.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    print(f"{len(records)} records, {len(sources)} sources, parquet {parquet}")
    print("validation issues:", summary["validation_issue_counts"] or "none")
    return records, issues


if __name__ == "__main__":
    main()
