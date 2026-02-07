'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MarkdownToolbar } from './markdown-toolbar'
import { ImageUploadArea } from './image-upload-area'
import { createPost } from '@/app/(main)/community/actions'
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
}

export function PostEditor({ channels, defaultChannelSlug }: PostEditorProps) {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const defaultChannel = channels.find(c => c.slug === defaultChannelSlug) ?? channels[0]

  const [channelId, setChannelId] = useState<number>(defaultChannel?.id)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Group channels by category for the dropdown
  const groupedChannels = channels.reduce((acc, ch) => {
    if (!acc[ch.category]) acc[ch.category] = []
    acc[ch.category].push(ch)
    return acc
  }, {} as Record<string, typeof channels>)

  async function handleSubmit(isDraft = false) {
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const postId = await createPost({
        title: title.trim(),
        body: body.trim(),
        channelId,
        imageUrls: images,
        isDraft,
      })

      if (isDraft) {
        router.push('/community')
      } else {
        router.push(`/community/posts/${postId}`)
      }
    } catch (err) {
      setError('Failed to create post. Please try again.')
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
        <SelectTrigger className="w-fit rounded-full bg-white text-sm font-medium">
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
          className="w-full border rounded-lg px-4 py-3 bg-white text-lg focus:outline-none focus:ring-2 focus:ring-green-600/20"
          maxLength={300}
        />
        <p className="text-xs text-gray-500 text-right mt-1">
          {title.length}/300
        </p>
      </div>

      {/* Image upload */}
      <ImageUploadArea images={images} onImagesChange={setImages} />

      {/* Body editor with toolbar */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <MarkdownToolbar textareaRef={textareaRef} onUpdate={setBody} />
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Body text (optional)"
          className="w-full min-h-[200px] p-4 bg-transparent resize-y focus:outline-none text-sm"
        />
      </div>

      {/* Submit buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => handleSubmit(true)}
          disabled={loading || !title.trim()}
          className="px-5 py-2 rounded-full border text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={loading || !title.trim()}
          className="px-5 py-2 rounded-full bg-green-700 text-white text-sm font-medium hover:bg-green-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  )
}
