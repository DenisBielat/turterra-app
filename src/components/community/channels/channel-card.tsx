import Link from 'next/link';
import { Users } from 'lucide-react';
import { MockChannel } from '@/lib/community/mock-data';
import { formatNumber } from '@/lib/community/utils';
import { JoinChannelButton } from './join-channel-button';
import { ChannelIcon } from './channel-icon';

interface ChannelCardProps {
  channel: MockChannel;
  isJoined?: boolean;
  isLoggedIn?: boolean;
}

/**
 * Channel Card Component
 *
 * Displays a single channel with icon, name, description, and stats.
 * Renders custom SVG from the icon_svg column in Supabase.
 */
export function ChannelCard({ channel, isJoined = false, isLoggedIn = false }: ChannelCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        {/* Icon and Info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <ChannelIcon svg={channel.icon_svg} name={channel.name} size={48} />

          {/* Channel Info */}
          <div className="flex-1 min-w-0">
            <Link
              href={`/community/channels/${channel.slug}`}
              className="font-semibold text-green-950 hover:text-green-700 transition-colors"
            >
              {channel.name}
            </Link>
            <div className="text-sm text-gray-400 mb-2">/{channel.slug}</div>
          </div>
        </div>

        {/* Join Button */}
        <JoinChannelButton
          channelId={channel.id}
          isJoined={isJoined}
          isLoggedIn={isLoggedIn}
        />
      </div>

      {/* Description */}
      <p className="mt-3 text-sm text-gray-600 line-clamp-2">
        {channel.description}
      </p>

      {/* Stats */}
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          <span>{formatNumber(channel.member_count)} members</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-300">|</span>
          <span>{formatNumber(channel.post_count)} posts</span>
        </div>
      </div>
    </div>
  );
}
