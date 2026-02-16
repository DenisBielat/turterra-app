'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RichTextEditor } from './rich-text-editor'
import { ImageUploadArea } from './image-upload-area'
import { createPost, updatePost } from '@/app/(main)/community/actions'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PostEditorProps {
  channels: Array<{ id: number; slug: string; name: string; category: string }>
  defaultChannelSlug?: string
  userRole?: string
  existingPost?: {
    id: number
    title: string
    body: string | null
    channel_id: number
    image_urls: string[]
  }
}

export function PostEditor({ channels, defaultChannelSlug, userRole = 'user', existingPost }: PostEditorProps) {
  const router = useRouter()
  const isEditing = !!existingPost

  // Filter out restricted channels for regular users
  const restrictedSlugs = ['announcements', 'roadmaps']
  const availableChannels = channels.filter(ch => {
    if (userRole === 'admin' || userRole === 'moderator') return true
    return !restrictedSlugs.includes(ch.slug)
  })

  const defaultChannel = isEditing
    ? channels.find(c => c.id === existingPost.channel_id)
    : channels.find(c => c.slug === defaultChannelSlug) ?? availableChannels[0]

  const [channelId, setChannelId] = useState<number>(defaultChannel?.id ?? availableChannels[0]?.id)
  const [title, setTitle] = useState(existingPost?.title ?? '')
  const [body, setBody] = useState(existingPost?.body ?? '')
  const [images, setImages] = useState<string[]>(existingPost?.image_urls ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Group channels by category for the dropdown
  const groupedChannels = availableChannels.reduce((acc, ch) => {
    if (!acc[ch.category]) acc[ch.category] = []
    acc[ch.category].push(ch)
    return acc
  }, {} as Record<string, typeof availableChannels>)

  async function handleSubmit(isDraft = false) {
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (isEditing) {
        await updatePost({
          postId: existingPost.id,
          title: title.trim(),
          body: body,
          channelId,
          imageUrls: images,
        })
        router.push(`/community/posts/${existingPost.id}`)
      } else {
        const postId = await createPost({
          title: title.trim(),
          body: body,
          channelId,
          imageUrls: images,
          isDraft,
        })

        if (isDraft) {
          router.push('/community')
        } else {
          router.push(`/community/posts/${postId}`)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {/* Channel selector */}
      <Select
        value={String(channelId)}
        onValueChange={(val) => setChannelId(Number(val))}
      >
        <SelectTrigger className="w-fit rounded-full bg-white text-sm font-medium gap-3 pr-4">
          <SelectValue placeholder="Select a channel" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(groupedChannels).map(([category, chs]) => (
            <SelectGroup key={category}>
              <SelectLabel className="text-xs font-bold text-green-800 uppercase tracking-wide border-b border-gray-100 pb-1 mb-1">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectLabel>
              {chs.map(ch => (
                <SelectItem key={ch.id} value={String(ch.id)}>
                  {ch.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>

      {/* Title */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title*"
          className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-white text-lg focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600"
          maxLength={300}
        />
        <p className="text-xs text-gray-500 text-right mt-1">
          {title.length}/300
        </p>
      </div>

      {/* Image upload */}
      <ImageUploadArea images={images} onImagesChange={setImages} />

      {/* Rich text editor */}
      <RichTextEditor
        value={body}
        onChange={setBody}
        placeholder="Body text (optional)"
      />

      {/* Submit buttons */}
      <div className="flex items-center justify-end gap-3">
        {!isEditing && (
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={loading || !title.trim()}
            className="px-5 py-2 rounded-full border text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
        )}
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={loading || !title.trim()}
          className="px-5 py-2 rounded-full bg-green-700 text-white text-sm font-medium hover:bg-green-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Post'}
        </button>
      </div>
    </div>
  )
}
