'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, Trash2, Pencil, Send } from 'lucide-react'
import { getRelativeTime } from '@/lib/community/utils'
import { deletePost, publishDraft } from '@/app/(main)/community/actions'

interface PostItem {
  id: number
  title: string
  created_at: string
  is_draft: boolean
  score?: number
  comment_count?: number
  channel: { slug: string; name: string } | null
}

interface UserPostsProps {
  posts: PostItem[]
  drafts: PostItem[]
  isOwnProfile: boolean
}

export function UserPosts({ posts, drafts, isOwnProfile }: UserPostsProps) {
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published')
  const [deleting, setDeleting] = useState<number | null>(null)
  const [publishing, setPublishing] = useState<number | null>(null)
  const router = useRouter()

  async function handleDelete(postId: number) {
    if (!confirm('Are you sure you want to delete this post?')) return
    setDeleting(postId)
    try {
      await deletePost(postId)
      router.refresh()
    } catch (err) {
      console.error('Failed to delete post:', err)
      alert('Failed to delete post. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  async function handlePublish(postId: number) {
    setPublishing(postId)
    try {
      await publishDraft(postId)
      router.refresh()
    } catch (err) {
      console.error('Failed to publish draft:', err)
      alert('Failed to publish draft. Please try again.')
    } finally {
      setPublishing(null)
    }
  }

  const currentItems = activeTab === 'published' ? posts : drafts

  return (
    <section id="my-posts" className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-green-950 font-heading">
          {isOwnProfile ? 'My Posts' : 'Posts'}
        </h3>
        {isOwnProfile && (
          <Link
            href="/community/new"
            className="text-sm text-green-700 hover:text-green-800 font-medium"
          >
            + New Post
          </Link>
        )}
      </div>

      {/* Tabs (only show drafts tab for own profile) */}
      {isOwnProfile && (
        <div className="flex gap-1 mb-4 border-b border-gray-100">
          <button
            onClick={() => setActiveTab('published')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'published'
                ? 'border-green-700 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Published ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'drafts'
                ? 'border-green-700 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Drafts ({drafts.length})
          </button>
        </div>
      )}

      {/* Post list */}
      {currentItems.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 text-sm">
            {activeTab === 'published'
              ? 'No posts yet'
              : 'No drafts saved'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentItems.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <Link
                  href={post.is_draft ? `/community/posts/${post.id}/edit` : `/community/posts/${post.id}`}
                  className="font-medium text-green-950 hover:text-green-700 transition-colors text-sm block truncate"
                >
                  {post.title}
                </Link>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  {post.channel && (
                    <>
                      <span className="text-green-700">{(post.channel as { name: string }).name}</span>
                      <span>&middot;</span>
                    </>
                  )}
                  <span>{getRelativeTime(post.created_at)}</span>
                  {!post.is_draft && post.score !== undefined && (
                    <>
                      <span>&middot;</span>
                      <span>{post.score} points</span>
                      <span>&middot;</span>
                      <span>{post.comment_count} comments</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions (own profile only) */}
              {isOwnProfile && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3">
                  {post.is_draft && (
                    <button
                      onClick={() => handlePublish(post.id)}
                      disabled={publishing === post.id}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="Publish"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                  <Link
                    href={`/community/posts/${post.id}/edit`}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deleting === post.id}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
