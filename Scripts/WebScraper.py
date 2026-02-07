# import requests
# from bs4 import BeautifulSoup
# import csv
# import time
# import os
#
# # -------------------------------
# # Safe scraper for one place
# # -------------------------------
# def scrape_place(url):
#     headers = {"User-Agent": "Mozilla/5.0"}
#     try:
#         res = requests.get(url, headers=headers, timeout=10)
#         soup = BeautifulSoup(res.text, "html.parser")
#     except Exception as e:
#         print(f"Failed to fetch {url}: {e}")
#         return None
#
#     data = {
#         "name": "",
#         "description": "",
#         "location": "",
#         "dresscode": "",
#         "traffic": "",
#         "open_hours": "",
#         "special": "",
#         "source": url
#     }
#
#     # Name
#     title = soup.find("h1")
#     if title:
#         data["name"] = title.text.strip()
#
#     # Description = first paragraph with text
#     for p in soup.select("div.mw-parser-output > p"):
#         if p.text.strip():
#             data["description"] = p.text.strip()
#             break
#
#     # Infobox scraping
#     infobox = soup.find("table", class_="infobox")
#     if infobox:
#         for row in infobox.find_all("tr"):
#             header = row.find("th")
#             value = row.find("td")
#             if not header or not value:
#                 continue
#             key = header.text.strip().lower()
#             val = value.text.strip()
#             if "location" in key:
#                 data["location"] = val
#             elif "dress" in key:
#                 data["dresscode"] = val
#             elif "hours" in key or "open" in key:
#                 data["open_hours"] = val
#             elif "traffic" in key or "transport" in key:
#                 data["traffic"] = val
#
#     # "Special" = first section after description
#     h2 = soup.find("h2")
#     if h2:
#         section = h2.find_next("p")
#         if section:
#             data["special"] = section.text.strip()
#
#     return data
#
# # -------------------------------
# # Get all page URLs in a category
# # -------------------------------
# def get_category_pages(category_url):
#     pages = []
#     headers = {"User-Agent": "Mozilla/5.0"}
#     url = category_url
#
#     while True:
#         try:
#             res = requests.get(url, headers=headers)
#             soup = BeautifulSoup(res.text, "html.parser")
#         except Exception as e:
#             print(f"Failed to fetch category page {url}: {e}")
#             break
#
#         links = soup.select("#mw-pages .mw-category-group li a")
#         print(f"Found {len(links)} links on page {url}")
#
#         for a in links:
#             link_url = "https://en.wikipedia.org" + a["href"]
#             if "/wiki/List_of" in link_url:
#                 continue
#             pages.append(link_url)
#
#         # Next page
#         next_link = soup.select_one("#mw-pages a[title^='Category:']")
#         if next_link and "pagefrom" in next_link.get("href", ""):
#             url = "https://en.wikipedia.org" + next_link["href"]
#             time.sleep(1)
#         else:
#             break
#
#     return pages
#
# # -------------------------------
# # Main: scrape all categories
# # -------------------------------
# categories = {
#     "Museums": "https://en.wikipedia.org/wiki/Category:Museums_in_Egypt",
#     "Mosques": "https://en.wikipedia.org/wiki/Category:Mosques_in_Egypt",
#     "National_Parks": "https://en.wikipedia.org/wiki/Category:National_parks_of_Egypt",
#     "Beaches": "https://en.wikipedia.org/wiki/Category:Beaches_of_Egypt",
#     "Oases": "https://en.wikipedia.org/wiki/Category:Oases_of_Egypt",
#     "Archaeological_Sites": "https://en.wikipedia.org/wiki/Category:Archaeological_sites_in_Egypt"
# }
#
# output_dir = "egypt_sites"
# os.makedirs(output_dir, exist_ok=True)
#
# for cat_name, cat_url in categories.items():
#     print(f"\nScraping category: {cat_name}")
#     urls = get_category_pages(cat_url)
#     print(f"Total valid pages: {len(urls)}")
#
#     csv_path = os.path.join(output_dir, f"{cat_name}.csv")
#     with open(csv_path, "w", newline="", encoding="utf-8") as f:
#         writer = csv.DictWriter(f, fieldnames=[
#             "name", "description", "location", "dresscode",
#             "traffic", "open_hours", "special", "source"
#         ])
#         writer.writeheader()
#
#         for url in urls:
#             data = scrape_place(url)
#             if data:
#                 writer.writerow(data)
#                 print(f"Saved: {data['name']}")
#             else:
#                 print(f"Failed: {url}")
#             time.sleep(1)  # Be polite to Wikipedia


import os
import pandas as pd
import requests
from bs4 import BeautifulSoup


# ----------------------
# Helpers
# ----------------------
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/114.0.0.0 Safari/537.36"
}

def get_soup(url):
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
        res.raise_for_status()
        return BeautifulSoup(res.text, 'html.parser')
    except Exception as e:
        print(f"Failed: {url} --> {e}")
        return None



def save_to_csv(category, data, folder="scraped_data"):
    """Append or create CSV for a category"""
    os.makedirs(folder, exist_ok=True)
    file_path = os.path.join(folder, f"{category}.csv")

    df = pd.DataFrame(data)
    if os.path.exists(file_path):
        existing = pd.read_csv(file_path)
        df = pd.concat([existing, df], ignore_index=True)

    df.to_csv(file_path, index=False)
    print(f"[Saved] {len(df)} items to {file_path}")


# ----------------------
# Experience Egypt scraping
# ----------------------
def scrape_experience_egypt(base_url="https://www.experienceegypt.eg/en"):
    soup = get_soup(base_url)
    if not soup:
        return

    # "WHAT TO DO" menu (3rd li)
    try:
        menu_li = soup.find_all('li')[2]  # index might need adjustment if site changes
        categories = menu_li.find_all('a', class_='CIMblock')
    except Exception as e:
        print(f"Failed to locate categories: {e}")
        return

    for cat in categories:
        cat_name = cat.find('p').text.strip()
        cat_url = cat['href']
        cat_img = cat.find('img')['data-src'] if cat.find('img') else ''

        # Optional: fetch description from category page
        desc = ''
        cat_soup = get_soup(cat_url)
        if cat_soup:
            content = cat_soup.find('div', class_='col-12 col-lg-7')
            if content:
                desc = ' '.join(p.text.strip() for p in content.find_all('p'))

        # Save/update CSV
        save_to_csv(cat_name, [{
            "title": cat_name,
            "url": cat_url,
            "description": desc,
            "image": cat_img
        }])


# ----------------------
# Run
# ----------------------
if __name__ == "__main__":
    scrape_experience_egypt()
