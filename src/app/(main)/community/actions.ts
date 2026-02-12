'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sanitizePostHtml, stripHtml } from '@/lib/community/sanitize';
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

  // Check channel restrictions
  const { data: channel } = await supabase
    .from('channels')
    .select('restricted')
    .eq('id', channelId)
    .single();

  if (channel?.restricted) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
      throw new Error('Only admins and moderators can post in this channel');
    }
  }

  // Sanitize the HTML body
  const sanitizedBody = sanitizePostHtml(body);

  // Extract hashtags from plain text version of the body
  const plainText = stripHtml(body);
  const hashtags = extractHashtags(plainText);

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

// ---------- Post Update ----------

export async function updatePost({
  postId,
  title,
  body,
  channelId,
  imageUrls,
}: {
  postId: number;
  title: string;
  body: string;
  channelId: number;
  imageUrls: string[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Verify ownership
  const { data: existing } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', postId)
    .single();

  if (!existing || existing.author_id !== user.id) {
    throw new Error('You can only edit your own posts');
  }

  // Check channel restrictions if changing channel
  const { data: channel } = await supabase
    .from('channels')
    .select('restricted')
    .eq('id', channelId)
    .single();

  if (channel?.restricted) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
      throw new Error('Only admins and moderators can post in this channel');
    }
  }

  const sanitizedBody = sanitizePostHtml(body);

  const { error } = await supabase
    .from('posts')
    .update({
      title: title.trim(),
      body: sanitizedBody,
      channel_id: channelId,
      image_urls: imageUrls,
    })
    .eq('id', postId);

  if (error) throw error;

  revalidatePath('/community');
  revalidatePath(`/community/posts/${postId}`);
  return postId;
}

// ---------- Post Deletion ----------

export async function deletePost(postId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('author_id', user.id);

  if (error) throw error;

  revalidatePath('/community');
}

// ---------- Publish Draft ----------

export async function publishDraft(postId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: post, error } = await supabase
    .from('posts')
    .update({ is_draft: false })
    .eq('id', postId)
    .eq('author_id', user.id)
    .select('body')
    .single();

  if (error) throw error;

  // Process hashtags now that it's published
  if (post?.body) {
    const plainText = stripHtml(post.body);
    const hashtags = extractHashtags(plainText);
    if (hashtags.length > 0) {
      await processHashtags(supabase, postId, hashtags);
    }
  }

  revalidatePath('/community');
}

// ---------- Helpers ----------

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
    const { data: hashtag } = await supabase
      .from('hashtags')
      .upsert({ name: tag }, { onConflict: 'name' })
      .select('id')
      .single();

    if (hashtag) {
      await supabase
        .from('post_hashtags')
        .insert({ post_id: postId, hashtag_id: hashtag.id });

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

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');
  const dataUri = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'community/posts',
    resource_type: 'image',
    transformation: [
      { width: 1200, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });

  return result.secure_url;
}
