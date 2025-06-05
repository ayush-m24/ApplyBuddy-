from bs4 import BeautifulSoup
from urllib.parse import quote_plus

from common import session

BASE_URL = "https://www.foundit.in"


def scrape_monster(title="", location="", keywords=None, max_results=5):
    query = quote_plus(title)
    url = f"{BASE_URL}/s/jobs?search={query}"
    if location:
        url += f"&locations={quote_plus(location)}"
    try:
        resp = session.get(url, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        print(f"monster request failed: {e}")
        return []
    soup = BeautifulSoup(resp.text, "html.parser")
    jobs = []
    for item in soup.select("section.card-job-result")[:max_results]:
        title_el = item.select_one("h3 a")
        company_el = item.select_one(".company-name")
        loc_el = item.select_one(".desirable-loc")
        if not title_el:
            continue
        jobs.append({
            "title": title_el.get_text(strip=True),
            "company": company_el.get_text(strip=True) if company_el else "",
            "location": loc_el.get_text(strip=True) if loc_el else "",
            "apply_type": "external",
            "email": None,
            "job_link": BASE_URL + title_el['href'],
            "source": "monster",
        })
    return jobs
