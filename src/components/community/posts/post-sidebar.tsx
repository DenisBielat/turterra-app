import Link from 'next/link';
import { Calendar, ShieldCheck, Users } from 'lucide-react';
import { ChannelIcon } from '@/components/community/channels/channel-icon';
import { JoinChannelButton } from '@/components/community/channels/join-channel-button';
import { formatNumber, formatDate } from '@/lib/community/utils';
import { CHANNEL_ICON_COLORS } from '@/lib/community/mock-data';

const COMMUNITY_RULES = [
  { number: 1, title: 'Be respectful and kind' },
  { number: 2, title: 'Stay on topic' },
  { number: 3, title: 'No misinformation' },
  { number: 4, title: 'No spam or self-promotion' },
  { number: 5, title: 'Protect animal welfare' },
];

interface PostSidebarProps {
  channel: {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    icon_svg: string | null;
    created_at: string;
  };
  memberCount: number;
  isJoined: boolean;
  isLoggedIn: boolean;
  moderators: Array<{
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  }>;
}

export function PostSidebar({
  channel,
  memberCount,
  isJoined,
  isLoggedIn,
  moderators,
}: PostSidebarProps) {
  return (
    <div className="space-y-4">
      {/* Channel Info Card */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Header bar */}
        <div className={`h-8 ${CHANNEL_ICON_COLORS[channel.slug] ?? 'bg-green-700'}`} />

        <div className="p-4">
          {/* Channel icon + name */}
          <div className="flex items-center gap-3 -mt-8 mb-3">
            <ChannelIcon
              svg={channel.icon_svg}
              name={channel.name}
              bgColor={CHANNEL_ICON_COLORS[channel.slug]}
              size={48}
            />
            <div className="mt-4">
              <Link
                href={`/community/channels/${channel.slug}`}
                className="font-bold text-green-950 hover:text-green-700 transition-colors"
              >
                {channel.name}
              </Link>
              <p className="text-xs text-gray-500">/{channel.slug}</p>
            </div>
          </div>

          {/* Description */}
          {channel.description && (
            <p className="text-sm text-gray-600 mb-3">
              {channel.description}
            </p>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{formatNumber(memberCount)} members</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDate(channel.created_at)}</span>
            </div>
          </div>

          {/* Join button */}
          <JoinChannelButton
            channelId={channel.id}
            isJoined={isJoined}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </div>

      {/* Moderators */}
      {moderators.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="font-semibold text-green-950 text-sm mb-3">Moderators</h3>
          <div className="space-y-2">
            {moderators.map((mod) => (
              <Link
                key={mod.username}
                href={`/user/${mod.username}`}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-700 transition-colors"
              >
                {mod.avatar_url ? (
                  <img
                    src={mod.avatar_url}
                    alt={mod.display_name ?? mod.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">
                    {(mod.display_name ?? mod.username).charAt(0).toUpperCase()}
                  </div>
                )}
                <span>@{mod.username}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Community Rules */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-green-700" />
          <h3 className="font-semibold text-green-950 text-sm">Community Rules</h3>
        </div>
        <ol className="space-y-2">
          {COMMUNITY_RULES.map((rule) => (
            <li key={rule.number} className="flex gap-2 text-sm">
              <span className="text-green-700 font-bold flex-shrink-0 w-4 text-right text-xs mt-0.5">
                {rule.number}
              </span>
              <span className="text-gray-700">{rule.title}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
