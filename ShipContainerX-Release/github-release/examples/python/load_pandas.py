"""Loads the flat table with pandas and answers two simple questions.

    pip install -r requirements.txt
    python examples/python/load_pandas.py
"""

from pathlib import Path

import pandas as pd

df = pd.read_parquet(Path(__file__).resolve().parents[2] / "data" / "shipcontainerx.parquet")
print(f"{len(df)} container types")
print(df.groupby("category").size())
print(df.sort_values("max_payload_kg", ascending=False)[["id", "iso_size_type", "max_payload_kg", "capacity_m3"]].head(5))
