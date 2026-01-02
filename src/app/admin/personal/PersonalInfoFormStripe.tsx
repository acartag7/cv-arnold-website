'use client'

/**
 * Personal Info Form - Stripe Dashboard Style
 *
 * A polished, enterprise-quality form for editing personal information.
 * Design inspired by Stripe's dashboard aesthetic with:
 * - Gradient accents and blue/indigo color scheme
 * - Rounded cards with subtle shadows
 * - Clear visual hierarchy with dividers
 * - Professional, accessible form patterns
 *
 * @module app/admin/personal/PersonalInfoFormStripe
 */

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Twitter,
  ImageIcon,
  Briefcase,
  FileText,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { PersonalInfoSchema } from '@/schemas/cv.schema'
import type { PersonalInfo } from '@/types/cv'

// ============================================================================
// Types
// ============================================================================

export interface PersonalInfoFormStripeProps {
  /** Initial form values */
  defaultValues: PersonalInfo
  /** Callback when form is submitted with valid data */
  onSubmit: (data: PersonalInfo) => void | Promise<void>
  /** Whether the form is currently submitting */
  isSubmitting?: boolean
  /** Optional callback for cancel action */
  onCancel?: () => void
  /** Optional callback for reset action */
  onReset?: () => void
}

// Infer form values from schema
type FormValues = z.infer<typeof PersonalInfoSchema>

// Availability status options
const availabilityOptions = [
  { value: 'available', label: 'Available', color: 'green' },
  { value: 'open_to_opportunities', label: 'Open to Offers', color: 'blue' },
  { value: 'not_available', label: 'Not Available', color: 'gray' },
] as const

// ============================================================================
// Component
// ============================================================================

