'use client'

import { useState, useEffect } from 'react'

interface MenuItem {
  id: string
  title: string
  url: string | null
  target: '_self' | '_blank' | null
  menu_type: 'main' | 'footer' | 'sidebar'
  parent_id: string | null
  sort_order: number
  link_type: 'internal' | 'external' | 'page' | 'category'
  target_id: string | null
  is_visible: boolean
  is_published: boolean
  requires_auth: boolean
  show_on_mobile: boolean
  show_on_desktop: boolean
  css_class: string | null
  icon: string | null
  description: string | null
  created_at: string
  updated_at: string
  children?: MenuItem[]
}

export default function MenuManager() {
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [selectedMenu, setSelectedMenu] = useState<'main' | 'footer' | 'sidebar'>('main')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Load menus from API
  const loadMenus = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/menus?menu_type=${selectedMenu}`)
      if (!response.ok) throw new Error('Failed to load menus')
      
      const data = await response.json()
      setMenus(data.menuItems || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menus')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMenus()
  }, [selectedMenu])

  // Move item up/down
  const moveItem = async (item: MenuItem, direction: 'up' | 'down') => {
    const currentIndex = menus.findIndex(m => m.id === item.id)
    if (currentIndex === -1) return
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= menus.length) return

    const newMenus = [...menus]
    const [movedItem] = newMenus.splice(currentIndex, 1)
    newMenus.splice(newIndex, 0, movedItem)

    // Update sort order
    const updates = newMenus.map((menu, index) => ({
      id: menu.id,
      sort_order: index
    }))

    setMenus(newMenus)

    try {
      await fetch('/api/menus/bulk-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      })
    } catch (err) {
      console.error('Failed to update menu order:', err)
      loadMenus() // Revert on error
    }
  }

  // Toggle visibility
  const toggleVisibility = async (item: MenuItem) => {
    try {
      const response = await fetch(`/api/menus/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visible: !item.is_visible })
      })

      if (!response.ok) throw new Error('Failed to update visibility')
      loadMenus()
    } catch (err) {
      console.error('Failed to toggle visibility:', err)
    }
  }

  // Delete menu item
  const deleteItem = async (item: MenuItem) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return

    try {
      const response = await fetch(`/api/menus/${item.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete menu item')
      loadMenus()
    } catch (err) {
      console.error('Failed to delete menu item:', err)
    }
  }

  // Render menu item
  const renderMenuItem = (item: MenuItem, index: number) => (
    <div
      key={item.id}
      className={`
        bg-white border rounded-lg p-4 mb-2 shadow-sm
        ${!item.is_visible ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Move up/down buttons */}
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => moveItem(item, 'up')}
              disabled={index === 0}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              title="Move up"
            >
              ▲
            </button>
            <button
              onClick={() => moveItem(item, 'down')}
              disabled={index === menus.length - 1}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              title="Move down"
            >
              ▼
            </button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900">{item.title}</h3>
              {!item.is_published && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                  Draft
                </span>
              )}
              {item.requires_auth && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  Auth Required
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {item.url || `${item.link_type} link`}
            </p>
            {item.description && (
              <p className="text-xs text-gray-400 mt-1">{item.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleVisibility(item)}
            className={`p-2 rounded-md ${
              item.is_visible
                ? 'text-green-600 hover:bg-green-50'
                : 'text-gray-400 hover:bg-gray-50'
            }`}
            title={item.is_visible ? 'Visible' : 'Hidden'}
          >
            {item.is_visible ? '👁️' : '🙈'}
          </button>

          <button
            onClick={() => {
              setEditingItem(item)
              setShowForm(true)
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
            title="Edit"
          >
            ✏️
          </button>

          <button
            onClick={() => deleteItem(item)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Show children if any */}
      {item.children && item.children.length > 0 && (
        <div className="mt-3 ml-8 space-y-2">
          {item.children.map((child) => (
            <div key={child.id} className="bg-gray-50 rounded p-3 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{child.title}</span>
                  <span className="text-gray-500 ml-2">{child.url}</span>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => toggleVisibility(child)}
                    className={`p-1 rounded ${
                      child.is_visible ? 'text-green-600' : 'text-gray-400'
                    }`}
                    title={child.is_visible ? 'Visible' : 'Hidden'}
                  >
                    {child.is_visible ? '👁️' : '🙈'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(child)
                      setShowForm(true)
                    }}
                    className="p-1 text-blue-600 rounded"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteItem(child)}
                    className="p-1 text-red-600 rounded"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
        <button
          onClick={() => {
            setEditingItem(null)
            setShowForm(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Add Menu Item</span>
        </button>
      </div>

      {/* Menu Type Selector */}
      <div className="mb-6">
        <div className="flex space-x-4">
          {(['main', 'footer', 'sidebar'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedMenu(type)}
              className={`px-4 py-2 rounded-md font-medium ${
                selectedMenu === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} Menu
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Menu Items */}
      <div className="space-y-2">
        {menus.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No menu items found for {selectedMenu} menu.</p>
            <button
              onClick={() => {
                setEditingItem(null)
                setShowForm(true)
              }}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Add the first menu item
            </button>
          </div>
        ) : (
          menus.map((item, index) => renderMenuItem(item, index))
        )}
      </div>

      {/* Menu Item Form Modal */}
      {showForm && (
        <MenuItemForm
          item={editingItem}
          menuType={selectedMenu}
          onSave={() => {
            setShowForm(false)
            setEditingItem(null)
            loadMenus()
          }}
          onCancel={() => {
            setShowForm(false)
            setEditingItem(null)
          }}
        />
      )}
    </div>
  )
}

// Menu Item Form Component
interface MenuItemFormProps {
  item: MenuItem | null
  menuType: string
  onSave: () => void
  onCancel: () => void
}

function MenuItemForm({ item, menuType, onSave, onCancel }: MenuItemFormProps) {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    url: item?.url || '',
    target: item?.target || '_self',
    link_type: item?.link_type || 'external',
    is_visible: item?.is_visible ?? true,
    is_published: item?.is_published ?? true,
    requires_auth: item?.requires_auth ?? false,
    show_on_mobile: item?.show_on_mobile ?? true,
    show_on_desktop: item?.show_on_desktop ?? true,
    css_class: item?.css_class || '',
    icon: item?.icon || '',
    description: item?.description || ''
  })

  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = item ? `/api/menus/${item.id}` : '/api/menus'
      const method = item ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          menu_type: menuType
        })
      })

      if (!response.ok) throw new Error('Failed to save menu item')
      onSave()
    } catch (err) {
      console.error('Failed to save menu item:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {item ? 'Edit Menu Item' : 'Add Menu Item'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="text"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="https://example.com or /page"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link Type
              </label>
              <select
                value={formData.link_type}
                onChange={(e) => setFormData({ ...formData, link_type: e.target.value as any })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="external">External Link</option>
                <option value="internal">Internal Link</option>
                <option value="page">Page</option>
                <option value="category">Category</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target
              </label>
              <select
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value as any })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="_self">Same Window</option>
                <option value="_blank">New Window</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows={2}
              placeholder="Optional description for admin reference"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_visible}
                onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Visible</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Published</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.show_on_mobile}
                onChange={(e) => setFormData({ ...formData, show_on_mobile: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Mobile</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.show_on_desktop}
                onChange={(e) => setFormData({ ...formData, show_on_desktop: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Desktop</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : (item ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}