import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { extractJobFromAbler } from '@/lib/scraper';
import { generateBrandKitAI } from '@/lib/ai-engine';
import { renderBrandKitPNGs } from '@/lib/renderer';
import { uploadAssetsAndSendEmail } from '@/lib/distribution';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

    // 1. Criar registro inicial com status 'pending' e expiração em 48 horas
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const { data: dbJob, error: dbError } = await supabase
      .from('brandkit_jobs')
      .insert([{ job_url: jobUrl, recipient_email: recipientEmail, status: 'pending', expires_at: expiresAt }])
      .select()
      .single();

    if (dbError || !dbJob) {
      throw new Error(`Erro no Supabase DB: ${dbError?.message || 'Falha ao inserir job'}`);
    }

    jobId = dbJob.id;

    // Execute pipeline step-by-step with pacing for clear UI progress transitions
    
    // Etapa 1: Extração da Vaga (Scraper Multi-Camada 2.0)
    await supabase.from('brandkit_jobs').update({ status: 'scraping' }).eq('id', jobId);
    const extractedData = await extractJobFromAbler(jobUrl);
    await delay(400);

    // Etapa 2: Inteligência de Recrutamento & Copy (IA Profiler 2.0)
    await supabase
      .from('brandkit_jobs')
      .update({ status: 'generating_ai', extracted_data: extractedData })
      .eq('id', jobId);

    const { sourcing, copy } = await generateBrandKitAI(extractedData);
    await delay(400);

    // Etapa 3: Renderização das Artes PNG
    await supabase
      .from('brandkit_jobs')
      .update({ status: 'rendering_arts', sourcing_profile: sourcing, copy_data: copy })
      .eq('id', jobId);

    const pngBuffers = await renderBrandKitPNGs(copy);
    await delay(400);

    // Etapa 4: Upload para Storage & Envio do Dossier por E-mail
    await supabase.from('brandkit_jobs').update({ status: 'uploading_and_mailing' }).eq('id', jobId);

    const assetUrls = await uploadAssetsAndSendEmail(
      dbJob.id,
      recipientEmail,
      pngBuffers,
      sourcing,
      copy,
      extractedData  // Passando extractedData para o e-mail inteligente
    );
    await delay(300);

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
      message: 'Dossier de Sourcing gerado e enviado com sucesso!'
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
