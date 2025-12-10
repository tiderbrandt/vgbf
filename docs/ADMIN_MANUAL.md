# VGBF Admin Manual

This document provides a comprehensive guide to using the VGBF (Västra Götalands Bågskytteförbund) Administration Interface.

## 🔐 Access & Authentication

The admin interface is located at `/admin`.
*   **Login:** Required to access any admin features.
*   **Security:** Protected by JWT authentication. Sessions expire automatically for security.

---

## 📰 News Management (Nyheter)

Located at: **Admin > Nyheter**

Manage news articles displayed on the homepage and news archive.

### Features
*   **List View:** See all articles with status (Published/Draft) and dates.
*   **Create/Edit Article:**
    *   **Title & Content:** Rich text editor for article content.
    *   **Images:** Upload images or use **AI Image Generation**.
    *   **Scheduling:** Set a future publication date.
    *   **Featured:** Pin important news to the top.
*   **AI Image Generator:**
    *   Click "Generera AI-bild" in the image section.
    *   Enter a prompt (e.g., "Archery competition in summer").
    *   Select style (Photographic, Digital Art, etc.).
    *   The system generates a unique image using the configured AI provider (Hugging Face/OpenAI).

---

## 🎯 Club Management (Klubbar)

Located at: **Admin > Klubbar**

Manage the registry of archery clubs in the district.

### Features
*   **Club Details:** Name, description, website, and contact info.
*   **Location:** Address and map coordinates.
*   **Facilities:** List available facilities (Indoor/Outdoor ranges).
*   **Training Times:** Manage schedule for training sessions.
*   **Membership:** Update member counts and fees.
*   **Images:** Upload club logos or facility photos.

---

## 🏆 Competition Management (Tävlingar)

Located at: **Admin > Tävlingar**

Manage upcoming and past competitions.

### Features
*   **Event Details:** Name, date, location, and type (3D, Field, Target).
*   **Status:** Upcoming, Ongoing, or Completed.
*   **Invitation:** Upload PDF invitations or link to external info.
*   **Results:** Upload result lists after the event.
*   **Registration:** Link to IANSEO or other registration systems.

---

## 📅 Calendar (Kalender)

Located at: **Admin > Kalender**

Manage the district calendar events.

### Features
*   **Event Types:** Competitions, Meetings, Training, etc.
*   **Visibility:** Public events vs. Internal board meetings.
*   **Sync:** The system can import events from external ICS feeds (configured in Settings).

---

## 🏅 District Records (Distriktsrekord)

Located at: **Admin > Distriktsrekord**

Manage the official district records.

### Features
*   **Record Categories:** Indoor/Outdoor, Bow Type (Recurve, Compound, etc.), Age Class.
*   **Update Records:** Add new records with score, archer name, club, and date.
*   **History:** Keep track of historical records.

---

## 👥 Board & Contact (Styrelse & Kontakt)

Located at: **Admin > Styrelsen** and **Admin > Kontakt**

*   **Board Members:** Update names, roles, and contact details for the board.
*   **Contact Info:** Update the general contact information for the federation.

---

## 🤝 Sponsors (Sponsorer)

Located at: **Admin > Sponsorer**

Manage sponsor logos and links displayed on the site.

*   **Active/Inactive:** Toggle sponsor visibility.
*   **Priority:** Order sponsors by importance.

---

## ⚙️ Settings (Inställningar)

Located at: **Admin > Inställningar**

Global configuration for the website.

### General Settings
*   **Site Info:** Name, description, admin email.
*   **Maintenance Mode:** Temporarily disable the public site.

### AI & API
*   **AI Provider:** Configure Hugging Face or OpenAI API keys for image generation.
*   **External Feeds:** Configure URLs for calendar imports (ICS) or external news.

### Backup & System
*   **Database Backup:** Create manual backups or configure automatic schedules.
*   **Restore:** Restore the system settings from a previous backup.
*   **Logs:** View system activity logs.

---

## 🛠 Technical Notes for Developers

*   **Storage:** Data is stored in PostgreSQL (Neon). See `src/lib/*-storage-postgres.ts`.
*   **Images:** Stored in Cloudinary or Vercel Blob.
*   **Authentication:** Custom JWT implementation (`src/lib/auth.ts`).
*   **API:** All admin actions use secure API routes in `src/app/api/*` protected by `withAuth` middleware.
