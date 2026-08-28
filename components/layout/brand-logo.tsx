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
    src: '/brand/prime-digital-hub-full-transparent.png',
    alt: 'Prime Digital Hub',
    width: 353,
    height: 156,
  },
  mark: {
    src: '/brand/prime-digital-hub-mark-transparent.png',
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
        isFullLogo
          ? 'overflow-hidden rounded-xl border border-prime-cream/20 bg-prime-cream/95 px-2.5 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.24)]'
          : 'overflow-visible bg-transparent',
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
