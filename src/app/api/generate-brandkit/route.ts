import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { extractJobFromAbler } from '@/lib/scraper';
import { generateBrandKitAI } from '@/lib/ai-engine';
import { renderBrandKitPNGs } from '@/lib/renderer';
import { uploadAssetsAndSendEmail } from '@/lib/distribution';



export async function POST(request: Request) {
  let jobId: string | null = null;

  try {
    const { jobUrl, recipientEmail } = await request.json();

    if (!jobUrl || !recipientEmail) {
      return NextResponse.json(
        { error: 'jobUrl e recipientEmail são obrigatórios' },
        { status: 400 }
      );
    }

    // 1. Criar registro inicial com status 'pending'
    const { data: dbJob, error: dbError } = await supabase
      .from('brandkit_jobs')
      .insert([{ job_url: jobUrl, recipient_email: recipientEmail, status: 'pending' }])
      .select()
      .single();

    if (dbError || !dbJob) {
      throw new Error(`Erro no Supabase DB: ${dbError?.message || 'Falha ao inserir job'}`);
    }

    jobId = dbJob.id;

    // Execute pipeline synchronously with step-by-step Supabase status tracking
    
    // Etapa 1: Extração da Vaga (Scraper)
    await supabase.from('brandkit_jobs').update({ status: 'scraping' }).eq('id', jobId);
    const extractedData = await extractJobFromAbler(jobUrl);

    // Etapa 2: Inteligência de Recrutamento & Copy (IA)
    await supabase
      .from('brandkit_jobs')
      .update({ status: 'generating_ai', extracted_data: extractedData })
      .eq('id', jobId);

    const { sourcing, copy } = await generateBrandKitAI(extractedData);

    // Etapa 3: Renderização das Artes PNG
    await supabase
      .from('brandkit_jobs')
      .update({ status: 'rendering_arts', sourcing_profile: sourcing, copy_data: copy })
      .eq('id', jobId);

    const pngBuffers = await renderBrandKitPNGs(copy);

    // Etapa 4: Upload para Storage & Envio por E-mail
    await supabase.from('brandkit_jobs').update({ status: 'uploading_and_mailing' }).eq('id', jobId);

    const assetUrls = await uploadAssetsAndSendEmail(
      jobId,
      recipientEmail,
      pngBuffers,
      sourcing,
      copy
    );

    // Etapa Concluída com Sucesso!
    await supabase
      .from('brandkit_jobs')
      .update({
        status: 'completed',
        asset_urls: assetUrls,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    return NextResponse.json({
      success: true,
      jobId,
      status: 'completed',
      assetUrls,
      message: 'BrandKit gerado e enviado com sucesso!'
    });

  } catch (err: any) {
    const errorMsg = err?.message || 'Erro durante o processamento do pipeline';
    console.error('Falha no pipeline BrandKit:', errorMsg);

    if (jobId) {
      await supabase
        .from('brandkit_jobs')
        .update({
          status: 'failed',
          error_message: errorMsg,
        })
        .eq('id', jobId);
    }

    return NextResponse.json(
      { error: errorMsg, jobId, status: 'failed' },
      { status: 500 }
    );
  }
}
