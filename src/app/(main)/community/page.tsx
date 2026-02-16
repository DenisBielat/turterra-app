import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { CommunityHeader } from '@/components/community/community-header';
import { NewsCarouselServer } from '@/components/community/news/news-carousel-server';
import { CommunityTabs } from '@/components/community/community-tabs';
import { CommunitySidebar } from '@/components/community/community-sidebar';
import { PostFeedServer } from '@/components/community/posts/post-feed-server';
import { ChannelListServer } from '@/components/community/channels/channel-list-server';

interface CommunityPageProps {
  searchParams: Promise<{
    tab?: string;
    sort?: string;
    view?: string;
  }>;
}

/**
 * Community Page (Server Component)
 *
 * Main community hub with hero header, news carousel, posts, and channels.
 * Tab, sort, and view state are driven by URL search params.
 */
export default async function CommunityPage({ searchParams }: CommunityPageProps) {
  const params = await searchParams;
  const activeTab = params.tab === 'channels' ? 'channels' : 'posts';
  const sort = (['hot', 'new', 'top'].includes(params.sort ?? '') ? params.sort : 'hot') as
    | 'hot'
    | 'new'
    | 'top';
  const viewMode = params.view === 'compact' ? 'compact' : 'rich';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-warm">
      {/* Full-width hero section */}
      <div className="w-full">
        <CommunityHeader />
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-0 pb-8">
        {/* Latest News: carousel overlapping hero */}
        <div className="-mt-48 relative z-10 mb-8">
          <Suspense fallback={<NewsCarouselSkeleton />}>
            {/* @ts-expect-error Async Server Component */}
            <NewsCarouselServer />
          </Suspense>
        </div>

        {/* Main Content Area */}
        <div className="flex gap-8">
          {/* Main Column */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <CommunityTabs activeTab={activeTab} />

            {/* Content based on active tab */}
            {activeTab === 'posts' ? (
              <Suspense fallback={<PostFeedSkeleton />}>
                {/* @ts-expect-error Async Server Component */}
                <PostFeedServer sort={sort} viewMode={viewMode} />
              </Suspense>
            ) : (
              <Suspense fallback={<ChannelListSkeleton />}>
                {/* @ts-expect-error Async Server Component */}
                <ChannelListServer />
              </Suspense>
            )}
          </div>

          {/* Sidebar */}
          <CommunitySidebar isLoggedIn={!!user} />
        </div>
      </div>
    </div>
  );
}

// ---------- Loading Skeletons ----------

function NewsCarouselSkeleton() {
  return (
    <div className="pb-8 pt-6">
      <div className="flex items-center justify-between mb-5">
        <div className="h-6 w-28 bg-white/20 rounded animate-pulse" />
      </div>
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-72 h-[384px] bg-white/10 rounded-xl animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

function PostFeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-100 h-40 animate-pulse"
        />
      ))}
    </div>
  );
}

function ChannelListSkeleton() {
  return (
    <div className="space-y-10">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i}>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div
                key={j}
                className="bg-white rounded-xl border border-gray-100 h-32 animate-pulse"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
