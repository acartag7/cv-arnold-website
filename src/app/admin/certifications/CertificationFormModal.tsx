'use client'

/**
 * Certification Form Modal
 *
 * Modal form for adding or editing certifications.
 *
 * @module app/admin/certifications/CertificationFormModal
 */

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, DatePicker } from '@/components/admin'
import {
  Award,
  Building2,
  Calendar,
  FileText,
  Link as LinkIcon,
  Hash,
} from 'lucide-react'
import { CertificationStatus, type Certification } from '@/types/cv'

interface CertificationFormModalProps {
  isOpen: boolean
  certification: Certification | null
  onSave: (certification: Certification) => void
  onClose: () => void
  isSaving?: boolean
}

const formSchema = z
  .object({
    name: z.string().min(1, 'Certification name is required').max(200),
    issuer: z.string().min(1, 'Issuer is required').max(200),
    issuerUrl: z.string().url('Must be a valid URL').or(z.literal('')),
    issueDate: z.string().min(1, 'Issue date is required'),
    expirationDate: z.string().nullable(),
    noExpiration: z.boolean(),
    status: z.nativeEnum(CertificationStatus),
    credentialId: z.string().max(200),
    credentialUrl: z.string().url('Must be a valid URL').or(z.literal('')),
    description: z.string().max(1000),
  })
  .refine(
    data => {
      if (data.noExpiration || !data.expirationDate) return true
      return new Date(data.issueDate) <= new Date(data.expirationDate)
    },
    {
      message: 'Issue date must be before expiration date',
      path: ['expirationDate'],
    }
  )

type FormData = z.infer<typeof formSchema>

const statusOptions: {
  value: CertificationStatus
  label: string
  description: string
}[] = [
  {
    value: CertificationStatus.ACTIVE,
    label: 'Active',
    description: 'Currently valid',
  },
  {
    value: CertificationStatus.EXPIRED,
    label: 'Expired',
    description: 'No longer valid',
  },
  {
    value: CertificationStatus.IN_PROGRESS,
    label: 'In Progress',
    description: 'Currently pursuing',
  },
]

