"use client"

import { useState } from 'react'
import Link from 'next/link'

const categories = [
  {
    id: 'outdoor',
    emoji: '🏹',
    title: 'Utomhus',
    subtitle: '70m/60m/50m/40m/30m 72/15 pilar',
    sample: [
      { holder: 'Anna Svensson', score: '658', year: 2024, class: 'Recurve' },
      { holder: 'Per Karlsson', score: '645', year: 2023, class: 'Compound' },
    ],
  },
  {
    id: 'indoor',
    emoji: '🎯',
    title: 'Inomhus',
    subtitle: '18m/12m 15 & 30 pilar',
    sample: [
      { holder: 'Lisa Andersson', score: '590', year: 2024, class: 'Recurve' },
      { holder: 'Jonas Berg', score: '577', year: 2022, class: 'Compound' },
    ],
  },
  {
    id: '900',
    emoji: '🏆',
    title: '900 Rond',
    subtitle: 'Fältbåge kategorier',
    sample: [
      { holder: 'Erik Nilsson', score: '850', year: 2021, class: 'Longbow' },
    ],
  },
]

export default function RecordsHighlight() {
  const [selected, setSelected] = useState(categories[0].id)

  const active = categories.find((c) => c.id === selected) || categories[0]

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="text-3xl font-bold text-vgbf-blue mb-4">Distriktsrekord</h2>
      <p className="text-gray-600 text-lg mb-6">
        Upptäck våra distriktsrekord inom olika kategorier och klasser.
        Nu samlade på ett ställe för enkel åtkomst och uppdatering.
      </p>

          <div className="flex justify-center gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelected(cat.id)}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                  selected === cat.id 
                    ? 'bg-gradient-to-r from-vgbf-blue to-blue-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-vgbf-blue/30'
                }`}
                aria-pressed={selected === cat.id}
              >
                <span className="mr-2 text-lg">{cat.emoji}</span>
                {cat.title}
              </button>
            ))}
          </div>

          <div className="bg-gradient-to-br from-white via-blue-50/30 to-white rounded-2xl p-8 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="text-5xl p-4 bg-gradient-to-br from-vgbf-blue/10 to-blue-100 rounded-2xl">{active.emoji}</div>
                <div className="text-left">
                  <h3 className="font-bold text-vgbf-blue text-2xl mb-1">{active.title}</h3>
                  <p className="text-gray-600">{active.subtitle}</p>
                </div>
              </div>
              <div className="text-right">
                <Link href="/distriktsrekord" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-vgbf-blue font-medium group">
                  Visa alla rekord 
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              {active.sample.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100 hover:border-vgbf-blue/30 hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-vgbf-gold to-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                      #{i + 1}
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 font-medium mb-1">{r.class} • {r.year}</div>
                      <div className="font-bold text-vgbf-blue group-hover:text-blue-700 transition-colors">{r.holder}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-vgbf-blue group-hover:text-blue-700 transition-colors">{r.score}</div>
                    <div className="text-xs text-gray-500 font-medium">poäng</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link 
            href="/distriktsrekord"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-vgbf-blue to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Se alla distriktsrekord
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
    </div>
  )
}
