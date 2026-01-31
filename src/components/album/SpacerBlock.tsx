'use client'

interface SpacerBlockProps {
  height: 'sm' | 'md' | 'lg'
}

export default function SpacerBlock({ height }: SpacerBlockProps) {
  const heightClasses = {
    sm: 'h-12 md:h-16',
    md: 'h-20 md:h-28',
    lg: 'h-32 md:h-44',
  }

  return <div className={heightClasses[height]} />
}
