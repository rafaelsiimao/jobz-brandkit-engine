import { NextRequest, NextResponse } from 'next/server';
import { fetchVacancyDetailsFromAbler } from '@/lib/abler-api';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });
  }

  try {
    const details = await fetchVacancyDetailsFromAbler(id);
    return NextResponse.json(details);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro ao buscar vaga' }, { status: 500 });
  }
}