function generateId(): string {
  return `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function CertificationFormModal({
  isOpen,
  certification,
  onSave,
  onClose,
  isSaving,
}: CertificationFormModalProps) {
  const isEditing = !!certification

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      issuer: '',
      issuerUrl: '',
      issueDate: new Date().toISOString().split('T')[0] ?? '',
      expirationDate: null,
      noExpiration: false,
      status: CertificationStatus.ACTIVE,
      credentialId: '',
      credentialUrl: '',
      description: '',
    },
  })

  const noExpiration = watch('noExpiration')
  const selectedStatus = watch('status')

  useEffect(() => {
    if (isOpen) {
      if (certification) {
        reset({
          name: certification.name,
          issuer: certification.issuer,
          issuerUrl: certification.issuerUrl || '',
          issueDate: certification.issueDate,
          expirationDate: certification.expirationDate,
          noExpiration: certification.expirationDate === null,
          status: certification.status,
          credentialId: certification.credentialId || '',
          credentialUrl: certification.credentialUrl || '',
          description: certification.description || '',
        })
      } else {
        reset({
          name: '',
          issuer: '',
          issuerUrl: '',
          issueDate: new Date().toISOString().split('T')[0] ?? '',
          expirationDate: null,
          noExpiration: false,
          status: CertificationStatus.ACTIVE,
          credentialId: '',
          credentialUrl: '',
          description: '',
        })
      }
    }
  }, [isOpen, certification, reset])

  useEffect(() => {
    if (noExpiration) {
      setValue('expirationDate', null)
    }
  }, [noExpiration, setValue])

  const onSubmit = (data: FormData) => {
    const certData: Certification = {
      id: certification?.id || generateId(),
      name: data.name,
      issuer: data.issuer,
      issueDate: data.issueDate,
      expirationDate: data.noExpiration ? null : data.expirationDate,
      status: data.status,
      order: certification?.order || 0,
    }

    // Add optional fields
    if (data.issuerUrl) {
      certData.issuerUrl = data.issuerUrl
    }
    if (data.credentialId) {
      certData.credentialId = data.credentialId
    }
    if (data.credentialUrl) {
      certData.credentialUrl = data.credentialUrl
    }
    if (data.description) {
      certData.description = data.description
    }

    onSave(certData)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Certification' : 'Add Certification'}
      subtitle={
        isEditing
          ? `Editing ${certification.name}`
          : 'Add a new professional certification'
      }
      size="lg"
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
            form="certification-form"
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
              'Add Certification'
            )}
          </button>
        </>
      }
    >
      <form
        id="certification-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Name & Issuer Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <Award size={18} className="text-blue-500" />
            Certification Details
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Certification Name *
              </label>
              <input
                {...register('name')}
                className={`
                  w-full px-4 py-2.5 bg-white dark:bg-slate-800
                  border rounded-xl text-slate-900 dark:text-slate-100
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                  ${errors.name ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
                `}
                placeholder="AWS Solutions Architect"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Issuer */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <Building2 size={14} className="inline mr-1" />
                Issuer *
              </label>
              <input
                {...register('issuer')}
                className={`
                  w-full px-4 py-2.5 bg-white dark:bg-slate-800
                  border rounded-xl text-slate-900 dark:text-slate-100
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                  ${errors.issuer ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
                `}
                placeholder="Amazon Web Services"
              />
              {errors.issuer && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.issuer.message}
                </p>
              )}
            </div>
          </div>

          {/* Issuer URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <LinkIcon size={14} className="inline mr-1" />
              Issuer Website
            </label>
            <input
              {...register('issuerUrl')}
              type="url"
              className={`
                w-full px-4 py-2.5 bg-white dark:bg-slate-800
                border rounded-xl text-slate-900 dark:text-slate-100
                transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                ${errors.issuerUrl ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
              `}
              placeholder="https://aws.amazon.com"
            />
            {errors.issuerUrl && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.issuerUrl.message}
              </p>
            )}
          </div>
        </section>

        {/* Dates & Status Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <Calendar size={18} className="text-blue-500" />
            Validity
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Issue Date */}
            <Controller
              name="issueDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Issue Date *"
                  value={field.value}
                  onChange={field.onChange}
                  mode="month-year"
                  error={errors.issueDate?.message}
                />
              )}
            />

            {/* Expiration Date */}
            <Controller
              name="expirationDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Expiration Date"
                  value={field.value}
                  onChange={field.onChange}
                  mode="month-year"
                  allowNull
                  nullLabel="No expiration"
                  disabled={noExpiration}
                  error={errors.expirationDate?.message}
                />
              )}
            />
          </div>

          {/* No expiration checkbox */}
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register('noExpiration')}
              className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/30"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              This certification does not expire
            </span>
          </label>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Status *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {statusOptions.map(option => (
                <label
                  key={option.value}
                  className={`
                    relative flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer
                    transition-all text-center
                    ${
                      selectedStatus === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }
                  `}
                >
                  <input
                    type="radio"
                    {...register('status')}
                    value={option.value}
                    className="sr-only"
                  />
                  <span
                    className={`
                      font-medium text-sm
                      ${
                        selectedStatus === option.value
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-slate-700 dark:text-slate-300'
                      }
                    `}
                  >
                    {option.label}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {option.description}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Credential Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <Hash size={18} className="text-blue-500" />
            Credential Information
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Credential ID */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Credential ID
              </label>
              <input
                {...register('credentialId')}
                className="
                  w-full px-4 py-2.5 bg-white dark:bg-slate-800
                  border border-slate-200 dark:border-slate-600 rounded-xl
                  text-slate-900 dark:text-slate-100
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                "
                placeholder="ABC123XYZ"
              />
            </div>

            {/* Credential URL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Verification URL
              </label>
              <input
                {...register('credentialUrl')}
                type="url"
                className={`
                  w-full px-4 py-2.5 bg-white dark:bg-slate-800
                  border rounded-xl text-slate-900 dark:text-slate-100
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                  ${errors.credentialUrl ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
                `}
                placeholder="https://verify.example.com/..."
              />
              {errors.credentialUrl && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.credentialUrl.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Description Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <FileText size={18} className="text-blue-500" />
            Description
          </div>

          <div>
            <textarea
              {...register('description')}
              rows={3}
              className={`
                w-full px-4 py-2.5 bg-white dark:bg-slate-800
                border rounded-xl text-slate-900 dark:text-slate-100
                transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                resize-y min-h-[80px]
                ${errors.description ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
              `}
              placeholder="Brief description of the certification and skills covered..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>
        </section>
      </form>
    </Modal>
  )
}
