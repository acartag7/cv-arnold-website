import type { ElementType } from 'react'

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral'
  | 'accent'

export type BadgeSize = 'sm' | 'md' | 'lg'

export interface BadgeVariantConfig {
  base: string
  hover?: string
  focus?: string
  active?: string
}

export interface BadgeSizeConfig {
  base: string
  padding: string
  fontSize: string
  iconSize: string
}

export interface BaseBadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  interactive?: boolean
  rounded?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  className?: string
  children?: React.ReactNode
}

export type BadgeComponentProps<T extends ElementType = 'span'> =
  BaseBadgeProps & {
    as?: T
  } & Omit<React.ComponentPropsWithRef<T>, keyof BaseBadgeProps | 'as'>

export type BadgeProps = BaseBadgeProps
