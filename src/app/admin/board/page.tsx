'use client'

import { useState, useEffect, useCallback } from 'react'
import { BoardMember, BoardData } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'

interface BoardMemberFormData {
  id?: string
  title: string
  name: string
  club: string
  email: string
  phone: string
  description: string
  order: number
  category: 'board' | 'substitute' | 'auditor' | 'nomination'
  isActive: boolean
}

const initialFormData: BoardMemberFormData = {
  title: '',
  name: '',
  club: '',
  email: '',
  phone: '',
  description: '',
  order: 1,
  category: 'board',
  isActive: true
}

const categoryNames = {
  board: 'Styrelseledamöter',
  substitute: 'Suppleanter',
  auditor: 'Revisorer',
  nomination: 'Valberedning'
}

const commonTitles = {
  board: ['Ordförande', 'Vice ordförande', 'Sekreterare', 'Kassör', 'Ordinarie ledamot'],
  substitute: ['Suppleant'],
  auditor: ['Revisor', 'Revisorsuppleant'],
  nomination: ['Ordförande för valberedningen', 'Ledamot valberedning']
}

export default function AdminBoardPage() {
  const [boardData, setBoardData] = useState<BoardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingMember, setEditingMember] = useState<BoardMember | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<BoardMemberFormData>(initialFormData)
  const [activeCategory, setActiveCategory] = useState<'board' | 'substitute' | 'auditor' | 'nomination'>('board')
  const { isAuthenticated } = useAuth()
  const { success, error } = useToast()

  const fetchBoardData = useCallback(async () => {
    try {
      const response = await fetch('/api/board')
      const result = await response.json()
      
      if (result.success) {
        setBoardData(result.data)
      } else {
        error('Fel vid hämtning av styrelsedata')
      }
    } catch (err) {
      console.error('Error fetching board data:', err)
      error('Fel vid hämtning av styrelsedata')
    } finally {
      setLoading(false)
    }
  }, [error])

  useEffect(() => {
    if (isAuthenticated) {
      fetchBoardData()
    }
  }, [isAuthenticated, fetchBoardData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const method = editingMember ? 'PUT' : 'POST'
      const url = '/api/board'
      
      const submitData = {
        ...formData,
        ...(editingMember && { id: editingMember.id })
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      const result = await response.json()

      if (result.success) {
        success(
          editingMember ? 'Styrelseledamot uppdaterad!' : 'Styrelseledamot tillagd!'
        )
        setShowForm(false)
        setEditingMember(null)
        setFormData(initialFormData)
        fetchBoardData()
      } else {
        error(result.error || 'Ett fel uppstod')
      }
    } catch (err) {
      console.error('Error submitting form:', err)
      error('Ett fel uppstod vid sparandet')
    }
  }

  const handleEdit = (member: BoardMember) => {
    setFormData({
      id: member.id,
      title: member.title,
      name: member.name,
      club: member.club,
      email: member.email || '',
      phone: member.phone || '',
      description: member.description,
      order: member.order,
      category: member.category,
      isActive: member.isActive
    })
    setEditingMember(member)
    setShowForm(true)
  }

  const handleDelete = async (member: BoardMember) => {
    if (!confirm(`Är du säker på att du vill ta bort ${member.name}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/board?id=${member.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        success('Styrelseledamot borttagen!')
        fetchBoardData()
      } else {
        error(result.error || 'Ett fel uppstod')
      }
    } catch (err) {
      console.error('Error deleting member:', err)
      error('Ett fel uppstod vid borttagning')
    }
  }

  const resetForm = () => {
    setFormData({ ...initialFormData, category: activeCategory })
    setEditingMember(null)
    setShowForm(false)
  }

  const getCurrentCategoryMembers = () => {
    if (!boardData) return []
    
    switch (activeCategory) {
      case 'board':
        return boardData.boardMembers.sort((a, b) => a.order - b.order)
      case 'substitute':
        return boardData.substitutes.sort((a, b) => a.order - b.order)
      case 'auditor':
        return boardData.auditors.sort((a, b) => a.order - b.order)
      case 'nomination':
        return boardData.nominationCommittee.sort((a, b) => a.order - b.order)
      default:
        return []
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <p>Du måste vara inloggad för att hantera styrelsen.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Laddar styrelsedata...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Hantera Styrelsen</h1>
        <button
          onClick={() => {
            setFormData({ ...initialFormData, category: activeCategory })
            setShowForm(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Lägg till person
        </button>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {Object.entries(categoryNames).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeCategory === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Members List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {categoryNames[activeCategory]}
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {getCurrentCategoryMembers().map((member) => (
            <div key={member.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-medium text-gray-900">{member.name}</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {member.title}
                    </span>
                    {!member.isActive && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inaktiv
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">{member.club}</span>
                  </p>
                  {member.email && (
                    <p className="text-sm text-gray-600">
                      E-post: <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">{member.email}</a>
                    </p>
                  )}
                  {member.phone && (
                    <p className="text-sm text-gray-600">
                      Telefon: <a href={`tel:${member.phone}`} className="text-blue-600 hover:underline">{member.phone}</a>
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-2">{member.description}</p>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(member)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Redigera
                  </button>
                  <button
                    onClick={() => handleDelete(member)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Ta bort
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {getCurrentCategoryMembers().length === 0 && (
            <div className="p-6 text-center text-gray-500">
              Inga personer i denna kategori än.
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingMember ? 'Redigera person' : 'Lägg till person'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Stäng</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titel/Roll *
                    </label>
                    <select
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Välj titel</option>
                      {commonTitles[formData.category].map(title => (
                        <option key={title} value={title}>{title}</option>
                      ))}
                      <option value="custom">Annan titel...</option>
                    </select>
                    {formData.title === 'custom' && (
                      <input
                        type="text"
                        placeholder="Ange anpassad titel"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        category: e.target.value as any,
                        title: '' // Reset title when category changes
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {Object.entries(categoryNames).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Namn *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Klubb *
                    </label>
                    <input
                      type="text"
                      value={formData.club}
                      onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-post
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ordning
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                      Aktiv
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beskrivning *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingMember ? 'Uppdatera' : 'Lägg till'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
