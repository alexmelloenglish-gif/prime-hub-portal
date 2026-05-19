import Image from 'next/image'
import { cn } from '@/lib/utils'

type BrandLogoVariant = 'full' | 'mark'

interface BrandLogoProps {
  variant?: BrandLogoVariant
  className?: string
  priority?: boolean
}

const logos: Record<BrandLogoVariant, { src: string; alt: string; width: number; height: number }> = {
  full: {
    src: '/brand/prime-digital-hub-full.png',
    alt: 'Prime Digital Hub',
    width: 373,
    height: 175,
  },
  mark: {
    src: '/brand/prime-digital-hub-mark-bubble.png',
    alt: 'Prime Digital Hub mark',
    width: 938,
    height: 938,
  },
}

export function BrandLogo({ variant = 'mark', className, priority = false }: BrandLogoProps) {
  const logo = logos[variant]
  const isFullLogo = variant === 'full'

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        isFullLogo ? 'overflow-hidden rounded-md bg-white px-2 py-1' : 'overflow-visible bg-transparent',
        className
      )}
    >
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        priority={priority}
        unoptimized={!isFullLogo}
        className={cn('h-full w-full', isFullLogo ? 'object-contain' : 'object-contain')}
      />
    </span>
  )
}
