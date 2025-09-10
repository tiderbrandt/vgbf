'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useToast } from '@/contexts/ToastContext'
import { authenticatedApiCall } from '@/lib/api'

interface SiteSettings {
  siteName: string
  siteDescription: string
  adminEmail: string
  itemsPerPage: number
  dateFormat: string
  enableRegistration: boolean
  enableNotifications: boolean
  backupFrequency: string
  maintenanceMode: boolean
  openaiApiKey?: string
  geminiApiKey?: string
  aiImageProvider?: 'openai' | 'gemini'
}

export default function SettingsPage() {
  const router = useRouter()
  const { success, error } = useToast()
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Västra Götalands Bågskytteförbund',
    siteDescription: 'Officiell webbplats för Västra Götalands Bågskytteförbund',
    adminEmail: 'admin@vgbf.se',
    itemsPerPage: 10,
    dateFormat: 'sv-SE',
    enableRegistration: false,
    enableNotifications: true,
    backupFrequency: 'weekly',
    maintenanceMode: false,
    openaiApiKey: '',
    geminiApiKey: '',
    aiImageProvider: 'openai'
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [testingApi, setTestingApi] = useState(false)
  const [apiTestResults, setApiTestResults] = useState<{
    openai?: { success: boolean; message: string; timestamp?: string }
    gemini?: { success: boolean; message: string; timestamp?: string }
  }>({})

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await authenticatedApiCall('/api/admin/settings')
        const data = await response.json()
        if (data.success) {
          setSettings(data.data)
        }
      } catch (err) {
        console.error('Error loading settings:', err)
        error('Fel vid laddning', 'Kunde inte ladda inställningar.')
      }
    }
    
    loadSettings()
  }, [error])

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await authenticatedApiCall('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      })
      const data = await response.json()
      
      if (data.success) {
        success('Inställningar sparade!', 'Dina ändringar har sparats framgångsrikt.')
        setSettings(data.data)
      } else {
        error('Fel vid sparande', data.error || 'Ett oväntat fel inträffade.')
      }
    } catch (err) {
      console.error('Error saving settings:', err)
      error('Fel vid sparande', 'Ett oväntat fel inträffade vid sparande av inställningarna.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (confirm('Är du säker på att du vill återställa alla inställningar till standardvärden?')) {
      setLoading(true)
      try {
        const response = await authenticatedApiCall('/api/admin/settings', {
          method: 'POST',
          body: JSON.stringify({ action: 'reset' })
        })
        const data = await response.json()
        
        if (data.success) {
          setSettings(data.data)
          success('Återställt!', 'Inställningarna har återställts till standardvärden.')
        } else {
          error('Fel vid återställning', data.error || 'Ett oväntat fel inträffade.')
        }
      } catch (err) {
        console.error('Error resetting settings:', err)
        error('Fel vid återställning', 'Ett oväntat fel inträffade vid återställning.')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleBackup = async () => {
    setLoading(true)
    try {
      const response = await authenticatedApiCall('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ action: 'backup' })
      })
      const data = await response.json()
      
      if (data.success) {
        success('Backup skapad!', 'En ny backup har skapats framgångsrikt.')
      } else {
        error('Fel vid backup', data.error || 'Ett oväntat fel inträffade.')
      }
    } catch (err) {
      console.error('Error creating backup:', err)
      error('Fel vid backup', 'Ett oväntat fel inträffade vid skapande av backup.')
    } finally {
      setLoading(false)
    }
  }

  const testGeminiAPI = async () => {
    setTestingApi(true)
    
    try {
      const response = await authenticatedApiCall('/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Test image generation - a simple blue circle on white background',
          style: 'photographic',
          size: '1024x1024'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setApiTestResults(prev => ({
          ...prev,
          gemini: {
            success: true,
            message: `✅ Google Gemini fungerar korrekt!`,
            timestamp: new Date().toLocaleTimeString('sv-SE')
          }
        }))
        success('API Test lyckades!', 'Gemini API fungerar korrekt.')
      } else {
        setApiTestResults(prev => ({
          ...prev,
          gemini: {
            success: false,
            message: `❌ ${data.error || 'API test misslyckades'}`,
            timestamp: new Date().toLocaleTimeString('sv-SE')
          }
        }))
        error('API Test misslyckades', data.error || 'Ett oväntat fel inträffade.')
      }
    } catch (err) {
      console.error('API test error:', err)
      setApiTestResults(prev => ({
        ...prev,
        gemini: {
          success: false,
          message: `❌ Nätverksfel vid test av Gemini`,
          timestamp: new Date().toLocaleTimeString('sv-SE')
        }
      }))
      error('API Test fel', 'Kunde inte testa Gemini API.')
    } finally {
      setTestingApi(false)
    }
  }

  const tabs = [
    { id: 'general', name: 'Allmänt', icon: '⚙️' },
    { id: 'display', name: 'Visning', icon: '🎨' },
    { id: 'ai', name: 'AI & API', icon: '🤖' },
    { id: 'security', name: 'Säkerhet', icon: '🔒' },
    { id: 'backup', name: 'Backup', icon: '💾' },
    { id: 'advanced', name: 'Avancerat', icon: '🔧' }
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-vgbf-blue mb-2">Inställningar</h1>
              <p className="text-gray-600">Hantera systemkonfiguration och preferenser</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Återställ
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-vgbf-blue text-white rounded-lg text-sm font-medium hover:bg-vgbf-green transition-colors disabled:opacity-50"
              >
                {loading ? 'Sparar...' : 'Spara ändringar'}
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <nav className="bg-white rounded-lg shadow-md p-4">
                <div className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-vgbf-blue text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-3">{tab.icon}</span>
                      {tab.name}
                    </button>
                  ))}
                </div>
              </nav>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md">
                {/* General Settings */}
                {activeTab === 'general' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Allmänna inställningar</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Webbplatsens namn
                        </label>
                        <input
                          type="text"
                          value={settings.siteName}
                          onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-vgbf-blue focus:border-vgbf-blue"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Beskrivning
                        </label>
                        <textarea
                          value={settings.siteDescription}
                          onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-vgbf-blue focus:border-vgbf-blue"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Admin e-post
                        </label>
                        <input
                          type="email"
                          value={settings.adminEmail}
                          onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-vgbf-blue focus:border-vgbf-blue"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Display Settings */}
                {activeTab === 'display' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Visningsinställningar</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Objekt per sida i listor
                        </label>
                        <select
                          value={settings.itemsPerPage}
                          onChange={(e) => setSettings({...settings, itemsPerPage: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-vgbf-blue focus:border-vgbf-blue"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Datumformat
                        </label>
                        <select
                          value={settings.dateFormat}
                          onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-vgbf-blue focus:border-vgbf-blue"
                        >
                          <option value="sv-SE">Svenska (2024-01-15)</option>
                          <option value="en-US">Engelska (01/15/2024)</option>
                          <option value="en-GB">Brittiska (15/01/2024)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI & API Settings */}
                {activeTab === 'ai' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">AI & API Inställningar</h2>
                    
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <span className="text-2xl">🤖</span>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                              AI Bildgenerering
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                              <p>Konfigurera Google Gemini för automatisk bildgenerering när du skapar nyheter.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Gemini Configuration */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <span className="mr-2">🔶</span>
                          Google Gemini
                        </h3>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gemini API Nyckel
                          </label>
                          <input
                            type="password"
                            value={settings.geminiApiKey || ''}
                            onChange={(e) => setSettings({...settings, geminiApiKey: e.target.value})}
                            placeholder="AIza..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-vgbf-blue focus:border-vgbf-blue"
                          />
                          <p className="mt-2 text-sm text-gray-500">
                            Din Google Gemini API-nyckel används för att generera bilder. 
                            <a 
                              href="https://aistudio.google.com/app/apikey" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-vgbf-blue hover:underline ml-1"
                            >
                              Skaffa en API-nyckel här →
                            </a>
                          </p>
                        </div>
                      </div>

                      {/* API Testing Section */}
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">🧪 API Testning</h3>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <span className="text-2xl">🔬</span>
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-blue-800">
                                Testa API-anslutning
                              </h4>
                              <div className="mt-2 text-sm text-blue-700">
                                <p>Testa om din API-nyckel fungerar genom att generera en testbild. Detta kommer att förbruka en liten mängd API-krediter.</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {/* Test Button */}
                          <div className="flex items-center gap-4">
                            <button
                              onClick={testGeminiAPI}
                              disabled={testingApi || !((settings.aiImageProvider === 'openai' && settings.openaiApiKey) || (settings.aiImageProvider === 'gemini' && settings.geminiApiKey))}
                              className="bg-vgbf-blue text-white px-6 py-2 rounded-lg font-medium hover:bg-vgbf-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {testingApi ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  <span>Testar API...</span>
                                </>
                              ) : (
                                <>
                                  <span>🧪</span>
                                  <span>Testa {settings.aiImageProvider === 'openai' ? 'OpenAI' : 'Gemini'} API</span>
                                </>
                              )}
                            </button>

                            {!((settings.aiImageProvider === 'openai' && settings.openaiApiKey) || (settings.aiImageProvider === 'gemini' && settings.geminiApiKey)) && (
                              <p className="text-sm text-gray-500">
                                ⚠️ Konfigurera en API-nyckel först för att kunna testa
                              </p>
                            )}
                          </div>

                          {/* Test Results */}
                          {Object.keys(apiTestResults).length > 0 && (
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-gray-700">Testresultat:</h4>
                              {Object.entries(apiTestResults).map(([provider, result]) => (
                                <div
                                  key={provider}
                                  className={`border rounded-lg p-3 ${
                                    result.success
                                      ? 'border-green-200 bg-green-50'
                                      : 'border-red-200 bg-red-50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="text-sm font-medium capitalize">
                                        🔶 Google Gemini
                                      </span>
                                      <p className="text-sm mt-1">{result.message}</p>
                                    </div>
                                    {result.timestamp && (
                                      <span className="text-xs text-gray-500">
                                        {result.timestamp}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">API Status</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">AI Leverantör</span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                 Gemini
                              </span>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Gemini Status</span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                settings.geminiApiKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {settings.geminiApiKey ? '✓ Konfigurerad' : '✗ Ej konfigurerad'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {settings.geminiApiKey && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <span className="text-green-400 text-xl">✓</span>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-green-800">
                                AI Bildgenerering aktiverad!
                              </h3>
                              <div className="mt-2 text-sm text-green-700">
                                <p>Du kan nu använda {settings.aiImageProvider === 'openai' ? 'OpenAI DALL-E 3' : 'Google Gemini'} för bildgenerering när du skapar eller redigerar nyheter.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Säkerhetsinställningar</h2>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Aktivera registrering
                          </label>
                          <p className="text-sm text-gray-500">Tillåt nya användare att registrera sig</p>
                        </div>
                        <button
                          onClick={() => setSettings({...settings, enableRegistration: !settings.enableRegistration})}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-vgbf-blue focus:ring-offset-2 ${
                            settings.enableRegistration ? 'bg-vgbf-blue' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              settings.enableRegistration ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Aktivera notifikationer
                          </label>
                          <p className="text-sm text-gray-500">Skicka e-postnotifikationer för viktiga händelser</p>
                        </div>
                        <button
                          onClick={() => setSettings({...settings, enableNotifications: !settings.enableNotifications})}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-vgbf-blue focus:ring-offset-2 ${
                            settings.enableNotifications ? 'bg-vgbf-blue' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              settings.enableNotifications ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Ändra lösenord</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nuvarande lösenord
                            </label>
                            <input
                              type="password"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-vgbf-blue focus:border-vgbf-blue"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nytt lösenord
                            </label>
                            <input
                              type="password"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-vgbf-blue focus:border-vgbf-blue"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Bekräfta nytt lösenord
                            </label>
                            <input
                              type="password"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-vgbf-blue focus:border-vgbf-blue"
                            />
                          </div>
                          <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                            Uppdatera lösenord
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Backup Settings */}
                {activeTab === 'backup' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Backup-inställningar</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Backup-frekvens
                        </label>
                        <select
                          value={settings.backupFrequency}
                          onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-vgbf-blue focus:border-vgbf-blue"
                        >
                          <option value="daily">Dagligen</option>
                          <option value="weekly">Veckovis</option>
                          <option value="monthly">Månadsvis</option>
                          <option value="manual">Endast manuellt</option>
                        </select>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Manuella backup-åtgärder</h3>
                        <div className="space-y-3">
                          <button className="w-full px-4 py-2 bg-vgbf-blue text-white rounded-lg text-sm font-medium hover:bg-vgbf-green transition-colors">
                            Skapa backup nu
                          </button>
                          <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            Exportera alla data
                          </button>
                          <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            Visa backup-historik
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Advanced Settings */}
                {activeTab === 'advanced' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Avancerade inställningar</h2>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Underhållsläge
                          </label>
                          <p className="text-sm text-gray-500">Stäng av webbplatsen för underhåll</p>
                        </div>
                        <button
                          onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                            settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {settings.maintenanceMode && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">
                                Varning: Underhållsläge aktiverat
                              </h3>
                              <div className="mt-2 text-sm text-red-700">
                                <p>Webbplatsen är för närvarande otillgänglig för besökare. Kom ihåg att stänga av underhållsläget när du är klar.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Systemstatistik</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Database storlek:</span>
                            <span className="ml-2 font-medium">~2.3 MB</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Senaste backup:</span>
                            <span className="ml-2 font-medium">2024-09-07</span>
                          </div>
                          <div>
                            <span className="text-gray-500">System version:</span>
                            <span className="ml-2 font-medium">1.0.0</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Upptid:</span>
                            <span className="ml-2 font-medium">3 dagar</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
