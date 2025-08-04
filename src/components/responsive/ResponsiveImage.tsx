/**
 * ResponsiveImage Component
 * Adaptive image rendering with responsive sizing and optimization
 */

'use client'

import { forwardRef } from 'react'
import Image from 'next/image'
import { useBreakpointValue } from '../../hooks/responsive'
import { cn } from '../../utils/cn'
import type { ResponsiveImageProps } from '../../types/responsive'

/**
 * ResponsiveImage component for adaptive image rendering
 *
 * @example
 * ```tsx
 * // Responsive sizes
 * <ResponsiveImage
 *   src="/hero-image.jpg"
 *   alt="Hero image"
 *   sizes={{
 *     base: '100vw',
 *     md: '50vw',
 *     lg: '33vw'
 *   }}
 * />
 *
 * // Responsive quality
 * <ResponsiveImage
 *   src="/profile.jpg"
 *   alt="Profile"
 *   quality={{ base: 75, lg: 90 }}
 *   priority
 * />
 *
 * // Art direction with different images
 * <ResponsiveImage
 *   src={{
 *     base: '/mobile-hero.jpg',
 *     md: '/tablet-hero.jpg',
 *     lg: '/desktop-hero.jpg'
 *   }}
 *   alt="Responsive hero"
 *   sizes="100vw"
 * />
 * ```
 */
export const ResponsiveImage = forwardRef<
  HTMLImageElement,
  ResponsiveImageProps & {
    width?: number
    height?: number
    fill?: boolean
    style?: React.CSSProperties
    onLoad?: () => void
    onError?: () => void
  }
>(
  (
    {
      src,
      alt,
      sizes,
      className,
      priority = false,
      quality,
      placeholder = 'empty',
      blurDataURL,
      width,
      height,
      fill,
      style,
      onLoad,
      onError,
      ...props
    },
    ref
  ) => {
    // Resolve responsive values
    const resolvedSrc = useBreakpointValue(src)
    const resolvedSizes = useBreakpointValue(sizes || '100vw')
    const resolvedQuality = useBreakpointValue(quality || 75)

    // Handle different src types
    const imageSrc = typeof resolvedSrc === 'string' ? resolvedSrc : resolvedSrc

    // Build Next.js Image props
    const nextImageProps: React.ComponentProps<typeof Image> = {
      ref,
      src: imageSrc,
      alt,
      sizes: resolvedSizes,
      quality: resolvedQuality,
      priority,
      placeholder,
      className: cn('responsive-image', className),
      ...(blurDataURL && { blurDataURL }),
      ...(width && { width }),
      ...(height && { height }),
      ...(fill && { fill }),
      ...(style && { style }),
      ...(onLoad && { onLoad }),
      ...(onError && { onError }),
      ...props,
    }

    // eslint-disable-next-line jsx-a11y/alt-text -- alt prop is provided via nextImageProps
    return <Image {...nextImageProps} />
  }
)

ResponsiveImage.displayName = 'ResponsiveImage'

/**
 * ResponsiveBackground component for responsive background images
 *
 * @example
 * ```tsx
 * <ResponsiveBackground
 *   src={{
 *     base: '/mobile-bg.jpg',
 *     md: '/tablet-bg.jpg',
 *     lg: '/desktop-bg.jpg'
 *   }}
 *   className="min-h-screen"
 * >
 *   <div>Content over background</div>
 * </ResponsiveBackground>
 * ```
 */
export const ResponsiveBackground = forwardRef<
  HTMLDivElement,
  {
    src: ResponsiveImageProps['src']
    children?: React.ReactNode
    className?: string
    style?: React.CSSProperties
    overlay?: boolean
    overlayOpacity?: number
  }
>(
  (
    {
      src,
      children,
      className,
      style,
      overlay = false,
      overlayOpacity = 0.3,
      ...props
    },
    ref
  ) => {
    const resolvedSrc = useBreakpointValue(src)

    const backgroundStyle: React.CSSProperties = {
      backgroundImage: `url(${resolvedSrc})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      ...style,
    }

    return (
      <div
        ref={ref}
        className={cn('responsive-background relative', className)}
        style={backgroundStyle}
        {...props}
      >
        {overlay && (
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
          />
        )}
        {children && <div className="relative z-10">{children}</div>}
      </div>
    )
  }
)

ResponsiveBackground.displayName = 'ResponsiveBackground'

/**
 * ResponsiveAvatar component for user avatars with responsive sizing
 *
 * @example
 * ```tsx
 * <ResponsiveAvatar
 *   src="/user-avatar.jpg"
 *   alt="User avatar"
 *   size={{ base: 40, md: 48, lg: 56 }}
 * />
 * ```
 */
export const ResponsiveAvatar = forwardRef<
  HTMLDivElement,
  {
    src: string
    alt: string
    size?: ResponsiveImageProps['sizes']
    className?: string
    fallback?: React.ReactNode
  }
>(({ src, alt, size, className, fallback, ...props }, ref) => {
  const resolvedSize = useBreakpointValue(size || { base: 40, md: 48, lg: 56 })
  const sizeInPx =
    typeof resolvedSize === 'number'
      ? resolvedSize
      : parseInt(String(resolvedSize))

  return (
    <div
      ref={ref}
      className={cn(
        'responsive-avatar relative rounded-full overflow-hidden bg-gray-200 flex items-center justify-center',
        className
      )}
      style={{
        width: sizeInPx,
        height: sizeInPx,
      }}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={sizeInPx}
          height={sizeInPx}
          className="object-cover"
        />
      ) : (
        fallback || (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
            <svg
              width={sizeInPx * 0.6}
              height={sizeInPx * 0.6}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )
      )}
    </div>
  )
})

ResponsiveAvatar.displayName = 'ResponsiveAvatar'
