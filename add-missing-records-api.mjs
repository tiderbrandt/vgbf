const missingRecords = [
  {
    "category": "Inomhus SBF 18m/12m 30 pilar",
    "class": "U21 Herrar Recurve",
    "name": "Oskar Lindgren",
    "club": "Göteborg BK",
    "score": "575/600",
    "date": "2024-03-10",
    "competition": "Ungdoms DM",
    "competitionUrl": "https://resultat.bagskytte.se/competitions/2024/ungdoms-dm",
    "organizer": "VGBF"
  },
  {
    "category": "Inomhus SBF 18m/12m 30 pilar",
    "class": "U18 Damer Barebow",
    "name": "Emma Svensson",
    "club": "Borås BS",
    "score": "512/600",
    "date": "2024-02-25",
    "competition": "Regionala Ungdomsmästerskapet",
    "organizer": "Borås BS"
  },
  {
    "category": "Utomhus SBF 900 rond",
    "class": "Herrar Barebow",
    "name": "Mikael Gustafsson",
    "club": "Vänersborg BK",
    "score": "814",
    "date": "2024-08-05",
    "competition": "Dalsland Open",
    "competitionUrl": "https://resultat.bagskytte.se/competitions/2024/dalsland-open",
    "organizer": "Vänersborg BK"
  },
  {
    "category": "Utomhus SBF 900 rond",
    "class": "Damer Barebow",
    "name": "Karin Blomqvist",
    "club": "Alingsås BK",
    "score": "763",
    "date": "2024-07-14",
    "competition": "Midsommar Cup",
    "organizer": "Alingsås BK"
  }
]

async function addMissingRecords() {
  console.log('🔍 Adding missing district records via API...')
  
  for (const record of missingRecords) {
    try {
      console.log(`Adding: ${record.name} - ${record.class}`)
      
      const response = await fetch('http://localhost:3000/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU3MzIzMDY5LCJleHAiOjE3NTc5Mjc4Njl9.oiqR6XLI7OeODAPcWUNqev3lcNqmrJNbrmp7rnsH-ow' // Fresh admin token
        },
        body: JSON.stringify(record)
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log(`  ✅ Added: ${record.name}`)
      } else {
        console.log(`  ⚠️ Error: ${result.error}`)
      }
    } catch (error) {
      console.log(`  ❌ Failed to add ${record.name}: ${error.message}`)
    }
  }
  
  console.log('\n🎉 Migration complete!')
}

// Run the migration
addMissingRecords()
