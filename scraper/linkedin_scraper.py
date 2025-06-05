from bs4 import BeautifulSoup
from urllib.parse import quote_plus

from common import session

BASE_URL = "https://www.linkedin.com"


def scrape_linkedin(title="", location="", keywords=None, max_results=5):
    query = quote_plus(title)
    url = f"{BASE_URL}/jobs/search/?keywords={query}"
    if location:
        url += f"&location={quote_plus(location)}"
    try:
        resp = session.get(url, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        print(f"linkedin request failed: {e}")
        return []
    soup = BeautifulSoup(resp.text, "html.parser")
    jobs = []
    for item in soup.select(".jobs-search-results__list-item")[:max_results]:
        title_el = item.select_one("span.screen-reader-text")
        link_el = item.select_one("a.base-card__full-link")
        company_el = item.select_one("a.hidden-nested-link")
        loc_el = item.select_one("span.job-search-card__location")
        if not title_el or not link_el:
            continue
        jobs.append({
            "title": title_el.get_text(strip=True),
            "company": company_el.get_text(strip=True) if company_el else "",
            "location": loc_el.get_text(strip=True) if loc_el else "",
            "apply_type": "external",
            "email": None,
            "job_link": link_el['href'],
            "source": "linkedin",
        })
    return jobs
