import { cn } from '@/utils/cn'

interface StackProps {
  children: React.ReactNode
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12
  align?: 'start' | 'center' | 'end' | 'stretch'
  className?: string
}

const gapMap = {
  0: 'space-y-0',
  1: 'space-y-1', // 4px
  2: 'space-y-2', // 8px (base unit)
  3: 'space-y-3', // 12px
  4: 'space-y-4', // 16px (2x base)
  5: 'space-y-5', // 20px
  6: 'space-y-6', // 24px (3x base)
  8: 'space-y-8', // 32px (4x base)
  10: 'space-y-10', // 40px (5x base)
  12: 'space-y-12', // 48px (6x base)
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
  className,
}: StackProps) {
  return (
    <div
      className={cn('flex flex-col', gapMap[gap], alignMap[align], className)}
    >
      {children}
    </div>
  )
}
