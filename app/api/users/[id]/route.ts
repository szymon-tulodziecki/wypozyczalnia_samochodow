import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const callerRole = await getCallerRole(request);
    if (callerRole !== 'root') {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
    }

    const { id } = await params;

    // Delete profile row first to avoid trigger/cascade issues
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id);
    if (profileError) {
      console.error('Profile delete error:', profileError);
    }

    // Delete auth user via admin client (best-effort — may fail if Supabase auth DB has issues)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) {
      console.error('Auth deleteUser error (non-fatal, profile already deleted):', authError.message);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const callerRole = await getCallerRole(request);
    if (callerRole !== 'root') {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json() as {
      password?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      bio?: string;
      isPublic?: boolean;
      role?: string;
    };

    if (body.password) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(id, { password: body.password });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const profileUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.firstName !== undefined) profileUpdates.first_name = body.firstName;
    if (body.lastName !== undefined) profileUpdates.last_name = body.lastName;
    if (body.phone !== undefined) profileUpdates.phone = body.phone || null;
    if (body.bio !== undefined) profileUpdates.bio = body.bio;
    if (body.isPublic !== undefined) profileUpdates.is_public = body.isPublic;
    if (body.role !== undefined) profileUpdates.role = body.role;

    const { data, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(profileUpdates)
      .eq('id', id)
      .select('*')
      .single();
    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 });

    return NextResponse.json({ user: data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
