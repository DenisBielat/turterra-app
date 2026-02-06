import Image from 'next/image';
import Link from 'next/link';
import {
  Megaphone,
  Map,
  Users,
  HelpCircle,
  Heart,
  Home,
  Activity,
  Leaf,
  Search,
  Eye,
} from 'lucide-react';
import { MockChannel, CHANNEL_ICON_COLORS } from '@/lib/community/mock-data';
import { formatNumber } from '@/lib/community/utils';
import { cn } from '@/lib/utils';
import { JoinChannelButton } from './join-channel-button';

// Fallback: map icon names to Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  megaphone: Megaphone,
  map: Map,
  users: Users,
  'help-circle': HelpCircle,
  heart: Heart,
  home: Home,
  activity: Activity,
  leaf: Leaf,
  search: Search,
  eye: Eye,
};

interface ChannelCardProps {
  channel: MockChannel;
  isJoined?: boolean;
  isLoggedIn?: boolean;
}

/**
 * Channel Card Component
 *
 * Displays a single channel with icon, name, description, and stats.
 * Uses custom icon_url if set, otherwise falls back to Lucide icons.
 *
 * To use custom icons:
 * 1. Place SVG/PNG files in public/images/channel-icons/
 * 2. Set icon_url on the channel record in Supabase (e.g., '/images/channel-icons/announcements.svg')
 */
export function ChannelCard({ channel, isJoined = false, isLoggedIn = false }: ChannelCardProps) {
  const IconComponent = ICON_MAP[channel.icon] || HelpCircle;
  const iconColors = CHANNEL_ICON_COLORS[channel.slug] || {
    bg: 'bg-gray-500',
    icon: 'text-white',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        {/* Icon and Info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Icon */}
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden',
              !channel.icon_url && iconColors.bg
            )}
          >
            {channel.icon_url ? (
              <Image
                src={channel.icon_url}
                alt={channel.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <IconComponent className={cn('h-6 w-6', iconColors.icon)} />
            )}
          </div>

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
