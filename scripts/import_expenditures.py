#!/usr/bin/env python3
"""
Import expenditures from TEC CSV files to Supabase.
Filters to 2020+ records only.
"""

import csv
import os
from pathlib import Path
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv
import glob

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

DATA_DIR = Path(os.getenv('TEC_DATA_DIR', './data/TEC_CF_CSV'))
BATCH_SIZE = 1000
MIN_DATE = 20200101  # Filter to 2020+


def get_supabase_client() -> Client:
    """Create Supabase client."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def parse_date(date_str: str) -> str | None:
    """Parse TEC date format (YYYYMMDD) to ISO date."""
    if not date_str or len(date_str) < 8:
        return None
    try:
        if len(date_str) == 8 and date_str.isdigit():
            return f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:8]}"
        for fmt in ['%Y%m%d', '%m/%d/%Y', '%Y-%m-%d']:
            try:
                dt = datetime.strptime(date_str[:10], fmt)
                return dt.strftime('%Y-%m-%d')
            except ValueError:
                continue
        return None
    except Exception:
        return None


def parse_amount(amount_str: str) -> float:
    """Parse amount string to float."""
    if not amount_str:
        return 0.0
    try:
        clean = amount_str.replace(',', '').replace('$', '').strip()
        return float(clean) if clean else 0.0
    except ValueError:
        return 0.0


def build_payee_name(row: dict) -> str:
    """Build payee name from row data."""
    org = row.get('payeeNameOrganization', '').strip()
    if org:
        return org

    last = row.get('payeeNameLast', '').strip()
    first = row.get('payeeNameFirst', '').strip()
    suffix = row.get('payeeNameSuffixCd', '').strip()

    if last and first:
        name = f"{last}, {first}"
        if suffix:
            name += f" {suffix}"
        return name
    elif last:
        return last
    elif first:
        return first

    return 'Unknown'


def parse_expenditure_row(row: dict) -> dict | None:
    """Parse an expenditure row into database format."""
    received_date_raw = row.get('receivedDt', '')
    if received_date_raw:
        try:
            date_int = int(received_date_raw[:8]) if len(received_date_raw) >= 8 else 0
            if date_int < MIN_DATE:
                return None
        except ValueError:
            pass

    expend_id = row.get('expendInfoId', '')
    if not expend_id:
        return None

    return {
        'id': expend_id,
        'filer_id': row.get('filerIdent', ''),
        'filer_name': row.get('filerName', ''),
        'payee_name': build_payee_name(row),
        'payee_city': row.get('payeeStreetCity', ''),
        'payee_state': row.get('payeeStreetStateCd', ''),
        'amount': parse_amount(row.get('expendAmount', '')),
        'date': parse_date(row.get('expendDt', '')),
        'category': row.get('expendCatCd', '') or row.get('expendCatDescr', ''),
        'description': row.get('expendDescr', ''),
        'report_id': row.get('reportInfoIdent', ''),
        'received_date': parse_date(received_date_raw),
    }


def import_expenditures():
    """Import expenditures from all expend_*.csv files."""
    client = get_supabase_client()

    csv_files = sorted(glob.glob(str(DATA_DIR / 'expend_*.csv')))
    print(f"Found {len(csv_files)} expenditure files")

    total_imported = 0
    total_skipped = 0

    for csv_path in csv_files:
        print(f"\nProcessing {os.path.basename(csv_path)}...")

        expenditures = []
        file_skipped = 0

        with open(csv_path, 'r', encoding='utf-8', errors='replace') as f:
            reader = csv.DictReader(f)
            for row in reader:
                expend = parse_expenditure_row(row)
                if expend:
                    expenditures.append(expend)
                else:
                    file_skipped += 1

        print(f"  Parsed {len(expenditures)} expenditures (skipped {file_skipped} pre-2020)")
        total_skipped += file_skipped

        for i in range(0, len(expenditures), BATCH_SIZE):
            batch = expenditures[i:i + BATCH_SIZE]
            try:
                client.table('expenditures').upsert(batch).execute()
                total_imported += len(batch)
                print(f"  Inserted batch: {len(batch)} expenditures ({total_imported} total)")
            except Exception as e:
                print(f"  Error inserting batch: {e}")
                for j in range(0, len(batch), 100):
                    mini_batch = batch[j:j + 100]
                    try:
                        client.table('expenditures').upsert(mini_batch).execute()
                        total_imported += len(mini_batch)
                    except Exception as e2:
                        print(f"    Error with mini-batch: {e2}")

    print(f"\nDone! Imported {total_imported} expenditures (skipped {total_skipped} pre-2020)")


if __name__ == '__main__':
    import_expenditures()
