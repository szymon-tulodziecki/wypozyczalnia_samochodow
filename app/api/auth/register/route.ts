import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value?: string) {
  return value?.trim() ?? '';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      password?: string;
    };

    const firstName = body.firstName?.trim() ?? '';
    const lastName = body.lastName?.trim() ?? '';
    const email = normalizeEmail(body.email ?? '');
    const phone = normalizePhone(body.phone);
    const password = body.password ?? '';

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'Wypełnij wszystkie wymagane pola.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Hasło musi mieć co najmniej 8 znaków.' }, { status: 400 });
    }

    // Check if email already exists
    const { data: emailMatch, error: emailCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (emailCheckError) {
      return NextResponse.json({ error: emailCheckError.message }, { status: 500 });
    }

    if ((emailMatch ?? []).length > 0) {
      return NextResponse.json({ error: 'Podany adres e-mail jest już zarejestrowany.' }, { status: 409 });
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const { data: phoneMatch, error: phoneCheckError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('phone', phone)
        .limit(1);

      if (phoneCheckError) {
        return NextResponse.json({ error: phoneCheckError.message }, { status: 500 });
      }

      if ((phoneMatch ?? []).length > 0) {
        return NextResponse.json(
          { error: 'Podany numer telefonu jest już przypisany do innego konta.' },
          { status: 409 }
        );
      }
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: 'customer',
      },
    });

    if (authError) {
      const message = authError.message.toLowerCase().includes('already')
        ? 'Podany adres e-mail jest już zarejestrowany.'
        : authError.message;
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const userId = authData.user.id;

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        role: 'customer',
        is_public: false,
        created_by: userId,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: 'Konto zostało utworzone. Za chwilę przeniesiemy Cię do logowania.' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd.' },
      { status: 500 }
    );
  }
}
