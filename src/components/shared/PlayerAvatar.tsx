import Image from 'next/image'
import { cn, initials } from '@/lib/utils'

interface Props {
  name: string
  photoUrl?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  xs: { cls: 'w-6 h-6 text-[10px]', img: 24 },
  sm: { cls: 'w-8 h-8 text-xs', img: 32 },
  md: { cls: 'w-10 h-10 text-sm', img: 40 },
  lg: { cls: 'w-14 h-14 text-lg', img: 56 },
  xl: { cls: 'w-20 h-20 text-2xl', img: 80 },
}

export function PlayerAvatar({ name, photoUrl, size = 'md', className }: Props) {
  const { cls, img } = sizes[size]
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={img}
        height={img}
        className={cn('rounded-full object-cover shrink-0', cls, className)}
      />
    )
  }
  return (
    <div className={cn('rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center shrink-0', cls, className)}>
      {initials(name)}
    </div>
  )
}
