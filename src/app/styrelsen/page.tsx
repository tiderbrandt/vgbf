'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PageHero from '@/components/PageHero'
import { BoardData } from '@/types'

export default function StylesenPage() {
  const [boardData, setBoardData] = useState<BoardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBoardData()
  }, [])

  const fetchBoardData = async () => {
    try {
      const response = await fetch('/api/board')
      const result = await response.json()
      
      if (result.success) {
        setBoardData(result.data)
      }
    } catch (error) {
      console.error('Error fetching board data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Laddar styrelsedata...</p>
        </div>
        <Footer />
      </main>
    )
  }

  if (!boardData) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Kunde inte ladda styrelsedata.</p>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <PageHero 
        title="Styrelsen"
        description="Västra Götalands Bågskytteförbund styrelse sammansatt efter årsmötet 30/3 2025"
        subtitle="Styrelsen arbetar för att främja bågskyttet i regionen och stödja våra medlemsklubbar."
      />
      
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Introduction */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-vgbf-blue mb-4">Om styrelsen</h2>
            <p className="text-gray-600 mb-4">
              {boardData.meetingInfo?.description || 
               'Styrelsen för Västra Götalands Bågskytteförbund arbetar för att främja bågskyttet i regionen och stödja våra medlemsklubbar. Vi träffas regelbundet för att diskutera förbundets verksamhet, ekonomi och framtida utveckling.'}
            </p>
            <p className="text-gray-600">
              {boardData.meetingInfo?.contactInfo || 
               'Har du frågor eller förslag till styrelsen? Kontakta oss gärna via e-post eller telefon.'}
            </p>
          </div>

          {/* Board Members */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="bg-vgbf-green text-white px-6 py-3 rounded-t-lg">
              <h3 className="text-lg font-semibold">Styrelseledamöter</h3>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {boardData.boardMembers
                  .filter(member => member.isActive)
                  .sort((a, b) => a.order - b.order)
                  .map((member) => (
                  <div key={member.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="mb-3">
                      <h4 className="font-semibold text-vgbf-blue text-lg">{member.name}</h4>
                      <p className="text-sm font-medium text-vgbf-green">{member.title}</p>
                      <p className="text-sm text-gray-600">{member.club}</p>
                    </div>
                    
                    {member.description && (
                      <p className="text-sm text-gray-600 mb-3">{member.description}</p>
                    )}
                    
                    {(member.email || member.phone) && (
                      <div className="text-sm">
                        {member.email && (
                          <p className="mb-1">
                            <span className="font-medium">E-post:</span>{' '}
                            <a href={`mailto:${member.email}`} className="text-vgbf-blue hover:underline">
                              {member.email}
                            </a>
                          </p>
                        )}
                        {member.phone && (
                          <p>
                            <span className="font-medium">Telefon:</span>{' '}
                            <a href={`tel:${member.phone}`} className="text-vgbf-blue hover:underline">
                              {member.phone}
                            </a>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Other Roles */}
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Substitutes */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="bg-vgbf-gold text-vgbf-blue px-6 py-3 rounded-t-lg">
                <h3 className="text-lg font-semibold">Suppleanter</h3>
              </div>
              <div className="p-6">
                {boardData.substitutes
                  .filter(member => member.isActive)
                  .sort((a, b) => a.order - b.order)
                  .map((substitute) => (
                  <div key={substitute.id} className="mb-3 last:mb-0">
                    <p className="font-medium text-gray-900">{substitute.name}</p>
                    <p className="text-sm text-gray-600">{substitute.club}</p>
                    {substitute.description && substitute.description !== 'Suppleant i styrelsen.' && (
                      <p className="text-sm text-gray-500 mt-1">{substitute.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Auditors */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="bg-vgbf-gold text-vgbf-blue px-6 py-3 rounded-t-lg">
                <h3 className="text-lg font-semibold">Revisorer</h3>
              </div>
              <div className="p-6">
                {boardData.auditors
                  .filter(member => member.isActive)
                  .sort((a, b) => a.order - b.order)
                  .map((auditor) => (
                  <div key={auditor.id} className="mb-3 last:mb-0">
                    <p className="font-medium text-gray-900">{auditor.name}</p>
                    <p className="text-sm text-gray-600">{auditor.club}</p>
                    {auditor.description && auditor.description !== 'Revisor för förbundet.' && (
                      <p className="text-sm text-gray-500 mt-1">{auditor.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Nomination Committee */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="bg-vgbf-gold text-vgbf-blue px-6 py-3 rounded-t-lg">
                <h3 className="text-lg font-semibold">Valberedning</h3>
              </div>
              <div className="p-6">
                {boardData.nominationCommittee
                  .filter(member => member.isActive)
                  .sort((a, b) => a.order - b.order)
                  .map((member) => (
                  <div key={member.id} className="mb-3 last:mb-0">
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.club}</p>
                    <p className="text-xs text-vgbf-green font-medium">{member.title}</p>
                    {member.description && member.title && typeof member.title === 'string' && !member.title.includes(member.description) && (
                      <p className="text-sm text-gray-500 mt-1">{member.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold text-vgbf-blue mb-4">Kontaktinformation</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Postadress</h4>
                <p className="text-gray-600">
                  Bengt Idéhn<br />
                  Änghagsliden 114<br />
                  423 49 Torslanda
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Kontakt</h4>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Telefon:</span>{' '}
                  <a href="tel:0705463466" className="text-vgbf-blue hover:underline">
                    0705 46 34 66
                  </a>
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">E-post:</span>{' '}
                  <a href="mailto:VastraGotalandsBF@bagskytte.se" className="text-vgbf-blue hover:underline">
                    VastraGotalandsBF@bagskytte.se
                  </a>
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Organisationsnummer:</span> 857500-2954
                </p>
              </div>
            </div>
          </div>

          {/* Meeting Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold text-vgbf-blue mb-4">Styrelsemöten</h3>
            <p className="text-gray-600 mb-4">
              Styrelsen träffas regelbundet via Teams för att diskutera löpande frågor 
              och planera förbundets verksamhet. Styrelseprotokoll finns tillgängliga 
              för medlemsklubbar.
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Mötesplats:</span> Via Teams
            </p>
          </div>

          {/* Last Updated */}
          <div className="text-center text-sm text-gray-500">
            Sidan uppdaterad {boardData.lastUpdated ? 
              new Date(boardData.lastUpdated).toLocaleDateString('sv-SE', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              }) : 
              '20 augusti 2025'
            }
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
