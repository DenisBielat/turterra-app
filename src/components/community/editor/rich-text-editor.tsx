'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link'],
  ['clean'],
]

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: TOOLBAR_OPTIONS,
    }),
    []
  )

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'blockquote',
    'list',
    'link',
  ]

  return (
    <div className="quill-editor-wrapper">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
      <style jsx global>{`
        .quill-editor-wrapper .ql-container {
          min-height: 200px;
          font-size: 0.875rem;
          font-family: inherit;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border-color: rgb(229 231 235);
          background: white;
        }
        .quill-editor-wrapper .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border-color: rgb(229 231 235);
          background: rgb(249 250 251);
        }
        .quill-editor-wrapper .ql-editor {
          min-height: 200px;
        }
        .quill-editor-wrapper .ql-editor.ql-blank::before {
          color: rgb(156 163 175);
          font-style: normal;
        }
        .quill-editor-wrapper .ql-container.ql-snow:focus-within {
          border-color: rgb(22 163 74);
        }
        .quill-editor-wrapper:focus-within .ql-toolbar {
          border-color: rgb(22 163 74);
        }
        /* Tooltips for toolbar buttons */
        .quill-editor-wrapper .ql-toolbar button,
        .quill-editor-wrapper .ql-toolbar .ql-picker-label {
          position: relative;
        }
        .quill-editor-wrapper .ql-toolbar button::after,
        .quill-editor-wrapper .ql-toolbar .ql-picker-label::after {
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%);
          padding: 4px 8px;
          background: rgb(17 24 39);
          color: white;
          font-size: 11px;
          font-weight: 500;
          line-height: 1.2;
          white-space: nowrap;
          border-radius: 4px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s;
          z-index: 10;
        }
        .quill-editor-wrapper .ql-toolbar button:hover::after,
        .quill-editor-wrapper .ql-toolbar .ql-picker-label:hover::after {
          opacity: 1;
        }
        .quill-editor-wrapper .ql-toolbar .ql-bold::after { content: 'Bold'; }
        .quill-editor-wrapper .ql-toolbar .ql-italic::after { content: 'Italic'; }
        .quill-editor-wrapper .ql-toolbar .ql-underline::after { content: 'Underline'; }
        .quill-editor-wrapper .ql-toolbar .ql-strike::after { content: 'Strikethrough'; }
        .quill-editor-wrapper .ql-toolbar .ql-blockquote::after { content: 'Quote'; }
        .quill-editor-wrapper .ql-toolbar .ql-list[value="ordered"]::after { content: 'Numbered List'; }
        .quill-editor-wrapper .ql-toolbar .ql-list[value="bullet"]::after { content: 'Bullet List'; }
        .quill-editor-wrapper .ql-toolbar .ql-link::after { content: 'Link'; }
        .quill-editor-wrapper .ql-toolbar .ql-clean::after { content: 'Clear Formatting'; }
        .quill-editor-wrapper .ql-toolbar .ql-picker-label::after { content: 'Heading'; }
      `}</style>
    </div>
  )
}
