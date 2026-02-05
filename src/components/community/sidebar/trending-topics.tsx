import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { MOCK_TRENDING } from '@/lib/community/mock-data';
import { formatNumber } from '@/lib/community/utils';

/**
 * Trending Topics Component
 *
 * Displays the top trending hashtags with post counts.
 */
export function TrendingTopics() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-green-700" />
        <h3 className="font-semibold text-green-950">Trending Topics</h3>
      </div>

      <div className="space-y-3">
        {MOCK_TRENDING.map((topic, index) => (
          <Link
            key={topic.name}
            href={`/community/topics/${topic.name.toLowerCase()}`}
            className="flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-400 w-4">
                {index + 1}
              </span>
              <span className="text-green-950 group-hover:text-green-700 transition-colors">
                #{topic.name}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {formatNumber(topic.post_count)} posts
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
