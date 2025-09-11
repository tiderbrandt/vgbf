import Link from 'next/link'
import { getAllRecords as getDistrictRecords } from '@/lib/records-storage-postgres'
import { getDistriktsrekordInfo } from '@/lib/settings-storage-postgres'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PageHero from '@/components/PageHero'

// Function to format text with email links
function formatTextWithEmailLinks(text: string) {
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
  const parts = text.split(emailRegex)
  
  return parts.map((part, index) => {
    if (emailRegex.test(part)) {
      return (
        <a 
          key={index} 
          href={`mailto:${part}`} 
          className="text-vgbf-blue hover:underline"
        >
          {part}
        </a>
      )
    }
    return part
  })
}

export default async function DistriktsrekordPage() {
  const records = await getDistrictRecords()
  
  // Get the distriktsrekord information from database
  let distriktsrekordInfo = ''
  try {
    const infoResult = await getDistriktsrekordInfo()
    if (infoResult.success && infoResult.data) {
      distriktsrekordInfo = infoResult.data
    }
  } catch (error) {
    console.error('Error loading distriktsrekord info:', error)
  }

  // Group records by category
  const groupedRecords = records.reduce((acc: any, record: any) => {
    const category = record.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(record)
    return acc
  }, {})

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <PageHero 
        title="Distriktsrekord"
        description="Västra Götalands Bågskytteförbund officiella distriktsrekord"
        subtitle="Här hittar du alla aktuella distriktsrekord för Västra Götaland i bågskytesporten."
      />

      
      {/* Content section with consistent styling */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6 text-center md:text-left">
          <h2 className="text-2xl font-bold text-vgbf-blue">Information om distriktsrekord</h2>
          <p className="text-gray-600 mt-2">Anmälan och regler för distriktsrekord.</p>
        </div>
        
        {/* Information section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <div className="prose max-w-none text-gray-600">
            {distriktsrekordInfo ? (
              distriktsrekordInfo.split('\n').map((paragraph, index) => {
                if (paragraph.trim() === '') return <br key={index} />
                return (
                  <p key={index} className="mb-4">
                    {formatTextWithEmailLinks(paragraph)}
                  </p>
                )
              })
            ) : (
              <p className="text-gray-500 italic">
                Ingen information tillgänglig. Kontakta administratör för att uppdatera innehållet.
              </p>
            )}
          </div>
        </div>

        
        {/* Records section */}
        <div className="mb-6 text-center md:text-left">
          <h2 className="text-2xl font-bold text-vgbf-blue">Aktuella distriktsrekord</h2>
          <p className="text-gray-600 mt-2">Alla gällande rekord för Västra Götaland sorterade per kategori.</p>
        </div>

        {/* Records by category */}
        {Object.keys(groupedRecords).length > 0 ? (
          Object.entries(groupedRecords).map(([category, categoryRecords]: [string, any]) => (
            <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
              <div className="bg-gradient-to-r from-vgbf-green to-green-600 text-white px-6 py-4 rounded-t-lg">
                <h3 className="text-lg font-semibold">{category}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Klass
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Namn
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Klubb
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resultat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Datum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tävling
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoryRecords.map((record: any) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.class}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.club}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-vgbf-blue">
                          {record.score}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.date).toLocaleDateString('sv-SE')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.competitionUrl ? (
                            <a 
                              href={record.competitionUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-vgbf-blue hover:underline"
                            >
                              {record.competition}
                            </a>
                          ) : (
                            record.competition
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">Inga distriktsrekord hittades.</p>
          </div>
        )}

        {/* Back to home */}
        <div className="text-center mt-12">
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-vgbf-blue to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm"
          >
            Tillbaka till startsidan
          </Link>
        </div>

        {/* Last updated */}
        <div className="text-center mt-4 text-sm text-gray-500">
          Sidan uppdaterad {new Date().toLocaleDateString('sv-SE')}
        </div>
      </section>
      
      <Footer />
    </main>
  )
}
