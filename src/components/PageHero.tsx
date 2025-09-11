interface PageHeroProps {
  title: string
  description: string
  subtitle?: string
}

export default function PageHero({ title, description, subtitle }: PageHeroProps) {
  const heroStyle: React.CSSProperties = {
    background: `linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.04)), radial-gradient(circle at center, #FFD700 0% 18%, #FFCF33 20% 22%, #E03C31 30% 38%, #B91C1C 40% 44%, #003366 48% 56%, #002a4a 58% 64%, rgba(0,0,0,0.9) 70% 84%, rgba(255,255,255,0.04) 86% 100%)`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  }

  return (
    <section style={heroStyle} className="text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          {title}
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto opacity-95">
          {description}
        </p>
        
        {subtitle && (
          <div className="mt-10 max-w-3xl mx-auto text-sm text-white/90">
            <p>{subtitle}</p>
          </div>
        )}
      </div>
    </section>
  )
}
