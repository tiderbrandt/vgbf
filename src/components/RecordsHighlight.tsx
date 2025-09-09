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

          <div className="flex justify-center gap-3 mb-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelected(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${selected === cat.id ? 'bg-vgbf-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                aria-pressed={selected === cat.id}
              >
                <span className="mr-2">{cat.emoji}</span>
                {cat.title}
              </button>
            ))}
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-6 hover:shadow-md transition mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{active.emoji}</div>
                <div className="text-left">
                  <h3 className="font-semibold text-vgbf-blue text-xl">{active.title}</h3>
                  <p className="text-gray-600 text-sm">{active.subtitle}</p>
                </div>
              </div>
              <div className="text-right">
                <Link href="/distriktsrekord" className="text-sm text-gray-600 hover:text-vgbf-blue">Visa alla rekord →</Link>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {active.sample.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white rounded border">
                  <div>
                    <div className="text-sm text-gray-600">{r.class} • {r.year}</div>
                    <div className="font-semibold">{r.holder}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-vgbf-blue">{r.score}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link 
            href="/distriktsrekord"
            className="inline-flex items-center px-8 py-3 bg-vgbf-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Se alla distriktsrekord
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
    </div>
  )
}
