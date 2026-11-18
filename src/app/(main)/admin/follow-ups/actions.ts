'use server';

import { revalidatePath } from 'next/cache';
import { getAdminClient } from '@/lib/admin/auth';
import {
  FOLLOW_UP_KINDS,
  FOLLOW_UP_LIMITS,
  FOLLOW_UP_STATUSES,
  TAXON_NAME_PATTERN,
  type FollowUpInput,
  type FollowUpStatus,
} from '@/lib/admin/followups';

export type ActionResult = { ok: true } | { ok: false; error: string };

const NOT_ALLOWED: ActionResult = { ok: false, error: 'Only a signed-in admin can change follow-ups.' };

function refresh() {
  revalidatePath('/admin/follow-ups');
  revalidatePath('/admin/species');
}

/** Checks a form submission and returns the row to store, or a message. */
function toRow(input: FollowUpInput): { row: Record<string, unknown> } | { error: string } {
  const taxa = Array.from(new Set((input.taxa ?? []).map((t) => String(t).trim()).filter(Boolean)));
  if (taxa.length === 0) return { error: 'Choose at least one species, subspecies or genus.' };
  if (taxa.length > FOLLOW_UP_LIMITS.taxa) return { error: `No more than ${FOLLOW_UP_LIMITS.taxa} names.` };
  const badName = taxa.find((t) => !TAXON_NAME_PATTERN.test(t));
  if (badName) return { error: `"${badName}" is not a scientific name.` };

  if (!FOLLOW_UP_KINDS.includes(input.kind)) return { error: 'Choose what kind of follow-up this is.' };

  const title = (input.title ?? '').trim().replace(/\s+/g, ' ');
  if (!title) return { error: 'Give it a title or citation.' };
  if (title.length > FOLLOW_UP_LIMITS.title) return { error: 'The title is too long.' };

  const wouldFill = (input.would_fill ?? '').trim();
  const notes = (input.notes ?? '').trim();
  if (wouldFill.length > FOLLOW_UP_LIMITS.text || notes.length > FOLLOW_UP_LIMITS.text) {
    return { error: `Keep each text field under ${FOLLOW_UP_LIMITS.text} characters.` };
  }

  const url = (input.url ?? '').trim();
  if (url) {
    if (url.length > FOLLOW_UP_LIMITS.url) return { error: 'The link is too long.' };
    let parsed: URL | null = null;
    try {
      parsed = new URL(url);
    } catch {
      parsed = null;
    }
    if (!parsed || (parsed.protocol !== 'https:' && parsed.protocol !== 'http:')) {
      return { error: 'The link must start with https:// or http://.' };
    }
  }

  return {
    row: { taxa, kind: input.kind, title, would_fill: wouldFill || null, url: url || null, notes: notes || null },
  };
}

function describe(error: { code?: string; message: string }): string {
  if (error.code === '23505') return 'A follow-up of this kind with the same title already exists.';
  if (error.code === '42P01' || error.code === 'PGRST205') {
    return 'The follow-ups table does not exist yet. Run supabase/migrations/024_species_followups.sql.';
  }
  return error.message;
}

export async function addFollowUp(input: FollowUpInput): Promise<ActionResult> {
  const { supabase } = await getAdminClient();
  if (!supabase) return NOT_ALLOWED;

  const checked = toRow(input);
  if ('error' in checked) return { ok: false, error: checked.error };

  const { error } = await supabase.from('species_followups').insert(checked.row);
  if (error) return { ok: false, error: describe(error) };
  refresh();
  return { ok: true };
}

export async function updateFollowUp(id: number, input: FollowUpInput): Promise<ActionResult> {
  const { supabase } = await getAdminClient();
  if (!supabase) return NOT_ALLOWED;

  const checked = toRow(input);
  if ('error' in checked) return { ok: false, error: checked.error };

  const { data, error } = await supabase.from('species_followups').update(checked.row).eq('id', id).select('id');
  if (error) return { ok: false, error: describe(error) };
  if (!data || data.length === 0) return { ok: false, error: 'That follow-up no longer exists.' };
  refresh();
  return { ok: true };
}

export async function setFollowUpStatus(id: number, status: FollowUpStatus): Promise<ActionResult> {
  const { supabase } = await getAdminClient();
  if (!supabase) return NOT_ALLOWED;
  if (!FOLLOW_UP_STATUSES.includes(status)) return { ok: false, error: 'Unknown status.' };

  const { data, error } = await supabase.from('species_followups').update({ status }).eq('id', id).select('id');
  if (error) return { ok: false, error: describe(error) };
  if (!data || data.length === 0) return { ok: false, error: 'That follow-up no longer exists.' };
  refresh();
  return { ok: true };
}

export async function deleteFollowUp(id: number): Promise<ActionResult> {
  const { supabase } = await getAdminClient();
  if (!supabase) return NOT_ALLOWED;

  const { data, error } = await supabase.from('species_followups').delete().eq('id', id).select('id');
  if (error) return { ok: false, error: describe(error) };
  if (!data || data.length === 0) return { ok: false, error: 'That follow-up no longer exists.' };
  refresh();
  return { ok: true };
}
