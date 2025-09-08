import { ReactNode } from 'react'

interface ActivityItem {
  id: string
  title: string
  date: string
  type: 'news' | 'competition' | 'club' | 'board' | 'sponsor' | 'record' | 'calendar'
  color?: 'blue' | 'green' | 'gold' | 'purple' | 'red' | 'orange' | 'indigo'
}

interface ActivityFeedProps {
  title: string
  items: ActivityItem[]
  emptyMessage?: string
  maxItems?: number
}

const colorClasses = {
  blue: 'bg-vgbf-blue',
  green: 'bg-vgbf-green',
  gold: 'bg-vgbf-gold',
  purple: 'bg-purple-600',
  red: 'bg-red-600',
  orange: 'bg-orange-600',
  indigo: 'bg-indigo-600'
}

const typeColors: Record<ActivityItem['type'], keyof typeof colorClasses> = {
  news: 'blue',
  competition: 'green',
  club: 'gold',
  board: 'indigo',
  sponsor: 'orange',
  record: 'red',
  calendar: 'purple'
}

export default function ActivityFeed({ 
  title, 
  items, 
  emptyMessage = 'Ingen aktivitet att visa',
  maxItems = 5 
}: ActivityFeedProps) {
  const displayItems = items.slice(0, maxItems)

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-vgbf-blue mb-4">{title}</h3>
      
      {displayItems.length > 0 ? (
        <div className="space-y-3">
          {displayItems.map((item) => {
            const color = item.color || typeColors[item.type]
            return (
              <div key={item.id} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${colorClasses[color]}`}></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.date).toLocaleDateString('sv-SE', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
  )
}
