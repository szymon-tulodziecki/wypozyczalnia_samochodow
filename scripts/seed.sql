-- ============================================================
-- schema_seed.sql  —  uruchom w Supabase → SQL Editor
-- ============================================================

-- ─── Tabela profiles ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name  text NOT NULL,
  last_name   text NOT NULL,
  email       text NOT NULL UNIQUE,
  role        text NOT NULL DEFAULT 'agent' CHECK (role IN ('root','agent')),
  phone       text,
  avatar_url  text,
  bio         text,
  is_active   boolean NOT NULL DEFAULT true,
  is_public   boolean NOT NULL DEFAULT true,
  last_login  timestamptz,
  created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio        text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_public  boolean NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─── Tabela cars ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cars (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand         text NOT NULL,
  model         text NOT NULL,
  year          int  NOT NULL,
  mileage       int,
  fuel_type     text NOT NULL CHECK (fuel_type IN ('benzyna','diesel','elektryczny','hybryda','LPG')),
  gearbox       text NOT NULL CHECK (gearbox IN ('manualna','automatyczna')),
  color         text,
  seats         int,
  category      text NOT NULL CHECK (category IN ('ekonomiczny','komfort','premium','SUV','van')),
  price_per_day numeric(10,2) NOT NULL,
  status        text NOT NULL DEFAULT 'dostepny' CHECK (status IN ('dostepny','wynajety','serwis')),
  license_plate text UNIQUE,
  description   text,
  features      text[]  NOT NULL DEFAULT '{}',
  images        text[]  NOT NULL DEFAULT '{}',
  agent_id      uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── Tabela reservations ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS reservations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  car_id          uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  start_date      timestamptz NOT NULL,
  end_date        timestamptz NOT NULL,
  pickup_time     text,
  return_time     text,
  total_price     numeric(10,2) NOT NULL,
  status          text NOT NULL DEFAULT 'aktywna' CHECK (status IN ('aktywna','zakonczona','anulowana')),
  pickup_location text,
  return_location text,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── RLS ─────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select"       ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_service_role" ON profiles;
DROP POLICY IF EXISTS "cars_select"           ON cars;
DROP POLICY IF EXISTS "cars_write"            ON cars;
DROP POLICY IF EXISTS "reservations_select"   ON reservations;
DROP POLICY IF EXISTS "reservations_insert"   ON reservations;
DROP POLICY IF EXISTS "reservations_update"   ON reservations;

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_service_role" ON profiles
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "cars_select" ON cars
  FOR SELECT USING (true);

CREATE POLICY "cars_write" ON cars
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "reservations_select" ON reservations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "reservations_insert" ON reservations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "reservations_update" ON reservations
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ─── Trigger: updated_at ─────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_cars_updated_at ON cars;
CREATE TRIGGER trg_cars_updated_at
  BEFORE UPDATE ON cars FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_reservations_updated_at ON reservations;
CREATE TRIGGER trg_reservations_updated_at
  BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Trigger: auto-tworzenie profilu po rejestracji ──────────
-- Pierwszy zarejestrowany użytkownik (brak jakichkolwiek profili)
-- otrzymuje automatycznie rolę 'root'. Każdy kolejny — 'agent',
-- chyba że raw_user_meta_data->>'role' jawnie wskazuje inaczej.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role text;
BEGIN
  -- Jeśli tabela profiles jest pusta — to pierwszy user, nadaj mu root
  IF NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1) THEN
    assigned_role := 'root';
  ELSE
    assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'agent');
  END IF;

  INSERT INTO public.profiles (id, first_name, last_name, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    assigned_role,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Samochody ───────────────────────────────────────────────

DO $$
BEGIN

  INSERT INTO cars (brand, model, year, mileage, fuel_type, gearbox, color, seats,
                    category, price_per_day, status, license_plate, description,
                    features, images, created_at, updated_at)
  SELECT brand, model, year, mileage, fuel_type, gearbox, color, seats,
         category, price_per_day, status, license_plate, description,
         features, images, now(), now()
  FROM (VALUES
    ('Koenigsegg',   'Agera RS',             2017, 3200, 'benzyna', 'automatyczna', 'Pomaranczowy', 2, 'premium', 12999, 'dostepny', 'WA 10001',
     'Jeden z najszybszych samochodow seryjnych swiata. 1360 KM, 0-100 km/h w 2,8 s.',
     ARRAY['silnik twin-turbo V8 5.0L','ceramiczne hamulce','aktywna aerodynamika','fotele kubelkowe z wegla','system telemetryczny']::text[], ARRAY[]::text[]),
    ('Bugatti',      'Chiron Super Sport',   2022, 1800, 'benzyna', 'automatyczna', 'Granatowy',    2, 'premium', 14999, 'dostepny', 'WA 10002',
     '1625 KM, predkosc maksymalna 440 km/h. Kwintesencja luksusu i osiagow.',
     ARRAY['W16 8.0L quad-turbo','titanowy uklad wydechowy','skora Alcantara','carbon body','aktywne zawieszenie']::text[], ARRAY[]::text[]),
    ('Lamborghini',  'Huracan EVO',          2023, 5500, 'benzyna', 'automatyczna', 'Zolty',        2, 'premium',  5999, 'dostepny', 'KR 10003',
     '640-konna V10 o brzmieniu, ktorego nie zapomnisz. Naped 4WD, tryby jazdy ANIMA.',
     ARRAY['V10 5.2L 640 KM','Lamborghini Dinamica Veicolo Integrata','lift przedniej osi','kamera cofania','Apple CarPlay']::text[], ARRAY[]::text[]),
    ('Ferrari',      '488 Pista',            2022, 4200, 'benzyna', 'automatyczna', 'Czerwony',     2, 'premium',  7499, 'dostepny', 'WR 10004',
     '720 KM czystej wloskiej pasji. Tor lub droga — wszedzie bezkonkurencyjny.',
     ARRAY['twin-turbo V8 3.9L','Side Slip Control 6.1','ceramiczne hamulce Brembo','wentylowane fotele kubelkowe','wyswietlacz HUD']::text[], ARRAY[]::text[]),
    ('McLaren',      '720S Spider',          2023, 3100, 'benzyna', 'automatyczna', 'Bialy',        2, 'premium',  6499, 'dostepny', 'WS 10005',
     'Skladany dach w 11 sekund i 720 KM pod stopa. Monokomurka z karbonu.',
     ARRAY['twin-turbo V8 4.0L','dach retractable','carbon MonoCell II','aktywna aerodynamika','Variable Drift Control']::text[], ARRAY[]::text[]),
    ('Porsche',      '911 GT3 RS',           2023, 2800, 'benzyna', 'manualna',     'Szary',        2, 'premium',  4499, 'wynajety', 'PO 10006',
     '525 KM wolnossacego bokser-6. Precyzja prowadzenia godna toru.',
     ARRAY['bokser 6 4.0L 525 KM','PDK 7-biegowy','ceramiczne hamulce PCCB','Weissach Package','telemetria Porsche Track Precision']::text[], ARRAY[]::text[]),
    ('Rolls-Royce',  'Phantom Extended',     2023, 6000, 'benzyna', 'automatyczna', 'Czarny',       4, 'premium',  8999, 'dostepny', 'WB 10007',
     'Szczyt luksusu i prestizu. Gwiazdisty sufit i 563 KM ciszy pod maska.',
     ARRAY['V12 6.75L 563 KM','Starlight Headliner','bespoke audio','masaz foteli','panoramiczny szyberdach']::text[], ARRAY[]::text[]),
    ('Aston Martin', 'DBS Superleggera',     2022, 7200, 'benzyna', 'automatyczna', 'Zielony',      2, 'premium',  5499, 'dostepny', 'GD 10008',
     '725 KM eleganckiej brytyjskiej brutalnosci. Samochod Bonda w Twoich rekach.',
     ARRAY['twin-turbo V12 5.2L','carbon body panels','Bang & Olufsen audio','skora semi-anilina','podgrzewane fotele']::text[], ARRAY[]::text[]),
    ('Pagani',       'Huayra BC',            2020, 1500, 'benzyna', 'automatyczna', 'Srebrny',      2, 'premium', 15999, 'serwis',   'WK 10009',
     'Dzielo sztuki na kolkach. Recznie wykonana karoseria z tytanu i karbonu, V12 AMG 789 KM.',
     ARRAY['AMG V12 twin-turbo 789 KM','titanowe wydechy','aktywne klapy aerodynamiczne','wnetrze z wegla i skory','zawieszenie push-rod']::text[], ARRAY[]::text[]),
    ('Bentley',      'Continental GT Speed', 2023, 4800, 'benzyna', 'automatyczna', 'Bordowy',      4, 'premium',  4999, 'dostepny', 'WF 10010',
     '659-konny W12 gran turismo. Doskonaly na dlugie trasy w pelnym komforcie.',
     ARRAY['W12 6.0L twin-turbo 659 KM','48V active anti-roll','skora Mulliner','masaz foteli','naglasnienie Naim 2200W']::text[], ARRAY[]::text[])
  ) AS v(brand, model, year, mileage, fuel_type, gearbox, color, seats,
         category, price_per_day, status, license_plate, description, features, images)
  WHERE NOT EXISTS (SELECT 1 FROM cars WHERE license_plate = v.license_plate);

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Gotowe! Tabele, RLS i triggery skonfigurowane.';
  RAISE NOTICE 'Pierwszy zarejestrowany uzytkownik otrzyma role root.';
  RAISE NOTICE '==============================================';

END $$;