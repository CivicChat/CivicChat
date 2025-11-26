
"""
dcboe_ingest.py

Turn a DC Board of Elections certified results CSV into:

- data/precincts/dc_precincts.json
- data/results/dc_results_2025_ward8_special.json  (for this example)

USAGE:
  pip install pandas
  python scripts/dcboe_ingest.py
"""

import json
from pathlib import Path

import pandas as pd

DATA_DIR = Path("data")
RAW_DCBOE = Path("raw/dcboe")


def load_results_csv(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    df.columns = [c.strip() for c in df.columns]
    return df


def build_precincts(df: pd.DataFrame):
    pcol = "PrecinctNumber"
    wcol = "WardNumber"
    df_sub = df[[pcol, wcol]].drop_duplicates()

    precincts = []
    for _, row in df_sub.iterrows():
        precincts.append(
            {
                "precinct_id": str(int(row[pcol])),
                "ward": str(int(row[wcol])),
            }
        )

    out_path = DATA_DIR / "precincts" / "dc_precincts.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(precincts, indent=2))
    print(f"Saved {len(precincts)} precincts -> {out_path}")


def build_results(df: pd.DataFrame, election_slug: str):
    for col in ["ContestNumber", "Candidate", "Party", "Votes", "PrecinctNumber"]:
        if col not in df.columns:
            raise ValueError(f"Missing column: {col}")

    # Only candidate rows (exclude totals like REGISTERED VOTERS)
    df2 = df[(df["ContestNumber"] >= 0) & df["Candidate"].notna()].copy()

    def clean_candidate_name(row):
        cand = str(row["Candidate"])
        party = str(row["Party"])
        if party and cand.startswith(party + " "):
            return cand[len(party) + 1 :].strip()
        return cand.strip()

    df2["CleanCandidate"] = df2.apply(clean_candidate_name, axis=1)

    import re

    def slugify(name):
        return "dc-" + re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")

    df2["candidate_id"] = df2["CleanCandidate"].apply(slugify)

    results = []
    for _, row in df2.iterrows():
        results.append(
            {
                "precinct_id": str(int(row["PrecinctNumber"])),
                "contest_id": str(int(row["ContestNumber"])),
                "candidate_id": row["candidate_id"],
                "votes": int(row["Votes"]),
            }
        )

    out_path = DATA_DIR / "results" / f"dc_results_{election_slug}.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(results, indent=2))
    print(f"Saved {len(results)} result rows -> {out_path}")


def main():
    # Put your CSV here in your repo: raw/dcboe/July_15_2025_Special_Election_Certified_Results.csv
    csv_path = RAW_DCBOE / "July_15_2025_Special_Election_Certified_Results.csv"
    if not csv_path.exists():
        print(f"Place your DCBOE CSV at: {csv_path}")
        return

    df = load_results_csv(csv_path)
    build_precincts(df)
    build_results(df, election_slug="2025_ward8_special")


if __name__ == "__main__":
    main()
