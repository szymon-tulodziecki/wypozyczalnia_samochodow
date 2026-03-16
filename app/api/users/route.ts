import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

function getProfileRoleErrorMessage(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes('profiles_role_check')) {
    return 'Baza danych nadal ma stary constraint dla pola roli. Zaktualizuj constraint `profiles_role_check`, aby akceptował role `user` i `root`.';
  }
  return message;
}

function getUserIdFromJwt(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

async function getCallerRole(request: NextRequest): Promise<string | null> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const userId = getUserIdFromJwt(token);
  if (!userId) return null;
  const { data } = await supabaseAdmin.from('profiles').select('role').eq('id', userId).single();
  return (data as { role: string } | null)?.role ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const callerRole = await getCallerRole(request);
    if (callerRole !== 'root') {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, firstName, lastName, role, phone, isPublic } = body;

    if (role !== 'agent' && role !== 'root') {
      return NextResponse.json({ error: 'Nieprawidłowa rola użytkownika.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role,
        phone: phone || null,
        is_public: isPublic ?? true,
      },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        role,
        is_public: isPublic ?? true,
      }, { onConflict: 'id' })
      .select('*')
      .single();

    if (profileError) {
      // Roll back auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);
      return NextResponse.json({ error: getProfileRoleErrorMessage(profileError.message) }, { status: 400 });
    }

    return NextResponse.json({ user: profile }, { status: 201 });
  } catch (err) {
    console.error('Create user failed:', err);
    return NextResponse.json({ error: 'Wystąpił błąd serwera.' }, { status: 500 });
  }
}
