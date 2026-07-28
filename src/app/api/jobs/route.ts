import { NextResponse } from 'next/server';
import { supabase, mapDbJobToModel } from '@/lib/supabase';

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      return NextResponse.json({ jobs: [] }, { status: 200 });
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
