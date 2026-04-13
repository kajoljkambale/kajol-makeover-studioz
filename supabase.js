import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zlzrdpagpwlrbljfmxzy.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_6_AujeG9DfoPxMELnkGCeQ_08K3XEF4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ─── Generic CRUD helpers ───────────────────────────────────────────

export async function dbLoad(table) {
  const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: true })
  if (error) { console.error(`Load ${table}:`, error); return [] }
  return data || []
}

export async function dbUpsert(table, row) {
  const { data, error } = await supabase.from(table).upsert(row, { onConflict: 'id' }).select()
  if (error) { console.error(`Upsert ${table}:`, error); return null }
  return data?.[0]
}

export async function dbDelete(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) { console.error(`Delete ${table}:`, error); return false }
  return true
}

export async function dbClearTable(table) {
  const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (error) { console.error(`Clear ${table}:`, error); return false }
  return true
}

// ─── Load all app data ──────────────────────────────────────────────
export async function loadAllData() {
  const [students, courses, batches, classes, homeworkCompliance,
         payments, orders, expenses, reminders] = await Promise.all([
    dbLoad('students'),
    dbLoad('courses'),
    dbLoad('batches'),
    dbLoad('classes'),
    dbLoad('homework_compliance'),
    dbLoad('payments'),
    dbLoad('orders'),
    dbLoad('expenses'),
    dbLoad('reminders'),
  ])
  return { students, courses, batches, classes, homeworkCompliance, payments, orders, expenses, reminders }
}

// ─── Clear all app data ─────────────────────────────────────────────
export async function clearAllData() {
  const tables = ['homework_compliance','reminders','payments','expenses',
                  'orders','classes','batches','courses','students']
  for (const t of tables) await dbClearTable(t)
}
