'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ---------- Channel Membership ----------

export async function joinChannel(channelId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('channel_memberships')
    .insert({ user_id: user.id, channel_id: channelId });
  if (error) throw error;
  revalidatePath('/community');
}

export async function leaveChannel(channelId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('channel_memberships')
    .delete()
    .eq('user_id', user.id)
    .eq('channel_id', channelId);
  if (error) throw error;
  revalidatePath('/community');
}

// ---------- Voting ----------

export async function voteOnPost(postId: number, value: 1 | -1) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: existing } = await supabase
    .from('votes')
    .select('id, value')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .maybeSingle();

  if (existing) {
    if (existing.value === value) {
      await supabase.from('votes').delete().eq('id', existing.id);
    } else {
      await supabase.from('votes').update({ value }).eq('id', existing.id);
    }
  } else {
    await supabase
      .from('votes')
      .insert({ user_id: user.id, post_id: postId, value });
  }
  revalidatePath('/community');
}

export async function voteOnComment(commentId: number, value: 1 | -1) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: existing } = await supabase
    .from('votes')
    .select('id, value')
    .eq('user_id', user.id)
    .eq('comment_id', commentId)
    .maybeSingle();

  if (existing) {
    if (existing.value === value) {
      await supabase.from('votes').delete().eq('id', existing.id);
    } else {
      await supabase.from('votes').update({ value }).eq('id', existing.id);
    }
  } else {
    await supabase
      .from('votes')
      .insert({ user_id: user.id, comment_id: commentId, value });
  }
  revalidatePath('/community');
}
