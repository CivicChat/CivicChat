
# CivicChat Data Scripts

This folder contains helper scripts to build the DC civic dataset
for the CivicChat MVP.

## Scripts

### 1. `civic_ingest.py` (Google Civic API)

- Uses the Google Civic Information API to pull:
  - elections
  - contests (races)
  - candidates
  - offices
  - current officials
  - ballot measures
- Saves cleaned JSON into:
  - `data/elections/dc_elections.json`
  - `data/offices/dc_offices.json`
  - `data/officials/dc_officials.json`
  - `data/contests/dc_contests.json`
  - `data/candidates/dc_candidates.json`
  - `data/ballot_measures/dc_ballot_measures.json`

**Run:**

```bash
pip install requests
export GOOGLE_CIVIC_API_KEY="your-key-here"
python scripts/civic_ingest.py
```

### 2. `dcboe_ingest.py` (DC Board of Elections)

- Reads a certified results CSV downloaded from the DC Board of Elections.
- Produces:
  - `data/precincts/dc_precincts.json`
  - `data/results/dc_results_2025_ward8_special.json`

Place the CSV at: `raw/dcboe/July_15_2025_Special_Election_Certified_Results.csv`

**Run:**

```bash
pip install pandas
python scripts/dcboe_ingest.py
```

### 3. `ballotpedia_scraper.py` (Candidate bios)

- Takes a `ballotpedia_urls.csv` file with columns:
  - `candidate_id,name,url`
- Downloads each Ballotpedia page, extracts the first few paragraphs,
  and saves:
  - Markdown bios in `data/ballotpedia_markdown/{candidate_id}.md`
  - A JSON summary in `data/candidate_enrichment.json`

**Run:**

```bash
pip install requests beautifulsoup4
python scripts/ballotpedia_scraper.py
```

## Known Limitations

- Google Civic API does **not** provide detailed policy positions,
  endorsements, or full biographies. Those are intended to be added
  via Ballotpedia scraping or manual curation.
- The DCBOE script currently expects a CSV in the same format as the
  July 15, 2025 Ward 8 special election certified results file.
  Other elections may require light column-name tweaks.
- The Ballotpedia scraper is a simple heuristic and may miss some
  sections or formatting; it is meant as an enrichment starting point,
  not a perfect mirror of each page.
