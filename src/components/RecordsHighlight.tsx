import Link from 'next/link'

export default function RecordsHighlight() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-vgbf-blue mb-6">Distriktsrekord</h2>
          <p className="text-gray-600 text-lg mb-8">
            Upptäck våra distriktsrekord inom olika kategorier och klasser. 
            Nu samlade på ett ställe för enkel åtkomst och uppdatering.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-2xl font-bold text-vgbf-blue mb-2">🏹</div>
              <h3 className="font-semibold text-vgbf-blue mb-2">Utomhus</h3>
              <p className="text-gray-600 text-sm">
                70m/60m/50m/40m/30m 72/15 pilar
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-2xl font-bold text-vgbf-green mb-2">🎯</div>
              <h3 className="font-semibold text-vgbf-blue mb-2">Inomhus</h3>
              <p className="text-gray-600 text-sm">
                18m/12m 15 & 30 pilar
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-2xl font-bold text-vgbf-gold mb-2">🏆</div>
              <h3 className="font-semibold text-vgbf-blue mb-2">900 Rond</h3>
              <p className="text-gray-600 text-sm">
                Fältbåge kategorier
              </p>
            </div>
          </div>
          
          <Link 
            href="/distriktsrekord"
            className="inline-flex items-center px-8 py-3 bg-vgbf-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Se alla distriktsrekord
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
