import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function KontaktPage() {
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
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ordförande</h3>
                  <p className="text-gray-600">Bengt Idéhn</p>
                  <p className="text-gray-600">BS Gothia</p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Telefon:</span>{' '}
                    <a href="tel:0705463466" className="text-vgbf-blue hover:underline">
                      0705 46 34 66
                    </a>
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">E-post:</span>{' '}
                    <a href="mailto:VastraGotalandsBF@bagskytte.se" className="text-vgbf-blue hover:underline">
                      VastraGotalandsBF@bagskytte.se
                    </a>
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Postadress</h3>
                  <p className="text-gray-600">
                    Bengt Idéhn<br />
                    Änghagsliden 114<br />
                    423 49 Torslanda
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Organisationsnummer</h3>
                  <p className="text-gray-600">857500-2954</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-vgbf-blue mb-4">Snabblänkar</h2>
              
              <div className="space-y-3">
                <a 
                  href="/styrelsen" 
                  className="block p-3 border rounded hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-vgbf-blue">Styrelsen</h3>
                  <p className="text-sm text-gray-600">Kontaktuppgifter till alla styrelseledamöter</p>
                </a>

                <a 
                  href="/klubbar" 
                  className="block p-3 border rounded hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-vgbf-blue">Medlemsklubbar</h3>
                  <p className="text-sm text-gray-600">Hitta kontaktuppgifter till våra klubbar</p>
                </a>

                <a 
                  href="https://www.bagskytte.se" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 border rounded hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-vgbf-blue">Svenska Bågskytteförbundet</h3>
                  <p className="text-sm text-gray-600">Nationella förbundets webbplats</p>
                </a>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-vgbf-blue mb-4">Vanliga frågor</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Hur blir jag medlem?</h3>
                <p className="text-gray-600">
                  För att bli medlem i VGBF ska du först bli medlem i en av våra{' '}
                  <a href="/klubbar" className="text-vgbf-blue hover:underline">medlemsklubbar</a>.
                  Medlemskapet i förbundet följer automatiskt med klubbmedlemskapet.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Var kan jag prova på bågskytte?</h3>
                <p className="text-gray-600">
                  Många av våra klubbar erbjuder prova-på aktiviteter. Kontakta den{' '}
                  <a href="/klubbar" className="text-vgbf-blue hover:underline">klubb</a>{' '}
                  som ligger närmast dig för mer information.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Hur anmäler jag en tävling?</h3>
                <p className="text-gray-600">
                  Tävlingsanmälan görs vanligtvis via Svenska Bågskytteförbundets anmälningssystem 
                  eller direkt till arrangörklubben. Se mer information på respektive{' '}
                  <a href="/tavlingar" className="text-vgbf-blue hover:underline">tävlingssida</a>.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Var hittar jag tävlingsresultat?</h3>
                <p className="text-gray-600">
                  Aktuella tävlingsresultat publiceras på våra{' '}
                  <a href="/nyheter" className="text-vgbf-blue hover:underline">nyhetssidor</a>{' '}
                  och på{' '}
                  <a href="/distriktsrekord" className="text-vgbf-blue hover:underline">distriktsrekordsidan</a>{' '}
                  för nya rekord.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
