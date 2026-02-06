import { Users } from 'lucide-react';
import { getCommunityStats } from '@/lib/queries/community';
import { formatNumber } from '@/lib/community/utils';

/**
 * Community Stats Component (Server Component)
 *
 * Fetches and displays community-wide statistics in the sidebar.
 */
export async function CommunityStats() {
  let stats;
  try {
    stats = await getCommunityStats();
  } catch {
    // Fall back to zeros if the view isn't accessible yet
    stats = { total_members: 0, total_posts: 0, total_channels: 0 };
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-green-700" />
        <h3 className="font-semibold text-green-950">Community Stats</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-2xl font-bold text-green-950">
            {formatNumber(Number(stats.total_members))}
          </div>
          <div className="text-sm text-gray-500">Total Members</div>
        </div>

        <div>
          <div className="text-2xl font-bold text-green-950">
            {formatNumber(Number(stats.total_posts))}
          </div>
          <div className="text-sm text-gray-500">Total Posts</div>
        </div>

        <div>
          <div className="text-2xl font-bold text-green-950">
            {formatNumber(Number(stats.total_channels))}
          </div>
          <div className="text-sm text-gray-500">Channels</div>
        </div>
      </div>
    </div>
  );
}
