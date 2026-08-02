CREATE TABLE IF NOT EXISTS public.brandkit_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_url TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    extracted_data JSONB NULL,
    sourcing_profile JSONB NULL,
    copy_data JSONB NULL,
    asset_urls JSONB NULL,
    error_message TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ NULL
);

-- Enable RLS and set public policies (safe idempotent query)
ALTER TABLE public.brandkit_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert and select" ON public.brandkit_jobs;
DROP POLICY IF EXISTS "Allow public insert" ON public.brandkit_jobs;
DROP POLICY IF EXISTS "Allow public select" ON public.brandkit_jobs;

CREATE POLICY "Allow public insert" ON public.brandkit_jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON public.brandkit_jobs FOR SELECT USING (true);
