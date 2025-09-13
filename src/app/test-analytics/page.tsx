import SeoHead from '@/components/SeoHead';
import { trackButtonClick } from '@/lib/analytics';

export default function TestAnalyticsPage() {
  const handleTestClick = () => {
    // Test custom event tracking
    trackButtonClick('analytics-test-button', 'Analytics Test Page');
    
    // Also try direct Umami tracking if available
    if (typeof window !== 'undefined' && (window as any).umami) {
      (window as any).umami.track('test-click', { location: 'test-page' });
    }
    
    alert('Analytics event sent! Check your Umami dashboard or browser network tab.');
  };

  return (
    <>
      <SeoHead 
        title="Analytics Test"
        description="Test page for verifying Umami analytics integration"
        noindex={true}
      />
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              📊 Analytics Test Page
            </h1>
            
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">
                  Current Configuration
                </h2>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Umami URL:</strong> {process.env.NEXT_PUBLIC_UMAMI_URL || 'Not configured'}</p>
                  <p><strong>Website ID:</strong> {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || 'Not configured'}</p>
                  <p><strong>Site URL:</strong> {process.env.NEXT_PUBLIC_SITE_URL || 'Not configured'}</p>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-green-900 mb-2">
                  How to Check if Tracking Works
                </h2>
                <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
                  <li>Open Browser DevTools (F12)</li>
                  <li>Go to Network tab</li>
                  <li>Reload this page</li>
                  <li>Look for requests to <code>analytics.umami.is</code></li>
                  <li>Click the test button below</li>
                  <li>Check for additional network requests</li>
                </ol>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-yellow-900 mb-2">
                  Console Commands
                </h2>
                <div className="text-sm text-yellow-800 space-y-2">
                  <p>Run these in the browser console:</p>
                  <div className="bg-yellow-100 p-2 rounded font-mono text-xs">
                    <p>window.umami</p>
                    <p>document.querySelector('[data-website-id]')</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleTestClick}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                🧪 Test Analytics Event
              </button>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Umami Dashboard
                </h2>
                <p className="text-sm text-gray-700 mb-3">
                  If tracking is working, you should see this page visit in your Umami dashboard.
                </p>
                <a 
                  href="https://analytics.umami.is/websites/1bfd76c1-4918-4255-a73b-260e18ab26ac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Open Umami Dashboard →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}