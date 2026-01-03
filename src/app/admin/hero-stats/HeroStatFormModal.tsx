'use client'

/**
 * Hero Stat Form Modal
 *
 * Modal form for adding or editing hero statistics.
 *
 * @module app/admin/hero-stats/HeroStatFormModal
 */

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/admin'
import {
  BarChart3,
  Terminal,
  Shield,
  Cloud,
  Server,
  Code,
  Award,
  Users,
  Briefcase,
} from 'lucide-react'
import type { HeroStat } from '@/types/cv'
import { generateId } from '@/lib/format-utils'

interface HeroStatFormModalProps {
  isOpen: boolean
  stat: HeroStat | null
  onSave: (stat: HeroStat) => void
  onClose: () => void
  isSaving?: boolean
}

const iconOptions: {
  value: HeroStat['icon']
  label: string
  icon: typeof Terminal
}[] = [
  { value: 'terminal', label: 'Terminal', icon: Terminal },
  { value: 'shield', label: 'Shield', icon: Shield },
  { value: 'cloud', label: 'Cloud', icon: Cloud },
  { value: 'server', label: 'Server', icon: Server },
  { value: 'code', label: 'Code', icon: Code },
  { value: 'award', label: 'Award', icon: Award },
  { value: 'users', label: 'Users', icon: Users },
  { value: 'briefcase', label: 'Briefcase', icon: Briefcase },
]

const formSchema = z.object({
  value: z.string().min(1, 'Value is required').max(20),
  label: z.string().min(1, 'Label is required').max(50),
  icon: z.enum([
    'terminal',
    'shield',
    'cloud',
    'server',
    'code',
    'award',
    'users',
    'briefcase',
  ]),
})

type FormData = z.infer<typeof formSchema>

export function HeroStatFormModal({
  isOpen,
  stat,
  onSave,
  onClose,
  isSaving = false,
}: HeroStatFormModalProps) {
  const isEditing = !!stat

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: '',
      label: '',
      icon: 'terminal',
    },
  })

  const selectedIcon = watch('icon')

  useEffect(() => {
    if (isOpen) {
      if (stat) {
        reset({
          value: stat.value,
          label: stat.label,
          icon: stat.icon,
        })
      } else {
        reset({
          value: '',
          label: '',
          icon: 'terminal',
        })
      }
    }
  }, [isOpen, stat, reset])

  const onSubmit = (data: FormData) => {
    const statData: HeroStat = {
      id: stat?.id || generateId('stat'),
      value: data.value,
      label: data.label,
      icon: data.icon,
      order: stat?.order ?? 0,
    }

    onSave(statData)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Stat' : 'Add Stat'}
      subtitle={
        isEditing ? `Editing ${stat.label}` : 'Add a new hero statistic'
      }
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="hero-stat-form"
            disabled={isSaving}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              'Save Changes'
            ) : (
              'Add Stat'
            )}
          </button>
        </>
      }
    >
      <form
        id="hero-stat-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Value & Label Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <BarChart3 size={18} className="text-blue-500" />
            Stat Details
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Value */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Value *
              </label>
              <input
                {...register('value')}
                className={`
                  w-full px-4 py-2.5 bg-white dark:bg-slate-800
                  border rounded-xl text-slate-900 dark:text-slate-100 text-xl font-bold
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                  ${errors.value ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
                `}
                placeholder="8+"
              />
              {errors.value && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.value.message}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                The displayed value (e.g., &quot;8+&quot;, &quot;50+&quot;,
                &quot;100%&quot;)
              </p>
            </div>

            {/* Label */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Label *
              </label>
              <input
                {...register('label')}
                className={`
                  w-full px-4 py-2.5 bg-white dark:bg-slate-800
                  border rounded-xl text-slate-900 dark:text-slate-100
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                  ${errors.label ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
                `}
                placeholder="Years Experience"
              />
              {errors.label && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.label.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Icon Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            Icon
          </div>

          <div className="grid grid-cols-4 gap-2">
            {iconOptions.map(option => {
              const IconComponent = option.icon
              return (
                <label
                  key={option.value}
                  className={`
                    flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer
                    transition-all text-center
                    ${
                      selectedIcon === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }
                  `}
                >
                  <input
                    type="radio"
                    {...register('icon')}
                    value={option.value}
                    className="sr-only"
                  />
                  <IconComponent
                    size={24}
                    className={
                      selectedIcon === option.value
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }
                  />
                  <span
                    className={`
                      text-xs font-medium
                      ${
                        selectedIcon === option.value
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-slate-600 dark:text-slate-400'
                      }
                    `}
                  >
                    {option.label}
                  </span>
                </label>
              )
            })}
          </div>
        </section>

        {/* Preview Section */}
        <section className="space-y-4">
          <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">
            Preview
          </div>

          <div className="p-4 bg-slate-900 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-900/50 rounded-lg">
                {(() => {
                  const IconPreview =
                    iconOptions.find(o => o.value === selectedIcon)?.icon ||
                    Terminal
                  return <IconPreview size={20} className="text-emerald-400" />
                })()}
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {watch('value') || '0'}
                </div>
                <div className="text-sm text-slate-400">
                  {watch('label') || 'Label'}
                </div>
              </div>
            </div>
          </div>
        </section>
      </form>
    </Modal>
  )
}
