import Link from 'next/link'
import { ReactNode } from 'react'

interface QuickLinkProps {
  href: string
  icon: ReactNode
  title: string
  subtitle?: string
  color: 'blue' | 'green' | 'gold' | 'purple' | 'red' | 'orange' | 'indigo'
}

const colorClasses = {
  blue: 'bg-vgbf-blue bg-opacity-10 group-hover:bg-vgbf-blue group-hover:bg-opacity-20',
  green: 'bg-vgbf-green bg-opacity-10 group-hover:bg-vgbf-green group-hover:bg-opacity-20',
  gold: 'bg-vgbf-gold bg-opacity-20 group-hover:bg-vgbf-gold group-hover:bg-opacity-30',
  purple: 'bg-purple-100 group-hover:bg-purple-200',
  red: 'bg-red-100 group-hover:bg-red-200',
  orange: 'bg-orange-100 group-hover:bg-orange-200',
  indigo: 'bg-indigo-100 group-hover:bg-indigo-200'
}

export default function QuickLink({ href, icon, title, subtitle, color }: QuickLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
    >
      <div className={`flex-shrink-0 p-2 rounded-lg transition-colors ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="ml-3">
        <div className="text-sm font-medium text-gray-900">{title}</div>
        {subtitle && (
          <div className="text-xs text-gray-500">{subtitle}</div>
        )}
      </div>
    </Link>
  )
}

interface QuickLinksProps {
  title: string
  links: QuickLinkProps[]
}

export function QuickLinksCard({ title, links }: QuickLinksProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-vgbf-blue mb-4">{title}</h3>
      <div className="space-y-1">
        {links.map((link, index) => (
          <QuickLink key={index} {...link} />
        ))}
      </div>
    </div>
  )
}
