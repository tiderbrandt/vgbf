import { put, list } from '@vercel/blob'
import { ContactData, QuickLink, FAQItem } from '@/types'

const BLOB_PREFIX = 'vgbf-contact'

// Helper function to generate unique IDs
function generateContactId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
}

// Get all contact data
export async function getAllContactData(): Promise<ContactData> {
  try {
    const blobs = await list({ prefix: BLOB_PREFIX })
    
    if (blobs.blobs.length === 0) {
      return getDefaultContactData()
    }

    // Find the most recent contact data file
    const contactBlob = blobs.blobs
      .filter(blob => blob.pathname.includes('contact-data'))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0]

    if (!contactBlob) {
      return getDefaultContactData()
    }

    const response = await fetch(contactBlob.url)
    const contactData: ContactData = await response.json()
    
    return contactData
  } catch (error) {
    console.error('Error fetching contact data from blob storage:', error)
    return getDefaultContactData()
  }
}

// Save contact data
export async function saveContactData(contactData: ContactData): Promise<ContactData> {
  try {
    const filename = `${BLOB_PREFIX}/contact-data-${Date.now()}.json`
    
    const updatedData = {
      ...contactData,
      lastUpdated: new Date().toISOString()
    }

    const blob = await put(filename, JSON.stringify(updatedData, null, 2), {
      access: 'public',
      contentType: 'application/json'
    })

    console.log('Contact data saved to blob storage:', blob.url)
    return updatedData
  } catch (error) {
    console.error('Error saving contact data to blob storage:', error)
    throw error
  }
}

// Update main contact
export async function updateMainContact(updates: Partial<ContactData['mainContact']>): Promise<ContactData> {
  try {
    const contactData = await getAllContactData()
    contactData.mainContact = { ...contactData.mainContact, ...updates }
    return await saveContactData(contactData)
  } catch (error) {
    console.error('Error updating main contact:', error)
    throw error
  }
}

// Update postal address
export async function updatePostalAddress(updates: Partial<ContactData['postalAddress']>): Promise<ContactData> {
  try {
    const contactData = await getAllContactData()
    contactData.postalAddress = { ...contactData.postalAddress, ...updates }
    return await saveContactData(contactData)
  } catch (error) {
    console.error('Error updating postal address:', error)
    throw error
  }
}

// Update organization number
export async function updateOrganizationNumber(orgNumber: string): Promise<ContactData> {
  try {
    const contactData = await getAllContactData()
    contactData.organizationNumber = orgNumber
    return await saveContactData(contactData)
  } catch (error) {
    console.error('Error updating organization number:', error)
    throw error
  }
}

// Add quick link
export async function addQuickLink(linkData: Omit<QuickLink, 'id'>): Promise<ContactData> {
  try {
    const contactData = await getAllContactData()
    const newLink: QuickLink = {
      ...linkData,
      id: generateContactId()
    }
    contactData.quickLinks.push(newLink)
    contactData.quickLinks.sort((a, b) => a.order - b.order)
    return await saveContactData(contactData)
  } catch (error) {
    console.error('Error adding quick link:', error)
    throw error
  }
}

// Update quick link
export async function updateQuickLink(id: string, updates: Partial<QuickLink>): Promise<ContactData | null> {
  try {
    const contactData = await getAllContactData()
    const linkIndex = contactData.quickLinks.findIndex(link => link.id === id)
    
    if (linkIndex === -1) {
      return null
    }

    contactData.quickLinks[linkIndex] = {
      ...contactData.quickLinks[linkIndex],
      ...updates
    }
    contactData.quickLinks.sort((a, b) => a.order - b.order)
    return await saveContactData(contactData)
  } catch (error) {
    console.error('Error updating quick link:', error)
    throw error
  }
}

// Delete quick link
export async function deleteQuickLink(id: string): Promise<ContactData | null> {
  try {
    const contactData = await getAllContactData()
    const linkIndex = contactData.quickLinks.findIndex(link => link.id === id)
    
    if (linkIndex === -1) {
      return null
    }

    contactData.quickLinks.splice(linkIndex, 1)
    return await saveContactData(contactData)
  } catch (error) {
    console.error('Error deleting quick link:', error)
    throw error
  }
}

