# ApplyBuddy Scraper

Python scraper fetching jobs from multiple Indian job boards.

Create a virtual environment and install dependencies:
```bash
pip install -r requirements.txt
```

Start the scraper API on port 8000:
```bash
python scraper.py
```

Send a POST request with job preferences:
```bash
curl -X POST http://localhost:8000/scrape \
  -H "Content-Type: application/json" \
  -d '{"title":"developer","location":"Bengaluru"}'
```

The service returns a list of jobs from Naukri, Indeed, Monster, LinkedIn and Shine in a unified format.
