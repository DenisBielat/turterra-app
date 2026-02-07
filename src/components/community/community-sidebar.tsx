import { Suspense } from 'react';
import { CreatePostCta } from './sidebar/create-post-cta';
import { CommunityStats } from './community-stats';
import { TrendingTopics } from './sidebar/trending-topics';
import { TopContributors } from './sidebar/top-contributors';
import { CommunityRules } from './sidebar/community-rules';

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
      <Suspense fallback={<SidebarCardSkeleton />}>
        {/* @ts-expect-error Async Server Component */}
        <CommunityStats />
      </Suspense>
      <Suspense fallback={<SidebarCardSkeleton />}>
        {/* @ts-expect-error Async Server Component */}
        <TrendingTopics />
      </Suspense>
      <TopContributors />
      <CommunityRules />
    </aside>
  );
}

function SidebarCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 h-32 animate-pulse" />
  );
}
