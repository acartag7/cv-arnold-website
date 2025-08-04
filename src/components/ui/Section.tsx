import { cn } from '@/utils/cn'

interface SectionProps {
  children: React.ReactNode
  spacing?: 'sm' | 'md' | 'lg' | 'xl'
  background?: 'default' | 'muted' | 'accent'
  className?: string
  id?: string
}

const spacingMap = {
  sm: 'py-8', // 32px top/bottom
  md: 'py-12', // 48px top/bottom
  lg: 'py-16', // 64px top/bottom
  xl: 'py-20', // 80px top/bottom
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