// Add FAQ item
export async function addFAQItem(faqData: Omit<FAQItem, 'id'>): Promise<ContactData> {
  try {
    const contactData = await getAllContactData()
    const newFAQ: FAQItem = {
      ...faqData,
      id: generateContactId()
    }
    contactData.faqItems.push(newFAQ)
    contactData.faqItems.sort((a, b) => a.order - b.order)
    return await saveContactData(contactData)
  } catch (error) {
    console.error('Error adding FAQ item:', error)
    throw error
  }
}

// Update FAQ item
export async function updateFAQItem(id: string, updates: Partial<FAQItem>): Promise<ContactData | null> {
  try {
    const contactData = await getAllContactData()
    const faqIndex = contactData.faqItems.findIndex(faq => faq.id === id)
    
    if (faqIndex === -1) {
      return null
    }

    contactData.faqItems[faqIndex] = {
      ...contactData.faqItems[faqIndex],
      ...updates
    }
    contactData.faqItems.sort((a, b) => a.order - b.order)
    return await saveContactData(contactData)
  } catch (error) {
    console.error('Error updating FAQ item:', error)
    throw error
  }
}

// Delete FAQ item
export async function deleteFAQItem(id: string): Promise<ContactData | null> {
  try {
    const contactData = await getAllContactData()
    const faqIndex = contactData.faqItems.findIndex(faq => faq.id === id)
    
    if (faqIndex === -1) {
      return null
    }

    contactData.faqItems.splice(faqIndex, 1)
    return await saveContactData(contactData)
  } catch (error) {
    console.error('Error deleting FAQ item:', error)
    throw error
  }
}

// Default contact data
function getDefaultContactData(): ContactData {
  return {
    mainContact: {
      title: 'Ordförande',
      name: 'Bengt Idéhn',
      club: 'BS Gothia',
      phone: '0705 46 34 66',
      email: 'VastraGotalandsBF@bagskytte.se'
    },
    postalAddress: {
      name: 'Bengt Idéhn',
      street: 'Änghagsliden 114',
      postalCode: '423 49',
      city: 'Torslanda'
    },
    organizationNumber: '857500-2954',
    quickLinks: [
      {
        id: generateContactId(),
        title: 'Styrelsen',
        description: 'Kontaktuppgifter till alla styrelseledamöter',
        url: '/styrelsen',
        isExternal: false,
        order: 1,
        isActive: true
      },
      {
        id: generateContactId(),
        title: 'Medlemsklubbar',
        description: 'Hitta kontaktuppgifter till våra klubbar',
        url: '/klubbar',
        isExternal: false,
        order: 2,
        isActive: true
      },
      {
        id: generateContactId(),
        title: 'Svenska Bågskytteförbundet',
        description: 'Nationella förbundets webbplats',
        url: 'https://www.bagskytte.se',
        isExternal: true,
        order: 3,
        isActive: true
      }
    ],
    faqItems: [
      {
        id: generateContactId(),
        question: 'Hur blir jag medlem?',
        answer: 'För att bli medlem i VGBF ska du först bli medlem i en av våra medlemsklubbar. Medlemskapet i förbundet följer automatiskt med klubbmedlemskapet.',
        order: 1,
        isActive: true
      },
      {
        id: generateContactId(),
        question: 'Var kan jag prova på bågskytte?',
        answer: 'Många av våra klubbar erbjuder prova-på aktiviteter. Kontakta den klubb som ligger närmast dig för mer information.',
        order: 2,
        isActive: true
      },
      {
        id: generateContactId(),
        question: 'Hur anmäler jag en tävling?',
        answer: 'Tävlingsanmälan görs vanligtvis via Svenska Bågskytteförbundets anmälningssystem eller direkt till arrangörklubben. Se mer information på respektive tävlingssida.',
        order: 3,
        isActive: true
      },
      {
        id: generateContactId(),
        question: 'Var hittar jag tävlingsresultat?',
        answer: 'Aktuella tävlingsresultat publiceras på våra nyhetssidor och på distriktsrekordsidan för nya rekord.',
        order: 4,
        isActive: true
      }
    ],
    lastUpdated: new Date().toISOString()
  }
}
