// Party-tagging is intentionally disabled for NC migration v1.
// This file preserves the API surface used by components while returning no-op values.

export function getSupabase(): never {
  throw new Error('Supabase integration is disabled in this deployment.');
}

// Legacy export for compatibility
export const supabase = {
  from: () => {
    throw new Error('Supabase integration is disabled in this deployment.');
  },
};

// Type definitions kept for compatibility with existing components
export interface Filer {
  id: string;
  name: string;
  type: string;
  party?: string;
  office_held?: string;
  office_district?: string;
  status?: string;
}

export interface Contribution {
  id: string;
  filer_id: string;
  filer_name?: string;
  contributor_name: string;
  contributor_type?: string;
  contributor_city?: string;
  contributor_state?: string;
  contributor_employer?: string;
  contributor_occupation?: string;
  amount: number;
  date: string;
  description?: string;
  report_id?: string;
}

export interface Expenditure {
  id: string;
  filer_id: string;
  filer_name?: string;
  payee_name: string;
  payee_city?: string;
  payee_state?: string;
  amount: number;
  date: string;
  category?: string;
  description?: string;
  report_id?: string;
}

export interface Report {
  id: string;
  filer_id: string;
  filer_name?: string;
  report_type?: string;
  period_start?: string;
  period_end?: string;
  filed_date?: string;
  total_contributions?: number;
  total_expenditures?: number;
  cash_on_hand?: number;
}

export interface PartyTag {
  filer_id: string;
  party: string;
  tagged_at: string;
}

export const PARTY_OPTIONS = [
  'REPUBLICAN',
  'DEMOCRAT',
  'LIBERTARIAN',
  'GREEN',
  'INDEPENDENT',
] as const;

export type PartyOption = typeof PARTY_OPTIONS[number];

export async function getPartyTag(_filerId: string): Promise<PartyTag | null> {
  return null;
}

export async function submitPartyTag(
  _filerId: string,
  _party: PartyOption
): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Party tagging is disabled for this deployment.' };
}
