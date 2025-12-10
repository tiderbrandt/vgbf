import { getAllNews } from '@/lib/news-storage-postgres'
import { getAllCompetitions } from '@/lib/competitions-storage-postgres'
import { getAllClubs } from '@/lib/clubs-storage-postgres'
import { getAllSponsors } from '@/lib/sponsors-storage-postgres'
import { getAllBoardMembers } from '@/lib/board-storage-postgres'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [news, competitions, clubs, sponsors, boardMembers] = await Promise.all([
    getAllNews(),
    getAllCompetitions(),
    getAllClubs(),
    getAllSponsors(true), // Include inactive sponsors for admin
    getAllBoardMembers()
  ])

  return (
    <AdminDashboardClient
      news={news}
      competitions={competitions}
      clubs={clubs}
      sponsors={sponsors}
      boardMembers={boardMembers}
    />
  )
}
