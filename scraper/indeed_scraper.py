from bs4 import BeautifulSoup
from urllib.parse import quote_plus

from common import session

BASE_URL = "https://in.indeed.com"


def scrape_indeed(title="", location="", keywords=None, max_results=5):
    query = quote_plus(title)
    url = f"{BASE_URL}/jobs?q={query}"
    if location:
        url += f"&l={quote_plus(location)}"
    try:
        resp = session.get(url, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        print(f"indeed request failed: {e}")
        return []
    soup = BeautifulSoup(resp.text, "html.parser")
    jobs = []
    for item in soup.select(".result")[:max_results]:
        title_el = item.select_one("h2 a")
        company_el = item.select_one("span.company")
        loc_el = item.select_one("div.recJobLoc") or item.select_one("span.location")
        if not title_el:
            continue
        jobs.append({
            "title": title_el.get_text(strip=True),
            "company": company_el.get_text(strip=True) if company_el else "",
            "location": loc_el["data-rc-loc"] if loc_el and loc_el.has_attr("data-rc-loc") else (loc_el.get_text(strip=True) if loc_el else ""),
            "apply_type": "external",
            "email": None,
            "job_link": BASE_URL + title_el['href'],
            "source": "indeed",
        })
    return jobs
