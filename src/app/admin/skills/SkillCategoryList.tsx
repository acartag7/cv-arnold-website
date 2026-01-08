'use client'

/**
 * Skill Category List Component
 *
 * Displays sortable list of skill categories, each containing
 * a list of skills with edit/delete actions.
 *
 * @module app/admin/skills/SkillCategoryList
 */

import { SortableList } from '@/components/admin'
import {
  Edit2,
  Trash2,
  Plus,
  Star,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from 'lucide-react'
import { useState, useCallback } from 'react'
import type { SkillCategory, Skill } from '@/types/cv'

interface SkillCategoryListProps {
  categories: SkillCategory[]
  onEditCategory: (category: SkillCategory) => void
  onDeleteCategory: (category: SkillCategory) => void
  onAddSkill: (categoryId: string) => void
  onEditSkill: (skill: Skill, categoryId: string) => void
  onDeleteSkill: (skill: Skill, categoryId: string) => void
  onReorder: (categories: SkillCategory[]) => void
  onReorderSkills: (categoryId: string, skills: Skill[]) => void
  isSaving?: boolean
}

// Skill level labels and colors
const skillLevelConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  beginner: {
    label: 'Beginner',
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-700',
  },
  intermediate: {
    label: 'Intermediate',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  advanced: {
    label: 'Advanced',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
  },
  expert: {
    label: 'Expert',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
  },
}

function SkillBadge({
  skill,
  index,
  onEdit,
  onDelete,
  isSaving = false,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragLeave,
}: {
  skill: Skill
  index: number
  onEdit: () => void
  onDelete: () => void
  isSaving?: boolean
  isDragging?: boolean
  isDragOver?: boolean
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, index: number) => void
  onDragOver?: (e: React.DragEvent<HTMLDivElement>, index: number) => void
  onDragEnd?: () => void
  onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void
}) {
  const levelConfig = skillLevelConfig[skill.level]
  const level = levelConfig ??
    skillLevelConfig.beginner ?? {
      label: 'Beginner',
      color: 'text-slate-600',
      bg: 'bg-slate-100',
    }

  return (
    <div
      draggable={!isSaving}
      onDragStart={e => onDragStart?.(e, index)}
      onDragOver={e => onDragOver?.(e, index)}
      onDragEnd={onDragEnd}
      onDragLeave={e => onDragLeave?.(e)}
      className={`
        group relative inline-flex items-center gap-1.5 px-3 py-1.5
        ${level.bg} ${level.color}
        rounded-lg text-sm font-medium
        transition-all duration-150
        ${!isSaving ? 'cursor-grab active:cursor-grabbing' : ''}
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${isDragOver ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
      `}
    >
      {!isSaving && (
        <GripVertical
          size={12}
          className="text-current opacity-40 flex-shrink-0"
        />
      )}
      {skill.featured && <Star size={12} className="text-amber-500" />}
      <span>{skill.name}</span>

      {/* Hover actions */}
      <div
        className={`
          absolute -top-1 -right-1 flex gap-0.5 opacity-0 group-hover:opacity-100
          transition-opacity
          ${isSaving ? 'pointer-events-none' : ''}
        `}
      >
        <button
          onClick={e => {
            e.stopPropagation()
            onEdit()
          }}
          disabled={isSaving}
          className="p-1 bg-white dark:bg-slate-700 rounded shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-500 hover:text-blue-600"
          aria-label={`Edit ${skill.name}`}
        >
          <Edit2 size={12} />
        </button>
        <button
          onClick={e => {
            e.stopPropagation()
            onDelete()
          }}
          disabled={isSaving}
          className="p-1 bg-white dark:bg-slate-700 rounded shadow-sm hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-600"
          aria-label={`Delete ${skill.name}`}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

function SkillCategoryCard({
  category,
  onEditCategory,
  onDeleteCategory,
  onAddSkill,
  onEditSkill,
  onDeleteSkill,
  onReorderSkills,
  isSaving = false,
}: {
  category: SkillCategory
  onEditCategory: () => void
  onDeleteCategory: () => void
  onAddSkill: () => void
  onEditSkill: (skill: Skill) => void
  onDeleteSkill: (skill: Skill) => void
  onReorderSkills: (skills: Skill[]) => void
  isSaving?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
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
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
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
      const newSkills = [...category.skills]
      const [draggedSkill] = newSkills.splice(draggedIndex, 1)
      if (draggedSkill) {
        newSkills.splice(dragOverIndex, 0, draggedSkill)
        onReorderSkills(newSkills)
      }
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [draggedIndex, dragOverIndex, category.skills, onReorderSkills])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    // Only reset if leaving the actual element, not child elements
    if (e.currentTarget === e.target) {
      setDragOverIndex(null)
    }
  }, [])

  return (
    <div
      className={`
        bg-white dark:bg-slate-800
        border border-slate-200 dark:border-slate-700
        rounded-xl overflow-hidden
        transition-all
        ${isSaving ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      {/* Category header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-left flex-1"
        >
          {isExpanded ? (
            <ChevronUp size={18} className="text-slate-400" />
          ) : (
            <ChevronDown size={18} className="text-slate-400" />
          )}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {category.description}
              </p>
            )}
          </div>
          <span className="ml-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-full">
            {category.skills.length} skill
            {category.skills.length !== 1 ? 's' : ''}
          </span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={onAddSkill}
            disabled={isSaving}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            aria-label={`Add skill to ${category.name}`}
          >
            <Plus size={18} />
          </button>
          <button
            onClick={onEditCategory}
            disabled={isSaving}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            aria-label={`Edit ${category.name}`}
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={onDeleteCategory}
            disabled={isSaving}
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            aria-label={`Delete ${category.name}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Skills */}
      {isExpanded && (
        <div className="p-4">
          {category.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {category.skills.map((skill, index) => (
                <SkillBadge
                  key={skill.name}
                  skill={skill}
                  index={index}
                  onEdit={() => onEditSkill(skill)}
                  onDelete={() => onDeleteSkill(skill)}
                  isSaving={isSaving}
                  isDragging={draggedIndex === index}
                  isDragOver={dragOverIndex === index}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  onDragLeave={handleDragLeave}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              No skills added yet.{' '}
              <button
                onClick={onAddSkill}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Add one
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export function SkillCategoryList({
  categories,
  onEditCategory,
  onDeleteCategory,
  onAddSkill,
  onEditSkill,
  onDeleteSkill,
  onReorder,
  onReorderSkills,
  isSaving = false,
}: SkillCategoryListProps) {
  return (
    <SortableList
      items={categories}
      keyExtractor={cat => cat.id}
      onReorder={onReorder}
      renderItem={category => (
        <SkillCategoryCard
          category={category}
          onEditCategory={() => onEditCategory(category)}
          onDeleteCategory={() => onDeleteCategory(category)}
          onAddSkill={() => onAddSkill(category.id)}
          onEditSkill={skill => onEditSkill(skill, category.id)}
          onDeleteSkill={skill => onDeleteSkill(skill, category.id)}
          onReorderSkills={skills => onReorderSkills(category.id, skills)}
          isSaving={isSaving}
        />
      )}
    />
  )
}
