# Armadollar

A searchable web interface for Texas Ethics Commission (TEC) campaign finance data. All queries run entirely in the browser using DuckDB-WASM -- no backend server needed.

**Built with:** Astro 5 + React 19 + DuckDB-WASM + Tailwind CSS v4

## What it does

- Search millions of campaign contributions, expenditures, and filer records
- Browse candidate/committee profiles with top donors, financial timelines, and contribution tables
- Build complex boolean queries with AND/OR groups, aggregations, and regex support
- Filter by donor name, amount range, date, party, office type, geographic region
- Export results to CSV
- Community party tagging (via Supabase) for filers missing party affiliation

## How it works

The entire database runs client-side. On first visit, the browser downloads ~290MB of Parquet files from a CDN, caches them in IndexedDB, and loads them into DuckDB-WASM. After that first load, everything is instant -- queries run locally with zero network latency.

```
[Parquet files on CDN]  -->  [Browser downloads once]  -->  [IndexedDB cache]
                                                                    |
                                                              [DuckDB-WASM]
                                                                    |
                                                         [SQL queries in-browser]
```

**Performance:**
- First visit: 30-60 seconds (downloads ~290MB, then cached)
- Subsequent visits: <1 second (loads from IndexedDB)
- Query speed: <100ms (all in-browser, no network)

## Architecture

### Data pipeline

1. Download raw CSV data from the [Texas Ethics Commission](https://www.ethics.state.tx.us/data/search/cf/)
2. Run the Python import scripts (`scripts/`) to parse and clean the data
3. Convert to Parquet format (using DuckDB CLI or similar)
4. Upload Parquet files to a CDN (Cloudflare R2, S3, etc.)

### Parquet files

| File | Size | Records | Description |
|------|------|---------|-------------|
| `filers.parquet` | 380 KB | ~2,800 | Candidates, PACs, committees |
| `reports.parquet` | 7.5 MB | ~95K | Campaign finance report cover sheets |
| `expenditures.parquet` | 86 MB | ~1.5M | Spending transactions |
| `contributions_2020.parquet` | 210 MB | ~8-10M | Donation records (2020+) |

### Key source files

| File | What it does |
|------|-------------|
| `src/lib/duckdb.ts` | DuckDB-WASM singleton, all query functions, SQL generation |
| `src/lib/parquet-cache.ts` | IndexedDB caching with download progress tracking |
| `src/lib/supabase.ts` | Supabase client for community party tagging |
| `src/components/AdvancedSearch.tsx` | Main search UI with faceted filters |
| `src/components/QueryBuilder.tsx` | Boolean query builder (AND/OR groups, aggregations) |
| `src/components/CandidateProfile.tsx` | Candidate detail page with charts and tables |
| `src/components/ResultsTable.tsx` | Sortable results table with CSV export |
| `scripts/import_*.py` | Parse TEC CSV files into structured data |

### Date format

TEC stores dates as 8-digit integers: `20241215` = December 15, 2024. DuckDB's `make_date()` handles conversions.

## Adapting for another state

This architecture works for any state that publishes campaign finance data. Here's what you'd change:

1. **Data source** -- Replace the TEC CSV import scripts with parsers for your state's data format. Every state publishes this differently.

2. **Parquet files** -- Convert your state's data into the same schema (or modify the SQL views in `duckdb.ts` to match your columns). The four tables are: `filers`, `contributions`, `expenditures`, `reports`.

3. **CDN URL** -- Set `PUBLIC_DATA_URL` in `.env` to point at your Parquet host.

4. **Party tags** -- The `public/party_tags.json` and Supabase integration are Texas-specific. Replace with your state's party data or remove if your data source includes party affiliation.

5. **Geographic data** -- `public/texas_geo.json` maps Texas cities to counties and metro regions. Replace with your state's geography or remove the geographic filter feature.

6. **Branding** -- Colors in `tailwind.config.js` and `global.css` use Texas-themed values. The layout is in `src/layouts/BaseLayout.astro`.

The core engine (`duckdb.ts` + `parquet-cache.ts` + the React components) is state-agnostic. The SQL queries just need tables with the right column names.

## Setup

```bash
# Install dependencies
bun install

# Copy and configure environment
cp .env.example .env
# Edit .env with your PUBLIC_DATA_URL (and optionally Supabase credentials)

# Start dev server
bun run dev
```

The dev server runs at `localhost:4321`. You'll need Parquet files hosted at your `PUBLIC_DATA_URL` for the app to load data.

### Deploying

The site builds to static HTML:

```bash
bun run build              # Outputs to dist/
bun run preview            # Preview the build locally
```

Deploy the `dist/` folder to any static host (Cloudflare Pages, Netlify, Vercel, GitHub Pages, etc.).

### Import scripts

The Python scripts in `scripts/` parse TEC's raw CSV exports. They were originally used to load data into Supabase, but the same parsing logic applies if you're converting to Parquet.

```bash
cd scripts
pip install -r requirements.txt

# Set the path to your extracted TEC CSV data
export TEC_DATA_DIR=./data/TEC_CF_CSV

python import_filers.py
python import_contributions.py
python import_expenditures.py
python import_reports.py
```

## Why this approach

Campaign finance data is public but hard to use. State websites are slow, limited in search capability, and don't support cross-referencing or aggregation. Commercial tools exist but cost money and restrict access.

Running DuckDB in the browser means:
- **No server costs** -- Static files on a CDN is essentially free
- **No API limits** -- Every query runs locally
- **Fast iteration** -- SQL queries execute in milliseconds
- **Privacy** -- No query logs, no tracking, no third-party analytics
- **Portable** -- Once cached, works offline

The tradeoff is the initial ~290MB download, which takes 30-60 seconds on a decent connection. After that, it's faster than any server-based solution.
