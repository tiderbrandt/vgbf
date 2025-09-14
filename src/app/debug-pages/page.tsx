'use client';

import { useState, useEffect } from 'react';

export default function DebugPagesPage() {
  const [output, setOutput] = useState<string[]>([]);
  const [apiData, setApiData] = useState<any>(null);

  const addLog = (message: string) => {
    setOutput(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('Debug page mounted');
    testApiDirectly();
  }, []);

  const testApiDirectly = async () => {
    try {
      addLog('Testing API directly...');
      const url = '/api/pages?status=published&featured=true';
      addLog(`Fetching: ${url}`);
      
      const response = await fetch(url);
      addLog(`Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      addLog(`Data received: ${JSON.stringify(data, null, 2)}`);
      setApiData(data);
      
    } catch (error) {
      addLog(`Error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug: Featured Pages API</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Debug Log</h2>
            <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
              <pre className="text-sm">
                {output.join('\n')}
              </pre>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">API Response</h2>
            <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
              <pre className="text-sm">
                {apiData ? JSON.stringify(apiData, null, 2) : 'No data yet...'}
              </pre>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <button 
            onClick={testApiDirectly}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Test API Again
          </button>
        </div>
      </div>
    </div>
  );
}