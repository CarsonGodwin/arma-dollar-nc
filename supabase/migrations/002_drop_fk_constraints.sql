-- Drop foreign key constraints to allow importing data without all filers
ALTER TABLE contributions DROP CONSTRAINT IF EXISTS contributions_filer_id_fkey;
ALTER TABLE expenditures DROP CONSTRAINT IF EXISTS expenditures_filer_id_fkey;
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_filer_id_fkey;

-- Add indexes on filer_id if not exist (these help with queries)
CREATE INDEX IF NOT EXISTS idx_contributions_filer_id ON contributions(filer_id);
CREATE INDEX IF NOT EXISTS idx_expenditures_filer_id ON expenditures(filer_id);
CREATE INDEX IF NOT EXISTS idx_reports_filer_id ON reports(filer_id);
