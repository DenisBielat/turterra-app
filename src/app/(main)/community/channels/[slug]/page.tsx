import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';
import { notFound } from 'next/navigation';
import { MOCK_CHANNELS, CHANNEL_ICON_COLORS } from '@/lib/community/mock-data';
import { formatNumber } from '@/lib/community/utils';
import {
  Megaphone,
  Map,
  HelpCircle,
  Heart,
  Home,
  Activity,
  Leaf,
  Search,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Map icon names to Lucide components
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

interface ChannelPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Channel Detail Page
 *
 * Placeholder page for viewing a specific channel and its posts.
 */
export default async function ChannelPage({ params }: ChannelPageProps) {
  const { slug } = await params;

  // Find the channel from mock data
  const channel = MOCK_CHANNELS.find((c) => c.slug === slug);

  if (!channel) {
    return notFound();
  }

  const IconComponent = ICON_MAP[channel.icon] || HelpCircle;
  const iconColors = CHANNEL_ICON_COLORS[channel.slug] || {
    bg: 'bg-gray-500',
    icon: 'text-white',
  };

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
              {/* Icon */}
              <div
                className={cn(
                  'w-16 h-16 rounded-xl flex items-center justify-center',
                  iconColors.bg
                )}
              >
                <IconComponent className={cn('h-8 w-8', iconColors.icon)} />
              </div>

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
                    <span>{formatNumber(channel.member_count)} members</span>
                  </div>
                  <span className="text-gray-300">·</span>
                  <span>{formatNumber(channel.post_count)} posts</span>
                </div>
              </div>
            </div>

            {/* Join Button */}
            <button className="px-6 py-2 rounded-full text-sm font-medium bg-green-700 text-white hover:bg-green-800 transition-colors">
              Join
            </button>
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="text-gray-400 mb-2">
            <Users className="h-12 w-12 mx-auto mb-4" />
          </div>
          <h2 className="font-semibold text-green-950 mb-2">
            Posts Coming Soon
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Posts in this channel will appear here once the community features
            are fully connected to the database. Check back soon!
          </p>
        </div>
      </div>
    </div>
  );
}
