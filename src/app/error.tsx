'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log the error for debugging
  console.error('Calendar error:', error);
  console.error('Error stack:', error.stack);
  console.error('Error digest:', error.digest);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Något gick fel
          </h2>
          <p className="text-gray-600 mb-6">
            Ett oväntat fel uppstod. Försök igen eller kontakta administratören.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-left bg-gray-100 p-4 rounded mb-4 text-sm">
              <strong>Debug info:</strong><br />
              {error.message}<br />
              {error.stack && <pre className="whitespace-pre-wrap text-xs mt-2">{error.stack}</pre>}
            </div>
          )}
          <button
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Försök igen
          </button>
        </div>
      </div>
    </div>
  );
}
