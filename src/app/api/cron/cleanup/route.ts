import { NextResponse } from 'next/server';
import { cleanExpiredJobs } from '@/lib/cleanup';

export async function GET() {
  try {
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
