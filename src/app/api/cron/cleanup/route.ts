import { NextRequest, NextResponse } from 'next/server';
import { cleanExpiredJobs } from '@/lib/cleanup';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Acesso não autorizado ao cron' }, { status: 401 });
    }

    const result = await cleanExpiredJobs();
    return NextResponse.json({
      success: true,
      message: `Limpeza concluída com sucesso! ${result.cleanedCount} artes (48h) e ${result.purgedDbCount} registros (30 dias) limpados.`,
      cleanedCount: result.cleanedCount,
      purgedDbCount: result.purgedDbCount,
      errors: result.errors,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro na limpeza de cron' }, { status: 500 });
  }
}
