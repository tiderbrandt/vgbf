import Link from 'next/link'
import Image from 'next/image'
import { Competition } from '@/types'

interface CompetitionCardProps {
    competition: Competition
}

export default function CompetitionCard({ competition }: CompetitionCardProps) {
    const getStatusBadge = (status: Competition['status']) => {
        const styles = {
            upcoming: 'bg-blue-100 text-blue-800',
            ongoing: 'bg-green-100 text-green-800',
            completed: 'bg-gray-100 text-gray-800'
        }

        const labels = {
            upcoming: 'Kommande',
            ongoing: 'Pågående',
            completed: 'Avslutad'
        }

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        )
    }

    const getCategoryBadge = (category: Competition['category']) => {
        const styles = {
            outdoor: 'bg-green-100 text-green-800',
            indoor: 'bg-purple-100 text-purple-800',
            '3d': 'bg-orange-100 text-orange-800',
            field: 'bg-yellow-100 text-yellow-800',
            other: 'bg-gray-100 text-gray-800'
        }

        const labels = {
            outdoor: 'Utomhus',
            indoor: 'Inomhus',
            '3d': '3D',
            field: 'Fält',
            other: 'Övrigt'
        }

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[category]}`}>
                {labels[category]}
            </span>
        )
    }

    const borderColor =
        competition.status === 'ongoing' ? 'border-l-4 border-green-500' :
            competition.status === 'completed' ? 'border-l-4 border-gray-400' : ''

    return (
        <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${borderColor}`}>
            {competition.imageUrl && (
                <div className="relative h-48 w-full">
                    <Image
                        src={competition.imageUrl}
                        alt={competition.imageAlt || competition.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            )}
            <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="text-xl font-bold text-vgbf-blue">{competition.title}</h3>
                        {competition.isExternal && (
                            <div className="mt-1">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    🔗 Rikstävling
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                        {getStatusBadge(competition.status)}
                        {getCategoryBadge(competition.category)}
                    </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-3">{competition.description}</p>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">📅 Datum:</span>
                        {new Date(competition.date).toLocaleDateString('sv-SE')}
                    </div>
                    {competition.registrationDeadline && competition.status === 'upcoming' && (
                        <div className="flex items-center gap-2">
                            <span className="font-medium">⏰ Anmälan senast:</span>
                            {new Date(competition.registrationDeadline).toLocaleDateString('sv-SE')}
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="font-medium">📍 Plats:</span>
                        {competition.location}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium">👥 Arrangör:</span>
                        {competition.organizer}
                    </div>
                    {competition.fee && (
                        <div className="flex items-center gap-2">
                            <span className="font-medium">💰 Avgift:</span>
                            {competition.fee}
                        </div>
                    )}
                    {competition.maxParticipants && (
                        <div className="flex items-center gap-2">
                            <span className="font-medium">👤 Deltagare:</span>
                            {competition.status === 'upcoming' ? `Max ${competition.maxParticipants}` : competition.maxParticipants}
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    {competition.registrationUrl && competition.status === 'upcoming' && (
                        <a
                            href={competition.registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-vgbf-green text-white text-center py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                            Anmäl dig
                        </a>
                    )}
                    {competition.resultsUrl && (
                        <a
                            href={competition.resultsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-vgbf-blue text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            Se resultat
                        </a>
                    )}
                    {!competition.resultsUrl && competition.status === 'ongoing' && (
                        <a
                            href={competition.resultsUrl || '#'}
                            className="flex-1 bg-vgbf-blue text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium opacity-50 cursor-not-allowed"
                            onClick={(e) => e.preventDefault()}
                        >
                            Resultat kommer
                        </a>
                    )}
                    {competition.contactEmail && (
                        <a
                            href={`mailto:${competition.contactEmail}`}
                            className="flex-1 bg-gray-500 text-white text-center py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                        >
                            Kontakt
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}
