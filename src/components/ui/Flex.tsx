import { cn } from '@/utils/cn'

interface FlexProps {
  children: React.ReactNode
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12
  wrap?: boolean
  className?: string
}

const directionMap = {
  row: 'flex-row',
  col: 'flex-col',
  'row-reverse': 'flex-row-reverse',
  'col-reverse': 'flex-col-reverse',
}

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
}

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
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

export function Flex({
  children,
  direction = 'row',
  align = 'center',
  justify = 'start',
  gap = 0,
  wrap = false,
  className,
}: FlexProps) {
  return (
    <div
      className={cn(
        'flex',
        directionMap[direction],
        alignMap[align],
        justifyMap[justify],
        gapMap[gap],
        wrap && 'flex-wrap',
        className
      )}
    >
      {children}
    </div>
  )
}
