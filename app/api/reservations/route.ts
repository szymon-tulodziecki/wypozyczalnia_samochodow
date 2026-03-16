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

function daysBetween(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil((end.getTime() - start.getTime()) / 86400000);
  return diff > 0 ? diff : 1;
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Musisz być zalogowany, aby zarezerwować samochód.' }, { status: 401 });
    }

    const userId = getUserIdFromJwt(token);
    if (!userId) {
      return NextResponse.json({ error: 'Nie udało się potwierdzić tożsamości użytkownika.' }, { status: 401 });
    }

    const body = await request.json() as {
      carId?: string;
      startDate?: string;
      endDate?: string;
      pickupTime?: string;
      pickupLocation?: string;
      returnLocation?: string;
      notes?: string;
    };

    const carId = body.carId ?? '';
    const startDate = body.startDate ?? '';
    const endDate = body.endDate ?? '';
    const pickupTime = body.pickupTime?.trim() ?? '';
    const returnTime = '19:00';
    const pickupLocation = body.pickupLocation?.trim() ?? '';
    const returnLocation = body.returnLocation?.trim() ?? '';
    const notes = body.notes?.trim() ?? null;
    const today = new Date().toISOString().slice(0, 10);

    if (!carId || !startDate || !endDate || !pickupTime || !pickupLocation || !returnLocation) {
      return NextResponse.json({ error: 'Wypełnij wymagane pola rezerwacji.' }, { status: 400 });
    }

    if (startDate < today || endDate < startDate) {
      return NextResponse.json({ error: 'Podany zakres dat jest nieprawidłowy.' }, { status: 400 });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Nie znaleziono profilu użytkownika.' }, { status: 404 });
    }

    const { data: car, error: carError } = await supabaseAdmin
      .from('cars')
      .select('id, price_per_day, status')
      .eq('id', carId)
      .single();

    if (carError || !car) {
      return NextResponse.json({ error: 'Samochód nie został znaleziony.' }, { status: 404 });
    }

    if ((car as { status: string }).status !== 'dostepny') {
      return NextResponse.json({ error: 'Ten samochód nie jest obecnie dostępny do rezerwacji.' }, { status: 409 });
    }

    const { data: overlap, error: overlapError } = await supabaseAdmin
      .from('reservations')
      .select('id')
      .eq('car_id', carId)
      .eq('status', 'aktywna')
      .lte('start_date', endDate)
      .gte('end_date', startDate)
      .limit(1);

    if (overlapError) {
      return NextResponse.json({ error: overlapError.message }, { status: 400 });
    }

    if ((overlap ?? []).length > 0) {
      return NextResponse.json({ error: 'Wybrane dni są już zajęte dla tego auta.' }, { status: 409 });
    }

    const totalPrice = daysBetween(startDate, endDate) * Number((car as { price_per_day: number }).price_per_day);

    const { data: reservation, error: reservationError } = await supabaseAdmin
      .from('reservations')
      .insert({
        user_id: userId,
        car_id: carId,
        start_date: startDate,
        end_date: endDate,
        pickup_time: pickupTime,
        return_time: returnTime,
        pickup_location: pickupLocation,
        return_location: returnLocation,
        notes,
        total_price: totalPrice,
        status: 'aktywna',
      })
      .select('*, car:car_id(id, brand, model, year, price_per_day, images)')
      .single();

    if (reservationError) {
      return NextResponse.json({ error: reservationError.message }, { status: 400 });
    }

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Nie udało się utworzyć rezerwacji.' },
      { status: 500 },
    );
  }
}