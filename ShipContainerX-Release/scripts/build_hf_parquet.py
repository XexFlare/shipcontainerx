"""Build the two derived Parquet files used by the Hugging Face dataset configs.

The Hugging Face `datasets` library uses ONE file format for all configs of a repository, so the
`full` (nested provenance) and `sources` configs need Parquet twins of shipcontainerx.jsonl and
sources.csv. These are lossless format conversions; the originals are still published unchanged
and scripts/validate.mjs checks the twins against them.

    python scripts/build_hf_parquet.py          (requires: pip install pyarrow)
"""

import json
from pathlib import Path

import pyarrow as pa
import pyarrow.csv as pacsv
import pyarrow.json as pajson
import pyarrow.parquet as pq

RELEASE_ROOT = Path(__file__).resolve().parent.parent
SOURCE_DATA = RELEASE_ROOT.parent / "Data"
OUT = RELEASE_ROOT / "huggingface-dataset" / "data"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    jsonl = SOURCE_DATA / "shipcontainerx.jsonl"
    # One block for the whole file so the nested fields_detail struct is inferred from every record.
    # last_verified is pinned to text so the reader does not turn "2026-10-17" into a date.
    full = pajson.read_json(
        jsonl,
        read_options=pajson.ReadOptions(block_size=jsonl.stat().st_size + 1),
        parse_options=pajson.ParseOptions(
            explicit_schema=pa.schema([("last_verified", pa.string())]),
            unexpected_field_behavior="infer",
        ),
    )
    first = list(json.loads(jsonl.read_text(encoding="utf-8").splitlines()[0]).keys())
    full = full.select(first)  # keep the original column order
    pq.write_table(full, OUT / "shipcontainerx_full.parquet", compression="snappy")
    print(f"shipcontainerx_full.parquet: {full.num_rows} rows, {full.num_columns} columns")

    header = (SOURCE_DATA / "sources.csv").read_text(encoding="utf-8-sig").splitlines()[0].split(",")
    sources = pacsv.read_csv(
        SOURCE_DATA / "sources.csv",
        convert_options=pacsv.ConvertOptions(
            column_types={name: pa.string() for name in header},
            strings_can_be_null=False,
        ),
    )
    pq.write_table(sources, OUT / "sources.parquet", compression="snappy")
    print(f"sources.parquet: {sources.num_rows} rows, {sources.num_columns} columns")


if __name__ == "__main__":
    main()
