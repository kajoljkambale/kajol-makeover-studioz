# 💄 Kajol Makeover Studioz — Studio Management App

Complete cloud-based studio management system for Makeup, Mehndi & ArtWork classes and individual orders.

---

## ✅ Features
- Student management with enrollment to multiple batches/courses
- Course & syllabus management with WhatsApp share
- Batch management with class progress, homework compliance, attendance
- Zoom link management per batch & class
- YouTube upload tracker (Pending / Processing / Uploaded)
- WhatsApp reminders for classes, payments, batch groups
- Individual orders (Mehndi / Makeup / ArtWork) with per-order expenses
- Finance tracking: income vs expenses, batch-wise, monthly reports
- Broadcast messaging: class reminders, payment reminders, festival wishes, birthday wishes
- Full reports: monthly, batch-wise, student-wise, orders
- Desktop + Mobile responsive design
- Cloud data via Supabase (accessible from any device/browser)
- Admin password protected

---

## 🚀 COMPLETE SETUP GUIDE

### STEP 1 — Set up Supabase Database

1. Go to **https://supabase.com** and log in
2. Open your project (or create one)
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. **Copy the entire contents** of `supabase_schema.sql` and paste it
6. Click **Run** (▶ button)
7. You should see "Success. No rows returned" — database is ready!

---

### STEP 2 — Push Code to GitHub

1. Go to **https://github.com** → New Repository
2. Name it: `kajol-makeover-studioz`
3. Keep it **Private**
4. Click **Create repository**

Then on your computer (or use GitHub web upload):

**Option A — Upload files directly on GitHub website:**
- Click "uploading an existing file"
- Drag and drop ALL files and folders from this project
- Click "Commit changes"

**Option B — Using Git (if you have it installed):**
```bash
cd kajol-app
git init
git add .
git commit -m "Initial commit - Kajol Makeover Studioz"
git remote add origin https://github.com/YOUR_USERNAME/kajol-makeover-studioz.git
git push -u origin main
```

---

### STEP 3 — Deploy on Vercel

1. Go to **https://vercel.com** → Log in with GitHub
2. Click **"Add New Project"**
3. Click **"Import"** next to `kajol-makeover-studioz`
4. On the Configure page:
   - Framework: **Vite** (auto-detected)
   - Root Directory: leave as `/`
5. Click **"Environment Variables"** and add:
   ```
   VITE_SUPABASE_URL = https://zlzrdpagpwlrbljfmxzy.supabase.co
   VITE_SUPABASE_ANON_KEY = sb_publishable_6_AujeG9DfoPxMELnkGCeQ_08K3XEF4
   ```
6. Click **Deploy**
7. Wait ~2 minutes — your app is live! 🎉

Vercel gives you a URL like: `https://kajol-makeover-studioz.vercel.app`

---

### STEP 4 — Install on Android as App

1. Open Chrome on your Android phone
2. Go to your Vercel URL
3. Tap the **3-dot menu** (⋮) → **"Add to Home Screen"**
4. Name it "KMS Studio" → Tap **Add**
5. It will appear as an app icon on your home screen! 📱

---

## 🔐 Admin Login

**Password:** `kajol2024`

> To change the password: Open `src/App.jsx`, find `ADMIN_PWD = 'kajol2024'` and change it.

---

## 📁 Project File Structure

```
kajol-app/
├── index.html              ← Main HTML entry point
├── vite.config.js          ← Vite build config
├── package.json            ← Dependencies
├── vercel.json             ← Vercel deployment config
├── .env                    ← Supabase credentials (DO NOT push to public repo)
├── .gitignore              ← Ignores .env, node_modules
├── supabase_schema.sql     ← Run this in Supabase SQL Editor
├── public/
│   ├── manifest.json       ← PWA manifest for mobile install
│   └── favicon.svg         ← App icon
└── src/
    ├── main.jsx            ← React entry point
    ├── App.jsx             ← Main app + all core tabs
    ├── index.css           ← Global styles (desktop + mobile)
    ├── lib/
    │   ├── supabase.js     ← Supabase client + CRUD helpers
    │   └── ui.jsx          ← Shared UI components
    └── components/
        ├── Dashboard.jsx   ← Dashboard with pending activities
        ├── CoursesTab.jsx  ← Course & syllabus management
        ├── BroadcastTab.jsx← Bulk WhatsApp messaging
        └── SettingsTab.jsx ← Settings + clear data
```

---

## 🔄 Making Updates

After initial setup, to update your app:
1. Edit the files locally
2. Push to GitHub (`git push`)
3. Vercel auto-deploys within 1 minute ✅

---

## 🆘 Troubleshooting

**"Failed to load data":**
- Check Supabase URL and key in Vercel environment variables
- Make sure you ran the SQL schema in Supabase

**"RLS policy error":**
- Re-run the SQL schema — the RLS policies allow access

**App not updating on phone:**
- Hard refresh: hold Ctrl+Shift+R (browser) or clear cache

---

## 📞 Support

For help with this app, contact your developer.

---

*Kajol Makeover Studioz © 2025 — All rights reserved*
