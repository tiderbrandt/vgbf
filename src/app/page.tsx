import Header from '@/components/Header'
import Hero from '@/components/Hero'
import SimpleNewsSection from '@/components/SimpleNewsSection'
import SponsorsSection from '@/components/SponsorsSection'
import UpcomingEvents from '@/components/UpcomingEvents'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      
      {/* Om Västra Götalands Bågskytteförbund - Overview Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-vgbf-blue mb-6">
                Om Västra Götalands Bågskytteförbund
              </h2>
              <p className="text-xl text-gray-700 mb-12 leading-relaxed max-w-4xl mx-auto">
                Västra Götalands Bågskytteförbund (VGBF) är det regionala förbundet som samlar bågskyttar 
                i Västra Götalands län. Vi arbetar för att utveckla och främja bågskyttesporten genom att 
                koordinera tävlingar, utbildningar och stödja våra medlemsklubbar i deras verksamhet.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="text-center">
                  <div className="text-5xl font-bold text-vgbf-blue mb-3">12</div>
                  <div className="text-lg font-semibold text-gray-800 mb-2">Aktiva klubbar</div>
                  <div className="text-gray-600">Spridda över hela Västra Götaland</div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="text-center">
                  <div className="text-5xl font-bold text-vgbf-green mb-3">300+</div>
                  <div className="text-lg font-semibold text-gray-800 mb-2">Aktiva medlemmar</div>
                  <div className="text-gray-600">Från nybörjare till elitskyttar</div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="text-center">
                  <div className="text-5xl font-bold text-orange-500 mb-3">12+</div>
                  <div className="text-lg font-semibold text-gray-800 mb-2">Tävlingar per år</div>
                  <div className="text-gray-600">För alla åldrar och nivåer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Membership and Activities Information */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-vgbf-blue mb-6">
                Medlemskap och verksamhet
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Upptäck fördelarna med att vara medlem i en av våra klubbar och bli en del av bågskyttegemenskapen
              </p>
            </div>
            
            <div className="grid gap-12 md:grid-cols-3">
              <div className="text-center group">
                <div className="bg-gradient-to-br from-vgbf-blue to-blue-600 text-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Gemenskap</h3>
                <p className="text-gray-600 leading-relaxed">
                  Träffa likasinnade och bygg vänskap genom gemensam passion för bågskytte. 
                  Upplev kamratskap och stöd i en varm och välkomnande miljö.
                </p>
              </div>

              <div className="text-center group">
                <div className="bg-gradient-to-br from-vgbf-green to-green-600 text-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Tävlingar</h3>
                <p className="text-gray-600 leading-relaxed">
                  Delta i lokala, regionala och nationella tävlingar för att utveckla din förmåga. 
                  Testa dina färdigheter och mät dig mot andra skyttar.
                </p>
              </div>

              <div className="text-center group">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Utbildning</h3>
                <p className="text-gray-600 leading-relaxed">
                  Få tillgång till kurser, instruktörer och kontinuerlig utveckling av din teknik. 
                  Lär dig från erfarna skyttar och utveckla dina färdigheter.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-vgbf-blue mb-6">
                Aktuella nyheter
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Håll dig uppdaterad med senaste nytt och viktiga meddelanden från VGBF
              </p>
            </div>

            <SimpleNewsSection />
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-vgbf-blue mb-6">
                Kommande evenemang
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Kommande publika evenemang och aktiviteter inom förbundet
              </p>
            </div>

            <UpcomingEvents />
          </div>
        </div>
      </section>
      
      {/* Sponsors Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <SponsorsSection />
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  )
}
