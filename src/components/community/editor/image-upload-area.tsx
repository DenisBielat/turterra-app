'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X } from 'lucide-react'
import { uploadCommunityImage } from '@/app/(main)/community/actions'

interface ImageUploadAreaProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export function ImageUploadArea({
  images,
  onImagesChange,
  maxImages = 4,
}: ImageUploadAreaProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed')
      return null
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB')
      return null
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const url = await uploadCommunityImage(formData)
      return url
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Image upload failed. Please try again.')
      return null
    }
  }, [])

  async function handleFiles(files: FileList) {
    if (images.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)
    const remaining = maxImages - images.length
    const filesToUpload = Array.from(files).slice(0, remaining)

    const uploaded: string[] = []
    for (const file of filesToUpload) {
      const url = await uploadFile(file)
      if (url) uploaded.push(url)
    }

    if (uploaded.length > 0) {
      onImagesChange([...images, ...uploaded])
    }
    setUploading(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  function removeImage(index: number) {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  const remaining = maxImages - images.length

  return (
    <div className="space-y-3">
      {/* Counter */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">Images</p>
        <p className="text-xs text-gray-500">
          {images.length} / {maxImages} images
        </p>
      </div>

      {/* Upload area */}
      {remaining > 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-green-600 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />

          {uploading ? (
            <p className="text-sm text-gray-500">Uploading...</p>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-6 h-6 text-gray-400" />
              <p className="text-sm text-gray-500">
                Drag and drop or{' '}
                <span className="text-green-700 font-medium">upload media</span>
              </p>
              <p className="text-xs text-gray-400">
                {remaining} image{remaining !== 1 ? 's' : ''} remaining
              </p>
            </div>
          )}
        </div>
      )}

      {/* Image previews */}
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((url, index) => (
            <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded-full hover:bg-black/80"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
