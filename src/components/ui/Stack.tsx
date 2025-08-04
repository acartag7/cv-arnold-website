import { cn } from '@/utils/cn'

/**
 * Vertical stack layout component with consistent gaps and alignment options
 */
interface StackProps {
  /** Items to stack vertically */
  children: React.ReactNode
  /** Gap between items (8px units) */
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12
  /** Horizontal alignment of items */
  align?: 'start' | 'center' | 'end' | 'stretch'
  /** HTML element to render as */
  as?: React.ElementType
  /** Additional CSS classes */
  className?: string
}

const gapMap = {
  0: 'gap-0',
  1: 'gap-1', // 4px
  2: 'gap-2', // 8px (base unit)
  3: 'gap-3', // 12px
  4: 'gap-4', // 16px (2x base)
  5: 'gap-5', // 20px
  6: 'gap-6', // 24px (3x base)
  8: 'gap-8', // 32px (4x base)
  10: 'gap-10', // 40px (5x base)
  12: 'gap-12', // 48px (6x base)
}

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
}

export function Stack({
  children,
  gap = 4,
  align = 'stretch',
  as: Component = 'div',
  className,
}: StackProps) {
  return (
    <Component
      className={cn('flex flex-col', gapMap[gap], alignMap[align], className)}
    >
      {children}
    </Component>
  )
}
