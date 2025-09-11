export default function Hero() {
  return (
  <section className="bg-gradient-to-b from-vgbf-blue to-vgbf-gold text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          Västra Götalands
          <span className="block">Bågskytteförbund</span>
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto opacity-95">
          Välkommen till den officiella webbplatsen för Västra Götalands Bågskytteförbund. Här hittar du nyheter, tävlingar och information om våra medlemsklubbar.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/nyheter"
            className="inline-block bg-white text-vgbf-blue px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            aria-label="Se nyheter"
          >
            Se nyheter
          </a>

          <a
            href="/tavlingar/kommande"
            className="inline-block bg-vgbf-gold text-vgbf-blue px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
            aria-label="Kommande tävlingar"
          >
            Kommande tävlingar
          </a>
        </div>

        <div className="mt-10 max-w-3xl mx-auto text-sm text-white/90">
          <p>Upptäck distriktets senaste aktiviteter — från nyheter till rekord och tävlingsresultat.</p>
        </div>
      </div>
    </section>
  )
}
