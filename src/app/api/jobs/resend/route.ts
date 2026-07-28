import { NextResponse } from 'next/server';
import { supabase, mapDbJobToModel } from '@/lib/supabase';
import { Resend } from 'resend';
import { generateEmailHtml } from '@/lib/distribution';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock');

export async function POST(request: Request) {
  try {
    const { jobId, newEmail } = await request.json();

    if (!jobId || !newEmail) {
      return NextResponse.json(
        { error: 'jobId and newEmail are required' },
        { status: 400 }
      );
    }

    const { data: rawJob, error: dbError } = await supabase
      .from('brandkit_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (dbError || !rawJob) {
      return NextResponse.json({ error: 'Job não encontrado' }, { status: 404 });
    }

    const job = mapDbJobToModel(rawJob);

    if (job.status !== 'completed' || !job.copy_data || !job.sourcing_profile || !job.asset_urls) {
      return NextResponse.json(
        { error: 'Apenas vagas concluídas com BrandKit completo podem ser reenviadas' },
        { status: 400 }
      );
    }

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'recrutamento@jobz.com.br',
        to: newEmail,
        subject: `🎯 [Reenvio] BrandKit Pronto: ${job.copy_data.headline}`,
        html: generateEmailHtml(job.copy_data, job.sourcing_profile, job.asset_urls),
      });
    }

    return NextResponse.json({
      success: true,
      message: `BrandKit reenviado com sucesso para ${newEmail}`
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Erro ao reenviar e-mail' },
      { status: 500 }
    );
  }
}
