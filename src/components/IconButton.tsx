import Link from 'next/link'
import React from 'react'

type Props = {
  href?: string
  onClick?: () => void
  children?: React.ReactNode
  title?: string
  variant?: 'primary' | 'secondary' | 'ghost'
}

export default function IconButton({ href, onClick, children, title, variant = 'secondary' }: Props) {
  const base = 'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-150'
  const variants: Record<string, string> = {
    primary: 'bg-vgbf-blue text-white hover:bg-vgbf-blue/90 shadow-sm',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100'
  }

  const className = `${base} ${variants[variant] ?? variants.secondary}`

  if (href) {
    return (
      <Link href={href} className={className} title={title}>
        {children}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={className} title={title}>
      {children}
    </button>
  )
}
