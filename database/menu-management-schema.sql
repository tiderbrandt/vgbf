-- Menu Management System Database Schema
-- This creates a flexible menu system with support for:
-- - Hierarchical menus (parent/child relationships)
-- - Custom ordering
-- - Multiple menu types (main nav, footer, etc.)
-- - Link types (internal pages, external URLs, custom routes)
-- - Visibility controls

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic menu item properties
    title VARCHAR(255) NOT NULL,
    url VARCHAR(500), -- Can be relative URL, absolute URL, or NULL for parent items
    target VARCHAR(50) DEFAULT '_self', -- _self, _blank, etc.
    
    -- Menu structure
    menu_type VARCHAR(100) DEFAULT 'main', -- 'main', 'footer', 'sidebar', etc.
    parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    
    -- Link type and target
    link_type VARCHAR(50) DEFAULT 'url', -- 'url', 'page', 'news', 'external', 'custom'
    target_id UUID, -- ID of linked page/news article if link_type is 'page' or 'news'
    
    -- Visibility and permissions
    is_visible BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT true,
    requires_auth BOOLEAN DEFAULT false,
    show_on_mobile BOOLEAN DEFAULT true,
    show_on_desktop BOOLEAN DEFAULT true,
    
    -- CSS and styling
    css_class VARCHAR(255),
    icon VARCHAR(100), -- Icon name or class
    description TEXT, -- For tooltips or accessibility
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID, -- User ID who created this menu item
    updated_by UUID  -- User ID who last updated this menu item
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_type ON menu_items(menu_type);
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON menu_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_published ON menu_items(is_published);
CREATE INDEX IF NOT EXISTS idx_menu_items_target_id ON menu_items(target_id);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_menu_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_menu_items_updated_at();

-- Insert default menu structure based on current navigation
INSERT INTO menu_items (title, url, menu_type, sort_order, link_type, is_visible, is_published) VALUES
('Hem', '/', 'main', 1, 'url', true, true),
('Nyheter', '/nyheter', 'main', 2, 'url', true, true),
('Tävlingar', '/tavlingar', 'main', 3, 'url', true, true),
('Klubbar', '/klubbar', 'main', 4, 'url', true, true),
('Kalender', '/kalender', 'main', 5, 'url', true, true),
('Distriktsrekord', '/distriktsrekord', 'main', 6, 'url', true, true),
('Styrelsen', '/styrelsen', 'main', 7, 'url', true, true),
('Kontakt', '/kontakt', 'main', 8, 'url', true, true)
ON CONFLICT DO NOTHING;

-- Add submenu example for Tävlingar
INSERT INTO menu_items (title, url, menu_type, parent_id, sort_order, link_type, is_visible, is_published) 
SELECT 
    'Kommande tävlingar', '/tavlingar/kommande', 'main', 
    (SELECT id FROM menu_items WHERE title = 'Tävlingar' AND menu_type = 'main' LIMIT 1), 
    1, 'url', true, true
WHERE EXISTS (SELECT 1 FROM menu_items WHERE title = 'Tävlingar' AND menu_type = 'main')
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (title, url, menu_type, parent_id, sort_order, link_type, is_visible, is_published) 
SELECT 
    'Pågående tävlingar', '/tavlingar/pagaende', 'main', 
    (SELECT id FROM menu_items WHERE title = 'Tävlingar' AND menu_type = 'main' LIMIT 1), 
    2, 'url', true, true
WHERE EXISTS (SELECT 1 FROM menu_items WHERE title = 'Tävlingar' AND menu_type = 'main')
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (title, url, menu_type, parent_id, sort_order, link_type, is_visible, is_published) 
SELECT 
    'Avslutade tävlingar', '/tavlingar/avslutade', 'main', 
    (SELECT id FROM menu_items WHERE title = 'Tävlingar' AND menu_type = 'main' LIMIT 1), 
    3, 'url', true, true
WHERE EXISTS (SELECT 1 FROM menu_items WHERE title = 'Tävlingar' AND menu_type = 'main')
ON CONFLICT DO NOTHING;