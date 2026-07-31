import { NextResponse } from 'next/server';
import { supabase, mapDbJobToModel } from '@/lib/supabase';
import { cleanExpiredJobs } from '@/lib/cleanup';

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      return NextResponse.json({ jobs: [] }, { status: 200 });
    }

    // Executa a limpeza automatica de vagas com mais de 48h em background antes de retornar a lista
    try {
      await cleanExpiredJobs();
    } catch (cleanupErr: any) {
      console.warn('Aviso de limpeza automatica na rota GET /api/jobs:', cleanupErr?.message);
    }

    const { data, error } = await supabase
      .from('brandkit_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ jobs: [] }, { status: 200 });
    }

    const jobs = (data || []).map(mapDbJobToModel);
    return NextResponse.json({ jobs }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ jobs: [] }, { status: 200 });
  }
}
