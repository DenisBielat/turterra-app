'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

interface CommentEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: number
}

const TOOLBAR_OPTIONS = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link'],
  ['clean'],
]

export function CommentEditor({ value, onChange, placeholder, minHeight = 80 }: CommentEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: TOOLBAR_OPTIONS,
    }),
    []
  )

  const formats = [
    'bold', 'italic', 'underline', 'strike',
    'list',
    'link',
  ]

  return (
    <div className="comment-editor-wrapper">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
      <style jsx global>{`
        .comment-editor-wrapper .ql-container {
          min-height: ${minHeight}px;
          font-size: 0.875rem;
          font-family: inherit;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border-color: rgb(229 231 235);
          background: white;
        }
        .comment-editor-wrapper .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border-color: rgb(229 231 235);
          background: rgb(249 250 251);
          padding: 4px 8px;
        }
        .comment-editor-wrapper .ql-toolbar button {
          width: 26px;
          height: 26px;
        }
        .comment-editor-wrapper .ql-editor {
          min-height: ${minHeight}px;
          background: white;
          padding: 8px 12px;
        }
        .comment-editor-wrapper .ql-editor.ql-blank::before {
          color: rgb(156 163 175);
          font-style: normal;
        }
        .comment-editor-wrapper:focus-within {
          border-radius: 0.5rem;
          box-shadow: 0 0 0 1px rgb(22 163 74);
        }
        .comment-editor-wrapper .ql-container.ql-snow:focus-within {
          border-color: rgb(22 163 74);
        }
        .comment-editor-wrapper:focus-within .ql-toolbar {
          border-color: rgb(22 163 74);
        }
        /* Tooltips */
        .comment-editor-wrapper .ql-toolbar button {
          position: relative;
        }
        .comment-editor-wrapper .ql-toolbar button::after {
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%);
          padding: 3px 6px;
          background: rgb(17 24 39);
          color: white;
          font-size: 10px;
          font-weight: 500;
          line-height: 1.2;
          white-space: nowrap;
          border-radius: 3px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s;
          z-index: 10;
        }
        .comment-editor-wrapper .ql-toolbar button:hover::after {
          opacity: 1;
        }
        .comment-editor-wrapper .ql-toolbar .ql-bold::after { content: 'Bold'; }
        .comment-editor-wrapper .ql-toolbar .ql-italic::after { content: 'Italic'; }
        .comment-editor-wrapper .ql-toolbar .ql-underline::after { content: 'Underline'; }
        .comment-editor-wrapper .ql-toolbar .ql-strike::after { content: 'Strikethrough'; }
        .comment-editor-wrapper .ql-toolbar .ql-list[value="ordered"]::after { content: 'Numbered List'; }
        .comment-editor-wrapper .ql-toolbar .ql-list[value="bullet"]::after { content: 'Bullet List'; }
        .comment-editor-wrapper .ql-toolbar .ql-link::after { content: 'Link'; }
        .comment-editor-wrapper .ql-toolbar .ql-clean::after { content: 'Clear Formatting'; }
      `}</style>
    </div>
  )
}
