import json
from flask import Flask, request, jsonify

from naukri_scraper import scrape_naukri
from shine_scraper import scrape_shine
from monster_scraper import scrape_monster
from linkedin_scraper import scrape_linkedin
from indeed_scraper import scrape_indeed

SCRAPERS = [
    scrape_naukri,
    scrape_shine,
    scrape_monster,
    scrape_linkedin,
    scrape_indeed,
]

app = Flask(__name__)


@app.post('/scrape')
def scrape_route():
    data = request.get_json(force=True) or {}
    title = data.get('title', '')
    location = data.get('location', '')
    keywords = data.get('keywords', [])
    max_results = int(data.get('max_results', 5))
    all_jobs = []
    for scraper in SCRAPERS:
        try:
            jobs = scraper(title=title, location=location, keywords=keywords, max_results=max_results)
            all_jobs.extend(jobs)
        except Exception as e:
            print(f"Error in {scraper.__name__}: {e}")
    return jsonify(all_jobs)


def test_scrapers():
    prefs = {"title": "developer", "location": "Bengaluru"}
    for scraper in SCRAPERS:
        print(f"Testing {scraper.__name__}")
        try:
            jobs = scraper(max_results=5, **prefs)
            for job in jobs:
                print(job)
        except Exception as e:
            print(f"Failed {scraper.__name__}: {e}")
        print("-")


if __name__ == '__main__':
    test_scrapers()
    app.run(host='0.0.0.0', port=8000)
