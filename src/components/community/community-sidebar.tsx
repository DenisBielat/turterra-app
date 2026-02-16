import { Suspense } from 'react';
import { CreatePostCta } from './sidebar/create-post-cta';
import { CommunityStats } from './community-stats';
import { TopContributors } from './sidebar/top-contributors';
import { CommunityRules } from './sidebar/community-rules';

interface CommunitySidebarProps {
  isLoggedIn?: boolean;
}

export function CommunitySidebar({ isLoggedIn = false }: CommunitySidebarProps) {
  return (
    <aside className="hidden lg:block w-80 flex-shrink-0 space-y-6">
      <CreatePostCta isLoggedIn={isLoggedIn} />
      <Suspense fallback={<SidebarCardSkeleton />}>
        {/* @ts-expect-error Async Server Component */}
        <CommunityStats />
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
