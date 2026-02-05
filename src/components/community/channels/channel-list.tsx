import {
  MOCK_CHANNELS,
  CATEGORY_CONFIG,
  CATEGORY_ORDER,
} from '@/lib/community/mock-data';
import { ChannelCard } from './channel-card';

// Mock joined channels - in real implementation this would come from the database
const MOCK_JOINED_CHANNELS = ['announcements', 'introductions', 'care', 'help'];

/**
 * Channel List Component
 *
 * Displays all channels grouped by category.
 */
export function ChannelList() {
  // Group channels by category
  const channelsByCategory = CATEGORY_ORDER.map((category) => ({
    category,
    config: CATEGORY_CONFIG[category],
    channels: MOCK_CHANNELS.filter((c) => c.category === category),
  }));

  return (
    <div className="space-y-10">
      {channelsByCategory.map(({ category, config, channels }) => (
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
            {channels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                isJoined={MOCK_JOINED_CHANNELS.includes(channel.slug)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
