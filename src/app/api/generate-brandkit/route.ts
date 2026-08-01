import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { extractJobFromAbler } from '@/lib/scraper';
import { fetchVacancyDetailsFromAbler } from '@/lib/abler-api';
import { generateBrandKitAI } from '@/lib/ai-engine';
import { renderBrandKitPNGs } from '@/lib/renderer-engine';
import { uploadAssetsAndSendEmail } from '@/lib/distribution';
import { ExtractedJobData } from '@/lib/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  let jobId: string | null = null;

  try {
    const { jobUrl, vacancyId, recipientEmail } = await request.json();

    if ((!jobUrl && !vacancyId) || !recipientEmail) {
      return NextResponse.json(
        { error: 'É necessário informar a vaga (vacancyId ou jobUrl) e o recipientEmail' },
        { status: 400 }
      );
    }

    const effectiveJobUrl = jobUrl || `https://abler.com.br/vagas/${vacancyId}`;

    // 1. Criar registro inicial no Supabase com status 'pending' e expiração em 48 horas
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    let dbJob: any = null;
    let dbError: any = null;

    const resWithExpires = await supabase
      .from('brandkit_jobs')
      .insert([{ job_url: effectiveJobUrl, recipient_email: recipientEmail, status: 'pending', expires_at: expiresAt }])
      .select()
      .single();

    if (resWithExpires.error && (resWithExpires.error.message?.includes('expires_at') || resWithExpires.error.code === 'PGRST204')) {
      const resFallback = await supabase
        .from('brandkit_jobs')
        .insert([{ job_url: effectiveJobUrl, recipient_email: recipientEmail, status: 'pending' }])
        .select()
        .single();
      dbJob = resFallback.data;
      dbError = resFallback.error;
    } else {
      dbJob = resWithExpires.data;
      dbError = resWithExpires.error;
    }

    if (dbError || !dbJob) {
      throw new Error(`Erro no Supabase DB: ${dbError?.message || 'Falha ao criar registro da vaga'}`);
    }

    jobId = dbJob.id;

    // Etapa 1: Obter dados da Vaga (API Oficial da Abler V2 com fallback)
    await supabase.from('brandkit_jobs').update({ status: 'scraping' }).eq('id', jobId);

    let extractedData: ExtractedJobData;

    if (vacancyId) {
      try {
        extractedData = await fetchVacancyDetailsFromAbler(String(vacancyId));
      } catch (err: any) {
        console.warn(`Falha ao buscar via Abler API V2 para id #${vacancyId}, tentando fallback scraper:`, err?.message);
        extractedData = await extractJobFromAbler(effectiveJobUrl);
      }
    } else {
      // Tentar extrair ID numérico da URL da Abler se presente (ex: /secretaria-executiva-497454)
      const numericIdMatch = jobUrl?.match(/-(\d+)(?:\/|$|\?)/) || jobUrl?.match(/vagas\/(\d+)/);
      if (numericIdMatch && numericIdMatch[1]) {
        try {
          extractedData = await fetchVacancyDetailsFromAbler(numericIdMatch[1]);
        } catch {
          extractedData = await extractJobFromAbler(jobUrl);
        }
      } else {
        extractedData = await extractJobFromAbler(jobUrl);
      }
    }

    await delay(300);

    // Etapa 2: Inteligência de Recrutamento & Copy (IA Profiler)
    await supabase
      .from('brandkit_jobs')
      .update({ status: 'generating_ai', extracted_data: extractedData })
      .eq('id', jobId);

    const { sourcing, copy } = await generateBrandKitAI(extractedData);
    await delay(300);

    // Etapa 3: Renderização das Artes PNG (Card Oficial Brandbook Jobz Carreira)
    await supabase
      .from('brandkit_jobs')
      .update({ status: 'rendering_arts', sourcing_profile: sourcing, copy_data: copy })
      .eq('id', jobId);

    const pngBuffers = await renderBrandKitPNGs(copy);
    await delay(300);

    // Etapa 4: Upload para Storage & Envio do Kit por E-mail
    await supabase.from('brandkit_jobs').update({ status: 'uploading_and_mailing' }).eq('id', jobId);

    const assetUrls = await uploadAssetsAndSendEmail(
      dbJob.id,
      recipientEmail,
      pngBuffers,
      sourcing,
      copy,
      extractedData
    );
    await delay(200);

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
      message: 'Kit de divulgação de vaga gerado e enviado com sucesso!'
    });

  } catch (err: any) {
    const errorMsg = err?.message || 'Erro durante o processamento da vaga';
    console.error('Falha no pipeline de artes da vaga:', errorMsg);

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
