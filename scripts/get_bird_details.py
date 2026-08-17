import json
import re
import requests
from bs4 import BeautifulSoup

# ==========================================
# Configuration
# ==========================================

START_INDEX = 0
END_INDEX = 401

HEADERS = {"User-Agent": "Mozilla/5.0"}


# ==========================================
# Helpers
# ==========================================


def extract_field_items(soup, field_class):
    """
    Returns the inner text of every .field-item inside the given field.
    Returns [] if the field doesn't exist.
    """
    parent = soup.select_one(f".{field_class}")

    if parent is None:
        return []

    return [item.get_text(" ", strip=True) for item in parent.select(".field-item")]


def extract_number_field(soup, field_class):
    """
    Extracts the first number from a field.
    Examples:
    "35cm" -> 35
    "400g" -> 400
    "4 025g" -> 4025
    """
    field = soup.select_one(f".{field_class}")

    if field is None:
        return None

    text = field.get_text(" ", strip=True)

    match = re.search(r"\d+(?: *\d+)*", text)

    if match:
        return int(match.group().replace(" ", ""))

    return None


def extract_single_field_text(soup, field_class):
    """
    Gets the inner text of the .field-items child.
    """
    field = soup.select_one(f".{field_class}")

    if field is None:
        return None

    value = field.select_one(".field-items")

    if value is None:
        return None

    return value.get_text(" ", strip=True)


# ==========================================
# Scraper
# ==========================================

HARDCODED = {
    "Brown Cuckoo-Dove": {
        "order": "Columbiformes",
        "family": "Columbidae",
    },
    "Common Myna": {
        "order": "Passeriformes",
        "family": "Sturnidae",
    },
    "Eastern Barn Owl": {
        "order": "Strigiformes",
        "family": "Tytonidae",
    },
    "Scrubtit": {
        "order": "Passeriformes",
        "family": "Acanthizidae",
    },
    "Australian Painted Snipe": {
        "image_url": "https://birdlife.org.au/wp-content/uploads/2023/04/c.tzaros-snipe-gallery-768x426.jpg",
    },
    "Black-eared Cuckoo": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Chrysococcyx_osculans_-_Glen_Davis.jpg/500px-Chrysococcyx_osculans_-_Glen_Davis.jpg",
    },
    "Blue Bonnet": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Northiella_haematogaster_-Cocoparra_National_Park-8.jpg/500px-Northiella_haematogaster_-Cocoparra_National_Park-8.jpg",
    },
    "Broad-billed Sandpiper": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Broad_billed_sandpiper_by_Sreedev_Puthur.jpg/500px-Broad_billed_sandpiper_by_Sreedev_Puthur.jpg",
    },
    "Common Noddy": {
        "image_url": "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/58291321/480",
    },
    "Eclectus Parrot": {
        "image_url": "https://a-z-animals.com/media/2026/04/shutterstock-2481693531-huge-licensed-scaled-600x400.jpg",
    },
    "Elegant Parrot": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Elegant_Parrot_4.jpg/500px-Elegant_Parrot_4.jpg",
    },
    "Little Button-quail": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Turnix_velox_40860983.jpg/500px-Turnix_velox_40860983.jpg",
    },
    "Little Lorikeet": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Little_Lorikeet_kobble.JPG/500px-Little_Lorikeet_kobble.JPG",
    },
    "Plains-wanderer": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Plains-wanderer_female_8173.jpg/500px-Plains-wanderer_female_8173.jpg",
    },
    "Purple-crowned Lorikeet": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Purple_crowned_lorikeet_%284989713000%29.jpg/500px-Purple_crowned_lorikeet_%284989713000%29.jpg",
    },
    "Scarlet-chested Parrot": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Scarlet-chested_Parrot_0A2A5594.jpg/500px-Scarlet-chested_Parrot_0A2A5594.jpg",
    },
    "Broad-billed Sandpiper": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Broad_billed_sandpiper_by_Sreedev_Puthur.jpg/500px-Broad_billed_sandpiper_by_Sreedev_Puthur.jpg",
    },
    "Stubble Quail": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Stubble_Quail_%28Coturnix_pectoralis%29_male_%2814377891677%29%2C_crop.jpg/500px-Stubble_Quail_%28Coturnix_pectoralis%29_male_%2814377891677%29%2C_crop.jpg",
    },
    "White-fronted Tern": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Sterna_striata%2C_Kaiaua%2C_Firth_Of_Thames%2C_Waikato%2C_New_Zealand_2.jpg/500px-Sterna_striata%2C_Kaiaua%2C_Firth_Of_Thames%2C_Waikato%2C_New_Zealand_2.jpg",
    },
    "White-winged Black Tern": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Chlidonias_leucopterus_2023-04-08.jpg/500px-Chlidonias_leucopterus_2023-04-08.jpg",
    },
    "Yellow-tufted Honeyeater": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Lichenostomus_melanops_-_Glen_Davis.jpg/500px-Lichenostomus_melanops_-_Glen_Davis.jpg",
    },
    "Zebra Finch": {
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Zebra_finch_group.png/500px-Zebra_finch_group.png",
    },
}


