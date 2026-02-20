import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing. Please set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY.');
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

// Legacy export for compatibility - use getSupabase() instead
export const supabase = {
  from: (table: string) => getSupabase().from(table),
};

// Type definitions for our database tables
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

// Valid party options for tagging
export const PARTY_OPTIONS = [
  'REPUBLICAN',
  'DEMOCRAT',
  'LIBERTARIAN',
  'GREEN',
  'INDEPENDENT',
] as const;

export type PartyOption = typeof PARTY_OPTIONS[number];

/**
 * Get the user-submitted party tag for a filer (if any)
 */
export async function getPartyTag(filerId: string): Promise<PartyTag | null> {
  try {
    const { data, error } = await getSupabase()
      .from('party_tags')
      .select('*')
      .eq('filer_id', filerId)
      .single();

    if (error) {
      // PGRST116 means no rows found - that's fine
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching party tag:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error fetching party tag:', err);
    return null;
  }
}

/**
 * Submit a party tag for a filer
 * Returns true if successful, false if the filer was already tagged
 */
export async function submitPartyTag(filerId: string, party: PartyOption): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await getSupabase()
      .from('party_tags')
      .insert({ filer_id: filerId, party });

    if (error) {
      // Primary key violation means already tagged
      if (error.code === '23505') {
        return { success: false, error: 'This filer has already been tagged' };
      }
      console.error('Error submitting party tag:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error submitting party tag:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}
