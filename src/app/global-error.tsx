'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full text-center">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">Oops!</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Något gick fel</h2>
            <p className="text-gray-600 mb-8">
              Ett oväntat fel har inträffat. Försök igen eller kontakta oss om problemet kvarstår.
            </p>
            <div className="space-y-4">
              <button
                onClick={reset}
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Försök igen
              </button>
              <br />
              <a
                href="/"
                className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Tillbaka till startsidan
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
