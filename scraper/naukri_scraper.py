from bs4 import BeautifulSoup
from urllib.parse import quote_plus

from common import session, HEADERS

BASE_URL = "https://www.naukri.com"


def scrape_naukri(title="", location="", keywords=None, max_results=5):
    query = quote_plus(title)
    url = f"{BASE_URL}/{query}-jobs"
    if location:
        url += f"-in-{quote_plus(location)}"
    try:
        resp = session.get(url, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        print(f"naukri request failed: {e}")
        return []
    soup = BeautifulSoup(resp.text, "html.parser")
    jobs = []
    for item in soup.select("article.jobTuple")[:max_results]:
        title_el = item.select_one("a.title")
        company_el = item.select_one("a.comp-name")
        loc_el = item.select_one("li.location span")
        if not title_el:
            continue
        jobs.append({
            "title": title_el.get_text(strip=True),
            "company": company_el.get_text(strip=True) if company_el else "",
            "location": loc_el.get_text(strip=True) if loc_el else "",
            "apply_type": "external",
            "email": None,
            "job_link": title_el["href"],
            "source": "naukri",
        })
    return jobs
