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

async function getCaller(request: NextRequest): Promise<{ id: string; role: string; isPublic: boolean } | null> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const userId = getUserIdFromJwt(token);
  if (!userId) return null;
  const { data } = await supabaseAdmin.from('profiles').select('role, is_public').eq('id', userId).single();
  if (!data) return null;
  const profile = data as { role: string; is_public?: boolean | null };
  return { id: userId, role: profile.role, isPublic: profile.is_public !== false };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const caller = await getCaller(request);
    if (!caller) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    if (!caller.isPublic) return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });

    const { id } = await params;

    // Agent może edytować tylko swoje auto
    if (caller.role === 'agent') {
      const { data: car } = await supabaseAdmin.from('cars').select('agent_id').eq('id', id).single();
      if (!car || (car as { agent_id: string }).agent_id !== caller.id) {
        return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
      }
    } else if (caller.role !== 'root') {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
    }

    const body = await request.json();
    const { data, error } = await supabaseAdmin
      .from('cars')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ car: data });
  } catch (err) {
    console.error('Update car failed:', err);
    return NextResponse.json({ error: 'Wystąpił błąd serwera.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const caller = await getCaller(request);
    if (!caller) return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    if (!caller.isPublic) return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });

    const { id } = await params;

    // Agent może usuwać tylko swoje auto
    if (caller.role === 'agent') {
      const { data: car } = await supabaseAdmin.from('cars').select('agent_id').eq('id', id).single();
      if (!car || (car as { agent_id: string }).agent_id !== caller.id) {
        return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
      }
    } else if (caller.role !== 'root') {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
    }

    const { error } = await supabaseAdmin.from('cars').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete car failed:', err);
    return NextResponse.json({ error: 'Wystąpił błąd serwera.' }, { status: 500 });
  }
}
