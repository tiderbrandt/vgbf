'use client';

import { useState, useEffect } from 'react';

interface CookieConsentProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

export default function CookieConsent({ onAccept, onDecline }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const hasConsent = localStorage.getItem('vgbf_cookie_consent');
    const needsConsent = process.env.NEXT_PUBLIC_COOKIES_CONSENT_REQUIRED === 'true';
    
    if (!hasConsent && needsConsent) {
      setShowBanner(true);
      // Delay visibility for animation
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('vgbf_cookie_consent', 'accepted');
    localStorage.setItem('vgbf_analytics_enabled', 'true');
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
    onAccept?.();
  };

  const handleDecline = () => {
    localStorage.setItem('vgbf_cookie_consent', 'declined');
    localStorage.setItem('vgbf_analytics_enabled', 'false');
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
    onDecline?.();
  };

  const handleCustomize = () => {
    // For now, just show accept/decline. In future, could show detailed preferences
    alert('Anpassade inställningar kommer snart. Välj "Acceptera" för grundläggande statistik eller "Avböj" för ingen spårning.');
  };

  if (!showBanner) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-lg transform transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🍪 Cookies och integritet
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Vi använder cookies för att förbättra din upplevelse på vår webbplats. 
              Vi samlar grundläggande besöksstatistik för att förstå hur sajten används. 
              All data sparas lokalt i din webbläsare och delas inte med tredje part.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              <a 
                href="/privacy" 
                className="underline hover:text-gray-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                Läs mer i vår integritetspolicy
              </a>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleCustomize}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Anpassa
            </button>
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Avböj
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
            >
              Acceptera
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to check if analytics are enabled
export function useAnalyticsEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('vgbf_cookie_consent');
    const analyticsEnabled = localStorage.getItem('vgbf_analytics_enabled');
    
    // If consent required but not given, disable analytics
    const needsConsent = process.env.NEXT_PUBLIC_COOKIES_CONSENT_REQUIRED === 'true';
    if (needsConsent && consent !== 'accepted') {
      setEnabled(false);
      return;
    }
    
    // Check explicit analytics setting
    setEnabled(analyticsEnabled !== 'false');
  }, []);

  return enabled;
}

// Component to reset cookie preferences (for settings page)
export function CookieSettings() {
  const handleReset = () => {
    localStorage.removeItem('vgbf_cookie_consent');
    localStorage.removeItem('vgbf_analytics_enabled');
    window.location.reload();
  };

  const consent = typeof window !== 'undefined' 
    ? localStorage.getItem('vgbf_cookie_consent') 
    : null;

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-semibold text-gray-800 mb-2">Cookie-inställningar</h3>
      <p className="text-sm text-gray-600 mb-3">
        Nuvarande val: {
          consent === 'accepted' ? '✅ Accepterat' : 
          consent === 'declined' ? '❌ Avböjt' : 
          '⏳ Ej valt'
        }
      </p>
      <button
        onClick={handleReset}
        className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
      >
        Återställ val
      </button>
    </div>
  );
}