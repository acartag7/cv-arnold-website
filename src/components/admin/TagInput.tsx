'use client'

/**
 * Tag Input Component
 *
 * A multi-value input for managing arrays of strings (technologies, skills, etc.).
 * Features:
 * - Add tags by pressing Enter or comma
 * - Remove tags by clicking X or backspace
 * - Optional autocomplete suggestions
 * - Keyboard navigation
 *
 * @module components/admin/TagInput
 */

import { useState, useRef, useCallback, KeyboardEvent } from 'react'
import { X, Plus, GripVertical } from 'lucide-react'

export interface TagInputProps {
  /** Current array of tags */
  value: string[]
  /** Callback when tags change */
  onChange: (tags: string[]) => void
  /** Placeholder text */
  placeholder?: string
  /** Optional suggestions for autocomplete */
  suggestions?: string[]
  /** Maximum number of tags allowed */
  maxTags?: number
  /** Whether the input is disabled */
  disabled?: boolean
  /** Error message to display */
  error?: string
  /** Label for the input */
  label?: string
  /** Additional CSS classes */
  className?: string
  /** Enable drag-and-drop reordering (default: true) */
  reorderable?: boolean
}

export function TagInput({
  value = [],
  onChange,
  placeholder = 'Add tag...',
  suggestions = [],
  maxTags,
  disabled = false,
  error,
  label,
  className = '',
  reorderable = true,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter suggestions based on input and existing tags
  const filteredSuggestions = suggestions.filter(
    suggestion =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(suggestion)
  )

  const addTag = useCallback(
    (tag: string) => {
      const trimmedTag = tag.trim()
      if (!trimmedTag) return
      if (value.includes(trimmedTag)) return
      if (maxTags && value.length >= maxTags) return

      onChange([...value, trimmedTag])
      setInputValue('')
      setShowSuggestions(false)
      setSelectedSuggestion(-1)
    },
    [value, onChange, maxTags]
  )

  const removeTag = useCallback(
    (tagToRemove: string) => {
      onChange(value.filter(tag => tag !== tagToRemove))
    },
    [value, onChange]
  )

  // Drag and drop handlers for reordering
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLSpanElement>, index: number) => {
      setDraggedIndex(index)
      e.dataTransfer.effectAllowed = 'move'
      // Set a transparent drag image - use requestAnimationFrame for safe cleanup
      const dragImage = document.createElement('div')
      dragImage.style.opacity = '0'
      dragImage.style.position = 'absolute'
      dragImage.style.pointerEvents = 'none'
      document.body.appendChild(dragImage)
      e.dataTransfer.setDragImage(dragImage, 0, 0)
      // Use requestAnimationFrame to ensure cleanup happens after browser processes drag
      requestAnimationFrame(() => {
        if (dragImage.parentNode) {
          dragImage.parentNode.removeChild(dragImage)
        }
      })
    },
    []
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLSpanElement>, index: number) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      if (draggedIndex !== null && draggedIndex !== index) {
        setDragOverIndex(index)
      }
    },
    [draggedIndex]
  )

  const handleDragEnd = useCallback(() => {
    if (
      draggedIndex !== null &&
      dragOverIndex !== null &&
      draggedIndex !== dragOverIndex
    ) {
      const newTags = [...value]
      const [draggedTag] = newTags.splice(draggedIndex, 1)
      if (draggedTag) {
        newTags.splice(dragOverIndex, 0, draggedTag)
        onChange(newTags)
      }
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [draggedIndex, dragOverIndex, value, onChange])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLSpanElement>) => {
    // Only reset if leaving the actual element, not child elements
    if (e.currentTarget === e.target) {
      setDragOverIndex(null)
    }
  }, [])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Add tag on Enter or comma
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()

      // If a suggestion is selected, use that
      if (selectedSuggestion >= 0 && filteredSuggestions[selectedSuggestion]) {
        addTag(filteredSuggestions[selectedSuggestion])
      } else if (inputValue) {
        addTag(inputValue)
      }
      return
    }

    // Remove last tag on backspace if input is empty
    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      const lastTag = value[value.length - 1]
      if (lastTag) {
        removeTag(lastTag)
      }
      return
    }

    // Navigate suggestions with arrow keys
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedSuggestion(prev =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      )
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedSuggestion(prev => (prev > 0 ? prev - 1 : -1))
      return
    }

    // Close suggestions on escape
    if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedSuggestion(-1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    // Don't allow commas in input (they're used as separators)
    if (newValue.includes(',')) {
      const parts = newValue.split(',')
      parts.forEach(part => addTag(part))
      return
    }
    setInputValue(newValue)
    setShowSuggestions(newValue.length > 0 && filteredSuggestions.length > 0)
    setSelectedSuggestion(-1)
  }

  const handleBlur = () => {
    // Small delay to allow clicking suggestions
    setTimeout(() => {
      setShowSuggestions(false)
      // Add any remaining input as a tag
      if (inputValue) {
        addTag(inputValue)
      }
    }, 150)
  }

  const canAddMore = !maxTags || value.length < maxTags

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}

      <div
        className={`
          relative flex flex-wrap gap-2 p-2
          bg-white dark:bg-slate-800
          border rounded-xl
          transition-colors
          ${error ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500
        `}
      >
        {/* Existing tags */}
        {value.map((tag, index) => (
          <span
            key={tag}
            draggable={reorderable && !disabled}
            onDragStart={e => reorderable && handleDragStart(e, index)}
            onDragOver={e => reorderable && handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onDragLeave={e => reorderable && handleDragLeave(e)}
            className={`
              inline-flex items-center gap-1 px-2.5 py-1
              bg-blue-50 dark:bg-blue-900/30
              text-blue-700 dark:text-blue-300
              text-sm font-medium rounded-lg
              transition-all duration-150
              ${reorderable && !disabled ? 'cursor-grab active:cursor-grabbing' : ''}
              ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
              ${dragOverIndex === index ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
            `}
          >
            {reorderable && !disabled && (
              <GripVertical
                size={12}
                className="text-blue-400 dark:text-blue-500 flex-shrink-0"
              />
            )}
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="
                  p-0.5 rounded hover:bg-blue-200 dark:hover:bg-blue-800
                  transition-colors focus:outline-none
                "
                aria-label={`Remove ${tag}`}
              >
                <X size={14} />
              </button>
            )}
          </span>
        ))}

        {/* Input field */}
        {canAddMore && !disabled && (
          <div className="relative flex-1 min-w-[120px]">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() =>
                setShowSuggestions(
                  inputValue.length > 0 && filteredSuggestions.length > 0
                )
              }
              onBlur={handleBlur}
              placeholder={value.length === 0 ? placeholder : 'Add more...'}
              disabled={disabled}
              className="
                w-full px-2 py-1 bg-transparent
                text-slate-900 dark:text-slate-100
                placeholder-slate-400 dark:placeholder-slate-500
                focus:outline-none
              "
            />

            {/* Suggestions dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div
                className="
                  absolute top-full left-0 right-0 mt-1 z-50
                  bg-white dark:bg-slate-800
                  border border-slate-200 dark:border-slate-600
                  rounded-lg shadow-lg
                  max-h-48 overflow-y-auto
                "
              >
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addTag(suggestion)}
                    className={`
                      w-full px-3 py-2 text-left text-sm
                      transition-colors
                      ${
                        index === selectedSuggestion
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }
                    `}
                  >
                    <Plus size={14} className="inline mr-2" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Max tags reached indicator */}
        {maxTags && value.length >= maxTags && (
          <span className="text-xs text-slate-500 dark:text-slate-400 py-1">
            Max {maxTags} tags
          </span>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}

export default TagInput
