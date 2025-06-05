from bs4 import BeautifulSoup
from urllib.parse import quote_plus

from common import session

BASE_URL = "https://www.shine.com"


def scrape_shine(title="", location="", keywords=None, max_results=5):
    query = quote_plus(title)
    url = f"{BASE_URL}/job-search/{query}-jobs"
    if location:
        url += f"-in-{quote_plus(location)}"
    try:
        resp = session.get(url, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        print(f"shine request failed: {e}")
        return []
    soup = BeautifulSoup(resp.text, "html.parser")
    jobs = []
    for item in soup.select("li.jobCard")[:max_results]:
        title_el = item.select_one(".jobCardJobTitle span")
        company_el = item.select_one(".jobCardCompanyName span")
        loc_el = item.select_one(".jobCardJobDetail span")
        link_el = item.select_one("a.jobCardJobTitle")
        if not title_el:
            continue
        jobs.append({
            "title": title_el.get_text(strip=True),
            "company": company_el.get_text(strip=True) if company_el else "",
            "location": loc_el.get_text(strip=True) if loc_el else "",
            "apply_type": "external",
            "email": None,
            "job_link": BASE_URL + link_el['href'] if link_el else url,
            "source": "shine",
        })
    return jobs
