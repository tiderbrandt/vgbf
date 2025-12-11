import { getAllRecords as getDistrictRecords } from '@/lib/records-storage-postgres'
import { getDistriktsrekordInfo } from '@/lib/settings-storage-postgres'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import DistriktsrekordClient from '@/components/DistriktsrekordClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Distriktsrekord - VGBF',
  description: 'Officiella distriktsrekord för Västra Götalands Bågskytteförbund.',
}

export const dynamic = 'force-dynamic'

export default async function DistriktsrekordPage() {
  const records = await getDistrictRecords()

  // Get the distriktsrekord information from database
  let distriktsrekordInfo = ''
  try {
    const infoResult = await getDistriktsrekordInfo()
    if (infoResult.success && infoResult.data) {
      distriktsrekordInfo = infoResult.data
    }
  } catch (error) {
    console.error('Error loading distriktsrekord info:', error)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <Hero
        title="Distriktsrekord"
        subtitle="Västra Götalands Bågskytteförbund officiella distriktsrekord"
        description="Här hittar du alla aktuella distriktsrekord för Västra Götaland i bågskytesporten."
        showButtons={false}
      />

      <DistriktsrekordClient
        initialRecords={records}
        infoText={distriktsrekordInfo}
      />

      <Footer />
    </main>
  )
}

