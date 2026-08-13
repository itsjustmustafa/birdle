import requests
import json
from bs4 import BeautifulSoup

URL = "https://www.birdsinbackyards.net/finder/all-species"


def parse_birds(html):
    soup = BeautifulSoup(html, "html.parser")

    birds = []

    # Every card contains one hero image field
    hero_fields = soup.select(".views-field-field-hero-image")

    # Get the unique parent elements (the cards)
    seen = set()
    cards = []
    for hero in hero_fields:
        card = hero.parent
        if id(card) not in seen:
            seen.add(id(card))
            cards.append(card)

    for card in cards:
        # -------------------------
        # Name + bird page URL
        # -------------------------
        title_link = card.select_one(".views-field-title .field-content a")
        if title_link is None:
            continue

        name = title_link.get_text(strip=True)
        url = title_link.get("href")

        # Make URL absolute if necessary
        if url.startswith("/"):
            url = "https://www.birdsinbackyards.net" + url

        # -------------------------
        # Order + Family
        # -------------------------
        taxonomy_link = card.select_one(".views-field-name .field-content a")

        order = None
        family = None

        if taxonomy_link:
            href = taxonomy_link.get("href", "").strip("/")
            parts = href.split("/", 1)
            if len(parts) == 2:
                order, family = parts

        birds.append({
            "name": name,
            "url": url,
            "order": order,
            "family": family,
        })

    return birds


def main():
    response = requests.get(
        URL,
        headers={
            "User-Agent": "Mozilla/5.0"
        },
        timeout=30,
    )
    response.raise_for_status()

    birds = parse_birds(response.text)

    with open("birds.json", "w", encoding="utf-8") as f:
        json.dump(birds, f, indent=4, ensure_ascii=False)

    print(f"Saved {len(birds)} birds to birds.json")


if __name__ == "__main__":
    main()
