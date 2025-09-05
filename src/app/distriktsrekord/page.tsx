import Link from 'next/link'
import { getDistrictRecords } from '@/lib/records-storage-blob'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default async function DistriktsrekordPage() {
  const records = await getDistrictRecords()

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
      <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-vgbf-blue text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Distriktsrekord</h1>
          <p className="text-blue-100 mt-2">
            Västra Götalands Bågskytteförbund officiella distriktsrekord
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Information section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-vgbf-blue mb-4">Information om distriktsrekord</h2>
          <div className="prose max-w-none text-gray-600">
            <p className="mb-4">
              Anmälan om distriktsrekord skall vara VGBF tillhanda senast 3 veckor efter 
              tävlingen på mail till{' '}
              <a href="mailto:VastraGotalandsBF@bagskytte.se" className="text-vgbf-blue hover:underline">
                VastraGotalandsBF@bagskytte.se
              </a>
            </p>
            <p className="mb-4">
              Följande information skall vara med i mailet: Namn, Klass, Resultat, Arrangör 
              och Länk till tävlingen från resultat.bagskytte.se. Vid lagrekord skall alla 
              skyttar i laget vara med i mailet till VGBF.
            </p>
            <p className="text-sm text-gray-500">
              Från och med 2025 är inte längre rekord från U16 med, då denna klass ersätts av U15 och U18.
            </p>
          </div>
        </div>

        {/* Records by category */}
        {Object.keys(groupedRecords).length > 0 ? (
          Object.entries(groupedRecords).map(([category, categoryRecords]: [string, any]) => (
            <div key={category} className="bg-white rounded-lg shadow-md mb-6">
              <div className="bg-vgbf-green text-white px-6 py-3 rounded-t-lg">
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
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">Inga distriktsrekord hittades.</p>
          </div>
        )}

        {/* Back to home */}
        <div className="text-center mt-8">
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-vgbf-blue hover:bg-blue-700 transition-colors"
          >
            Tillbaka till startsidan
          </Link>
        </div>

        {/* Last updated */}
        <div className="text-center mt-4 text-sm text-gray-500">
          Sidan uppdaterad {new Date().toLocaleDateString('sv-SE')}
        </div>
      </div>
      </div>
      <Footer />
    </main>
  )
}
