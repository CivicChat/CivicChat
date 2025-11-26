
"""
ballotpedia_scraper.py

Given a CSV with: candidate_id, name, url (Ballotpedia),
download each page, grab a simple bio, and save:

- data/ballotpedia_markdown/{candidate_id}.md
- data/candidate_enrichment.json

USAGE:
  pip install requests beautifulsoup4
  python scripts/ballotpedia_scraper.py
"""

import csv
import json
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

DATA_DIR = Path("data")
RAW_BP = Path("raw/ballotpedia")
MD_DIR = DATA_DIR / "ballotpedia_markdown"
INPUT_CSV = "ballotpedia_urls.csv"  # in project root


def ensure_dirs():
    for d in [DATA_DIR, RAW_BP, MD_DIR]:
        d.mkdir(parents=True, exist_ok=True)


def fetch_page(url: str) -> str:
    headers = {
        "User-Agent": "CivicChatHackathonBot/1.0 (contact: your-email@example.com)"
    }
    resp = requests.get(url, headers=headers, timeout=30)
    resp.raise_for_status()
    return resp.text


def extract_bio(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    main = soup.find("div", id="bodyContent") or soup
    paragraphs = [p.get_text(strip=True) for p in main.find_all("p")]
    paragraphs = [p for p in paragraphs if p]
    return "\n\n".join(paragraphs[:5])


def main():
    ensure_dirs()
    path = Path(INPUT_CSV)
    if not path.exists():
        print(f"Create {INPUT_CSV} with columns: candidate_id,name,url")
        return

    enrichment = []

    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            cid = row["candidate_id"]
            name = row["name"]
            url = row["url"]
            print(f"Scraping {name} from {url} ...")

            html = fetch_page(url)
            (RAW_BP / f"{cid}.html").write_text(html, encoding="utf-8")

            bio = extract_bio(html)
            (MD_DIR / f"{cid}.md").write_text(f"# {name}\n\n{bio}", encoding="utf-8")

            enrichment.append(
                {
                    "candidate_id": cid,
                    "ballotpedia_url": url,
                    "bio_excerpt": bio[:600],
                }
            )

            time.sleep(2)  # be polite to their servers

    out_path = DATA_DIR / "candidate_enrichment.json"
    out_path.write_text(json.dumps(enrichment, indent=2), encoding="utf-8")
    print(f"Saved enrichment for {len(enrichment)} candidates -> {out_path}")


if __name__ == "__main__":
    main()
