-- ============================================================
-- schema_seed.sql  —  uruchom w Supabase → SQL Editor
-- ============================================================

-- ─── Tabela profiles ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name  text NOT NULL,
  last_name   text NOT NULL,
  email       text NOT NULL UNIQUE,
  role        text NOT NULL DEFAULT 'agent' CHECK (role IN ('root','admin','agent')),
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

-- ─── RLS ─────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select"       ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_service_role" ON profiles;
DROP POLICY IF EXISTS "cars_select"           ON cars;
DROP POLICY IF EXISTS "cars_write"            ON cars;

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

-- ─── Trigger: updated_at ─────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_cars_updated_at ON cars;
CREATE TRIGGER trg_cars_updated_at
  BEFORE UPDATE ON cars FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Trigger: auto-tworzenie profilu po rejestracji ──────────
-- Odpala się przy każdym INSERT do auth.users (seed, Dashboard,
-- rejestracja). Rola pochodzi z raw_user_meta_data->>'role',
-- domyslnie 'agent'.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'agent'),
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

-- ─── Użytkownicy ─────────────────────────────────────────────

DO $$
DECLARE
  root_id   uuid;
  -- admin_id  uuid;
  -- agent1_id uuid;
  -- agent2_id uuid;
BEGIN

  -- ── ROOT ─────────────────────────────────────────────────
  SELECT id INTO root_id FROM auth.users WHERE email = '3ac1r.user@inbox.testmail.app';
  IF root_id IS NULL THEN
    root_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email,
      encrypted_password,
      email_confirmed_at, confirmation_sent_at,
      created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      root_id, 'authenticated', 'authenticated',
      '3ac1r.user@inbox.testmail.app',
      extensions.crypt('Root1234!', extensions.gen_salt('bf', 10)),
      now(), now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"root","first_name":"Marek","last_name":"Kowalski"}',
      false
    );
    -- Trigger handle_new_user odpali sie automatycznie i stworzy profil
    INSERT INTO auth.identities (
      id, user_id, identity_data,
      provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), root_id,
      jsonb_build_object('sub', root_id::text, 'email', '3ac1r.user@inbox.testmail.app'),
      'email', '3ac1r.user@inbox.testmail.app',
      now(), now(), now()
    );
    RAISE NOTICE 'Root user utworzony: %', root_id;
  ELSE
    -- Istnieje — zaktualizuj haslo i upewnij sie ze profil ma role root
    UPDATE auth.users SET
      encrypted_password = extensions.crypt('Root1234!', extensions.gen_salt('bf', 10)),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at         = now()
    WHERE id = root_id;
    INSERT INTO profiles (id, first_name, last_name, email, role, phone, created_at, updated_at)
    VALUES (root_id, 'Marek', 'Kowalski', '3ac1r.user@inbox.testmail.app', 'root', '+48 600 100 200', now(), now())
    ON CONFLICT (id) DO UPDATE SET role = 'root', updated_at = now();
    RAISE NOTICE 'Root user zaktualizowany: %', root_id;
  END IF;

  -- ── ADMIN (zakomentowany) ─────────────────────────────────
  -- SELECT id INTO admin_id FROM auth.users WHERE email = '3ac1r.admin@inbox.testmail.app';
  -- IF admin_id IS NULL THEN
  --   admin_id := gen_random_uuid();
  --   INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
  --     email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin)
  --   VALUES ('00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated',
  --     '3ac1r.admin@inbox.testmail.app',
  --     extensions.crypt('Admin1234!', extensions.gen_salt('bf', 10)),
  --     now(), now(), now(), now(),
  --     '{"provider":"email","providers":["email"]}',
  --     '{"role":"admin","first_name":"Anna","last_name":"Nowak"}',
  --     false);
  --   INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  --   VALUES (gen_random_uuid(), admin_id,
  --     jsonb_build_object('sub', admin_id::text, 'email', '3ac1r.admin@inbox.testmail.app'),
  --     'email', '3ac1r.admin@inbox.testmail.app', now(), now(), now());
  -- END IF;

  -- ── AGENT 1 (zakomentowany) ───────────────────────────────
  -- SELECT id INTO agent1_id FROM auth.users WHERE email = '3ac1r.agent1@inbox.testmail.app';
  -- IF agent1_id IS NULL THEN
  --   agent1_id := gen_random_uuid();
  --   INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
  --     email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin)
  --   VALUES ('00000000-0000-0000-0000-000000000000', agent1_id, 'authenticated', 'authenticated',
  --     '3ac1r.agent1@inbox.testmail.app',
  --     extensions.crypt('Agent1234!', extensions.gen_salt('bf', 10)),
  --     now(), now(), now(), now(),
  --     '{"provider":"email","providers":["email"]}',
  --     '{"role":"agent","first_name":"Piotr","last_name":"Wisniewski"}',
  --     false);
  --   INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  --   VALUES (gen_random_uuid(), agent1_id,
  --     jsonb_build_object('sub', agent1_id::text, 'email', '3ac1r.agent1@inbox.testmail.app'),
  --     'email', '3ac1r.agent1@inbox.testmail.app', now(), now(), now());
  -- END IF;

  -- ── AGENT 2 (zakomentowany) ───────────────────────────────
  -- SELECT id INTO agent2_id FROM auth.users WHERE email = '3ac1r.agent2@inbox.testmail.app';
  -- IF agent2_id IS NULL THEN
  --   agent2_id := gen_random_uuid();
  --   INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
  --     email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin)
  --   VALUES ('00000000-0000-0000-0000-000000000000', agent2_id, 'authenticated', 'authenticated',
  --     '3ac1r.agent2@inbox.testmail.app',
  --     extensions.crypt('Agent1234!', extensions.gen_salt('bf', 10)),
  --     now(), now(), now(), now(),
  --     '{"provider":"email","providers":["email"]}',
  --     '{"role":"agent","first_name":"Katarzyna","last_name":"Dabrowska"}',
  --     false);
  --   INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  --   VALUES (gen_random_uuid(), agent2_id,
  --     jsonb_build_object('sub', agent2_id::text, 'email', '3ac1r.agent2@inbox.testmail.app'),
  --     'email', '3ac1r.agent2@inbox.testmail.app', now(), now(), now());
  -- END IF;

  -- ── Samochody ────────────────────────────────────────────
  INSERT INTO cars (brand, model, year, mileage, fuel_type, gearbox, color, seats,
                    category, price_per_day, status, license_plate, description,
                    features, images, agent_id, created_at, updated_at)
  SELECT brand, model, year, mileage, fuel_type, gearbox, color, seats,
         category, price_per_day, status, license_plate, description,
         features, images, root_id, now(), now()
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
  RAISE NOTICE 'Gotowe!';
  RAISE NOTICE '3ac1r.user@inbox.testmail.app';
  RAISE NOTICE 'Haslo: Root1234!';
  RAISE NOTICE '==============================================';

END $$;






create extension if not exists pgcrypto;

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  car_id uuid not null references public.cars(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  pickup_time time not null,
  return_time time not null,
  pickup_location text not null,
  return_location text not null,
  notes text,
  total_price numeric(10,2) not null default 0,
  status text not null default 'aktywna'
    check (status in ('aktywna', 'zakonczona', 'anulowana')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservations_date_order check (end_date >= start_date)
);

create index if not exists reservations_user_id_idx
  on public.reservations(user_id);

create index if not exists reservations_car_id_idx
  on public.reservations(car_id);

create index if not exists reservations_status_idx
  on public.reservations(status);

create index if not exists reservations_car_status_dates_idx
  on public.reservations(car_id, status, start_date, end_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reservations_set_updated_at on public.reservations;

create trigger reservations_set_updated_at
before update on public.reservations
for each row
execute function public.set_updated_at();




alter table public.reservations
drop column if exists pickup_time;

alter table public.profiles
drop constraint if exists profiles_role_check;

alter table public.profiles
add constraint profiles_role_check
check (role in ('user', 'root'));