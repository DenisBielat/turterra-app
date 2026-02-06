import { createClient } from '@/lib/supabase/server';
import { getChannels, getChannelStats, getUserChannelMemberships } from '@/lib/queries/community';
import { CATEGORY_CONFIG, CATEGORY_ORDER } from '@/lib/community/mock-data';
import { ChannelCard } from './channel-card';

/**
 * Channel List Server Component
 *
 * Fetches channels, stats, and user memberships from Supabase,
 * then renders grouped channel cards.
 */
export async function ChannelListServer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [channels, stats, memberships] = await Promise.all([
    getChannels(),
    getChannelStats(),
    user ? getUserChannelMemberships(user.id) : Promise.resolve([]),
  ]);

  // Build a stats lookup map: channel_id -> { member_count, post_count }
  const statsMap = new Map(
    stats?.map((s) => [s.channel_id, { member_count: Number(s.member_count), post_count: Number(s.post_count) }]) ?? []
  );

  const membershipSet = new Set(memberships);

  // Group channels by category
  const channelsByCategory = CATEGORY_ORDER.map((category) => ({
    category,
    config: CATEGORY_CONFIG[category],
    channels: (channels ?? []).filter(
      (c: { category: string }) => c.category === category
    ),
  }));

  return (
    <div className="space-y-10">
      {channelsByCategory.map(({ category, config, channels: catChannels }) => (
        <section key={category}>
          {/* Category Header */}
          <div className="mb-4">
            <h2 className="font-heading text-xl font-semibold text-green-950">
              {config.label}
            </h2>
            <p className="text-gray-600 text-sm">{config.description}</p>
          </div>

          {/* Channel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {catChannels.map((channel: { id: number; slug: string; name: string; description: string; icon: string }) => {
              const channelStats = statsMap.get(channel.id);
              return (
                <ChannelCard
                  key={channel.id}
                  channel={{
                    id: channel.id,
                    slug: channel.slug,
                    name: channel.name,
                    description: channel.description,
                    icon: channel.icon,
                    category: category,
                    member_count: channelStats?.member_count ?? 0,
                    post_count: channelStats?.post_count ?? 0,
                  }}
                  isJoined={membershipSet.has(channel.id)}
                  isLoggedIn={!!user}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
