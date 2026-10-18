# Publishing this folder to the Hugging Face Hub

This folder is a complete dataset repository. Nothing has been uploaded yet. The namespace used in
the card is `xexflare`; change it in `README.md` if you publish under another name.

## Option A: Hugging Face CLI (recommended)

```bash
pip install -U "huggingface_hub[cli]"
hf auth login                                   # paste a token with write access
hf repo create xexflare/shipcontainerx --repo-type dataset
# run from the release root (the folder that contains huggingface-dataset/)
hf upload xexflare/shipcontainerx huggingface-dataset . --repo-type dataset \
  --commit-message "ShipContainerX v1.0.0"
```

(Older CLI versions use `huggingface-cli login` and `huggingface-cli upload` with the same arguments.)

Optionally tag the release so users can pin it:

```bash
python -c "from huggingface_hub import create_tag; create_tag('xexflare/shipcontainerx', tag='v1.0.0', repo_type='dataset')"
```

## Option B: web upload

1. https://huggingface.co/new-dataset: owner `xexflare`, name `shipcontainerx`, visibility **Public**.
2. *Files and versions*, *Add file*, *Upload files*: upload `README.md`, `CHANGELOG.md`,
   `.gitattributes` and the `data/` folder (keep the `data/` path).

## Repository settings

- Visibility: Public. Gated access: off (open dataset).
- The dataset viewer uses the `configs` in the card: `default` (Parquet), `full`, `sources`.

## Verify after publishing

```python
from datasets import load_dataset
ds = load_dataset("xexflare/shipcontainerx", split="train")
assert ds.num_rows == 17
full = load_dataset("xexflare/shipcontainerx", "full", split="train")
assert "fields_detail" in full.column_names
assert load_dataset("xexflare/shipcontainerx", "sources", split="train").num_rows == 11
```

Also check in the browser that the dataset viewer renders all three configs, and that
`data/SHA256SUMS` matches your local files (`sha256sum -c SHA256SUMS` inside `data/`).