export function PersonalInfoFormStripe({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  onCancel,
  onReset,
}: PersonalInfoFormStripeProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty, isValid },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(PersonalInfoSchema),
    defaultValues,
    mode: 'onChange',
  })

  // watch() is used intentionally for reactive form updates
  const currentAvailability = watch('availability.status')

  const handleFormSubmit = handleSubmit(async data => {
    // Transform the validated data to match PersonalInfo interface
    // The Zod schema ensures the data is valid, but we need to handle
    // the exactOptionalPropertyTypes requirement by filtering undefined values
    const transformedData: PersonalInfo = {
      fullName: data.fullName,
      title: data.title,
      email: data.email,
      ...(data.phone !== undefined && { phone: data.phone }),
      location: {
        city: data.location.city,
        country: data.location.country,
        countryCode: data.location.countryCode,
      },
      ...(data.website !== undefined && { website: data.website }),
      social: {
        ...(data.social.linkedin !== undefined && {
          linkedin: data.social.linkedin,
        }),
        ...(data.social.github !== undefined && { github: data.social.github }),
        ...(data.social.twitter !== undefined && {
          twitter: data.social.twitter,
        }),
      },
      summary: data.summary,
      ...(data.profileImage !== undefined && {
        profileImage: data.profileImage,
      }),
      availability: {
        status: data.availability.status,
        ...(data.availability.message !== undefined && {
          message: data.availability.message,
        }),
      },
    }
    await onSubmit(transformedData)
  })

  const handleReset = () => {
    reset(defaultValues)
    onReset?.()
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
      <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium mb-3">
            <User size={12} />
            Profile
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Personal Information
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Update your profile details and public information
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="space-y-6">
            {/* Basic Information Section */}
            <SectionHeader
              icon={<User size={16} />}
              title="Basic Information"
              description="Your name and professional title"
            />

            {/* Full Name */}
            <FormField
              label="Full Name"
              required
              error={errors.fullName?.message}
              description="2-100 characters"
            >
              <FormInput
                {...register('fullName')}
                placeholder="John Doe"
                error={!!errors.fullName}
              />
            </FormField>

            {/* Professional Title */}
            <FormField
              label="Professional Title"
              required
              error={errors.title?.message}
            >
              <FormInput
                {...register('title')}
                placeholder="Platform Engineer"
                error={!!errors.title}
              />
            </FormField>

            <SectionDivider />

            {/* Contact Information Section */}
            <SectionHeader
              icon={<Mail size={16} />}
              title="Contact Information"
              description="How people can reach you"
            />

            {/* Two columns - Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Email Address"
                required
                error={errors.email?.message}
              >
                <FormInputWithIcon
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  icon={<Mail size={12} />}
                  error={!!errors.email}
                />
              </FormField>

              <FormField
                label="Phone Number"
                error={errors.phone?.message}
                description="E.164 format (e.g., +1234567890)"
              >
                <FormInputWithIcon
                  {...register('phone')}
                  type="tel"
                  placeholder="+1234567890"
                  icon={<Phone size={12} />}
                  error={!!errors.phone}
                />
              </FormField>
            </div>

            <SectionDivider />

            {/* Location Section */}
            <SectionHeader
              icon={<MapPin size={16} />}
              title="Location"
              description="Where you are based"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="City"
                required
                error={errors.location?.city?.message}
              >
                <FormInput
                  {...register('location.city')}
                  placeholder="Chicago"
                  error={!!errors.location?.city}
                />
              </FormField>

              <FormField
                label="Country"
                required
                error={errors.location?.country?.message}
              >
                <FormInput
                  {...register('location.country')}
                  placeholder="United States"
                  error={!!errors.location?.country}
                />
              </FormField>

              <FormField
                label="Country Code"
                required
                error={errors.location?.countryCode?.message}
                description="ISO 3166-1 alpha-2"
              >
                <FormInput
                  {...register('location.countryCode', {
                    setValueAs: (value: string) => value?.toUpperCase() ?? '',
                  })}
                  placeholder="US"
                  maxLength={2}
                  className="uppercase"
                  error={!!errors.location?.countryCode}
                />
              </FormField>
            </div>

            <SectionDivider />

            {/* Web Presence Section */}
            <SectionHeader
              icon={<Globe size={16} />}
              title="Web Presence"
              description="Your website and social profiles"
            />

            <FormField
              label="Personal Website"
              error={errors.website?.message}
              description="Must include http:// or https://"
            >
              <FormInputWithIcon
                {...register('website')}
                type="url"
                placeholder="https://yoursite.com"
                icon={<Globe size={12} />}
                error={!!errors.website}
              />
            </FormField>

            {/* Social Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="LinkedIn"
                error={errors.social?.linkedin?.message}
              >
                <FormInputWithIcon
                  {...register('social.linkedin')}
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  icon={<Linkedin size={12} />}
                  error={!!errors.social?.linkedin}
                />
              </FormField>

              <FormField label="GitHub" error={errors.social?.github?.message}>
                <FormInputWithIcon
                  {...register('social.github')}
                  type="url"
                  placeholder="https://github.com/..."
                  icon={<Github size={12} />}
                  error={!!errors.social?.github}
                />
              </FormField>

              <FormField
                label="Twitter / X"
                error={errors.social?.twitter?.message}
              >
                <FormInputWithIcon
                  {...register('social.twitter')}
                  type="url"
                  placeholder="https://twitter.com/..."
                  icon={<Twitter size={12} />}
                  error={!!errors.social?.twitter}
                />
              </FormField>
            </div>

            <SectionDivider />

            {/* Profile Image Section */}
            <SectionHeader
              icon={<ImageIcon size={16} />}
              title="Profile Image"
              description="A professional photo or avatar"
            />

            <FormField
              label="Profile Image URL"
              error={errors.profileImage?.message}
              description="Direct link to an image (JPG, PNG, WebP)"
            >
              <FormInputWithIcon
                {...register('profileImage')}
                type="url"
                placeholder="https://example.com/photo.jpg"
                icon={<ImageIcon size={12} />}
                error={!!errors.profileImage}
              />
            </FormField>

            <SectionDivider />

            {/* Professional Summary Section */}
            <SectionHeader
              icon={<FileText size={16} />}
              title="Professional Summary"
              description="A brief overview of your experience and expertise"
            />

            <FormField
              label="Summary"
              required
              error={errors.summary?.message}
              description="10-5000 characters. Markdown is supported."
            >
              <FormTextarea
                {...register('summary')}
                rows={6}
                placeholder="Write a compelling summary of your professional background, key skills, and career highlights..."
                error={!!errors.summary}
              />
            </FormField>

            <SectionDivider />

            {/* Availability Section */}
            <SectionHeader
              icon={<Briefcase size={16} />}
              title="Availability"
              description="Let people know if you are open to new opportunities"
            />

            <FormField label="Status" required>
              <Controller
                name="availability.status"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-3 gap-3">
                    {availabilityOptions.map(option => (
                      <AvailabilityButton
                        key={option.value}
                        label={option.label}
                        colorScheme={option.color}
                        selected={field.value === option.value}
                        onClick={() => field.onChange(option.value)}
                        type="button"
                      />
                    ))}
                  </div>
                )}
              />
            </FormField>

            {/* Availability Message */}
            <FormField
              label="Availability Message"
              error={errors.availability?.message?.message}
              description="Optional message about your availability (max 500 chars)"
            >
              <FormTextarea
                {...register('availability.message')}
                rows={2}
                placeholder={
                  currentAvailability === 'available'
                    ? 'e.g., Available for new projects starting next month'
                    : currentAvailability === 'open_to_opportunities'
                      ? 'e.g., Interested in senior engineering roles'
                      : 'e.g., Currently focused on my current role'
                }
                error={!!errors.availability?.message}
              />
            </FormField>
          </div>
        </div>

        {/* Form Status Indicator */}
        <FormStatusBar isDirty={isDirty} isValid={isValid} errors={errors} />

        {/* Form Actions */}
        <div className="mt-6 flex justify-between items-center">
          <button
            type="button"
            onClick={handleReset}
            disabled={!isDirty || isSubmitting}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors text-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw size={14} />
            Reset to saved
          </button>

          <div className="flex gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !isDirty || !isValid}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/25 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Save size={16} />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