def scrape_bird(url, initial_bird_data):
    response = requests.get(url, headers=HEADERS, timeout=30)

    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # --------------------------------------
    # Bird Groups
    # --------------------------------------

    bird_groups = []

    group_parent = soup.select_one(".field-name-field-feature-groups")

    if group_parent:
        bird_groups = [a.get_text(strip=True) for a in group_parent.select("a")]

    # --------------------------------------
    # Hero Image
    # --------------------------------------

    image_url = None

    hero = soup.select_one(".field-name-field-hero-image img") or soup.select_one(
        ".field-name-field-image img"
    )

    if hero:
        image_url = hero.get("src")

        if image_url and image_url.startswith("/"):
            image_url = "https://www.birdsinbackyards.net" + image_url

    # --------------------------------------
    # General Attributes
    # --------------------------------------

    colours = extract_field_items(soup, "field-name-field-colour")

    size = extract_field_items(soup, "field-name-field-size")

    bird_shape = extract_field_items(soup, "field-name-field-bird-shape")

    distinctive_features = extract_field_items(soup, "field-name-field-distinctive")

    # --------------------------------------
    # Average Size / Weight
    # --------------------------------------

    average_size = str(
        extract_number_field(soup, "field-name-field-avg-size") or "Unspecified"
    )

    average_weight = str(
        extract_number_field(soup, "field-name-field-avg-weight") or "Unspecified"
    )

    # --------------------------------------
    # Conservation Status
    # --------------------------------------

    conservation_status = {
        "Federal": extract_single_field_text(soup, "field-name-field-federal")
        or "Status unspecified",
        "NSW": extract_single_field_text(soup, "field-name-field-nsw")
        or "Status unspecified",
        "NT": extract_single_field_text(soup, "field-name-field-nt")
        or "Status unspecified",
        "QLD": extract_single_field_text(soup, "field-name-field-qld")
        or "Status unspecified",
        "SA": extract_single_field_text(soup, "field-name-field-sa")
        or "Status unspecified",
        "TAS": extract_single_field_text(soup, "field-name-field-tas")
        or "Status unspecified",
        "VIC": extract_single_field_text(soup, "field-name-field-vic")
        or "Status unspecified",
        "WA": extract_single_field_text(soup, "field-name-field-wa")
        or "Status unspecified",
    }

    # --------------------------------------
    # Descriptions
    # --------------------------------------

    profile_description = (
        extract_single_field_text(soup, "field-name-field-profiledescription")
        or "Unspecified"
    )

    similar_species = (
        extract_single_field_text(soup, "field-name-field-similar-species")
        or "Unspecified"
    )

    call_description = (
        extract_single_field_text(soup, "field-name-field-call-description")
        or "Unspecified"
    )

    did_you_know_description = (
        extract_single_field_text(soup, "field-name-field-did-you-know")
        or "Unspecified"
    )

    return {
        "name": initial_bird_data["name"],
        "order": HARDCODED.get(initial_bird_data["name"], {}).get("order")
        or initial_bird_data["order"]
        or "Unspecified",
        "family": HARDCODED.get(initial_bird_data["name"], {}).get("family")
        or initial_bird_data["family"]
        or "Unspecified",
        "bird_groups": bird_groups,
        "image_url": HARDCODED.get(initial_bird_data["name"], {}).get("image_url")
        or image_url,
        "colours": colours,
        "size": size,
        "bird_shape": bird_shape,
        "distinctive_features": distinctive_features,
        "average_size": average_size,
        "average_weight": average_weight,
        "conservation_status": conservation_status,
        "call_description": call_description,
        "did_you_know": did_you_know_description,
        "description": profile_description,
        "similar_species": similar_species,
    }


# ==========================================
# Main
# ==========================================


def main():
    with open("birds.json", encoding="utf-8") as f:
        birds = json.load(f)

    end = min(END_INDEX, len(birds) - 1)

    results = []

    for index in range(START_INDEX, end + 1):
        bird = birds[index]

        print(f"[{index}/{len(birds)-1}] {bird['name']}...")

        try:
            extra_data = scrape_bird(bird["url"], bird)

            # Keep original bird data + scraped data
            results.append(
                {
                    **bird,
                    **extra_data,
                }
            )

        except Exception as e:
            print(f"    Failed: {e}")

    filename = f"birds_{START_INDEX:03}_{end:03}.json"

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4, ensure_ascii=False)

    print(f"\nSaved {len(results)} birds to {filename}")


if __name__ == "__main__":
    main()
