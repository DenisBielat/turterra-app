import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getChannels } from '@/lib/queries/community';
import { PostEditor } from '@/components/community/editor/post-editor';
import { CommunityRules } from '@/components/community/sidebar/community-rules';

export const metadata = {
  title: 'Create Post | Turterra Community',
};

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const channels = await getChannels();
  const { channel: defaultChannelSlug } = await searchParams;

  // Map channels to the shape the editor expects
  const editorChannels = (channels ?? []).map((ch) => ({
    id: ch.id as number,
    slug: ch.slug as string,
    name: ch.name as string,
    category: ch.category as string,
  }));

  return (
    <div className="min-h-screen bg-warm">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Community
        </Link>

        <h1 className="font-heading text-2xl font-bold text-green-950 mb-6">
          Create post
        </h1>

        <CommunityRules variant="inline" />

        <div className="mt-6">
          <PostEditor
            channels={editorChannels}
            defaultChannelSlug={defaultChannelSlug}
          />
        </div>
      </div>
    </div>
  );
}
