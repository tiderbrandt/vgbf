'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { DistrictRecord } from '@/types'

interface DistriktsrekordClientProps {
    initialRecords: DistrictRecord[]
    infoText: string
}

// Function to format text with email links (Client-side version)
function formatTextWithEmailLinks(text: string) {
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
    const parts = text.split(emailRegex)

    return parts.map((part, index) => {
        if (emailRegex.test(part)) {
            return (
                <a
                    key={index}
                    href={`mailto:${part}`}
                    className="text-vgbf-blue hover:underline"
                >
                    {part}
                </a>
            )
        }
        return part
    })
}

export default function DistriktsrekordClient({ initialRecords, infoText }: DistriktsrekordClientProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')

    // Derive unique categories for filter
    const uniqueCategories = useMemo(() => {
        const categories = new Set(initialRecords.map(r => r.category))
        return Array.from(categories).sort()
    }, [initialRecords])

    // Filter records
    const filteredRecords = useMemo(() => {
        return initialRecords.filter(record => {
            // Category filter
            if (categoryFilter !== 'all' && record.category !== categoryFilter) return false

            // Search filter
            const searchLower = searchQuery.toLowerCase()
            const matchesSearch =
                searchQuery === '' ||
                record.name.toLowerCase().includes(searchLower) ||
                record.club.toLowerCase().includes(searchLower) ||
                record.competition.toLowerCase().includes(searchLower) ||
                record.class.toLowerCase().includes(searchLower)

            return matchesSearch
        })
    }, [initialRecords, categoryFilter, searchQuery])

    // Group filtered records by category
    const groupedRecords = useMemo(() => {
        return filteredRecords.reduce((acc: Record<string, DistrictRecord[]>, record) => {
            const category = record.category
            if (!acc[category]) {
                acc[category] = []
            }
            acc[category].push(record)
            return acc
        }, {})
    }, [filteredRecords])

    // Calculate dynamic stats based on filtered view
    const stats = useMemo(() => {
        return {
            total: filteredRecords.length,
            categories: Object.keys(groupedRecords).length,
            uniqueArchers: new Set(filteredRecords.map(r => r.name)).size
        }
    }, [filteredRecords, groupedRecords])

    return (
        <>
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto">

                    {/* Controls Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">

                            {/* Search */}
                            <div className="relative w-full md:w-96">
                                <input
                                    type="text"
                                    placeholder="Sök skytt, klubb eller tävling..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-vgbf-blue focus:border-transparent outline-none"
                                />
                                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                            </div>

                            {/* Category Filter */}
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <span className="font-medium text-gray-700 whitespace-nowrap">Kategori:</span>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full md:w-auto px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-vgbf-blue focus:border-transparent outline-none"
                                >
                                    <option value="all">Alla kategorier</option>
                                    {uniqueCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6 text-center transition-all duration-300">
                            <div className="text-3xl font-bold text-vgbf-blue mb-2">{stats.total}</div>
                            <div className="text-gray-600">Visade rekord</div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 text-center transition-all duration-300">
                            <div className="text-3xl font-bold text-vgbf-green mb-2">
                                {stats.categories}
                            </div>
                            <div className="text-gray-600">Kategorier</div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 text-center transition-all duration-300">
                            <div className="text-3xl font-bold text-vgbf-gold mb-2">
                                {stats.uniqueArchers}
                            </div>
                            <div className="text-gray-600">Unika skyttar</div>
                        </div>
                    </div>

                    {/* Information section */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-2xl font-bold text-vgbf-blue mb-4">Information om distriktsrekord</h2>
                        <div className="prose max-w-none text-gray-600">
                            {infoText ? (
                                infoText.split('\n').map((paragraph, index) => {
                                    if (paragraph.trim() === '') return <br key={index} />
                                    return (
                                        <p key={index} className="mb-4">
                                            {formatTextWithEmailLinks(paragraph)}
                                        </p>
                                    )
                                })
                            ) : (
                                <p className="text-gray-500 italic">
                                    Ingen information tillgänglig. Kontakta administratör för att uppdatera innehållet.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Records section */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-vgbf-blue mb-2">Aktuella distriktsrekord</h2>
                        <p className="text-gray-600">
                            {filteredRecords.length === initialRecords.length
                                ? 'Alla gällande rekord för Västra Götaland sorterade per kategori.'
                                : `Visar urval av rekord baserat på sökning/filter.`}
                        </p>
                    </div>

                    {/* Records by category */}
                    {Object.keys(groupedRecords).length > 0 ? (
                        Object.entries(groupedRecords).map(([category, categoryRecords]) => (
                            <div key={category} className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
                                <div className="bg-gradient-to-r from-vgbf-green to-green-600 text-white px-6 py-4">
                                    <h3 className="text-lg font-semibold">{category}</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Klass</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Namn</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Klubb</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resultat</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tävling</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {categoryRecords.map((record) => (
                                                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.class}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.club}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-vgbf-blue">{record.score}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(record.date).toLocaleDateString('sv-SE')}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {record.competitionUrl ? (
                                                            <a
                                                                href={record.competitionUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-vgbf-blue hover:underline"
                                                            >
                                                                {record.competition}
                                                            </a>
                                                        ) : (
                                                            record.competition
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <div className="text-4xl mb-4">🔍</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Inga rekord matchade din sökning</h3>
                            <p className="text-gray-500">Försök med att justera dina filter eller söktermer.</p>
                            <button
                                onClick={() => {
                                    setSearchQuery('')
                                    setCategoryFilter('all')
                                }}
                                className="mt-4 text-vgbf-blue hover:underline font-medium"
                            >
                                Rensa alla filter
                            </button>
                        </div>
                    )}

                    {/* Back to home */}
                    <div className="text-center mt-12">
                        <Link
                            href="/"
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-vgbf-blue to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm"
                        >
                            Tillbaka till startsidan
                        </Link>
                    </div>

                    {/* Last updated */}
                    <div className="text-center mt-4 text-sm text-gray-500">
                        Sidan uppdaterad {new Date().toLocaleDateString('sv-SE')}
                    </div>

                </div>
            </div>
        </>
    )
}