// ============================================================================
// Sub-Components
// ============================================================================

interface SectionHeaderProps {
  icon: React.ReactNode
  title: string
  description: string
}

function SectionHeader({ icon, title, description }: SectionHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  )
}

function SectionDivider() {
  return (
    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-600 to-transparent" />
  )
}

// NOTE: These form components use Stripe-inspired styling.
// The UI components (src/components/ui/Input, Textarea) now support variant="stripe"
// which provides the same styling. Future refactor can migrate to use those.
// See: Input.tsx, Textarea.tsx with variant="stripe"

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string | undefined
  description?: string | undefined
  children: React.ReactNode
}

function FormField({
  label,
  required,
  error,
  description,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {description && !error && (
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {description}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  )
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const FormInput = ({
  error,
  className = '',
  ...props
}: FormInputProps & React.RefAttributes<HTMLInputElement>) => {
  return (
    <input
      {...props}
      className={`
        w-full px-4 py-2.5
        bg-slate-50 dark:bg-slate-900
        border rounded-xl
        text-slate-900 dark:text-slate-100
        placeholder:text-slate-400 dark:placeholder:text-slate-500
        focus:outline-none focus:ring-2 focus:border-transparent
        transition-all
        ${
          error
            ? 'border-red-300 dark:border-red-700 focus:ring-red-500/30'
            : 'border-slate-200 dark:border-slate-600 focus:ring-blue-500/30'
        }
        ${className}
      `}
    />
  )
}

interface FormInputWithIconProps extends FormInputProps {
  icon: React.ReactNode
}

const FormInputWithIcon = ({
  icon,
  error,
  className = '',
  ...props
}: FormInputWithIconProps & React.RefAttributes<HTMLInputElement>) => {
  return (
    <div className="relative">
      <div
        className={`
        absolute left-4 top-1/2 -translate-y-1/2
        p-1 rounded
        ${error ? 'bg-red-100 dark:bg-red-900/30' : 'bg-slate-100 dark:bg-slate-700'}
      `}
      >
        <span
          className={
            error ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'
          }
        >
          {icon}
        </span>
      </div>
      <input
        {...props}
        className={`
          w-full pl-12 pr-4 py-2.5
          bg-slate-50 dark:bg-slate-900
          border rounded-xl
          text-slate-900 dark:text-slate-100
          placeholder:text-slate-400 dark:placeholder:text-slate-500
          focus:outline-none focus:ring-2 focus:border-transparent
          transition-all
          ${
            error
              ? 'border-red-300 dark:border-red-700 focus:ring-red-500/30'
              : 'border-slate-200 dark:border-slate-600 focus:ring-blue-500/30'
          }
          ${className}
        `}
      />
    </div>
  )
}

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const FormTextarea = ({
  error,
  className = '',
  ...props
}: FormTextareaProps & React.RefAttributes<HTMLTextAreaElement>) => {
  return (
    <textarea
      {...props}
      className={`
        w-full px-4 py-3
        bg-slate-50 dark:bg-slate-900
        border rounded-xl
        text-slate-900 dark:text-slate-100
        placeholder:text-slate-400 dark:placeholder:text-slate-500
        focus:outline-none focus:ring-2 focus:border-transparent
        transition-all resize-none
        ${
          error
            ? 'border-red-300 dark:border-red-700 focus:ring-red-500/30'
            : 'border-slate-200 dark:border-slate-600 focus:ring-blue-500/30'
        }
        ${className}
      `}
    />
  )
}

interface AvailabilityButtonProps {
  label: string
  colorScheme: 'green' | 'blue' | 'gray'
  selected: boolean
  onClick: () => void
  type?: 'button' | 'submit'
}

function AvailabilityButton({
  label,
  colorScheme,
  selected,
  onClick,
  type = 'button',
}: AvailabilityButtonProps) {
  const colorStyles = {
    green: {
      selected:
        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-500',
      default:
        'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-green-300 dark:hover:border-green-700',
    },
    blue: {
      selected:
        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-500',
      default:
        'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-700',
    },
    gray: {
      selected:
        'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-500',
      default:
        'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500',
    },
  }

  const styles = colorStyles[colorScheme]

  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        px-4 py-2.5 rounded-xl font-medium text-sm
        border-2 transition-all
        ${selected ? styles.selected : styles.default}
      `}
    >
      {label}
    </button>
  )
}

interface FormStatusBarProps {
  isDirty: boolean
  isValid: boolean
  errors: Record<string, unknown>
}

/**
 * Recursively counts leaf error nodes in react-hook-form errors object.
 * Handles nested objects like location.country, location.countryCode
 */
function countErrors(obj: Record<string, unknown>): number {
  let count = 0
  for (const key in obj) {
    const value = obj[key]
    if (value && typeof value === 'object') {
      // If it has a 'message' property, it's a leaf error node
      if ('message' in value) {
        count++
      } else {
        // Otherwise recurse into nested object
        count += countErrors(value as Record<string, unknown>)
      }
    }
  }
  return count
}

function FormStatusBar({ isDirty, isValid, errors }: FormStatusBarProps) {
  const errorCount = countErrors(errors)

  if (!isDirty) {
    return null
  }

  return (
    <div
      className={`
      mt-4 px-4 py-2.5 rounded-lg flex items-center justify-between text-sm
      ${
        isValid
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
      }
    `}
    >
      <div className="flex items-center gap-2">
        {isValid ? (
          <>
            <CheckCircle
              size={16}
              className="text-green-500 dark:text-green-400"
            />
            <span className="text-green-700 dark:text-green-300">
              All fields are valid. Ready to save.
            </span>
          </>
        ) : (
          <>
            <AlertCircle
              size={16}
              className="text-amber-500 dark:text-amber-400"
            />
            <span className="text-amber-700 dark:text-amber-300">
              {errorCount} {errorCount === 1 ? 'error' : 'errors'} to fix before
              saving
            </span>
          </>
        )}
      </div>
      {isDirty && (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Unsaved changes
        </span>
      )}
    </div>
  )
}

export default PersonalInfoFormStripe
