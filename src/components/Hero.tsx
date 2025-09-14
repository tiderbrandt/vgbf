interface HeroProps {
  title?: string
  subtitle?: string
  description?: string
  showButtons?: boolean
}

export default function Hero({ 
  title = "Västra Götalands Bågskytteförbund",
  subtitle = "Välkommen till den officiella webbplatsen för Västra Götalands Bågskytteförbund. Här hittar du nyheter, tävlingar och information om våra medlemsklubbar.",
  description = "Upptäck distriktets senaste aktiviteter — från nyheter till rekord och tävlingsresultat.",
  showButtons = true
}: HeroProps) {
  return (
    <section className="bg-gradient-to-b from-vgbf-blue to-vgbf-red text-white py-20 hero-with-logo-bg">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          {title.includes("Bågskytteförbund") ? (
            <>
              Västra Götalands
              <span className="block">Bågskytteförbund</span>
            </>
          ) : (
            title
          )}
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto opacity-95">
          {subtitle}
        </p>

        {showButtons && (
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
              className="inline-block bg-vgbf-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              aria-label="Kommande tävlingar"
            >
              Kommande tävlingar
            </a>
          </div>
        )}

        <div className="mt-10 max-w-3xl mx-auto text-sm text-white/90">
          <p>{description}</p>
        </div>
      </div>
    </section>
  )
}
