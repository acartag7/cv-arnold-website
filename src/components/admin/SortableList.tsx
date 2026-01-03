'use client'

/**
 * Sortable List Component
 *
 * A reusable wrapper for drag-and-drop sortable lists using @dnd-kit.
 * Provides:
 * - Keyboard and pointer sensors
 * - Smooth animations during drag
 * - Collision detection
 * - Accessibility support
 *
 * @module components/admin/SortableList
 */

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

export interface SortableListProps<T> {
  /** Array of items to render */
  items: T[]
  /** Callback when items are reordered */
  onReorder: (items: T[]) => void
  /** Function to extract unique key from item */
  keyExtractor: (item: T) => string
  /** Function to render each item */
  renderItem: (item: T, index: number) => React.ReactNode
  /** Optional class for the container */
  className?: string
  /** Whether drag handles are shown */
  showDragHandle?: boolean
}

export interface SortableItemProps {
  /** Unique identifier for the item */
  id: string
  /** Item content to render */
  children: React.ReactNode
  /** Whether to show drag handle */
  showDragHandle?: boolean
  /** Optional class for the item wrapper */
  className?: string
}

/**
 * Individual sortable item wrapper
 */
export function SortableItem({
  id,
  children,
  showDragHandle = true,
  className = '',
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative flex items-start gap-3
        ${isDragging ? 'opacity-50 shadow-lg' : ''}
        ${className}
      `}
    >
      {showDragHandle && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="
            mt-3 p-1.5 rounded-lg cursor-grab active:cursor-grabbing
            text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
            hover:bg-slate-100 dark:hover:bg-slate-700
            focus:outline-none focus:ring-2 focus:ring-blue-500/30
            transition-colors
          "
          aria-label="Drag to reorder"
        >
          <GripVertical size={18} />
        </button>
      )}
      <div className="flex-1">{children}</div>
    </div>
  )
}

/**
 * Main sortable list component
 */
export function SortableList<T>({
  items,
  onReorder,
  keyExtractor,
  renderItem,
  className = '',
  showDragHandle = true,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum drag distance before activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => keyExtractor(item) === active.id)
      const newIndex = items.findIndex(item => keyExtractor(item) === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex)
        onReorder(newItems)
      }
    }
  }

  const itemIds = items.map(keyExtractor)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className={`space-y-3 ${className}`}>
          {items.map((item, index) => (
            <SortableItem
              key={keyExtractor(item)}
              id={keyExtractor(item)}
              showDragHandle={showDragHandle}
            >
              {renderItem(item, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

export default SortableList
