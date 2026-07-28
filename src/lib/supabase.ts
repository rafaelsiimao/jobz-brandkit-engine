import { createClient } from '@supabase/supabase-js';
import { BrandKitJob } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

export function mapDbJobToModel(row: Record<string, any>): BrandKitJob {
  return {
    id: row.id,
    job_url: row.job_url,
    recipient_email: row.recipient_email,
    status: row.status,
    extracted_data: row.extracted_data || undefined,
    sourcing_profile: row.sourcing_profile || undefined,
    copy_data: row.copy_data || undefined,
    asset_urls: row.asset_urls || undefined,
    error_message: row.error_message || undefined,
    created_at: row.created_at,
    completed_at: row.completed_at || undefined,
  };
}
