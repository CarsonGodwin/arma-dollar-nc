#!/usr/bin/env python3
"""Create Texas city-to-county lookup JSON from Simplemaps data."""
import csv
import json
import os
import re
from pathlib import Path

INPUT_CSV = Path(os.getenv('SIMPLEMAPS_CSV', './data/uscities.csv'))
OUTPUT_JSON = Path(os.getenv('GEO_OUTPUT', './public/texas_geo.json'))

TEXAS_REGIONS = {
    'DFW': ['Collin', 'Dallas', 'Denton', 'Ellis', 'Hunt', 'Kaufman', 'Rockwall',
            'Tarrant', 'Johnson', 'Parker', 'Wise', 'Hood', 'Somervell'],
    'Houston': ['Harris', 'Fort Bend', 'Montgomery', 'Brazoria', 'Galveston',
                'Chambers', 'Liberty', 'Waller', 'Austin'],
    'San Antonio': ['Bexar', 'Comal', 'Guadalupe', 'Kendall', 'Medina',
                    'Wilson', 'Atascosa', 'Bandera'],
    'Austin': ['Travis', 'Williamson', 'Hays', 'Bastrop', 'Caldwell'],
    'El Paso': ['El Paso', 'Hudspeth'],
    'Rio Grande Valley': ['Cameron', 'Hidalgo', 'Starr', 'Willacy'],
}


def normalize_city(city_name: str) -> str:
    """Normalize city name for matching (must match TypeScript version)."""
    if not city_name:
        return ''
    n = city_name.upper().strip()
    n = re.sub(r'\s+', ' ', n)                           # collapse whitespace
    n = re.sub(r'^FT\.?\s+', 'FORT ', n)                 # FT WORTH -> FORT WORTH
    n = re.sub(r'^ST\.?\s+', 'SAINT ', n)                # ST HEDWIG -> SAINT HEDWIG
    n = re.sub(r',?\s*(TX|TEXAS)$', '', n, flags=re.I)   # strip trailing state
    n = re.sub(r'\s+TX\s+USA$', '', n, flags=re.I)       # DALLAS TX USA -> DALLAS
    return n.strip()


def get_region_for_county(county: str) -> str | None:
    """Get the metro region for a county, if any."""
    for region, counties in TEXAS_REGIONS.items():
        if county in counties:
            return region
    return None


def main():
    if not INPUT_CSV.exists():
        print(f"Error: {INPUT_CSV} not found.")
        print("Please download the free US Cities database from:")
        print("  https://simplemaps.com/data/us-cities")
        print(f"and save it to: {INPUT_CSV}")
        return

    cities = {}
    counties = set()

    with open(INPUT_CSV, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get('state_id') != 'TX':
                continue

            city = row.get('city', '').strip()
            county = row.get('county_name', '').strip()
            county_fips = row.get('county_fips', '').strip()

            if not city or not county:
                continue

            counties.add(county)
            region = get_region_for_county(county)
            normalized = normalize_city(city)

            # Only add if not already present (first entry wins)
            if normalized not in cities:
                cities[normalized] = {
                    'county': county,
                    'county_fips': county_fips,
                    'region': region
                }

    # Write output
    output = {
        'cities': cities,
        'counties': sorted(counties),
        'regions': TEXAS_REGIONS,
        'attribution': 'City data from Simplemaps.com (CC-BY 4.0)',
        'lastUpdated': '2026-01-26'
    }

    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_JSON, 'w') as f:
        json.dump(output, f, indent=2)

    print(f"Created {OUTPUT_JSON}")
    print(f"  - {len(cities)} cities")
    print(f"  - {len(counties)} counties")
    print(f"  - {len(TEXAS_REGIONS)} metro regions")


if __name__ == '__main__':
    main()
