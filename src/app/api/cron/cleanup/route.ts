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
      message: `Limpeza concluída! ${result.cleanedCount} vagas expiradas limpas do servidor.`,
      cleanedCount: result.cleanedCount,
      errors: result.errors,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro na limpeza de cron' }, { status: 500 });
  }
}
