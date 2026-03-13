import { supabase } from './supabase';
import type { Car, User, CreateCarInput } from '../types';

// ─── Helper ──────────────────────────────────────────────────────────────────

function mapProfile(row: Record<string, unknown>): User {
  const id = row.id as string;
  return {
    id,
    firstName: (row.first_name as string) || '',
    lastName: (row.last_name as string) || '',
    email: (row.email as string) || '',
    role: (row.role as User['role']) || 'agent',
    phone: row.phone as string | undefined,
    avatarUrl: row.avatar_url as string | undefined,
    bio: row.bio as string | undefined,
    isActive: row.is_active !== false,
    isPublic: row.is_public as boolean | undefined,
    lastLogin: row.last_login as string | undefined,
    createdBy: row.created_by as string | undefined,
    createdAt: (row.created_at as string) || '',
    updatedAt: (row.updated_at as string) || '',
  };
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authAPI = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getProfile: async (): Promise<User> => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error('Nie jestes zalogowany');
    const { data, error } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
    if (error) throw error;
    return mapProfile(data as Record<string, unknown>);
  },

  register: async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<{ message: string }> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json() as { message?: string; error?: string };
    if (!res.ok) throw new Error(json.error ?? 'Nie udało się utworzyć konta');
    return { message: json.message ?? 'Konto utworzone' };
  },
};
// ─── Auth header helper ──────────────────────────────────────────────────────────

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return { 'Authorization': `Bearer ${session.access_token}` };
}
// ─── Cars ────────────────────────────────────────────────────────────────────

export const carsAPI = {
  getAll: async (): Promise<Car[]> => {
    const { data, error } = await supabase
      .from('cars')
      .select('*, agent:profiles(id, first_name, last_name, email, phone, avatar_url)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Car[];
  },

  getById: async (id: string): Promise<Car> => {
    const { data, error } = await supabase
      .from('cars')
      .select('*, agent:profiles(id, first_name, last_name, email, phone, avatar_url)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Car;
  },

  create: async (car: CreateCarInput): Promise<Car> => {
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { ...car, agent_id: car.agent_id || user?.id };
    const { data, error } = await supabase.from('cars').insert(payload).select('*').single();
    if (error) throw error;
    return data as Car;
  },

  update: async (id: string, car: Partial<CreateCarInput>): Promise<Car> => {
    const headers = await getAuthHeader();
    const res = await fetch(`/api/cars/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(car),
    });
    const json = await res.json() as { car?: Car; error?: string };
    if (!res.ok) throw new Error(json.error ?? 'Failed to update car');
    return json.car!;
  },

  delete: async (id: string): Promise<void> => {
    const headers = await getAuthHeader();
    const res = await fetch(`/api/cars/${id}`, { method: 'DELETE', headers });
    if (!res.ok) {
      const json = await res.json() as { error?: string };
      throw new Error(json.error ?? 'Failed to delete car');
    }
  },

  uploadImage: async (_carId: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const json = await res.json() as { url?: string; error?: string };
    if (!res.ok) throw new Error(json.error ?? 'Upload failed');
    return json.url!;
  },

  deleteImage: async (url: string): Promise<void> => {
    // Wyciągnij public_id z URL Cloudinary, np. .../upload/v1234/cars/abc.jpg → cars/abc
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
    if (!match) return;
    await fetch('/api/upload/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId: match[1] }),
    });
  },
};

// ─── Users ───────────────────────────────────────────────────────────────────

export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(r => mapProfile(r as Record<string, unknown>));
  },

  getAgents: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('role', 'agent').order('first_name');
    if (error) throw error;
    return (data || []).map(r => mapProfile(r as Record<string, unknown>));
  },

  getById: async (id: string): Promise<User> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error) throw error;
    return mapProfile(data as Record<string, unknown>);
  },

  create: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
    isPublic?: boolean;
  }): Promise<User> => {
    const headers = await getAuthHeader();
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(userData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? 'Failed to create user');
    return mapProfile(json.user as Record<string, unknown>);
  },

  update: async (id: string, userData: Partial<User> & { password?: string }): Promise<User> => {
    const headers = await getAuthHeader();
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(userData),
    });
    const json = await res.json() as { user?: Record<string, unknown>; error?: string };
    if (!res.ok) throw new Error(json.error ?? 'Failed to update user');
    return mapProfile(json.user!);
  },

  delete: async (id: string): Promise<void> => {
    const headers = await getAuthHeader();
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error ?? 'Failed to delete user');
    }
  },

  uploadAvatar: async (id: string, file: File): Promise<User> => {
    const ext = file.name.split('.').pop();
    const path = `${id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    const { data, error } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', id).select('*').single();
    if (error) throw error;
    return mapProfile(data as Record<string, unknown>);
  },
};
