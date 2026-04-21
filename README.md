# Kajol Makeover Studioz — Studio Management App

A full-stack studio management web app for managing students, batches, courses, payments, orders, and the public website. Built with React + Vite + Supabase + Vercel.

---

## 📁 Project Structure

```
kajol-makeover-studioz/
├── index.html                        ← App entry point (do not edit)
├── vite.config.js                    ← Build config (do not edit)
├── vercel.json                       ← Routing rules for Vercel (do not edit)
├── package.json                      ← Dependencies (do not edit)
├── public/
│   ├── favicon.svg                   ← App icon
│   ├── manifest.json                 ← PWA config
│   └── upi-qr.jpg                    ← UPI QR code image for payments page
└── src/
    ├── main.jsx                      ← ReactDOM entry (do not edit)
    ├── App.jsx                       ← URL router: / → Website, /app → Admin, /enroll → Form
    ├── index.css                     ← Global styles (animations, scrollbar)
    ├── lib/
    │   ├── supabase.js               ← ALL database functions (dbLoad, dbUpsert, dbDelete etc.)
    │   └── ui.jsx                    ← ALL shared UI components + constants + colors
    ├── pages/
    │   ├── Website.jsx               ← Public homepage (hero, courses, gallery, reviews, FAQ)
    │   ├── AppDashboard.jsx          ← Admin app shell (navigation, layout, tab routing)
    │   └── EnrollForm.jsx            ← Public enrollment form (/enroll route)
    └── components/
        └── tabs/
            ├── Login.jsx             ← Admin login screen
            ├── Dashboard.jsx         ← Admin home dashboard (stats, alerts)
            ├── EnrollmentTab.jsx     ← Review & approve enrollment requests
            ├── StudentsTab.jsx       ← Add, edit, search students
            ├── CoursesTab.jsx        ← Create and manage courses + syllabus
            ├── BatchesTab.jsx        ← Manage batches, classes, attendance, homework
            ├── PaymentsTab.jsx       ← Track student fee payments
            ├── LeadsOrdersTab.jsx    ← Bookings, leads and commercial orders
            ├── FinanceTab.jsx        ← Expenses, income, monthly P&L
            ├── ReportsTab.jsx        ← Analytics: batch stats, student reports
            ├── BroadcastTab.jsx      ← WhatsApp message templates & broadcast
            ├── CertificateTab.jsx    ← Generate and send certificates
            ├── WebsiteEditorTab.jsx  ← Edit website content from admin panel
            └── SettingsTab.jsx       ← Admin settings, data management
```

---

## 🚀 Deployment (Vercel + GitHub)

1. Push to GitHub
2. Vercel auto-deploys on every push
3. Set these Environment Variables in Vercel Dashboard → Settings → Environment Variables:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

---

## 🗄️ Database Setup

Run `supabase_schema.sql` once in Supabase → SQL Editor → New Query → Run.

Tables used:
- `students` — student profiles
- `courses` — course definitions
- `batches` — batch info (timing, zoom, whatsapp)
- `classes` — individual class sessions per batch
- `homework_compliance` — homework tracking
- `payments` — fee payment records
- `orders` — client bookings & commercial orders
- `expenses` — studio expenses
- `enrollment_requests` — public form submissions
- `site_content` — website editable content (key/value)

---

## 🌐 URL Routes

| URL | What it shows |
|-----|---------------|
| `/` | Public website (Website.jsx) |
| `/enroll` | Public enrollment form (EnrollForm.jsx) |
| `/app` | Admin dashboard (AppDashboard.jsx) — password: kajol2024 |

---

## 🔑 Admin Login

Password: **kajol2024**

To change: edit `ADMIN_PWD` in `src/lib/ui.jsx` line ~20.

---

## 📞 Contact Info in App

All contact details are in `src/components/tabs/Dashboard.jsx` and `src/pages/Website.jsx`:
- Phone: 8390695155 / 7030825125
- Email: kajoljkambale@gmail.com
- UPI: kajalkambaleaxis@yesg

---

## 💡 How to Ask Claude for Modifications

### When you need to change something, upload ONLY the relevant file:

| What you want to change | Upload this file |
|------------------------|-----------------|
| Batch management (classes, attendance, zoom) | `src/components/tabs/BatchesTab.jsx` |
| Student management | `src/components/tabs/StudentsTab.jsx` |
| Finance / expenses | `src/components/tabs/FinanceTab.jsx` |
| Orders / leads / bookings | `src/components/tabs/LeadsOrdersTab.jsx` |
| Payments | `src/components/tabs/PaymentsTab.jsx` |
| Course & syllabus | `src/components/tabs/CoursesTab.jsx` |
| Reports & analytics | `src/components/tabs/ReportsTab.jsx` |
| WhatsApp broadcast | `src/components/tabs/BroadcastTab.jsx` |
| Certificates | `src/components/tabs/CertificateTab.jsx` |
| Website homepage | `src/pages/Website.jsx` |
| Enrollment form | `src/pages/EnrollForm.jsx` |
| Website text editor (admin) | `src/components/tabs/WebsiteEditorTab.jsx` |
| Admin settings / clear data | `src/components/tabs/SettingsTab.jsx` |
| Dashboard home screen | `src/components/tabs/Dashboard.jsx` |
| Login screen | `src/components/tabs/Login.jsx` |
| Enrollment requests | `src/components/tabs/EnrollmentTab.jsx` |
| Colors, fonts, shared components | `src/lib/ui.jsx` |
| Database functions | `src/lib/supabase.js` |
| Add a new URL route | `src/App.jsx` |
| Navigation tabs in admin | `src/pages/AppDashboard.jsx` |

### Example request format that gets best results:
> *"Here is my BatchesTab.jsx. When I click Save Batch, show a success toast and refresh the batch list. Keep everything else the same."*

### Never upload:
- The full zip (too large, wastes your free messages)
- Multiple files at once (unless truly needed)
- Files you haven't changed

---

## 🔧 Common Fixes

### "Enroll Now" shows blank page
Check `vercel.json` exists at repo root with rewrites. Already included.

### Data not saving to Supabase
- Check browser console for error messages
- Run `supabase_schema.sql` again in Supabase SQL editor
- Verify env vars are set in Vercel dashboard

### Build fails on Vercel
- The error message shows the file and line number
- Upload that specific file to Claude with the error message
- Say: "Fix this syntax error: [paste error]"

---

## 📊 Free Plan Usage Tips

Claude free plan = ~10-15 messages per session.

**Max value per message:**
- Upload 1 small file (one tab = ~150 lines = fast to process)
- State the exact change needed
- Say "keep everything else unchanged"
- One task per message

**Avoid:**
- Uploading the old 3000-line AppDashboard.jsx
- Asking multiple unrelated changes in one message
- Re-uploading files that haven't changed

---

*© 2025 Kajol Makeover Studioz by Kajol J Kamble, Pune*
