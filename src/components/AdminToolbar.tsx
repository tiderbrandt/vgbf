import React from 'react'
import IconButton from './IconButton'
import AllIcons from '@/components/admin-icons-exports'

type Props = {
  searchValue: string
  onSearchChange: (v: string) => void
}

export default function AdminToolbar({ searchValue, onSearchChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-80">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <AllIcons.Search />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Sök i administration..."
          className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-vgbf-blue"
        />
      </div>

      <IconButton href="/admin/settings" variant="secondary">
        <AllIcons.Settings />
        <span>Inställningar</span>
      </IconButton>

      <IconButton href="/admin/news/new" variant="primary">
        <AllIcons.Plus />
        <span>Skapa</span>
      </IconButton>
    </div>
  )
}
