# Västra Götalands Bågskytteförbund (VGBF)

<div align="center">
  <img src="public/vgbf-logo.png" alt="VGBF Logo" width="120" />
  <p>
    <em>The official digital platform for the West Götaland Archery Federation.</em>
  </p>
</div>

This repository contains the source code for the VGBF website, a modern Next.js application designed to manage and present archery activities, news, and administration for the district.

## 🚀 Features

### Public Portal
*   **News Feed:** Latest updates from the federation with rich media support.
*   **Calendar:** Comprehensive event calendar syncing with external ICS feeds.
*   **Club Registry:** Interactive map and directory of all affiliated archery clubs.
*   **Competitions:** Listings for upcoming, ongoing, and past competitions with results.
*   **District Records:** Searchable database of district records across all bow types and classes.

### Administration System
*   **Secure CMS:** Role-based administration for managing all site content.
*   **AI Integration:** Built-in AI image generation (via Hugging Face or OpenAI) for news articles.
*   **Media Management:** Integrated Cloudinary support for optimized image hosting.
*   **Data Management:** Tools for managing board members, sponsors, and contact information.

## 🛠️ Tech Stack

*   **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Database:** [PostgreSQL](https://www.postgresql.org/) (via [Neon](https://neon.tech/))
*   **Storage:** [Cloudinary](https://cloudinary.com/)
*   **Authentication:** Custom JWT-based auth
*   **Maps:** Leaflet / React-Leaflet

## 💻 Getting Started

### Prerequisites

*   Node.js 18+
*   npm or yarn
*   A PostgreSQL database (local or hosted)
*   Cloudinary account

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/tiderbrandt/vgbf.git
    cd vgbf
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env.local` file in the root directory with the following variables:

    ```bash
    # Database
    DATABASE_URL="postgresql://user:password@host:port/dbname"
    USE_PG_LOCAL=0 # Set to 1 if using local DB

    # Authentication
    JWT_SECRET="your-secure-secret"
    ADMIN_EMAIL="admin@example.com"

    # Cloudinary (Image Storage)
    CLOUDINARY_CLOUD_NAME="your-cloud-name"
    CLOUDINARY_API_KEY="your-api-key"
    CLOUDINARY_API_SECRET="your-api-secret"

    # AI Features (Optional)
    HUGGINGFACE_API_KEY="your-hf-key"
    OPENAI_API_KEY="your-openai-key"
    ```

4.  **Initialize Database**
    Run the migration scripts to set up the schema:
    ```bash
    npm run migrate
    ```

5.  **Start Development Server**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

## 📂 Project Structure

```
src/
├── app/                 # Next.js App Router pages and API routes
│   ├── admin/           # Protected administration interface
│   ├── api/             # Backend API endpoints
│   └── ...              # Public pages (news, clubs, etc.)
├── components/          # Reusable React components
├── lib/                 # Utilities and storage layers
│   ├── *-storage-postgres.ts  # Database access patterns
│   └── auth.ts          # Authentication logic
├── types/               # TypeScript definitions
└── styles/              # Global styles and Tailwind config
```

> [!NOTE]
> The project uses a "Storage Layer" pattern (`src/lib/*-storage-postgres.ts`) to abstract database operations. Always use these helpers instead of querying the database directly in components.

## 🧪 Testing

The project uses Jest and React Testing Library for testing.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test suites
npm run test:api
npm run test:components
```

## 📦 Deployment

This project is optimized for deployment on [Vercel](https://vercel.com).

1.  Push your code to a Git repository.
2.  Import the project into Vercel.
3.  Configure the environment variables in the Vercel dashboard.
4.  Deploy.

> [!IMPORTANT]
> Ensure that the `npm run build` command passes locally before deploying, as the build process includes type checking and linting.

## 📚 Documentation

For detailed administration guides, please refer to the [Admin Manual](docs/ADMIN_MANUAL.md).
