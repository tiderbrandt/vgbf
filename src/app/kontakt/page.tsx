'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ContactData } from '@/types'

export default function KontaktPage() {
  const [contactData, setContactData] = useState<ContactData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContactData()
  }, [])

  const fetchContactData = async () => {
    try {
      const response = await fetch('/api/contact')
      const result = await response.json()
      
      if (result.success) {
        setContactData(result.data)
      }
    } catch (error) {
      console.error('Error fetching contact data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Laddar kontaktinformation...</p>
        </div>
        <Footer />
      </main>
    )
  }

  if (!contactData) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Kunde inte ladda kontaktinformation.</p>
        </div>
        <Footer />
      </main>
    )
  }
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="bg-gray-50">
        {/* Hero Section */}
        <div className="bg-vgbf-blue text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Kontakt</h1>
            <p className="text-blue-100 mt-2">
              Västra Götalands Bågskytteförbund
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-vgbf-blue mb-4">Kontaktinformation</h2>
              
              <div className="space-y-4">
                {contactData.mainContact && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{contactData.mainContact.title}</h3>
                    <p className="text-gray-600">{contactData.mainContact.name}</p>
                    <p className="text-gray-600">{contactData.mainContact.club}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Telefon:</span>{' '}
                      <a href={`tel:${contactData.mainContact.phone.replace(/\s/g, '')}`} className="text-vgbf-blue hover:underline">
                        {contactData.mainContact.phone}
                      </a>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">E-post:</span>{' '}
                      <a href={`mailto:${contactData.mainContact.email}`} className="text-vgbf-blue hover:underline">
                        {contactData.mainContact.email}
                      </a>
                    </p>
                  </div>
                )}

                {contactData.postalAddress && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Postadress</h3>
                    <p className="text-gray-600">
                      {contactData.postalAddress.name}<br />
                      {contactData.postalAddress.street}<br />
                      {contactData.postalAddress.postalCode} {contactData.postalAddress.city}
                    </p>
                  </div>
                )}

                {contactData.organizationNumber && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Organisationsnummer</h3>
                    <p className="text-gray-600">{contactData.organizationNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-vgbf-blue mb-4">Snabblänkar</h2>
              
              <div className="space-y-3">
                {contactData.quickLinks
                  .filter(link => link.isActive)
                  .sort((a, b) => a.order - b.order)
                  .map((link) => (
                    <a 
                      key={link.id}
                      href={link.url}
                      {...(link.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="block p-3 border rounded hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-medium text-vgbf-blue">{link.title}</h3>
                      <p className="text-sm text-gray-600">{link.description}</p>
                    </a>
                  ))}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-vgbf-blue mb-4">Vanliga frågor</h2>
            
            <div className="space-y-4">
              {contactData.faqItems
                .filter(faq => faq.isActive)
                .sort((a, b) => a.order - b.order)
                .map((faq) => (
                  <div key={faq.id}>
                    <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-vgbf-blue hover:underline">$1</a>') }} />
                  </div>
                ))}
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-8 text-center text-sm text-gray-500">
            Sidan uppdaterad {contactData.lastUpdated ? 
              new Date(contactData.lastUpdated).toLocaleDateString('sv-SE', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              }) : 
              new Date().toLocaleDateString('sv-SE', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })
            }
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
