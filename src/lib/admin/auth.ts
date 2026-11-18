import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type ServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * The signed-in admin's Supabase client, or null when the visitor is not
 * signed in or is not an admin (profiles.role = 'admin').
 *
 * This is for clear messages and redirects. The database enforces the same
 * rule on every admin table through row-level security, so nothing depends on
 * this check alone.
 */
export async function getAdminClient(): Promise<
  { supabase: ServerClient; signedIn: true } | { supabase: null; signedIn: boolean }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, signedIn: false };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { supabase: null, signedIn: true };

  return { supabase, signedIn: true };
}

/**
 * For admin pages: sends signed-out visitors to the login page and shows
 * "not found" to everyone who is not an admin.
 */
export async function requireAdminPage(): Promise<ServerClient> {
  const admin = await getAdminClient();
  if (admin.supabase) return admin.supabase;
  if (!admin.signedIn) redirect('/login');
  notFound();
}
