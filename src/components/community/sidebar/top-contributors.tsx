import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { MOCK_TOP_CONTRIBUTORS } from '@/lib/community/mock-data';
import { formatNumber } from '@/lib/community/utils';

/**
 * Top Contributors Component
 *
 * Displays the top community contributors with badges and points.
 */
export function TopContributors() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-green-700" />
        <h3 className="font-semibold text-green-950">Top Contributors</h3>
      </div>

      <div className="space-y-4">
        {MOCK_TOP_CONTRIBUTORS.map((contributor) => (
          <Link
            key={contributor.username}
            href={`/user/${contributor.username}`}
            className="flex items-center gap-3 group"
          >
            {/* Avatar placeholder */}
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-gray-600">
                {contributor.display_name.charAt(0)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-medium text-green-950 group-hover:text-green-700 transition-colors truncate">
                {contributor.display_name}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-700 font-medium">
                  {contributor.badge}
                </span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">
                  {formatNumber(contributor.points)} pts
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
