import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon: ReactNode
  color: 'blue' | 'green' | 'gold' | 'purple' | 'red' | 'orange'
  trend?: {
    value: string
    isPositive: boolean
  }
}

const colorClasses = {
  blue: 'border-vgbf-blue',
  green: 'border-vgbf-green',
  gold: 'border-vgbf-gold',
  purple: 'border-purple-500',
  red: 'border-red-500',
  orange: 'border-orange-500'
}

export default function StatCard({ title, value, subtitle, icon, color, trend }: StatCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${colorClasses[color]}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0 text-gray-600">
          {icon}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-lg font-medium text-gray-900">{value}</div>
              {trend && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span className="sr-only">
                    {trend.isPositive ? 'Increased' : 'Decreased'} by
                  </span>
                  {trend.value}
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
      {subtitle && (
        <div className="mt-2 text-xs text-gray-500">
          {subtitle}
        </div>
      )}
    </div>
  )
}
