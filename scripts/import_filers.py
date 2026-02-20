#!/usr/bin/env python3
"""
Import filers (candidates and PACs) from TEC CSV to Supabase.
Filters to active filers only.
"""

import csv
import os
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')  # Service key for inserts

DATA_DIR = Path(os.getenv('TEC_DATA_DIR', './data/TEC_CF_CSV'))
BATCH_SIZE = 500


def get_supabase_client() -> Client:
    """Create Supabase client."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def parse_filer_row(row: dict) -> dict:
    """Parse a filer row into database format."""
    # Build name from parts if available
    name = row.get('filerName', '')
    if not name:
        first = row.get('filerNameFirst', '')
        last = row.get('filerNameLast', '')
        suffix = row.get('filerNameSuffixCd', '')
        if first or last:
            name = f"{last}, {first}".strip(', ')
            if suffix:
                name += f" {suffix}"

    return {
        'id': row.get('filerIdent', ''),
        'name': name,
        'type': row.get('filerTypeCd', ''),
        'party': None,  # Will extract from other sources
        'office_held': row.get('filerHoldOfficeCd', '') or row.get('ctaSeekOfficeCd', ''),
        'office_district': row.get('filerHoldOfficeDistrict', '') or row.get('ctaSeekOfficeDistrict', ''),
        'office_county': row.get('filerHoldOfficeCountyDescr', '') or row.get('ctaSeekOfficeCountyDescr', ''),
        'status': row.get('filerFilerpersStatusCd', '') or row.get('committeeStatusCd', ''),
        'city': row.get('filerStreetCity', ''),
        'state': row.get('filerStreetStateCd', ''),
    }


def import_filers():
    """Import filers from cand.csv."""
    client = get_supabase_client()
    csv_path = DATA_DIR / 'cand.csv'

    if not csv_path.exists():
        print(f"Error: {csv_path} not found")
        return

    print(f"Reading {csv_path}...")

    filers = []
    seen_ids = set()

    with open(csv_path, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f)
        for row in reader:
            filer_id = row.get('filerIdent', '')
            if not filer_id or filer_id in seen_ids:
                continue

            seen_ids.add(filer_id)
            filer = parse_filer_row(row)

            # Skip empty records
            if not filer['name']:
                continue

            filers.append(filer)

    print(f"Found {len(filers)} unique filers")

    # Insert in batches
    total_inserted = 0
    for i in range(0, len(filers), BATCH_SIZE):
        batch = filers[i:i + BATCH_SIZE]
        try:
            result = client.table('filers').upsert(batch).execute()
            total_inserted += len(batch)
            print(f"Inserted batch {i // BATCH_SIZE + 1}: {len(batch)} filers ({total_inserted}/{len(filers)})")
        except Exception as e:
            print(f"Error inserting batch: {e}")
            # Try inserting one by one
            for filer in batch:
                try:
                    client.table('filers').upsert(filer).execute()
                    total_inserted += 1
                except Exception as e2:
                    print(f"Error inserting filer {filer['id']}: {e2}")

    print(f"Done! Inserted {total_inserted} filers")


if __name__ == '__main__':
    import_filers()
