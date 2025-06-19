from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import time

# Launch Chrome
options = webdriver.ChromeOptions()
options.add_argument("--headless")  # optional: run without opening browser
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

# Open the URL
url = "https://www.mulberry.com/row/shop/women/bags"
driver.get(url)

# Wait for content to load
time.sleep(5)

# Parse the loaded page
soup = BeautifulSoup(driver.page_source, "html.parser")

# Close browser
driver.quit()

# Extract product data
products = []
for item in soup.select("div.list-item.product"):
    name = item.select_one("h3.list-item__title")
    url_tag = item.select_one("a.link-product")
    img_tag = item.select_one("link[itemprop='image']")
    price_tag = item.select_one("p.list-item__price span[itemprop='price']")

    products.append({
        "name": name.text.strip() if name else "N/A",
        "url": "https://www.mulberry.com" + url_tag["href"] if url_tag else "N/A",
        "image": img_tag["href"] if img_tag else "N/A",
        "price": price_tag.text.strip() if price_tag else "N/A",
    })

# Print results
for p in products:
    print(p)
