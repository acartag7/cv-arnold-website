import type { ElementType } from 'react'

export type CardVariant = 'elevated' | 'outlined' | 'ghost'
export type CardSize = 'sm' | 'md' | 'lg'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardVariantConfig {
  base: string
  hover: string
  focus: string
  active: string
  disabled: string
}

export interface CardSizeConfig {
  base: string
  padding: string
  borderRadius: string
}

export interface BaseCardProps {
  variant?: CardVariant
  size?: CardSize
  padding?: CardPadding
  interactive?: boolean
  disabled?: boolean
  hoverable?: boolean
  className?: string
  children?: React.ReactNode
}

export type CardComponentProps<T extends ElementType = 'div'> =
  BaseCardProps & {
    as?: T
  } & Omit<React.ComponentPropsWithRef<T>, keyof BaseCardProps | 'as'>

export type CardProps = BaseCardProps

export interface CardHeaderProps {
  className?: string
  children?: React.ReactNode
}

export interface CardBodyProps {
  className?: string
  children?: React.ReactNode
}

export interface CardFooterProps {
  className?: string
  children?: React.ReactNode
}

export interface CardMediaProps {
  className?: string
  children?: React.ReactNode
  aspectRatio?: 'square' | 'video' | 'wide' | 'tall'
}
