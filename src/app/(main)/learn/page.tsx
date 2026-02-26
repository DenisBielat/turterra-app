import { Metadata } from 'next';
import { LearnHeader } from '@/components/learn/learn-header';
import { BrowseGuides } from '@/components/learn/browse-guides';

export const metadata: Metadata = {
  title: 'Learn | Turterra',
  description:
    'Turtle care guides, habitat tips, diet advice, and everything you need to know about keeping turtles happy and healthy.',
};

/**
 * Learn Page
 *
 * Educational hub with care guides and general turtle-keeping resources.
 */
export default function LearnPage() {
  return (
    <div className="min-h-screen bg-warm">
      {/* Full-width hero section */}
      <div className="w-full">
        <LearnHeader />
      </div>

      {/* Content area — max-w-8xl + px-10 matches navbar logo alignment */}
      <div className="max-w-8xl mx-auto px-4 lg:px-10 py-12">
        <BrowseGuides />
      </div>
    </div>
  );
}
