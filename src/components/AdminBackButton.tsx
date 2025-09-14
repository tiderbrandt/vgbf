import Link from 'next/link'
import React from 'react'

interface AdminBackButtonProps {
  href?: string
  className?: string
  children?: React.ReactNode
}

export default function AdminBackButton({ 
  href = "/admin", 
  className = "",
  children = "Tillbaka till admin"
}: AdminBackButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm ${className}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {children}
    </Link>
  )
}