import { sql } from './database'
import { ContactData } from '@/types'

/**
 * PostgreSQL storage for contact data
 * Replaces the blob storage for contact information
 */

/**
 * Get all contact data
 */
export async function getAllContactData(): Promise<ContactData> {
  try {
    // Get main contact
    const mainContactResult = await sql`SELECT * FROM contact_main LIMIT 1`
    const mainContactRows = mainContactResult.rows || mainContactResult
    
    // Get postal address
    const postalAddressResult = await sql`SELECT * FROM contact_postal_address LIMIT 1`
    const postalAddressRows = postalAddressResult.rows || postalAddressResult
    
    // Get organization number
    const orgResult = await sql`SELECT organization_number FROM contact_organization LIMIT 1`
    const orgRows = orgResult.rows || orgResult
    
    // Get quick links
    const quickLinksResult = await sql`SELECT * FROM contact_quick_links WHERE is_active = true ORDER BY order_num`
    const quickLinksRows = quickLinksResult.rows || quickLinksResult
    
    // Get FAQ items
    const faqResult = await sql`SELECT * FROM contact_faq WHERE is_active = true ORDER BY order_num`
    const faqRows = faqResult.rows || faqResult

    return {
      mainContact: mainContactRows.length > 0 ? {
        title: mainContactRows[0].title,
        name: mainContactRows[0].name,
        club: mainContactRows[0].club,
        phone: mainContactRows[0].phone,
        email: mainContactRows[0].email
      } : null,
      postalAddress: postalAddressRows.length > 0 ? {
        name: postalAddressRows[0].name,
        street: postalAddressRows[0].street,
        postalCode: postalAddressRows[0].postal_code,
        city: postalAddressRows[0].city
      } : null,
      organizationNumber: orgRows.length > 0 ? orgRows[0].organization_number : null,
      quickLinks: quickLinksRows.map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        url: row.url,
        isExternal: row.is_external,
        order: row.order_num,
        isActive: row.is_active
      })),
      faqItems: faqRows.map((row: any) => ({
        id: row.id,
        question: row.question,
        answer: row.answer,
        order: row.order_num,
        isActive: row.is_active
      })),
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error getting contact data:', error)
    throw new Error('Failed to fetch contact data')
  }
}

/**
 * Save complete contact data
 */
export async function saveContactData(contactData: ContactData): Promise<ContactData> {
  try {
    // Update main contact
    if (contactData.mainContact) {
      await sql`
        INSERT INTO contact_main (title, name, club, phone, email, updated_at)
        VALUES (${contactData.mainContact.title}, ${contactData.mainContact.name}, 
                ${contactData.mainContact.club}, ${contactData.mainContact.phone}, 
                ${contactData.mainContact.email}, NOW())
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          name = EXCLUDED.name,
          club = EXCLUDED.club,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          updated_at = NOW()
      `
    }

    // Update postal address
    if (contactData.postalAddress) {
      await sql`
        INSERT INTO contact_postal_address (name, street, postal_code, city, updated_at)
        VALUES (${contactData.postalAddress.name}, ${contactData.postalAddress.street}, 
                ${contactData.postalAddress.postalCode}, ${contactData.postalAddress.city}, NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          street = EXCLUDED.street,
          postal_code = EXCLUDED.postal_code,
          city = EXCLUDED.city,
          updated_at = NOW()
      `
    }

    // Update organization number
    if (contactData.organizationNumber) {
      await sql`
        INSERT INTO contact_organization (organization_number, updated_at)
        VALUES (${contactData.organizationNumber}, NOW())
        ON CONFLICT (id) DO UPDATE SET
          organization_number = EXCLUDED.organization_number,
          updated_at = NOW()
      `
    }

    return await getAllContactData()
  } catch (error) {
    console.error('Error saving contact data:', error)
    throw new Error('Failed to save contact data')
  }
}

/**
 * Update main contact
 */
export async function updateMainContact(mainContact: ContactData['mainContact']): Promise<ContactData> {
  try {
    if (!mainContact) throw new Error('Main contact data is required')
    
    await sql`
      INSERT INTO contact_main (title, name, club, phone, email, updated_at)
      VALUES (${mainContact.title}, ${mainContact.name}, ${mainContact.club}, 
              ${mainContact.phone}, ${mainContact.email}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        name = EXCLUDED.name,
        club = EXCLUDED.club,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        updated_at = NOW()
    `

    return await getAllContactData()
  } catch (error) {
    console.error('Error updating main contact:', error)
    throw new Error('Failed to update main contact')
  }
}

/**
 * Update postal address
 */
export async function updatePostalAddress(postalAddress: ContactData['postalAddress']): Promise<ContactData> {
  try {
    if (!postalAddress) throw new Error('Postal address data is required')
    
    await sql`
      INSERT INTO contact_postal_address (name, street, postal_code, city, updated_at)
      VALUES (${postalAddress.name}, ${postalAddress.street}, 
              ${postalAddress.postalCode}, ${postalAddress.city}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        street = EXCLUDED.street,
        postal_code = EXCLUDED.postal_code,
        city = EXCLUDED.city,
        updated_at = NOW()
    `

    return await getAllContactData()
  } catch (error) {
    console.error('Error updating postal address:', error)
    throw new Error('Failed to update postal address')
  }
}

