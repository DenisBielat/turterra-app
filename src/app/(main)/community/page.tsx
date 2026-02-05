'use client';

import { useState } from 'react';
import { CommunityHeader } from '@/components/community/community-header';
import { NewsCarousel } from '@/components/community/news/news-carousel';
import { CommunityTabs } from '@/components/community/community-tabs';
import { CommunitySidebar } from '@/components/community/community-sidebar';
import { PostFeed } from '@/components/community/posts/post-feed';
import { ChannelList } from '@/components/community/channels/channel-list';

/**
 * Community Page
 *
 * Main community hub with news, posts, and channels.
 * Uses client-side state for tab switching.
 */
export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'channels'>('posts');

  return (
    <div className="min-h-screen bg-warm">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <CommunityHeader />

        {/* News Carousel */}
        <NewsCarousel />

        {/* Main Content Area */}
        <div className="flex gap-8">
          {/* Main Column */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <CommunityTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Content based on active tab */}
            {activeTab === 'posts' ? <PostFeed /> : <ChannelList />}
          </div>

          {/* Sidebar */}
          <CommunitySidebar />
        </div>
      </div>
    </div>
  );
}
