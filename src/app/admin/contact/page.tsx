'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdminBackButton from '@/components/AdminBackButton'
import { ContactData, QuickLink, FAQItem } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'

interface ContactSectionProps {
  title: string
  data: any
  editing: boolean
  onEdit: () => void
  onSave: (data: any) => void
  onCancel: () => void
  fields: Array<{
    key: string
    label: string
    type: string
  }>
}

interface QuickLinkSectionProps {
  title: string
  items: QuickLink[]
  onAdd: () => void
  onEdit: (item: QuickLink) => void
  onSave: (data: Partial<QuickLink>) => void
  onDelete: (id: string) => void
  onCancel: () => void
  editingItem: QuickLink | null
}

interface FAQSectionProps {
  title: string
  items: FAQItem[]
  onAdd: () => void
  onEdit: (item: FAQItem) => void
  onSave: (data: Partial<FAQItem>) => void
  onDelete: (id: string) => void
  onCancel: () => void
  editingItem: FAQItem | null
}

interface QuickLinkItemProps {
  link: QuickLink
  editing: boolean
  onEdit: () => void
  onSave: (data: Partial<QuickLink>) => void
  onCancel: () => void
  onDelete: () => void
}

interface FAQItemProps {
  faq: FAQItem
  editing: boolean
  onEdit: () => void
  onSave: (data: Partial<FAQItem>) => void
  onCancel: () => void
  onDelete: () => void
}

