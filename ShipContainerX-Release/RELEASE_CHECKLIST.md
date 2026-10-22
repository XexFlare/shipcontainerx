# ShipContainerX v1.0.0: release checklist

Done = built and verified locally on 2026-10-18. Open = needs the maintainer's accounts.

## A. Decisions

- Done: license CC BY 4.0 for data, docs and reports (card, `LICENSE`, `CITATION.cff`); code under MIT (root `LICENSE`).
- Done: the research records are kept out of every package (a separate private local repo).
- Done: public names. Hugging Face namespace `xexflare`, GitHub `XexFlare/shipcontainerx`. Change them in
  `huggingface-dataset/README.md`, `PUBLISHING.md` and `github-release/CITATION.cff` if you publish elsewhere.

## B. Verified locally

- Done: `npm run validate`: 29 checks pass (counts, ids, cross-format equality, arithmetic, sources, Parquet twins).
- Done: the standalone validator in `github-release/` passes on its own copy of the data.
- Done: the JavaScript and Python examples run against the data.
- Done: all package data copies are byte-identical to `../Data` (checked by `SHA256SUMS`).
- Done: API: 26 tests and the bundle check pass (`npm run release`).
- Done: the three Hugging Face configs load with the `datasets` library from the local folder (17, 17 and 11 rows; `full` has `fields_detail`).
- Open: repeat that check after upload (steps in `huggingface-dataset/PUBLISHING.md`).

## C. Publish

1. GitHub: the repository `XexFlare/shipcontainerx` already exists. Push the commit, then create a release
   `v1.0.0` and attach the five files in `github-release/data/` plus `SHA256SUMS`.
2. Hugging Face: log in as `xexflare`, create a write token, and follow `huggingface-dataset/PUBLISHING.md`.
3. API: deploy from the private `shipcontainerx-web-api` repo (see its README, Netlify, Base directory `api`).

## D. Rebuild everything

```bash
npm install
pip install pandas pyarrow
npm run release
```

`npm run release` = `build:dataset` (needs the private research repo beside this one) then
`build:release` (package copies, checksums, manifest), `build:hf`
(Parquet twins) and `validate`.
