import Link from 'next/link'
import { ReactNode } from 'react'

interface DashboardCardProps {
  title: string
  description: string
  icon: ReactNode
  primaryAction: {
    href: string
    label: string
    color: 'blue' | 'green' | 'gold' | 'red' | 'purple' | 'orange' | 'indigo'
  }
  secondaryAction?: {
    href: string
    label: string
  }
  stats?: Array<{
    value: number | string
    label: string
    color?: 'blue' | 'green' | 'gold' | 'red' | 'purple' | 'orange' | 'indigo' | 'yellow'
  }>
  footer?: string
}

const colorClasses = {
  blue: {
    primary: 'bg-vgbf-blue hover:bg-vgbf-green',
    icon: 'bg-vgbf-blue bg-opacity-10',
    text: 'text-vgbf-blue'
  },
  green: {
    primary: 'bg-vgbf-green hover:bg-green-700',
    icon: 'bg-vgbf-green bg-opacity-10',
    text: 'text-vgbf-green'
  },
  gold: {
    primary: 'bg-vgbf-gold text-vgbf-blue hover:bg-yellow-300',
    icon: 'bg-vgbf-gold bg-opacity-20',
    text: 'text-vgbf-gold'
  },
  red: {
    primary: 'bg-red-600 hover:bg-red-700',
    icon: 'bg-red-100',
    text: 'text-red-600'
  },
  purple: {
    primary: 'bg-purple-600 hover:bg-purple-700',
    icon: 'bg-purple-100',
    text: 'text-purple-600'
  },
  orange: {
    primary: 'bg-orange-600 hover:bg-orange-700',
    icon: 'bg-orange-100',
    text: 'text-orange-600'
  },
  indigo: {
    primary: 'bg-indigo-600 hover:bg-indigo-700',
    icon: 'bg-indigo-100',
    text: 'text-indigo-600'
  }
}

const statColorClasses = {
  blue: 'text-vgbf-blue',
  green: 'text-vgbf-green',
  gold: 'text-vgbf-gold',
  red: 'text-red-600',
  purple: 'text-purple-600',
  orange: 'text-orange-600',
  indigo: 'text-indigo-600',
  yellow: 'text-yellow-600'
}

export default function DashboardCard({
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  stats,
  footer
}: DashboardCardProps) {
  const colors = colorClasses[primaryAction.color]

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className={`flex-shrink-0 p-3 rounded-lg ${colors.icon}`}>
            {icon}
          </div>
          <div className="ml-4">
            <h2 className={`text-xl font-bold ${colors.text}`}>{title}</h2>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        
        {stats && stats.length > 0 && (
          <div className={`grid grid-cols-${Math.min(stats.length, 3)} gap-4 mb-4`}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-2xl font-bold ${stat.color ? statColorClasses[stat.color] : colors.text}`}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Link
            href={primaryAction.href}
            className={`${colors.primary} text-white px-4 py-2 rounded-lg transition-colors font-semibold text-sm text-center`}
          >
            {primaryAction.label}
          </Link>
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm text-center"
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>

        {footer && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
