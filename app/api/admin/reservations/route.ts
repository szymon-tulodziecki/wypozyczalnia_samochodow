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

async function getUser(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const userId = getUserIdFromJwt(token);
  if (!userId) return null;
  const { data } = await supabaseAdmin.from('profiles').select('id, role').eq('id', userId).single();
  return data as { id: string; role?: string } | null;
}

async function requireRoot(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const userId = getUserIdFromJwt(token);
  if (!userId) return null;
  const { data } = await supabaseAdmin.from('profiles').select('role').eq('id', userId).single();
  return (data as { role?: string } | null)?.role === 'root' ? userId : null;
}

function daysBetween(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil((end.getTime() - start.getTime()) / 86400000);
  return diff > 0 ? diff : 1;
}

async function ensureReservationPayload(body: {
  userId?: string;
  carId?: string;
  startDate?: string;
  endDate?: string;
  pickupTime?: string;
  pickupLocation?: string;
  returnLocation?: string;
  notes?: string;
  status?: string;
}) {
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
    return { error: 'Wypełnij wymagane pola rezerwacji.' };
  }

  if (!['aktywna', 'zakonczona', 'anulowana'].includes(status)) {
    return { error: 'Nieprawidłowy status rezerwacji.' };
  }

  if (endDate < startDate) {
    return { error: 'Data zwrotu nie może być wcześniejsza niż data odbioru.' };
  }

  const [{ data: profile, error: profileError }, { data: car, error: carError }] = await Promise.all([
    supabaseAdmin.from('profiles').select('id').eq('id', userId).single(),
    supabaseAdmin.from('cars').select('id, price_per_day').eq('id', carId).single(),
  ]);

  if (profileError || !profile) {
    return { error: 'Wybrany użytkownik nie istnieje.' };
  }

  if (carError || !car) {
    return { error: 'Wybrane auto nie istnieje.' };
  }

  const totalPrice = daysBetween(startDate, endDate) * Number((car as { price_per_day: number }).price_per_day);

  return {
    data: {
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
    },
  };
}

export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user || (user.role !== 'root' && user.role !== 'agent')) {
    return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
  }

  if (user.role === 'root') {
    const { data, error } = await supabaseAdmin
      .from('reservations')
      .select('*, car:car_id(id, brand, model, year, price_per_day, agent_id), profile:user_id(id, first_name, last_name, email)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ reservations: data ?? [] });
  }

  // For agents, get only their cars and reservations for those cars
  const { data: agentCars, error: carsError } = await supabaseAdmin
    .from('cars')
    .select('id')
    .eq('agent_id', user.id);

  if (carsError) {
    return NextResponse.json({ error: carsError.message }, { status: 400 });
  }

  const carIds = (agentCars ?? []).map(car => (car as { id: string }).id);

  if (carIds.length === 0) {
    return NextResponse.json({ reservations: [] });
  }

  const { data, error } = await supabaseAdmin
    .from('reservations')
    .select('*, car:car_id(id, brand, model, year, price_per_day, agent_id), profile:user_id(id, first_name, last_name, email)')
    .in('car_id', carIds)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ reservations: data ?? [] });
}

export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user || (user.role !== 'root' && user.role !== 'agent')) {
    return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
  }

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

  // For agents, verify the car belongs to them
  if (user.role === 'agent') {
    const { data: car, error: carError } = await supabaseAdmin
      .from('cars')
      .select('agent_id')
      .eq('id', body.carId)
      .single();

    if (carError || !car) {
      return NextResponse.json({ error: 'Wybrane auto nie istnieje.' }, { status: 400 });
    }

    if ((car as { agent_id?: string }).agent_id !== user.id) {
      return NextResponse.json({ error: 'Brak uprawnień do tworzenia rezerwacji dla tego samochodu.' }, { status: 403 });
    }
  }

  const validated = await ensureReservationPayload(body);
  if ('error' in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { data: overlap, error: overlapError } = await supabaseAdmin
    .from('reservations')
    .select('id')
    .eq('car_id', validated.data.car_id)
    .eq('status', 'aktywna')
    .lte('start_date', validated.data.end_date)
    .gte('end_date', validated.data.start_date)
    .limit(1);

  if (overlapError) {
    return NextResponse.json({ error: overlapError.message }, { status: 400 });
  }

  if ((overlap ?? []).length > 0 && validated.data.status === 'aktywna') {
    return NextResponse.json({ error: 'Wybrany zakres dat nachodzi na inną aktywną rezerwację.' }, { status: 409 });
  }

  const { data, error } = await supabaseAdmin
    .from('reservations')
    .insert({ ...validated.data, created_at: new Date().toISOString() })
    .select('*, car:car_id(id, brand, model, year, price_per_day), profile:user_id(id, first_name, last_name, email)')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ reservation: data }, { status: 201 });
}