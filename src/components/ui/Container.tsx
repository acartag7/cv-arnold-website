import { cn } from '@/utils/cn'

/**
 * Container component for responsive max-widths and centering
 */
interface ContainerProps {
  /** Content to be contained */
  children: React.ReactNode
  /** Container size variant - controls max-width breakpoints */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** HTML element to render as */
  as?: React.ElementType
  /** Additional CSS classes */
  className?: string
}

const containerSizes = {
  sm: 'max-w-screen-sm', // 640px
  md: 'max-w-screen-md', // 768px
  lg: 'max-w-screen-lg', // 1024px
  xl: 'max-w-screen-xl', // 1280px
  full: 'max-w-full',
}

export function Container({
  children,
  size = 'lg',
  as: Component = 'div',
  className,
}: ContainerProps) {
  return (
    <Component
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        containerSizes[size],
        className
      )}
    >
      {children}
    </Component>
  )
}
