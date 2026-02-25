import { Metadata } from 'next';
import { LearnHeader } from '@/components/learn/learn-header';

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

      {/* Content area */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          Guides &amp; Resources
        </h2>
        <p className="text-gray-600 text-base md:text-lg max-w-2xl">
          Content coming soon. Check back for care guides, habitat setup
          walkthroughs, feeding schedules, and more.
        </p>
      </div>
    </div>
  );
}
