-- Add pages table for custom pages/articles
-- This allows site owners to create custom content pages

CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author VARCHAR(255),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'private')),
    featured_image VARCHAR(255), -- Cloudinary URL
    featured_image_alt VARCHAR(255),
    meta_title VARCHAR(500), -- SEO title
    meta_description TEXT, -- SEO description
    meta_keywords TEXT, -- SEO keywords
    template VARCHAR(50) DEFAULT 'default', -- Page template type
    show_in_navigation BOOLEAN DEFAULT false,
    navigation_order INTEGER DEFAULT 0,
    parent_page_id UUID REFERENCES pages(id),
    view_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_featured ON pages(featured);
CREATE INDEX IF NOT EXISTS idx_pages_navigation ON pages(show_in_navigation, navigation_order);
CREATE INDEX IF NOT EXISTS idx_pages_published_at ON pages(published_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pages_updated_at
    BEFORE UPDATE ON pages
    FOR EACH ROW
    EXECUTE FUNCTION update_pages_updated_at();

-- Insert some example pages
INSERT INTO pages (title, slug, content, excerpt, status, show_in_navigation, navigation_order, published_at) VALUES
('Om VGBF', 'om-vgbf', 
'<h2>Välkommen till Västra Götalands Bågskytteförbund</h2>
<p>Västra Götalands Bågskytteförbund (VGBF) är det regionala förbundet för bågskytte i Västra Götaland. Vi arbetar för att främja och utveckla bågskyttesporten i regionen.</p>

<h3>Vår verksamhet</h3>
<p>VGBF organiserar tävlingar, kurser och andra aktiviteter för bågskyttar i alla åldrar och på alla nivåer. Vi samarbetar nära med våra medlemsklubbar för att erbjuda den bästa möjliga bågskytteupplevelsen.</p>

<h3>Våra värderingar</h3>
<ul>
<li>Säkerhet först - vi prioriterar alltid säker bågskytteutövning</li>
<li>Inkludering - bågskytte för alla oavsett ålder, kön eller funktionsförmåga</li>
<li>Utveckling - vi stöttar våra medlemmar att utvecklas inom sporten</li>
<li>Gemenskap - bågskytte bygger vänskap och samhörighet</li>
</ul>',
'Lär dig mer om Västra Götalands Bågskytteförbund, våra värderingar och verksamhet.',
'published', true, 1, CURRENT_TIMESTAMP),

('Säkerhet och regler', 'sakerhet-och-regler',
'<h2>Säkerhet vid bågskytte</h2>
<p>Säkerhet är vår högsta prioritet inom bågskyttesporten. Här hittar du viktiga säkerhetsregler och riktlinjer.</p>

<h3>Grundläggande säkerhetsregler</h3>
<ol>
<li>Peka aldrig en pilbåge mot någon person</li>
<li>Skjut endast mot godkända mål</li>
<li>Kontrollera att skjutbanan är fri innan du skjuter</li>
<li>Använd alltid lämplig skyddsutrustning</li>
<li>Följ alla instruktioner från kursansvariga och funktionärer</li>
</ol>

<h3>Utrustningskrav</h3>
<p>All utrustning ska vara i gott skick och kontrolleras regelbundet. Defekt utrustning får inte användas.</p>',
'Viktiga säkerhetsregler och riktlinjer för bågskytte.',
'published', true, 2, CURRENT_TIMESTAMP);