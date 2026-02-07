import Link from 'next/link';
import { SquarePen } from 'lucide-react';

/**
 * Create Post CTA Component
 *
 * Call-to-action card encouraging users to create posts.
 */
export function CreatePostCta() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="font-semibold text-green-950 mb-2">
        Share with the community
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Got a question, story, or photo to share? Start a discussion!
      </p>
      <Link
        href="/community/new"
        className="flex items-center justify-center gap-2 w-full bg-green-700 hover:bg-green-800 text-white font-medium py-3 px-4 rounded-lg transition-colors"
      >
        <SquarePen className="h-4 w-4" />
        Create Post
      </Link>
    </div>
  );
}