/**
 * Update organization number
 */
export async function updateOrganizationNumber(organizationNumber: string): Promise<ContactData> {
  try {
    await sql`
      INSERT INTO contact_organization (organization_number, updated_at)
      VALUES (${organizationNumber}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        organization_number = EXCLUDED.organization_number,
        updated_at = NOW()
    `

    return await getAllContactData()
  } catch (error) {
    console.error('Error updating organization number:', error)
    throw new Error('Failed to update organization number')
  }
}

/**
 * Add quick link
 */
export async function addQuickLink(quickLink: Omit<ContactData['quickLinks'][0], 'id'>): Promise<ContactData> {
  try {
    await sql`
      INSERT INTO contact_quick_links (title, description, url, is_external, order_num, is_active, created_at, updated_at)
      VALUES (${quickLink.title}, ${quickLink.description}, ${quickLink.url}, 
              ${quickLink.isExternal}, ${quickLink.order}, ${quickLink.isActive}, NOW(), NOW())
    `

    return await getAllContactData()
  } catch (error) {
    console.error('Error adding quick link:', error)
    throw new Error('Failed to add quick link')
  }
}

/**
 * Update quick link
 */
export async function updateQuickLink(id: string, quickLink: Partial<ContactData['quickLinks'][0]>): Promise<ContactData> {
  try {
    const updateFields = []
    const values = []
    
    if (quickLink.title !== undefined) {
      updateFields.push('title = $' + (values.length + 2))
      values.push(quickLink.title)
    }
    if (quickLink.description !== undefined) {
      updateFields.push('description = $' + (values.length + 2))
      values.push(quickLink.description)
    }
    if (quickLink.url !== undefined) {
      updateFields.push('url = $' + (values.length + 2))
      values.push(quickLink.url)
    }
    if (quickLink.isExternal !== undefined) {
      updateFields.push('is_external = $' + (values.length + 2))
      values.push(quickLink.isExternal)
    }
    if (quickLink.order !== undefined) {
      updateFields.push('order_num = $' + (values.length + 2))
      values.push(quickLink.order)
    }
    if (quickLink.isActive !== undefined) {
      updateFields.push('is_active = $' + (values.length + 2))
      values.push(quickLink.isActive)
    }

    if (updateFields.length > 0) {
      updateFields.push('updated_at = NOW()')
      const query = `UPDATE contact_quick_links SET ${updateFields.join(', ')} WHERE id = $1`
      await sql.query(query, [id, ...values])
    }

    return await getAllContactData()
  } catch (error) {
    console.error('Error updating quick link:', error)
    throw new Error('Failed to update quick link')
  }
}

/**
 * Delete quick link
 */
export async function deleteQuickLink(id: string): Promise<ContactData> {
  try {
    await sql`DELETE FROM contact_quick_links WHERE id = ${id}`
    return await getAllContactData()
  } catch (error) {
    console.error('Error deleting quick link:', error)
    throw new Error('Failed to delete quick link')
  }
}

/**
 * Add FAQ item
 */
export async function addFAQItem(faqItem: Omit<ContactData['faqItems'][0], 'id'>): Promise<ContactData> {
  try {
    await sql`
      INSERT INTO contact_faq (question, answer, order_num, is_active, created_at, updated_at)
      VALUES (${faqItem.question}, ${faqItem.answer}, ${faqItem.order}, ${faqItem.isActive}, NOW(), NOW())
    `

    return await getAllContactData()
  } catch (error) {
    console.error('Error adding FAQ item:', error)
    throw new Error('Failed to add FAQ item')
  }
}

/**
 * Update FAQ item
 */
export async function updateFAQItem(id: string, faqItem: Partial<ContactData['faqItems'][0]>): Promise<ContactData> {
  try {
    const updateFields = []
    const values = []
    
    if (faqItem.question !== undefined) {
      updateFields.push('question = $' + (values.length + 2))
      values.push(faqItem.question)
    }
    if (faqItem.answer !== undefined) {
      updateFields.push('answer = $' + (values.length + 2))
      values.push(faqItem.answer)
    }
    if (faqItem.order !== undefined) {
      updateFields.push('order_num = $' + (values.length + 2))
      values.push(faqItem.order)
    }
    if (faqItem.isActive !== undefined) {
      updateFields.push('is_active = $' + (values.length + 2))
      values.push(faqItem.isActive)
    }

    if (updateFields.length > 0) {
      updateFields.push('updated_at = NOW()')
      const query = `UPDATE contact_faq SET ${updateFields.join(', ')} WHERE id = $1`
      await sql.query(query, [id, ...values])
    }

    return await getAllContactData()
  } catch (error) {
    console.error('Error updating FAQ item:', error)
    throw new Error('Failed to update FAQ item')
  }
}

/**
 * Delete FAQ item
 */
export async function deleteFAQItem(id: string): Promise<ContactData> {
  try {
    await sql`DELETE FROM contact_faq WHERE id = ${id}`
    return await getAllContactData()
  } catch (error) {
    console.error('Error deleting FAQ item:', error)
    throw new Error('Failed to delete FAQ item')
  }
}
