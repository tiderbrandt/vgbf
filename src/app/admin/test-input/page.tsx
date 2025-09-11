'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TestInputPage() {
  const [testValue, setTestValue] = useState('')
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-vgbf-blue mb-8">Test Text Input</h1>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="test-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Simple Text Input
                </label>
                <input
                  type="text"
                  id="test-input"
                  value={testValue}
                  onChange={(e) => setTestValue(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                  placeholder="Type here to test..."
                />
                <p className="mt-2 text-sm text-gray-500">
                  Current value: "{testValue}"
                </p>
              </div>
              
              <div>
                <label htmlFor="textarea-test" className="block text-sm font-medium text-gray-700 mb-2">
                  Textarea Test
                </label>
                <textarea
                  id="textarea-test"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                  placeholder="Type in this textarea..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
