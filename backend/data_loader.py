import json
import os

def _load_json(filename):
    data_path = os.path.join(os.path.dirname(__file__), "data", filename)
    with open(data_path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_candidates():
    return _load_json("dc_candidates.json")

def load_contests():
    return _load_json("dc_contests.json")

def load_precincts():
    return _load_json("dc_precincts.json")

def load_results():
    return _load_json("dc_results.json")

if __name__ == "__main__":
    print("Candidates:")
    for c in load_candidates():
        print(f"- {c['name']} ({c['party']})")

    print("\nContests:")
    for contest in load_contests():
        print(f"- {contest['name']} [{contest['office_level']}]")

    print("Precincts:")
    for p in load_precincts():
        print(f"- Precinct {p['precinct_id']} (Ward {p['ward']})")

    print("Results sample:")
    for r in load_results()[:5]:
        print(f"Precinct {r['precinct_id']} | Contest {r['contest_id']} | Candidate {r['candidate_id']} | Votes: {r['votes']}")