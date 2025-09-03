export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-vgbf-blue to-vgbf-green text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Västra Götalands Bågskytteförbund
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Välkommen till den officiella webbplatsen för Västra Götalands Bågskytteförbund. 
          Här hittar du nyheter, tävlingar och information om våra medlemsklubbar.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-vgbf-gold text-vgbf-blue px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors">
            Testa på bågskyttet!
          </button>
          <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-vgbf-blue transition-colors">
            Bli medlem
          </button>
        </div>
      </div>
    </section>
  )
}
