import { CreatePostCta } from './sidebar/create-post-cta';
import { CommunityStats } from './community-stats';
import { TrendingTopics } from './sidebar/trending-topics';
import { TopContributors } from './sidebar/top-contributors';

/**
 * Community Sidebar Component
 *
 * Contains the right sidebar with CTA, stats, trending topics, and top contributors.
 * Hidden on mobile, visible on lg+ screens.
 */
export function CommunitySidebar() {
  return (
    <aside className="hidden lg:block w-80 flex-shrink-0 space-y-6">
      <CreatePostCta />
      <CommunityStats />
      <TrendingTopics />
      <TopContributors />
    </aside>
  );
}
