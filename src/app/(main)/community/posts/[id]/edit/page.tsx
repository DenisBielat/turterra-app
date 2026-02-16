import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getPostById, getChannels } from '@/lib/queries/community';
import { PostEditor } from '@/components/community/editor/post-editor';

export const metadata = {
  title: 'Edit Post | Turterra Community',
};

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = parseInt(id, 10);
  if (isNaN(postId)) return notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const post = await getPostById(postId);
  if (!post) return notFound();

  const author = post.author as { id: string };
  if (author.id !== user.id) return notFound();

  const channels = await getChannels();

  // Get user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const editorChannels = (channels ?? []).map((ch) => ({
    id: ch.id as number,
    slug: ch.slug as string,
    name: ch.name as string,
    category: ch.category as string,
  }));

  return (
    <div className="min-h-screen bg-warm">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link
          href={`/community/posts/${postId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Post
        </Link>

        <h1 className="font-heading text-2xl font-bold text-green-950 mb-6">
          Edit post
        </h1>

        <div className="flex gap-8">
          <div className="flex-1 min-w-0">
            <PostEditor
              channels={editorChannels}
              userRole={profile?.role ?? 'user'}
              existingPost={{
                id: post.id,
                title: post.title,
                body: post.body ?? null,
                channel_id: post.channel_id,
                image_urls: (post.image_urls as string[]) ?? [],
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
