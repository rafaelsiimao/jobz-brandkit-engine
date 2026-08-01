import { NextResponse } from 'next/server';
import { fetchCompanyVacancies } from '@/lib/abler-api';

export async function GET() {
  try {
    const vacancies = await fetchCompanyVacancies();
    return NextResponse.json({
      success: true,
      vacancies,
      count: vacancies.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Falha ao buscar vagas na Abler API' },
      { status: 500 }
    );
  }
}
