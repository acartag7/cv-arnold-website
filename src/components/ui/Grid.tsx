import { cn } from '@/utils/cn'

/**
 * CSS Grid component with responsive column control and 8px-aligned gaps
 */
interface GridProps {
  /** Grid items to display */
  children: React.ReactNode
  /** Number of columns on mobile (base) */
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  /** Gap between grid items (8px units) */
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12
  /** Number of columns on small screens (640px+) */
  smCols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  /** Number of columns on medium screens (768px+) */
  mdCols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  /** Number of columns on large screens (1024px+) */
  lgCols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  /** HTML element to render as */
  as?: React.ElementType
  /** Additional CSS classes */
  className?: string
}

// Helper function to generate grid column classes
const createGridColsMap = (prefix = '') => {
  const prefixStr = prefix ? `${prefix}:` : ''
  return {
    1: `${prefixStr}grid-cols-1`,
    2: `${prefixStr}grid-cols-2`,
    3: `${prefixStr}grid-cols-3`,
    4: `${prefixStr}grid-cols-4`,
    5: `${prefixStr}grid-cols-5`,
    6: `${prefixStr}grid-cols-6`,
    7: `${prefixStr}grid-cols-7`,
    8: `${prefixStr}grid-cols-8`,
    9: `${prefixStr}grid-cols-9`,
    10: `${prefixStr}grid-cols-10`,
    11: `${prefixStr}grid-cols-11`,
    12: `${prefixStr}grid-cols-12`,
  } as const
}

const gridColsMap = createGridColsMap()
const gridSmColsMap = createGridColsMap('sm')
const gridMdColsMap = createGridColsMap('md')
const gridLgColsMap = createGridColsMap('lg')

const gapMap = {
  0: 'gap-0',
  1: 'gap-1', // 4px
  2: 'gap-2', // 8px
  3: 'gap-3', // 12px
  4: 'gap-4', // 16px
  5: 'gap-5', // 20px
  6: 'gap-6', // 24px
  8: 'gap-8', // 32px
  10: 'gap-10', // 40px
  12: 'gap-12', // 48px
}

export function Grid({
  children,
  cols = 1,
  gap = 4,
  smCols,
  mdCols,
  lgCols,
  as: Component = 'div',
  className,
}: GridProps) {
  return (
    <Component
      className={cn(
        'grid',
        gridColsMap[cols],
        smCols && gridSmColsMap[smCols],
        mdCols && gridMdColsMap[mdCols],
        lgCols && gridLgColsMap[lgCols],
        gapMap[gap],
        className
      )}
    >
      {children}
    </Component>
  )
}
