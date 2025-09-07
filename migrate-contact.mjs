import pkg from 'pg';
const { Pool } = pkg;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrateContactData() {
  try {
    console.log('🔄 Starting contact data migration from blob storage to PostgreSQL...');
    
    // Fetch current contact data from production API (blob storage)
    const response = await fetch('https://vgbf.vercel.app/api/contact');
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('Failed to fetch contact data from blob storage');
    }
    
    const contactData = result.data;
    console.log('📞 Found contact data to migrate');
    
    // Clear existing data
    await pool.query('DELETE FROM contact_main');
    await pool.query('DELETE FROM contact_postal_address');
    await pool.query('DELETE FROM contact_organization');
    await pool.query('DELETE FROM contact_quick_links');
    await pool.query('DELETE FROM contact_faq');
    console.log('🗑️ Cleared existing PostgreSQL contact data');
    
    // Migrate main contact
    if (contactData.mainContact) {
      await pool.query(`
        INSERT INTO contact_main (title, name, club, phone, email)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        contactData.mainContact.title,
        contactData.mainContact.name,
        contactData.mainContact.club,
        contactData.mainContact.phone,
        contactData.mainContact.email
      ]);
      console.log('✅ Migrated main contact:', contactData.mainContact.name);
    }
    
    // Migrate postal address
    if (contactData.postalAddress) {
      await pool.query(`
        INSERT INTO contact_postal_address (name, street, postal_code, city)
        VALUES ($1, $2, $3, $4)
      `, [
        contactData.postalAddress.name,
        contactData.postalAddress.street,
        contactData.postalAddress.postalCode,
        contactData.postalAddress.city
      ]);
      console.log('✅ Migrated postal address for:', contactData.postalAddress.name);
    }
    
    // Migrate organization number
    if (contactData.organizationNumber) {
      await pool.query(`
        INSERT INTO contact_organization (organization_number)
        VALUES ($1)
      `, [contactData.organizationNumber]);
      console.log('✅ Migrated organization number:', contactData.organizationNumber);
    }
    
    // Migrate quick links
    if (contactData.quickLinks && contactData.quickLinks.length > 0) {
      for (const link of contactData.quickLinks) {
        await pool.query(`
          INSERT INTO contact_quick_links (title, description, url, is_external, order_num, is_active)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          link.title,
          link.description,
          link.url,
          link.isExternal,
          link.order,
          link.isActive
        ]);
        console.log('✅ Migrated quick link:', link.title);
      }
    }
    
    // Migrate FAQ items
    if (contactData.faqItems && contactData.faqItems.length > 0) {
      for (const faq of contactData.faqItems) {
        await pool.query(`
          INSERT INTO contact_faq (question, answer, order_num, is_active)
          VALUES ($1, $2, $3, $4)
        `, [
          faq.question,
          faq.answer,
          faq.order,
          faq.isActive
        ]);
        console.log('✅ Migrated FAQ:', faq.question);
      }
    }
    
    // Verify migration
    const mainContactCheck = await pool.query('SELECT COUNT(*) as count FROM contact_main');
    const quickLinksCheck = await pool.query('SELECT COUNT(*) as count FROM contact_quick_links');
    const faqCheck = await pool.query('SELECT COUNT(*) as count FROM contact_faq');
    
    console.log('\n🎉 Contact data migration complete!');
    console.log(`📊 Migration summary:`);
    console.log(`  - Main contacts: ${mainContactCheck.rows[0].count}`);
    console.log(`  - Quick links: ${quickLinksCheck.rows[0].count}`);
    console.log(`  - FAQ items: ${faqCheck.rows[0].count}`);
    
  } catch (error) {
    console.error('💥 Contact migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrateContactData();
