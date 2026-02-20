#!/usr/bin/env python3
"""
Import cover sheets (reports) from TEC CSV to Supabase.
Filters to 2020+ records only.
"""

import csv
import os
from pathlib import Path
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

DATA_DIR = Path(os.getenv('TEC_DATA_DIR', './data/TEC_CF_CSV'))
BATCH_SIZE = 500
MIN_DATE = 20200101


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


def parse_amount(amount_str: str) -> float | None:
    """Parse amount string to float."""
    if not amount_str:
        return None
    try:
        clean = amount_str.replace(',', '').replace('$', '').strip()
        return float(clean) if clean else None
    except ValueError:
        return None


def parse_report_row(row: dict) -> dict | None:
    """Parse a report row into database format."""
    received_date_raw = row.get('receivedDt', '')
    if received_date_raw:
        try:
            date_int = int(received_date_raw[:8]) if len(received_date_raw) >= 8 else 0
            if date_int < MIN_DATE:
                return None
        except ValueError:
            pass

    report_id = row.get('reportInfoIdent', '')
    if not report_id:
        return None

    # Build report type from multiple fields
    report_types = []
    for i in range(1, 11):
        rt = row.get(f'reportTypeCd{i}', '').strip()
        if rt:
            report_types.append(rt)
    report_type = ', '.join(report_types) if report_types else None

    return {
        'id': report_id,
        'filer_id': row.get('filerIdent', ''),
        'filer_name': row.get('filerName', ''),
        'report_type': report_type,
        'period_start': parse_date(row.get('periodStartDt', '')),
        'period_end': parse_date(row.get('periodEndDt', '')),
        'filed_date': parse_date(row.get('filedDt', '')),
        'received_date': parse_date(received_date_raw),
        'total_contributions': parse_amount(row.get('totalContribAmount', '')),
        'total_expenditures': parse_amount(row.get('totalExpendAmount', '')),
        'cash_on_hand': parse_amount(row.get('contribsMaintainedAmount', '')),
    }


def import_reports():
    """Import reports from cover.csv."""
    client = get_supabase_client()
    csv_path = DATA_DIR / 'cover.csv'

    if not csv_path.exists():
        print(f"Error: {csv_path} not found")
        return

    print(f"Reading {csv_path}...")

    reports = []
    skipped = 0

    with open(csv_path, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f)
        for row in reader:
            report = parse_report_row(row)
            if report:
                reports.append(report)
            else:
                skipped += 1

    print(f"Parsed {len(reports)} reports (skipped {skipped} pre-2020)")

    total_imported = 0
    for i in range(0, len(reports), BATCH_SIZE):
        batch = reports[i:i + BATCH_SIZE]
        try:
            client.table('reports').upsert(batch).execute()
            total_imported += len(batch)
            print(f"Inserted batch: {len(batch)} reports ({total_imported}/{len(reports)})")
        except Exception as e:
            print(f"Error inserting batch: {e}")
            for report in batch:
                try:
                    client.table('reports').upsert(report).execute()
                    total_imported += 1
                except Exception as e2:
                    print(f"Error inserting report {report['id']}: {e2}")

    print(f"\nDone! Imported {total_imported} reports")


if __name__ == '__main__':
    import_reports()
