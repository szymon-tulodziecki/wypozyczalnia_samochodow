import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

function isMissingReservationsTable(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? '';
  return error.code === '42P01' || error.code === 'PGRST205' || message.includes('reservations');
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabaseAdmin
      .from('reservations')
      .select('start_date, end_date')
      .eq('car_id', id)
      .eq('status', 'aktywna')
      .gte('end_date', today)
      .order('start_date', { ascending: true });

    if (error) {
      if (isMissingReservationsTable(error)) {
        return NextResponse.json({ reservations: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      reservations: (data ?? []).map(row => ({
        startDate: row.start_date as string,
        endDate: row.end_date as string,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Nie udało się pobrać rezerwacji auta.' },
      { status: 500 },
    );
  }
}