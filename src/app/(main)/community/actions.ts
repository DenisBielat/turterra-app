'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sanitizeMarkdown } from '@/lib/community/sanitize';
import cloudinary from '@/lib/db/cloudinary';

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

// ---------- Post Creation ----------

export async function createPost({
  title,
  body,
  channelId,
  imageUrls,
  isDraft,
}: {
  title: string;
  body: string;
  channelId: number;
  imageUrls: string[];
  isDraft: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Sanitize the markdown body
  const sanitizedBody = sanitizeMarkdown(body);

  // Extract hashtags from body
  const hashtags = extractHashtags(sanitizedBody);

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      title: title.trim(),
      body: sanitizedBody,
      channel_id: channelId,
      author_id: user.id,
      image_urls: imageUrls,
      is_draft: isDraft,
    })
    .select('id')
    .single();

  if (error) throw error;

  // Process hashtags for published posts
  if (hashtags.length > 0 && !isDraft) {
    await processHashtags(supabase, post.id, hashtags);
  }

  revalidatePath('/community');
  return post.id;
}

function extractHashtags(text: string): string[] {
  const matches = text.match(/#(\w+)/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];
}

async function processHashtags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  postId: number,
  hashtags: string[]
) {
  for (const tag of hashtags) {
    // Upsert the hashtag (create if not exists)
    const { data: hashtag } = await supabase
      .from('hashtags')
      .upsert({ name: tag }, { onConflict: 'name' })
      .select('id')
      .single();

    if (hashtag) {
      // Link hashtag to post
      await supabase
        .from('post_hashtags')
        .insert({ post_id: postId, hashtag_id: hashtag.id });

      // Update the hashtag's post count
      await supabase.rpc('update_hashtag_count', { hashtag_name: tag });
    }
  }
}

// ---------- Image Upload ----------

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function uploadCommunityImage(formData: FormData): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPEG, PNG, GIF, and WebP images are allowed');
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image must be under 5MB');
  }

  // Convert file to base64 data URI for Cloudinary upload
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');
  const dataUri = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'community/posts',
    resource_type: 'image',
    transformation: [
      { width: 1200, crop: 'limit' }, // Limit max width
      { quality: 'auto', fetch_format: 'auto' }, // Optimize
    ],
  });

  return result.secure_url;
}
