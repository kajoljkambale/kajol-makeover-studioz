-- ══════════════════════════════════════════════════════════════
-- KAJOL MAKEOVER STUDIOZ — Supabase Database Schema
-- Run this entire script in Supabase → SQL Editor → New Query
-- ══════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── STUDENTS ──────────────────────────────────────────────────────
create table if not exists students (
  id            text primary key,
  name          text not null,
  mobile        text,
  profession    text,
  address       text,
  email         text,
  birthday      date,
  enrolled_courses  text[] default '{}',
  join_date     date default current_date,
  created_at    timestamptz default now()
);

-- ── COURSES ───────────────────────────────────────────────────────
create table if not exists courses (
  id            text primary key,
  name          text not null,
  type          text default 'Mehndi',
  color         text default '#E91E8C',
  description   text,
  syllabus      text,
  fee           numeric default 0,
  created_at    timestamptz default now()
);

-- ── BATCHES ───────────────────────────────────────────────────────
create table if not exists batches (
  id            text primary key,
  name          text not null,
  course_id     text references courses(id) on delete set null,
  schedule      text default 'Daily',
  duration      text default '10 Days',
  start_date    date,
  end_date      date,
  timing        text,
  status        text default 'Active',
  fee           numeric default 0,
  zoom_link     text,
  zoom_id       text,
  wa_group      text,
  youtube_channel text,
  student_ids   text[] default '{}',
  created_at    timestamptz default now()
);

-- ── CLASSES ───────────────────────────────────────────────────────
create table if not exists classes (
  id            text primary key,
  batch_id      text references batches(id) on delete cascade,
  day           integer default 1,
  topic         text not null,
  date          date,
  zoom_link     text,
  youtube_link  text,
  youtube_status text default 'Pending',
  homework      text,
  notes         text,
  attendees     text[] default '{}',
  created_at    timestamptz default now()
);

-- ── HOMEWORK COMPLIANCE ───────────────────────────────────────────
create table if not exists homework_compliance (
  id            text primary key,
  class_id      text references classes(id) on delete cascade,
  student_id    text references students(id) on delete cascade,
  submitted     boolean default false,
  note          text,
  date          date,
  created_at    timestamptz default now()
);

-- ── PAYMENTS ──────────────────────────────────────────────────────
create table if not exists payments (
  id            text primary key,
  student_id    text references students(id) on delete set null,
  batch_id      text references batches(id) on delete set null,
  amount        numeric default 0,
  paid          numeric default 0,
  type          text default 'Full',
  date          date default current_date,
  note          text,
  created_at    timestamptz default now()
);

-- ── ORDERS (Individual Mehndi / Makeup / ArtWork) ─────────────────
create table if not exists orders (
  id            text primary key,
  type          text default 'Mehndi',
  client        text not null,
  mobile        text,
  date          date default current_date,
  amount        numeric default 0,
  paid          numeric default 0,
  status        text default 'Pending',
  notes         text,
  order_expenses jsonb default '[]',
  created_at    timestamptz default now()
);

-- ── EXPENSES (General) ────────────────────────────────────────────
create table if not exists expenses (
  id            text primary key,
  category      text default 'Advertising',
  amount        numeric default 0,
  date          date default current_date,
  note          text,
  linked_to     text default 'general',
  created_at    timestamptz default now()
);

-- ── REMINDERS ─────────────────────────────────────────────────────
create table if not exists reminders (
  id            text primary key,
  batch_id      text references batches(id) on delete cascade,
  type          text default 'Class',
  message       text,
  active        boolean default true,
  created_at    timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) — Allow full access with anon key
-- ══════════════════════════════════════════════════════════════
alter table students           enable row level security;
alter table courses            enable row level security;
alter table batches            enable row level security;
alter table classes            enable row level security;
alter table homework_compliance enable row level security;
alter table payments           enable row level security;
alter table orders             enable row level security;
alter table expenses           enable row level security;
alter table reminders          enable row level security;

-- Allow all operations for anonymous users (admin-only app, password protected in UI)
create policy "Allow all for anon" on students           for all using (true) with check (true);
create policy "Allow all for anon" on courses            for all using (true) with check (true);
create policy "Allow all for anon" on batches            for all using (true) with check (true);
create policy "Allow all for anon" on classes            for all using (true) with check (true);
create policy "Allow all for anon" on homework_compliance for all using (true) with check (true);
create policy "Allow all for anon" on payments           for all using (true) with check (true);
create policy "Allow all for anon" on orders             for all using (true) with check (true);
create policy "Allow all for anon" on expenses           for all using (true) with check (true);
create policy "Allow all for anon" on reminders          for all using (true) with check (true);

-- ══════════════════════════════════════════════════════════════
-- Done! Your database is ready.
-- ══════════════════════════════════════════════════════════════
