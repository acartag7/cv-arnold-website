import { cn } from '@/utils/cn'

/**
 * Semantic section component with consistent vertical spacing and background variants
 */
interface SectionProps {
  /** Section content */
  children: React.ReactNode
  /** Vertical padding size */
  spacing?: 'sm' | 'md' | 'lg' | 'xl'
  /** Background color variant */
  background?: 'default' | 'muted' | 'accent'
  /** Additional CSS classes */
  className?: string
  /** Section ID for navigation/anchoring */
  id?: string
}

const spacingMap = {
  sm: 'py-4', // 16px top/bottom
  md: 'py-6', // 24px top/bottom
  lg: 'py-10', // 40px top/bottom
  xl: 'py-14', // 56px top/bottom
}

const backgroundMap = {
  default: '',
  muted: 'bg-background-muted',
  accent: 'bg-accent-subtle',
}

export function Section({
  children,
  spacing = 'lg',
  background = 'default',
  className,
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(spacingMap[spacing], backgroundMap[background], className)}
    >
      {children}
    </section>
  )
}
