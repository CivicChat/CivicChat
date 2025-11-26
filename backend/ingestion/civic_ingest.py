
"""
civic_ingest.py

Pulls data from the Google Civic Information API for a Washington, DC
address and saves it into JSON files under the /data folder:

- data/elections/dc_elections.json
- data/offices/dc_offices.json
- data/officials/dc_officials.json
- data/contests/dc_contests.json
- data/candidates/dc_candidates.json
- data/ballot_measures/dc_ballot_measures.json

USAGE:
  pip install requests
  export GOOGLE_CIVIC_API_KEY="your-key-here"
  python scripts/civic_ingest.py
"""

import os
import json
from pathlib import Path
from datetime import datetime

import requests

BASE_URL = "https://www.googleapis.com/civicinfo/v2"
API_KEY = os.environ.get("GOOGLE_CIVIC_API_KEY")

# Central DC address (city hall)
DC_ADDRESS = "1350 Pennsylvania Ave NW, Washington, DC 20004"

DATA_DIR = Path("data")
RAW_DIR = Path("raw/google_civic")


def ensure_dirs():
    for d in [
        DATA_DIR / "elections",
        DATA_DIR / "offices",
        DATA_DIR / "officials",
        DATA_DIR / "contests",
        DATA_DIR / "candidates",
        DATA_DIR / "ballot_measures",
        RAW_DIR,
    ]:
        d.mkdir(parents=True, exist_ok=True)


def civic_get(path: str, params: dict):
    """Helper for calling the Google Civic API."""
    if not API_KEY:
        raise RuntimeError("Set GOOGLE_CIVIC_API_KEY environment variable.")
    params = dict(params)
    params["key"] = API_KEY
    url = f"{BASE_URL}/{path}"
    resp = requests.get(url, params=params, timeout=30)
    resp.raise_for_status()
    return resp.json()


# ---------- ELECTIONS ----------

def fetch_elections():
    print("Fetching elections ...")
    data = civic_get("elections", {})
    (RAW_DIR / "elections.json").write_text(json.dumps(data, indent=2))
    elections = data.get("elections", [])
    out = []
    for e in elections:
        out.append(
            {
                "id": e.get("id"),
                "name": e.get("name"),
                "date": e.get("electionDay"),
                "scope": "unknown",  # refine later if needed
                "source": "google_civic_api",
            }
        )
    (DATA_DIR / "elections" / "dc_elections.json").write_text(
        json.dumps(out, indent=2)
    )
    print(f"Saved {len(out)} elections -> data/elections/dc_elections.json")
    return out


# ---------- OFFICES + OFFICIALS ----------

def fetch_representatives():
    print("Fetching representatives (offices + officials) ...")
    params = {
        "address": DC_ADDRESS,
        "levels": "country,administrativeArea1,administrativeArea2,locality",
    }
    data = civic_get("representatives", params)
    (RAW_DIR / "representatives.json").write_text(json.dumps(data, indent=2))

    offices_raw = data.get("offices", []) or []
    officials_raw = data.get("officials", []) or []

    offices = []
    officials = []

    for idx, office in enumerate(offices_raw):
        office_id = f"office-{idx}"
        offices.append(
            {
                "id": office_id,
                "name": office.get("name"),
                "level": ", ".join(office.get("levels", []) or []),
                "body": office.get("divisionId"),
                "district": office.get("divisionId"),
                "source": "google_civic_api",
            }
        )
        for off_index in office.get("officialIndices", []) or []:
            if 0 <= off_index < len(officials_raw):
                off = officials_raw[off_index]
                official_id = f"official-{off_index}"
                officials.append(
                    {
                        "id": official_id,
                        "name": off.get("name"),
                        "office_id": office_id,
                        "party": off.get("party"),
                        "start_date": None,
                        "end_date": None,
                        "source": "google_civic_api",
                    }
                )

    (DATA_DIR / "offices" / "dc_offices.json").write_text(
        json.dumps(offices, indent=2)
    )
    (DATA_DIR / "officials" / "dc_officials.json").write_text(
        json.dumps(officials, indent=2)
    )
    print(f"Saved {len(offices)} offices, {len(officials)} officials.")
    return offices, officials


# ---------- BALLOT: CONTESTS + CANDIDATES + MEASURES ----------

def fetch_ballot_for_election(election_id: str):
    """Use voterInfoQuery to get contests + candidates + ballot measures."""
    print(f"Fetching ballot for election {election_id} ...")
    params = {"address": DC_ADDRESS, "electionId": election_id}
    data = civic_get("voterinfo", params)
    (RAW_DIR / f"voterinfo_{election_id}.json").write_text(
        json.dumps(data, indent=2)
    )

    contests_raw = data.get("contests", []) or []

    contests = []
    candidates = []
    measures = []

    for c_index, c in enumerate(contests_raw):
        contest_id = f"{election_id}-contest-{c_index}"

        contests.append(
            {
                "id": contest_id,
                "election_id": election_id,
                "office_id": c.get("office"),
                "name": c.get("office") or c.get("referendumTitle"),
                "district": (c.get("district") or {}).get("name"),
                "office_level": c.get("level"),
                "ballot_title": c.get("referendumTitle"),
                "description": c.get("referendumSubtitle"),
                "source": "google_civic_api",
            }
        )

        for cand in c.get("candidates", []) or []:
            base_slug = (cand.get("name") or "").lower().replace(" ", "-")
            cand_id = f"{contest_id}-cand-{base_slug}"
            candidates.append(
                {
                    "id": cand_id,
                    "name": cand.get("name"),
                    "party": cand.get("party"),
                    "office_id": c.get("office"),
                    "contest_id": contest_id,
                    "bio_short": "",
                    "website": cand.get("candidateUrl") or "",
                    "photo_url": "",
                    "source": "google_civic_api",
                }
            )

        if c.get("referendumTitle"):
            measures.append(
                {
                    "id": contest_id,
                    "election_id": election_id,
                    "title": c.get("referendumTitle"),
                    "summary": c.get("referendumSubtitle"),
                    "full_text_url": c.get("referendumUrl"),
                    "source": "google_civic_api",
                }
            )

    (DATA_DIR / "contests" / "dc_contests.json").write_text(
        json.dumps(contests, indent=2)
    )
    (DATA_DIR / "candidates" / "dc_candidates.json").write_text(
        json.dumps(candidates, indent=2)
    )
    (DATA_DIR / "ballot_measures" / "dc_ballot_measures.json").write_text(
        json.dumps(measures, indent=2)
    )

    print(
        f"Saved {len(contests)} contests, {len(candidates)} candidates, "
        f"{len(measures)} ballot measures for election {election_id}."
    )


def main():
    ensure_dirs()
    elections = fetch_elections()
    fetch_representatives()

    # Simple rule: only pull ballot info for elections in or after 2024
    for e in elections:
        date_str = e.get("date")
        try:
            d = datetime.strptime(date_str, "%Y-%m-%d")
        except Exception:
            continue
        if d.year >= 2024:
            fetch_ballot_for_election(e["id"])


if __name__ == "__main__":
    main()
