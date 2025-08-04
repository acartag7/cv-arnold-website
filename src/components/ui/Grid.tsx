import { cn } from '@/utils/cn'

interface GridProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12
  mdCols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  lgCols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  className?: string
}

const gridColsMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12',
}

const gridMdColsMap = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
  7: 'md:grid-cols-7',
  8: 'md:grid-cols-8',
  9: 'md:grid-cols-9',
  10: 'md:grid-cols-10',
  11: 'md:grid-cols-11',
  12: 'md:grid-cols-12',
}

const gridLgColsMap = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
  7: 'lg:grid-cols-7',
  8: 'lg:grid-cols-8',
  9: 'lg:grid-cols-9',
  10: 'lg:grid-cols-10',
  11: 'lg:grid-cols-11',
  12: 'lg:grid-cols-12',
}

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
  mdCols,
  lgCols,
  className,
}: GridProps) {
  return (
    <div
      className={cn(
        'grid',
        gridColsMap[cols],
        mdCols && gridMdColsMap[mdCols],
        lgCols && gridLgColsMap[lgCols],
        gapMap[gap],
        className
      )}
    >
      {children}
    </div>
  )
}