export default function AdminContactPage() {
  const [contactData, setContactData] = useState<ContactData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<any>(null)
  const { isAuthenticated } = useAuth()
  const { success, error } = useToast()

  const fetchContactData = useCallback(async () => {
    try {
      const response = await fetch('/api/contact')
      const result = await response.json()
      
      if (result.success) {
        setContactData(result.data)
      } else {
        error('Fel vid hämtning av kontaktdata')
      }
    } catch (err) {
      console.error('Error fetching contact data:', err)
      error('Ett fel uppstod vid hämtning av kontaktdata')
    } finally {
      setLoading(false)
    }
  }, [error])

  useEffect(() => {
    if (isAuthenticated) {
      fetchContactData()
    }
  }, [isAuthenticated, fetchContactData])

  const handleSave = async (type: string, data: any) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, data })
      })

      const result = await response.json()

      if (result.success) {
        success('Kontaktinformation uppdaterad!')
        setContactData(result.data)
        setEditingSection(null)
        setEditingItem(null)
      } else {
        if (result.error === 'Item not found') {
          error('Data har uppdaterats. Laddar om...')
          fetchContactData()
          setEditingSection(null)
          setEditingItem(null)
        } else {
          error(result.error || 'Ett fel uppstod')
        }
      }
    } catch (err) {
      console.error('Error saving contact data:', err)
      error('Ett fel uppstod vid sparandet')
    }
  }

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Är du säker på att du vill ta bort detta?')) {
      return
    }

    try {
      const response = await fetch(`/api/contact?type=${type}&id=${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        success('Borttaget!')
        setContactData(result.data)
      } else {
        error(result.error || 'Ett fel uppstod')
      }
    } catch (err) {
      console.error('Error deleting item:', err)
      error('Ett fel uppstod vid borttagning')
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-gray-600">Du måste vara inloggad för att hantera kontaktinformation.</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vgbf-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Laddar kontaktdata...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-vgbf-blue">Hantera Kontaktinformation</h1>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    fetchContactData()
                    success('Kontaktdata uppdaterad!')
                  }}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Uppdatera data
                </button>
                <AdminBackButton />
              </div>
            </div>

            {contactData && (
              <div className="space-y-8">
                {/* Main Contact Section */}
                <ContactSection
                  title="Huvudkontakt"
                  data={contactData.mainContact}
                  editing={editingSection === 'mainContact'}
                  onEdit={() => setEditingSection('mainContact')}
                  onSave={(data: any) => handleSave('mainContact', data)}
                  onCancel={() => setEditingSection(null)}
                  fields={[
                    { key: 'title', label: 'Titel', type: 'text' },
                    { key: 'name', label: 'Namn', type: 'text' },
                    { key: 'club', label: 'Klubb', type: 'text' },
                    { key: 'phone', label: 'Telefon', type: 'tel' },
                    { key: 'email', label: 'E-post', type: 'email' }
                  ]}
                />

                {/* Postal Address Section */}
                <ContactSection
                  title="Postadress"
                  data={contactData.postalAddress}
                  editing={editingSection === 'postalAddress'}
                  onEdit={() => setEditingSection('postalAddress')}
                  onSave={(data: any) => handleSave('postalAddress', data)}
                  onCancel={() => setEditingSection(null)}
                  fields={[
                    { key: 'name', label: 'Namn', type: 'text' },
                    { key: 'street', label: 'Gatuadress', type: 'text' },
                    { key: 'postalCode', label: 'Postnummer', type: 'text' },
                    { key: 'city', label: 'Stad', type: 'text' }
                  ]}
                />

                {/* Organization Number Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Organisationsnummer</h3>
                    {editingSection !== 'orgNumber' && (
                      <button
                        onClick={() => setEditingSection('orgNumber')}
                        className="text-vgbf-blue hover:text-vgbf-green text-sm font-medium"
                      >
                        Redigera
                      </button>
                    )}
                  </div>

                  {editingSection === 'orgNumber' ? (
                    <OrgNumberEditor
                      initialValue={contactData.organizationNumber}
                      onSave={(value: any) => handleSave('organizationNumber', value)}
                      onCancel={() => setEditingSection(null)}
                    />
                  ) : (
                    <p className="text-gray-600">{contactData.organizationNumber}</p>
                  )}
                </div>

                {/* Quick Links Section */}
                <QuickLinksSection
                  quickLinks={contactData.quickLinks}
                  onSave={(data: Partial<QuickLink>) => handleSave('quickLink', data)}
                  onDelete={(id: string) => handleDelete('quickLink', id)}
                />

                {/* FAQ Section */}
                <FAQSection
                  faqItems={contactData.faqItems}
                  onSave={(data: Partial<FAQItem>) => handleSave('faqItem', data)}
                  onDelete={(id: string) => handleDelete('faqItem', id)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}

// Helper Components
function ContactSection({ title, data, editing, onEdit, onSave, onCancel, fields }: ContactSectionProps) {
  const [formData, setFormData] = useState(data)

  useEffect(() => {
    setFormData(data)
  }, [data])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {!editing && (
          <button
            onClick={onEdit}
            className="text-vgbf-blue hover:text-vgbf-green text-sm font-medium"
          >
            Redigera
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field: any) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                value={formData[field.key] || ''}
                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vgbf-blue"
                required
              />
            </div>
          ))}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-vgbf-blue text-white rounded-lg hover:bg-vgbf-green"
            >
              Spara
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Avbryt
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-2">
          {fields.map((field: any) => (
            <p key={field.key} className="text-gray-600">
              <span className="font-medium">{field.label}:</span> {data[field.key]}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

function OrgNumberEditor({ initialValue, onSave, onCancel }: any) {
  const [value, setValue] = useState(initialValue)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(value)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vgbf-blue"
        placeholder="Organisationsnummer"
        required
      />
      <div className="flex gap-3">
        <button
          type="submit"
          className="px-4 py-2 bg-vgbf-blue text-white rounded-lg hover:bg-vgbf-green"
        >
          Spara
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Avbryt
        </button>
      </div>
    </form>
  )
}

function QuickLinksSection({ quickLinks, onSave, onDelete }: any) {
  const [editing, setEditing] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Snabblänkar</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-vgbf-blue text-white px-4 py-2 rounded-lg hover:bg-vgbf-green text-sm"
        >
          Lägg till länk
        </button>
      </div>

      <div className="space-y-4">
        {quickLinks
          .filter((link: QuickLink) => link.isActive)
          .sort((a: QuickLink, b: QuickLink) => a.order - b.order)
          .map((link: QuickLink) => (
            <QuickLinkItem
              key={link.id}
              link={link}
              editing={editing === link.id}
              onEdit={() => setEditing(link.id)}
              onSave={(data) => {
                onSave({ ...data, id: link.id })
                setEditing(null)
              }}
              onCancel={() => setEditing(null)}
              onDelete={() => onDelete(link.id)}
            />
          ))}

        {showAddForm && (
          <QuickLinkItem
            link={{
              id: '',
              title: '',
              description: '',
              url: '',
              isExternal: false,
              order: quickLinks.length + 1,
              isActive: true
            }}
            editing={true}
            onSave={(data: Partial<QuickLink>) => {
              onSave(data)
              setShowAddForm(false)
            }}
            onCancel={() => setShowAddForm(false)}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        )}
      </div>
    </div>
  )
}

function QuickLinkItem({ link, editing, onEdit, onSave, onCancel, onDelete }: QuickLinkItemProps) {
  const [formData, setFormData] = useState(link)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (editing) {
    return (
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded border space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vgbf-blue"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivning</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vgbf-blue"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vgbf-blue"
            required
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isExternal"
              checked={formData.isExternal}
              onChange={(e) => setFormData({ ...formData, isExternal: e.target.checked })}
              className="h-4 w-4 text-vgbf-blue focus:ring-vgbf-blue border-gray-300 rounded"
            />
            <label htmlFor="isExternal" className="ml-2 text-sm text-gray-700">
              Extern länk
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ordning</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
              className="w-20 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vgbf-blue"
              min="1"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 bg-vgbf-blue text-white rounded hover:bg-vgbf-green"
          >
            Spara
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Avbryt
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="bg-white p-4 rounded border">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900">{link.title}</h4>
          <p className="text-sm text-gray-600">{link.description}</p>
          <p className="text-sm text-gray-500">
            {link.url} {link.isExternal && '(extern länk)'}
          </p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-vgbf-blue hover:text-vgbf-green text-sm font-medium"
            >
              Redigera
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Ta bort
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function FAQSection({ faqItems, onSave, onDelete }: any) {
  const [editing, setEditing] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Vanliga frågor</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-vgbf-blue text-white px-4 py-2 rounded-lg hover:bg-vgbf-green text-sm"
        >
          Lägg till fråga
        </button>
      </div>

      <div className="space-y-4">
        {faqItems
          .filter((faq: FAQItem) => faq.isActive)
          .sort((a: FAQItem, b: FAQItem) => a.order - b.order)
          .map((faq: FAQItem) => (
            <FAQItemComponent
              key={faq.id}
              faq={faq}
              editing={editing === faq.id}
              onEdit={() => setEditing(faq.id)}
              onSave={(data: Partial<FAQItem>) => {
                onSave({ ...data, id: faq.id })
                setEditing(null)
              }}
              onCancel={() => setEditing(null)}
              onDelete={() => onDelete(faq.id)}
            />
          ))}

        {showAddForm && (
          <FAQItemComponent
            faq={{
              id: '',
              question: '',
              answer: '',
              order: faqItems.length + 1,
              isActive: true
            }}
            editing={true}
            onSave={(data: Partial<FAQItem>) => {
              onSave(data)
              setShowAddForm(false)
            }}
            onCancel={() => setShowAddForm(false)}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        )}
      </div>
    </div>
  )
}

function FAQItemComponent({ faq, editing, onEdit, onSave, onCancel, onDelete }: FAQItemProps) {
  const [formData, setFormData] = useState(faq)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (editing) {
    return (
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded border space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fråga</label>
          <input
            type="text"
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vgbf-blue"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Svar</label>
          <textarea
            value={formData.answer}
            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vgbf-blue"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ordning</label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
            className="w-20 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vgbf-blue"
            min="1"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 bg-vgbf-blue text-white rounded hover:bg-vgbf-green"
          >
            Spara
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Avbryt
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="bg-white p-4 rounded border">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
          <p className="text-sm text-gray-600">{faq.answer}</p>
        </div>
        <div className="flex gap-2 ml-4">
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-vgbf-blue hover:text-vgbf-green text-sm font-medium"
            >
              Redigera
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Ta bort
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
