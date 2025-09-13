'use client';

import { trackButtonClick, trackExternalLink, trackCompetition } from '@/lib/analytics';

/**
 * Example component showing how to use Umami analytics tracking
 * This demonstrates various tracking scenarios for the VGBF website
 */
export default function AnalyticsExampleComponent() {
  const handleJoinCompetition = (competitionName: string) => {
    // Track when users click to join a competition
    trackButtonClick('Join Competition', 'competition-card');
    trackCompetition('join_intent', competitionName);
    
    // Your existing join logic here
    console.log(`Joining competition: ${competitionName}`);
  };

  const handleNewsShare = (articleTitle: string) => {
    // Track when users share news articles
    trackButtonClick('Share News', 'news-article');
    
    // Your existing share logic here
    console.log(`Sharing article: ${articleTitle}`);
  };

  const handleExternalLinkClick = (url: string, linkText: string) => {
    // Track external link clicks (e.g., to sponsors, partner organizations)
    trackExternalLink(url, linkText);
    
    // Open external link
    window.open(url, '_blank', 'noopener noreferrer');
  };

  const handleContactFormSubmit = (formData: any) => {
    // Track form submissions with category
    import('@/lib/analytics').then(({ trackFormSubmit }) => {
      trackFormSubmit('contact-form', {
        category: formData.category,
        has_phone: formData.phone ? 'yes' : 'no',
      });
    });
    
    // Your existing form submission logic here
    console.log('Form submitted:', formData);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Analytics Tracking Examples</h3>
      <div className="space-y-3">
        
        {/* Competition tracking example */}
        <button
          onClick={() => handleJoinCompetition('Västsvenska Mästerskapet 2025')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-3"
        >
          Anmäl dig till tävling
        </button>

        {/* News sharing example */}
        <button
          onClick={() => handleNewsShare('Nya regler för utomhusskjutning')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-3"
        >
          Dela nyhet
        </button>

        {/* External link tracking example */}
        <button
          onClick={() => handleExternalLinkClick('https://www.archery.sport/', 'World Archery')}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 mr-3"
        >
          Besök World Archery
        </button>

        {/* Form submission example */}
        <button
          onClick={() => handleContactFormSubmit({ 
            category: 'general', 
            phone: '070-123456' 
          })}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          Skicka kontaktformulär
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
        <strong>💡 Tips för utvecklare:</strong>
        <ul className="mt-2 list-disc list-inside space-y-1">
          <li>Använd beskrivande händelsenamn (t.ex. &apos;join_competition&apos; istället för &apos;click&apos;)</li>
          <li>Inkludera relevant kontext i händelsedata</li>
          <li>Tracking fungerar bara i produktion - testa med <code>npm run build && npm start</code></li>
          <li>Kontrollera Umami-dashboarden för att se händelserna</li>
        </ul>
      </div>
    </div>
  );
}