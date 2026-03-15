import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

function getUserIdFromJwt(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8')) as { sub?: string };
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

async function requireRoot(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return false;
  const userId = getUserIdFromJwt(token);
  if (!userId) return false;
  const { data } = await supabaseAdmin.from('profiles').select('role').eq('id', userId).single();
  return (data as { role?: string } | null)?.role === 'root';
}

function daysBetween(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil((end.getTime() - start.getTime()) / 86400000);
  return diff > 0 ? diff : 1;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const isRoot = await requireRoot(request);
  if (!isRoot) {
    return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
  }

  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from('reservations')
    .select('*, car:car_id(id, brand, model, year, price_per_day), profile:user_id(id, first_name, last_name, email)')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Nie znaleziono rezerwacji.' }, { status: 404 });
  }

  return NextResponse.json({ reservation: data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const isRoot = await requireRoot(request);
  if (!isRoot) {
    return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json() as {
    userId?: string;
    carId?: string;
    startDate?: string;
    endDate?: string;
    pickupTime?: string;
    pickupLocation?: string;
    returnLocation?: string;
    notes?: string;
    status?: string;
  };

  const userId = body.userId?.trim() ?? '';
  const carId = body.carId?.trim() ?? '';
  const startDate = body.startDate?.trim() ?? '';
  const endDate = body.endDate?.trim() ?? '';
  const pickupTime = body.pickupTime?.trim() ?? '';
  const pickupLocation = body.pickupLocation?.trim() ?? '';
  const returnLocation = body.returnLocation?.trim() ?? '';
  const notes = body.notes?.trim() ?? null;
  const status = body.status?.trim() ?? 'aktywna';

  if (!userId || !carId || !startDate || !endDate || !pickupTime || !pickupLocation || !returnLocation) {
    return NextResponse.json({ error: 'Wypełnij wymagane pola rezerwacji.' }, { status: 400 });
  }

  if (!['aktywna', 'zakonczona', 'anulowana'].includes(status)) {
    return NextResponse.json({ error: 'Nieprawidłowy status rezerwacji.' }, { status: 400 });
  }

  if (endDate < startDate) {
    return NextResponse.json({ error: 'Data zwrotu nie może być wcześniejsza niż data odbioru.' }, { status: 400 });
  }

  const [{ data: profile, error: profileError }, { data: car, error: carError }] = await Promise.all([
    supabaseAdmin.from('profiles').select('id').eq('id', userId).single(),
    supabaseAdmin.from('cars').select('id, price_per_day').eq('id', carId).single(),
  ]);

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Wybrany użytkownik nie istnieje.' }, { status: 400 });
  }

  if (carError || !car) {
    return NextResponse.json({ error: 'Wybrane auto nie istnieje.' }, { status: 400 });
  }

  const { data: overlap, error: overlapError } = await supabaseAdmin
    .from('reservations')
    .select('id')
    .eq('car_id', carId)
    .eq('status', 'aktywna')
    .neq('id', id)
    .lte('start_date', endDate)
    .gte('end_date', startDate)
    .limit(1);

  if (overlapError) {
    return NextResponse.json({ error: overlapError.message }, { status: 400 });
  }

  if ((overlap ?? []).length > 0 && status === 'aktywna') {
    return NextResponse.json({ error: 'Wybrany zakres dat nachodzi na inną aktywną rezerwację.' }, { status: 409 });
  }

  const totalPrice = daysBetween(startDate, endDate) * Number((car as { price_per_day: number }).price_per_day);

  const { data, error } = await supabaseAdmin
    .from('reservations')
    .update({
      user_id: userId,
      car_id: carId,
      start_date: startDate,
      end_date: endDate,
      pickup_time: pickupTime,
      return_time: '19:00',
      pickup_location: pickupLocation,
      return_location: returnLocation,
      notes,
      status,
      total_price: totalPrice,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, car:car_id(id, brand, model, year, price_per_day), profile:user_id(id, first_name, last_name, email)')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ reservation: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const isRoot = await requireRoot(request);
  if (!isRoot) {
    return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
  }

  const { id } = await params;
  const { error } = await supabaseAdmin.from('reservations').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}