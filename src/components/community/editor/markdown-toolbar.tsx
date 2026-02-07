'use client'

import {
  Bold, Italic, Strikethrough, Link as LinkIcon,
  List, ListOrdered, Quote, Code, Minus,
} from 'lucide-react'

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  onUpdate: (newValue: string) => void
}

interface ToolbarAction {
  icon: typeof Bold
  label: string
  action: (textarea: HTMLTextAreaElement) => { text: string; cursorOffset: number }
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  {
    icon: Bold,
    label: 'Bold',
    action: (ta) => wrapSelection(ta, '**', '**'),
  },
  {
    icon: Italic,
    label: 'Italic',
    action: (ta) => wrapSelection(ta, '*', '*'),
  },
  {
    icon: Strikethrough,
    label: 'Strikethrough',
    action: (ta) => wrapSelection(ta, '~~', '~~'),
  },
  {
    icon: LinkIcon,
    label: 'Link',
    action: (ta) => {
      const selected = ta.value.substring(ta.selectionStart, ta.selectionEnd)
      if (selected) {
        return insertAtCursor(ta, `[${selected}](url)`)
      }
      return insertAtCursor(ta, '[link text](url)')
    },
  },
  {
    icon: List,
    label: 'Bullet List',
    action: (ta) => prefixLine(ta, '- '),
  },
  {
    icon: ListOrdered,
    label: 'Numbered List',
    action: (ta) => prefixLine(ta, '1. '),
  },
  {
    icon: Quote,
    label: 'Quote',
    action: (ta) => prefixLine(ta, '> '),
  },
  {
    icon: Code,
    label: 'Inline Code',
    action: (ta) => wrapSelection(ta, '`', '`'),
  },
  {
    icon: Minus,
    label: 'Horizontal Rule',
    action: (ta) => insertAtCursor(ta, '\n---\n'),
  },
]

// Indices after which to insert a visual separator in the toolbar
const SEPARATOR_AFTER = [2, 3]

export function MarkdownToolbar({ textareaRef, onUpdate }: MarkdownToolbarProps) {
  function handleAction(action: ToolbarAction['action']) {
    const textarea = textareaRef.current
    if (!textarea) return

    const result = action(textarea)
    onUpdate(result.text)

    // Restore focus and cursor position
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(result.cursorOffset, result.cursorOffset)
    })
  }

  return (
    <div className="flex items-center gap-0.5 p-2 border-b bg-gray-50 flex-wrap">
      {TOOLBAR_ACTIONS.map((tool, index) => (
        <span key={tool.label} className="contents">
          <button
            type="button"
            onClick={() => handleAction(tool.action)}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
            title={tool.label}
          >
            <tool.icon className="w-4 h-4" />
          </button>
          {SEPARATOR_AFTER.includes(index) && (
            <div className="w-px h-5 bg-gray-200 mx-1" />
          )}
        </span>
      ))}
    </div>
  )
}

// ---------- Helper Functions ----------

function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string
): { text: string; cursorOffset: number } {
  const { selectionStart, selectionEnd, value } = textarea
  const selected = value.substring(selectionStart, selectionEnd)

  const newText =
    value.substring(0, selectionStart) +
    before + (selected || 'text') + after +
    value.substring(selectionEnd)

  const cursorOffset = selected
    ? selectionEnd + before.length + after.length
    : selectionStart + before.length + 'text'.length

  return { text: newText, cursorOffset }
}

function insertAtCursor(
  textarea: HTMLTextAreaElement,
  insertion: string
): { text: string; cursorOffset: number } {
  const { selectionStart, selectionEnd, value } = textarea

  const newText =
    value.substring(0, selectionStart) +
    insertion +
    value.substring(selectionEnd)

  return { text: newText, cursorOffset: selectionStart + insertion.length }
}

function prefixLine(
  textarea: HTMLTextAreaElement,
  prefix: string
): { text: string; cursorOffset: number } {
  const { selectionStart, value } = textarea

  // Find the start of the current line
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1

  const newText =
    value.substring(0, lineStart) +
    prefix +
    value.substring(lineStart)

  return { text: newText, cursorOffset: selectionStart + prefix.length }
}
