import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { extractJobFromAbler } from '@/lib/scraper';
import { generateBrandKitAI } from '@/lib/ai-engine';
import { renderBrandKitPNGs } from '@/lib/renderer';
import { uploadAssetsAndSendEmail } from '@/lib/distribution';

export async function POST(request: Request) {
  try {
    const { jobUrl, recipientEmail } = await request.json();

    if (!jobUrl || !recipientEmail) {
      return NextResponse.json(
        { error: 'jobUrl and recipientEmail are required' },
        { status: 400 }
      );
    }

    // 1. Create DB record with pending status
    const { data: dbJob, error: dbError } = await supabase
      .from('brandkit_jobs')
      .insert([{ job_url: jobUrl, recipient_email: recipientEmail, status: 'pending' }])
      .select()
      .single();

    if (dbError || !dbJob) {
      throw new Error(`Database error: ${dbError?.message || 'Failed to insert job'}`);
    }

    // Process asynchronously background pipeline
    (async () => {
      try {
        await supabase.from('brandkit_jobs').update({ status: 'processing' }).eq('id', dbJob.id);

        const extractedData = await extractJobFromAbler(jobUrl);
        const { sourcing, copy } = await generateBrandKitAI(extractedData);
        const pngBuffers = await renderBrandKitPNGs(copy);
        const assetUrls = await uploadAssetsAndSendEmail(
          dbJob.id,
          recipientEmail,
          pngBuffers,
          sourcing,
          copy
        );

        await supabase
          .from('brandkit_jobs')
          .update({
            status: 'completed',
            extracted_data: extractedData,
            sourcing_profile: sourcing,
            copy_data: copy,
            asset_urls: assetUrls,
            completed_at: new Date().toISOString(),
          })
          .eq('id', dbJob.id);
      } catch (procErr: any) {
        await supabase
          .from('brandkit_jobs')
          .update({
            status: 'failed',
            error_message: procErr?.message || 'Processing failed',
          })
          .eq('id', dbJob.id);
      }
    })();

    return NextResponse.json({ success: true, jobId: dbJob.id, status: 'pending' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
