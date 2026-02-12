import { createClient } from '@/lib/supabase/server';

// ---------- Channels ----------

export async function getChannels() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getChannelBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data;
}

export async function getChannelStats() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('channel_stats').select('*');
  if (error) throw error;
  return data;
}

export async function getUserChannelMemberships(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('channel_memberships')
    .select('channel_id')
    .eq('user_id', userId);
  if (error) throw error;
  return data?.map((m) => m.channel_id) ?? [];
}

// ---------- Community Stats ----------

export async function getCommunityStats() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('community_stats')
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

// ---------- Posts ----------

type SortOption = 'hot' | 'new' | 'top';

export async function getPosts({
  channelId,
  sort = 'hot',
  limit = 20,
  offset = 0,
}: {
  channelId?: number;
  sort?: SortOption;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();

  let query = supabase
    .from('posts')
    .select(
      `
      *,
      author:profiles!author_id (id, username, display_name, avatar_url),
      channel:channels!channel_id (id, slug, name)
    `
    )
    .eq('is_draft', false)
    .range(offset, offset + limit - 1);

  if (channelId) query = query.eq('channel_id', channelId);

  switch (sort) {
    case 'new':
      query = query.order('created_at', { ascending: false });
      break;
    case 'top':
      query = query.order('score', { ascending: false });
      break;
    case 'hot':
    default:
      query = query.order('hot_score', { ascending: false });
      break;
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getPostById(postId: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      *,
      author:profiles!author_id (id, username, display_name, avatar_url),
      channel:channels!channel_id (id, slug, name)
    `
    )
    .eq('id', postId)
    .single();
  if (error) throw error;
  return data;
}

export async function getUserVotesForPosts(
  userId: string,
  postIds: number[]
) {
  if (postIds.length === 0) return new Map<number, number>();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('votes')
    .select('post_id, value')
    .eq('user_id', userId)
    .in('post_id', postIds);
  if (error) throw error;
  return new Map(data?.map((v) => [v.post_id, v.value]) ?? []);
}

// ---------- User Posts ----------

export async function getUserPosts(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      id, title, created_at, is_draft, score, comment_count, image_urls,
      channel:channels!channel_id (slug, name)
    `
    )
    .eq('author_id', userId)
    .eq('is_draft', false)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getUserDrafts(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      id, title, created_at, is_draft, image_urls,
      channel:channels!channel_id (slug, name)
    `
    )
    .eq('author_id', userId)
    .eq('is_draft', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getUserPostCount(userId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('author_id', userId)
    .eq('is_draft', false);
  if (error) throw error;
  return count ?? 0;
}

// ---------- Hashtags ----------

export async function getTrendingHashtags(limit = 5) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('hashtags')
    .select('name, post_count')
    .order('post_count', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// ---------- News ----------

export async function getLatestNews(limit = 10) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('community_news')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// ---------- Featured Species ----------

export async function getActiveFeaturedSpecies() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('featured_species')
    .select('*')
    .eq('is_active', true)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
}
