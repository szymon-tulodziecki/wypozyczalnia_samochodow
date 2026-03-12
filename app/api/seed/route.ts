import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const USERS = [
  { email: 'root@autorent.pl',   password: 'Root1234!',  firstName: 'Marek',     lastName: 'Kowalski',   role: 'root',  phone: '+48 600 100 200' },
  { email: 'admin@autorent.pl',  password: 'Admin1234!', firstName: 'Anna',      lastName: 'Nowak',      role: 'admin', phone: '+48 601 200 300' },
  { email: 'agent1@autorent.pl', password: 'Agent1234!', firstName: 'Piotr',     lastName: 'Wiśniewski', role: 'agent', phone: '+48 602 300 400' },
  { email: 'agent2@autorent.pl', password: 'Agent1234!', firstName: 'Katarzyna', lastName: 'Dąbrowska',  role: 'agent', phone: '+48 603 400 500' },
];

const CARS = (agent1: string, agent2: string) => [
  {
    brand: 'Koenigsegg', model: 'Agera RS', year: 2017, mileage: 3200,
    fuel_type: 'benzyna', gearbox: 'automatyczna', color: 'Pomarańczowy', seats: 2,
    category: 'premium', price_per_day: 12999, status: 'dostepny', license_plate: 'KA 01001',
    description: 'Jeden z najszybszych samochodów seryjnych świata. 1360 KM, 0-100 km/h w 2,8 s.',
    features: ['silnik twin-turbo V8 5.0L', 'ceramiczne hamulce', 'aktywna aerodynamika', 'fotele kubełkowe z węgla', 'system telemetryczny'], images: [], agent_id: agent1,
  },
  {
    brand: 'Bugatti', model: 'Chiron Super Sport', year: 2022, mileage: 1800,
    fuel_type: 'benzyna', gearbox: 'automatyczna', color: 'Granatowy', seats: 2,
    category: 'premium', price_per_day: 14999, status: 'dostepny', license_plate: 'BG 02002',
    description: '1625 KM, prędkość maksymalna 440 km/h. Kwintesencja luksusu i osiągów.',
    features: ['W16 8.0L quad-turbo', 'titanowy układ wydechowy', 'skóra Alcantara', 'carbon body', 'aktywne zawieszenie'], images: [], agent_id: agent2,
  },
  {
    brand: 'Lamborghini', model: 'Huracán EVO', year: 2023, mileage: 5500,
    fuel_type: 'benzyna', gearbox: 'automatyczna', color: 'Żółty', seats: 2,
    category: 'premium', price_per_day: 5999, status: 'dostepny', license_plate: 'LM 03003',
    description: '640-konna V10 o brzmieniu, którego nie zapomnisz. Napęd 4WD, tryby jazdy ANIMA.',
    features: ['V10 5.2L 640 KM', 'Lamborghini Dinamica Veicolo Integrata', 'lift przedniej osi', 'kamera cofania', 'Apple CarPlay'], images: [], agent_id: agent1,
  },
  {
    brand: 'Ferrari', model: '488 Pista', year: 2022, mileage: 4200,
    fuel_type: 'benzyna', gearbox: 'automatyczna', color: 'Czerwony', seats: 2,
    category: 'premium', price_per_day: 7499, status: 'dostepny', license_plate: 'FR 04004',
    description: '720 KM czystej włoskiej pasji. Tor lub droga – wszędzie bezkonkurencyjny.',
    features: ['twin-turbo V8 3.9L', 'Side Slip Control 6.1', 'ceramiczne hamulce Brembo', 'wentylowane fotele kubełkowe', 'wyświetlacz HUD'], images: [], agent_id: agent2,
  },
  {
    brand: 'McLaren', model: '720S Spider', year: 2023, mileage: 3100,
    fuel_type: 'benzyna', gearbox: 'automatyczna', color: 'Biały', seats: 2,
    category: 'premium', price_per_day: 6499, status: 'dostepny', license_plate: 'MC 05005',
    description: 'Składany dach w 11 sekund i 720 KM pod stopą. Monokomórka z karbonu.',
    features: ['twin-turbo V8 4.0L', 'dach retractable', 'carbon MonoCell II', 'aktywna aerodynamika', 'Variable Drift Control'], images: [], agent_id: agent1,
  },
  {
    brand: 'Porsche', model: '911 GT3 RS', year: 2023, mileage: 2800,
    fuel_type: 'benzyna', gearbox: 'manualna', color: 'Szary', seats: 2,
    category: 'premium', price_per_day: 4499, status: 'wynajety', license_plate: 'PR 06006',
    description: '525 KM wolnossącego bokser-6. Precyzja prowadzenia godna toru.',
    features: ['bokser 6 4.0L 525 KM', 'PDK 7-biegowy', 'ceramiczne hamulce PCCB', 'Weissach Package', 'telemetria Porsche Track Precision'], images: [], agent_id: agent2,
  },
  {
    brand: 'Rolls-Royce', model: 'Phantom Extended', year: 2023, mileage: 6000,
    fuel_type: 'benzyna', gearbox: 'automatyczna', color: 'Czarny', seats: 4,
    category: 'premium', price_per_day: 8999, status: 'dostepny', license_plate: 'RR 07007',
    description: 'Szczyt luksusu i prestiżu. Gwiaździany sufit i 563 KM ciszy pod maską.',
    features: ['V12 6.75L 563 KM', 'Starlight Headliner', 'bespoke audio', 'masaż foteli', 'panoramiczny szyberdach'], images: [], agent_id: agent1,
  },
  {
    brand: 'Aston Martin', model: 'DBS Superleggera', year: 2022, mileage: 7200,
    fuel_type: 'benzyna', gearbox: 'automatyczna', color: 'Zielony', seats: 2,
    category: 'premium', price_per_day: 5499, status: 'dostepny', license_plate: 'AM 08008',
    description: '725 KM eleganckiej brytyjskiej brutalności. Samochód Bonda w Twoich rękach.',
    features: ['twin-turbo V12 5.2L', 'carbon body panels', 'Bang & Olufsen audio', 'skóra semi-anilina', 'podgrzewane fotele'], images: [], agent_id: agent2,
  },
  {
    brand: 'Pagani', model: 'Huayra BC', year: 2020, mileage: 1500,
    fuel_type: 'benzyna', gearbox: 'automatyczna', color: 'Srebrny', seats: 2,
    category: 'premium', price_per_day: 15999, status: 'serwis', license_plate: 'PG 09009',
    description: 'Dzieło sztuki na kółkach. Ręcznie wykonana karoseria z tytanu i karbonu.',
    features: ['AMG V12 twin-turbo 789 KM', 'titanowe wydech', 'aktywne klapy aerodynamiczne', 'wnętrze z węgla i skóry', 'zawieszenie push-rod'], images: [], agent_id: agent1,
  },
  {
    brand: 'Bentley', model: 'Continental GT Speed', year: 2023, mileage: 4800,
    fuel_type: 'benzyna', gearbox: 'automatyczna', color: 'Bordowy', seats: 4,
    category: 'premium', price_per_day: 4999, status: 'dostepny', license_plate: 'BT 10010',
    description: '659-konny W12 gran turismo. Doskonały na długie trasy w pełnym komforcie.',
    features: ['W12 6.0L twin-turbo 659 KM', '48V active anti-roll', 'skóra Mulliner', 'masaż foteli', 'nagłośnienie Naim 2200W'], images: [], agent_id: agent2,
  },
];

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Seed route disabled in production' }, { status: 403 });
  }

  const results: string[] = [];

  // ── 1. Users ──────────────────────────────────────────────
  const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const existingMap = new Map(allUsers?.users?.map(u => [u.email!, u.id]) ?? []);
  const idMap = new Map<string, string>(); // email → uuid

  for (const u of USERS) {
    let userId: string | undefined = existingMap.get(u.email);

    if (userId) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: u.password,
        email_confirm: true,
      });
      results.push(error ? `ERROR update auth: ${u.email} — ${error.message}` : `OK updated auth: ${u.email}`);
    } else {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
      });
      if (error || !data.user) {
        results.push(`ERROR create auth: ${u.email} — ${error?.message}`);
        continue;
      }
      userId = data.user.id;
      results.push(`OK created auth: ${u.email}`);
    }

    idMap.set(u.email, userId);

    const { error: pe } = await supabaseAdmin.from('profiles').upsert({
      id: userId,
      first_name: u.firstName,
      last_name: u.lastName,
      email: u.email,
      role: u.role,
      phone: u.phone,
      is_public: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    results.push(pe ? `ERROR profile: ${u.email} — ${pe.message}` : `OK profile: ${u.email}`);
  }

  // ── 2. Cars ───────────────────────────────────────────────
  const agent1 = idMap.get('agent1@autorent.pl');
  const agent2 = idMap.get('agent2@autorent.pl');

  if (agent1 && agent2) {
    for (const car of CARS(agent1, agent2)) {
      const { error } = await supabaseAdmin
        .from('cars')
        .upsert(car, { onConflict: 'license_plate', ignoreDuplicates: true });
      results.push(error
        ? `ERROR car: ${car.brand} ${car.model} — ${error.message}`
        : `OK car: ${car.brand} ${car.model} (${car.license_plate})`);
    }
  } else {
    results.push('SKIP cars: brak agent1/agent2 (błąd wyżej?)');
  }

  return NextResponse.json({ results });
}

