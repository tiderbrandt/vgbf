'use client';

import { useState, useEffect } from 'react';
import { getVisitorStats } from './SeoHead';

interface AnalyticsData {
  totalViews: number;
  todayViews: number;
  popularPages: [string, number][];
  lastUpdated: string;
}

interface AnalyticsDashboardProps {
  className?: string;
}

export default function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const stats = getVisitorStats();
    setAnalytics(stats);
  }, []);

  if (!analytics) {
    return null;
  }

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
        title="Visa besöksstatistik"
      >
        📊
      </button>

      {/* Analytics Panel */}
      {isVisible && (
        <div className="absolute bottom-16 right-0 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Besöksstatistik</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-2xl font-bold text-blue-600">{analytics.totalViews}</div>
              <div className="text-sm text-blue-800">Totalt antal besök</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-2xl font-bold text-green-600">{analytics.todayViews}</div>
              <div className="text-sm text-green-800">Besök idag</div>
            </div>
          </div>

          {/* Popular Pages */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Populära sidor</h4>
            <div className="space-y-2">
              {analytics.popularPages.slice(0, 5).map(([page, views], index) => (
                <div key={page} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 truncate mr-2">
                    {index + 1}. {formatPageName(page)}
                  </span>
                  <span className="font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded">
                    {views}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-xs text-gray-500 border-t pt-2">
            Uppdaterad: {new Date(analytics.lastUpdated).toLocaleString('sv-SE')}
          </div>

          {/* Privacy Note */}
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
            📋 Statistiken sparas lokalt i din webbläsare och delas inte med tredje part.
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for using analytics data in other components
export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const updateStats = () => {
      const stats = getVisitorStats();
      setAnalytics(stats);
    };

    updateStats();
    
    // Update every minute when component is active
    const interval = setInterval(updateStats, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return analytics;
}

// Component for displaying simple visitor count
export function VisitorCounter({ className = '' }: { className?: string }) {
  const analytics = useAnalytics();

  if (!analytics || analytics.totalViews === 0) {
    return null;
  }

  return (
    <div className={`text-sm text-gray-500 ${className}`}>
      👥 {analytics.totalViews.toLocaleString('sv-SE')} besök
    </div>
  );
}