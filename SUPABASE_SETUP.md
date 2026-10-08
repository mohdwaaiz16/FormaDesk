# FormaDesk Supabase Setup Guide

## 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Once provisioned, open the **SQL Editor** from the left sidebar.

## 2. Run the Database Migration
1. Copy the contents of `supabase_migration.sql` (found in the root of this project).
2. Paste it into the Supabase SQL Editor and click **Run**.
3. This creates your tables (`companies`, `profiles`, `invoices`), establishes Row Level Security (RLS) to isolate company data, and sets up automatic timestamps.

## 3. Connect the Frontend
1. Go to **Project Settings** -> **API** in the Supabase dashboard.
2. Copy your **Project URL** and **anon / public** key.
3. In the root of your FormaDesk code, create a file named `.env` (you can copy `.env.example`).
4. Add your values:
   ```env
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```
5. Restart your Vite development server (`npm run dev`).

## 4. Test the Integration
1. Open the app and navigate to **Create Company Account** (`/signup`).
2. Register a new company and user.
3. Verify that you are redirected to the Dashboard.
4. Create an invoice and test saving it to your cloud history!
