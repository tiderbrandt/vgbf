import Header from '@/components/Header'
import Hero from '@/components/Hero'
import SimpleNewsSection from '@/components/SimpleNewsSection'
import RecordsHighlight from '@/components/RecordsHighlight'
import SponsorsSection from '@/components/SponsorsSection'
import UpcomingEvents from '@/components/UpcomingEvents'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      
      {/* Om Västra Götalands Bågskytteförbund - Overview Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-vgbf-blue mb-6">Om Västra Götalands Bågskytteförbund</h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Västra Götalands Bågskytteförbund (VGBF) är det regionala förbundet som samlar bågskyttar 
              i Västra Götalands län. Vi arbetar för att utveckla och främja bågskyttesporten genom att 
              koordinera tävlingar, utbildningar och stödja våra medlemsklubbar i deras verksamhet.
            </p>
            <div className="grid gap-6 md:grid-cols-3 text-center">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-vgbf-blue mb-2">25+</div>
                <div className="text-gray-600">Aktiva klubbar</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-vgbf-green mb-2">1000+</div>
                <div className="text-gray-600">Aktiva medlemmar</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-orange-500 mb-2">50+</div>
                <div className="text-gray-600">Tävlingar per år</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* About VGBF Information Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-vgbf-blue mb-4">Om Västra Götalands Bågskytteförbund</h2>
              <p className="text-lg text-gray-600">
                Vi samlar bågskyttar i Västra Götaland och arbetar för att utveckla och främja bågskyttesporten
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold text-vgbf-blue mb-4">Vad vi gör</h3>
                <p className="text-gray-600 mb-4">
                  VGBF ansvarar för bågskyttesporten i Västra Götalands län och arbetar för att:
                </p>
                <ul className="text-gray-600 space-y-2">
                  <li>• Koordinera tävlingar och utbildningar</li>
                  <li>• Stödja klubbarna i deras verksamhet</li>
                  <li>• Hantera distriktsrekord och ranking</li>
                  <li>• Främja säker och rolig bågskyttesport</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold text-vgbf-blue mb-4">Kom igång med bågskytte</h3>
                <p className="text-gray-600 mb-4">
                  Intresserad av att börja med bågskytte? Här är vad du behöver veta:
                </p>
                <ul className="text-gray-600 space-y-2">
                  <li>• Kontakta en lokal klubb för nybörjarkurs</li>
                  <li>• Ingen egen utrustning behövs till att börja</li>
                  <li>• Bågskytte passar alla åldrar och förmågor</li>
                  <li>• Säker och social sport för hela familjen</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-vgbf-blue mb-4">Kontakta oss</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Allmänna frågor</h4>
                  <p className="text-gray-600">För frågor om förbundet, tävlingar eller verksamhet</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Hitta en klubb</h4>
                  <p className="text-gray-600">
                    Se vår <a href="/klubbar" className="text-vgbf-blue hover:underline">klubblista</a> för att hitta närmaste klubb
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Tävlingar</h4>
                  <p className="text-gray-600">Information om kommande tävlingar och anmälan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News and Events Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6 text-center md:text-left">
          <h2 className="text-2xl font-bold text-vgbf-blue">Aktuella nyheter & evenemang</h2>
          <p className="text-gray-600 mt-2">Senaste nytt, viktiga meddelanden och kommande publika evenemang.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <SimpleNewsSection />
          </div>

          <div className="md:col-span-1">
            <div className="md:sticky md:top-24">
              <UpcomingEvents />
            </div>
          </div>
        </div>
      </section>

      {/* Membership and Activities Information */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-vgbf-blue mb-4">Medlemskap och verksamhet</h2>
              <p className="text-lg text-gray-600">
                Upptäck fördelarna med att vara medlem i en av våra klubbar
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="bg-vgbf-blue text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Gemenskap</h3>
                <p className="text-gray-600">
                  Träffa likasinnade och bygg vänskap genom gemensam passion för bågskytte
                </p>
              </div>

              <div className="text-center">
                <div className="bg-vgbf-green text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Tävlingar</h3>
                <p className="text-gray-600">
                  Delta i lokala, regionala och nationella tävlingar för att utveckla din förmåga
                </p>
              </div>

              <div className="text-center">
                <div className="bg-orange-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Utbildning</h3>
                <p className="text-gray-600">
                  Få tillgång till kurser, instruktörer och kontinuerlig utveckling av din teknik
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Records and Sponsors side by side */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <RecordsHighlight />
            </div>
            <div>
              <SponsorsSection />
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  )
}
