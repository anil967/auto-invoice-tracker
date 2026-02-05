# Enterprise Invoice Tracking System

A production-grade invoice management and tracking system built with Next.js, featuring AI-powered ingestion, 3-way matching, and automated workflows.

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Biswajitdash-09/Invoice-Tracker.git
cd Invoice-Tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
The project requires a PostgreSQL database (designed for Vercel/Neon Postgres).

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` and fill in your database credentials. You can obtain these from the Vercel Storage tab (Postgres Section) or directly from Neon.tech.

### 4. Database Initialization
If you are setting up a fresh database, run the schema to create necessary tables:
```bash
# You can execute the SQL found in lib/schema.sql in your database console
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🛠 Tech Stack
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Database**: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) / [Neon](https://neon.tech/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [DaisyUI 5](https://daisyui.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🏗 Key Components
- **Dashboard**: Real-time analytics and volume tracking.
- **Matching Arena**: 3-way matching engine for Purchase Orders vs Invoices.
- **Digitization**: AI-driven data extraction interface.
- **Audit Trail**: Enterprise logging for all financial transitions.

---

## 🚢 Deployment (Vercel)
The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new).

1. Push your code to GitHub.
2. Link the repository to Vercel.
3. Ensure the Environment Variables from `.env.local` are added to the Vercel Project Settings.
4. Vercel will automatically detect Next.js and build the project.

---

## 📄 License
Internal Enterprise Use Only.
