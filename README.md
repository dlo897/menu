# Digital Menu Application

This is a modern, high-performance digital menu application with a back-office administration panel.

## 🚀 Deployment Instructions

### 1. Set up Supabase (Database)
This app uses Supabase for content management. You **must** have a Supabase project to run this app outside of the AI Studio preview.

1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Go to the **SQL Editor** in your Supabase dashboard and paste the contents of `schema.sql`. Run it to create the necessary tables and default settings.
3. Go to **Storage** and create a public bucket named `media`. This is where your images and videos will be stored.
4. Go to **Project Settings > API** and find your `Project URL` and `anon public` key.

### 2. Configure Environment Variables
Create a `.env` file in the root of the project (or set these in your hosting provider's dashboard):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Build & Publish
To publish the app:

1. Run `npm install` to install dependencies.
2. Run `npm run build` to generate the production files.
3. The contents of the `dist` folder are what you need to upload to your hosting provider (Vercel, Netlify, Hostinger, etc.).

---

## 🛠 Features
- **Multi-language Support**: English, Arabic, and Kurdish.
- **Dynamic Content**: Manage categories, items, and marketing slides from the admin panel.
- **Announcement Overlay**: Show events or announcements with image/video support.
- **Developer Support**: Built-in link to connect with the developer.

## 🔐 Admin Access
To access the admin panel (`/admin`):
1. Go to your Supabase Dashboard **Authentication > Users**.
2. Create a new user with an email and password.
3. You can now use these credentials to log in to your app's admin panel.
