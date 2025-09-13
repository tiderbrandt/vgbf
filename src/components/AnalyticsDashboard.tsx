'use client';

import { useState } from 'react';

interface AnalyticsDashboardProps {
  className?: string;
}

export default function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const [isVisible, setIsVisible] = useState(false);

  const formatPageName = (path: string) => {
    if (path === '/') return 'Startsida';
    if (path === '/news') return 'Nyheter';
    if (path === '/competitions') return 'Tävlingar';
    if (path === '/clubs') return 'Klubbar';
    if (path === '/records') return 'Rekord';
    if (path === '/contact') return 'Kontakt';
    return path.replace(/^\//, '').replace(/-/g, ' ');
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Information om analytics"
      >
        📊
      </button>

      {/* Analytics Panel */}
      {isVisible && (
        <div className="absolute bottom-16 right-0 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Analytics</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Umami Analytics Info */}
          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-sm font-medium text-blue-800 mb-1">Umami Analytics</div>
              <div className="text-xs text-blue-600">
                Professionell analytics som respekterar integritet och följer GDPR.
              </div>
            </div>
            
            <div className="bg-green-50 p-3 rounded">
              <div className="text-sm font-medium text-green-800 mb-1">Cookiefri spårning</div>
              <div className="text-xs text-green-600">
                Ingen personlig data samlas in eller lagras.
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
            � All analytics hanteras enligt GDPR och svenska integritetslagar.
          </div>
        </div>
      )}
    </div>
  );
}
