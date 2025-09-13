interface PageHeroProps {
  title: string
  description?: string
  subtitle?: string
  featuredImage?: string
  featuredImageAlt?: string
}

export default function PageHero({ 
  title, 
  description, 
  subtitle, 
  featuredImage, 
  featuredImageAlt 
}: PageHeroProps) {
  return (
    <section className="bg-gradient-to-b from-vgbf-blue to-vgbf-red text-white py-16 relative overflow-hidden">
      {/* Background image if provided */}
      {featuredImage && (
        <div className="absolute inset-0 z-0">
          <img 
            src={featuredImage} 
            alt={featuredImageAlt || title}
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-vgbf-blue/80 to-vgbf-red/80"></div>
        </div>
      )}
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          {title}
        </h1>
        
        {description && (
          <p className="text-lg md:text-xl mb-6 max-w-3xl mx-auto opacity-95 leading-relaxed">
            {description}
          </p>
        )}
        
        {subtitle && (
          <div className="mt-6 max-w-3xl mx-auto text-sm text-white/90">
            <p>{subtitle}</p>
          </div>
        )}
      </div>
    </section>
  )
}
