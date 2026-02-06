import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getChannelBySlug, getChannelStats, getUserChannelMemberships } from '@/lib/queries/community';
import { CHANNEL_ICON_COLORS } from '@/lib/community/mock-data';
import { formatNumber } from '@/lib/community/utils';
import { PostFeedServer } from '@/components/community/posts/post-feed-server';
import { JoinChannelButton } from '@/components/community/channels/join-channel-button';
import { ChannelIcon } from '@/components/community/channels/channel-icon';

interface ChannelPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; view?: string }>;
}

/**
 * Channel Detail Page
 *
 * Displays channel info and its posts, fetched from Supabase.
 */
export default async function ChannelPage({ params, searchParams }: ChannelPageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  let channel;
  try {
    channel = await getChannelBySlug(slug);
  } catch {
    return notFound();
  }

  if (!channel) return notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get channel stats and membership in parallel
  const [stats, memberships] = await Promise.all([
    getChannelStats(),
    user ? getUserChannelMemberships(user.id) : Promise.resolve([]),
  ]);

  const channelStats = stats?.find((s) => s.channel_id === channel.id);
  const isJoined = memberships.includes(channel.id);

  const sort = (['hot', 'new', 'top'].includes(sp.sort ?? '') ? sp.sort : 'hot') as
    | 'hot'
    | 'new'
    | 'top';
  const viewMode = sp.view === 'compact' ? 'compact' : 'rich';

  return (
    <div className="min-h-screen bg-warm">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Community
        </Link>

        {/* Channel Header */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <ChannelIcon svg={channel.icon_svg} name={channel.name} bgColor={CHANNEL_ICON_COLORS[channel.slug]} size={64} />

              {/* Info */}
              <div>
                <h1 className="font-heading text-2xl font-bold text-green-950">
                  {channel.name}
                </h1>
                <div className="text-gray-500 mb-2">/{channel.slug}</div>
                <p className="text-gray-600">{channel.description}</p>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>
                      {formatNumber(Number(channelStats?.member_count ?? 0))} members
                    </span>
                  </div>
                  <span className="text-gray-300">·</span>
                  <span>
                    {formatNumber(Number(channelStats?.post_count ?? 0))} posts
                  </span>
                </div>
              </div>
            </div>

            {/* Join Button */}
            <JoinChannelButton
              channelId={channel.id}
              isJoined={isJoined}
              isLoggedIn={!!user}
            />
          </div>
        </div>

        {/* Posts filtered to this channel */}
        <Suspense
          fallback={
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-100 h-40 animate-pulse"
                />
              ))}
            </div>
          }
        >
          {/* @ts-expect-error Async Server Component */}
          <PostFeedServer
            sort={sort}
            viewMode={viewMode}
            channelId={channel.id}
          />
        </Suspense>
      </div>
    </div>
  );
}
