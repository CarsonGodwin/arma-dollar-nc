-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Filers table (candidates, PACs, committees)
CREATE TABLE IF NOT EXISTS filers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,  -- COH, GPAC, MPAC, SPAC, etc.
  party TEXT,
  office_held TEXT,
  office_district TEXT,
  office_county TEXT,
  status TEXT,
  city TEXT,
  state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for filers
CREATE INDEX IF NOT EXISTS idx_filers_name ON filers USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_filers_type ON filers(type);
CREATE INDEX IF NOT EXISTS idx_filers_party ON filers(party);
CREATE INDEX IF NOT EXISTS idx_filers_office ON filers(office_held);

-- Contributions table
CREATE TABLE IF NOT EXISTS contributions (
  id TEXT PRIMARY KEY,
  filer_id TEXT REFERENCES filers(id),
  filer_name TEXT,
  contributor_name TEXT,
  contributor_type TEXT,  -- INDIVIDUAL, ENTITY, etc.
  contributor_city TEXT,
  contributor_state TEXT,
  contributor_employer TEXT,
  contributor_occupation TEXT,
  amount DECIMAL(12,2),
  date DATE,
  description TEXT,
  report_id TEXT,
  received_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for contributions
CREATE INDEX IF NOT EXISTS idx_contributions_filer ON contributions(filer_id);
CREATE INDEX IF NOT EXISTS idx_contributions_name ON contributions USING gin(contributor_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_contributions_date ON contributions(date);
CREATE INDEX IF NOT EXISTS idx_contributions_amount ON contributions(amount);
CREATE INDEX IF NOT EXISTS idx_contributions_type ON contributions(contributor_type);
CREATE INDEX IF NOT EXISTS idx_contributions_received ON contributions(received_date);

-- Expenditures table
CREATE TABLE IF NOT EXISTS expenditures (
  id TEXT PRIMARY KEY,
  filer_id TEXT REFERENCES filers(id),
  filer_name TEXT,
  payee_name TEXT,
  payee_city TEXT,
  payee_state TEXT,
  amount DECIMAL(12,2),
  date DATE,
  category TEXT,
  description TEXT,
  report_id TEXT,
  received_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for expenditures
CREATE INDEX IF NOT EXISTS idx_expenditures_filer ON expenditures(filer_id);
CREATE INDEX IF NOT EXISTS idx_expenditures_name ON expenditures USING gin(payee_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_expenditures_date ON expenditures(date);
CREATE INDEX IF NOT EXISTS idx_expenditures_amount ON expenditures(amount);
CREATE INDEX IF NOT EXISTS idx_expenditures_category ON expenditures(category);

-- Reports table (cover sheets)
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  filer_id TEXT REFERENCES filers(id),
  filer_name TEXT,
  report_type TEXT,
  period_start DATE,
  period_end DATE,
  filed_date DATE,
  received_date DATE,
  total_contributions DECIMAL(12,2),
  total_expenditures DECIMAL(12,2),
  cash_on_hand DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for reports
CREATE INDEX IF NOT EXISTS idx_reports_filer ON reports(filer_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_filed ON reports(filed_date);

-- Enable Row Level Security but allow anonymous read access
ALTER TABLE filers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenditures ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous read access
CREATE POLICY "Allow anonymous read access on filers"
  ON filers FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous read access on contributions"
  ON contributions FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous read access on expenditures"
  ON expenditures FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous read access on reports"
  ON reports FOR SELECT
  USING (true);
