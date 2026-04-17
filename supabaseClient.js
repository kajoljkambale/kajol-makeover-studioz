/**
 * supabaseClient.js
 * Kajol Makeover Studioz — Supabase connection + shared DB helpers
 */

import { createClient } from '@supabase/supabase-js'

const SB_URL = import.meta.env.VITE_SUPABASE_URL  || 'https://zlzrdpagpwlrbljfmxzy.supabase.co'
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_6_AujeG9DfoPxMELnkGCeQ_08K3XEF4'

export const sb = createClient(SB_URL, SB_KEY)

/* ── Generic DB helpers ── */

export const dbLoad = async t => {
  const { data, error } = await sb.from(t).select('*').order('created_at', { ascending: true })
  if (error) console.error(t, error.message)
  return data || []
}

export const dbUpsert = async (t, d) => {
  const { error } = await sb.from(t).upsert(d, { onConflict: 'id' })
  if (error) console.error('Upsert error:', error.message)
}

export const dbSave = async (t, d) => {
  const { error } = await sb.from(t).upsert(d)
  if (error) alert('Error saving: ' + error.message)
}

export const dbDelete = async (t, id) => {
  const { error } = await sb.from(t).delete().eq('id', id)
  if (error) alert('Error deleting: ' + error.message)
}

export async function loadAll() {
  const [students, courses, batches, classes, hw, payments, orders, expenses, requests] =
    await Promise.all([
      dbLoad('students'),
      dbLoad('courses'),
      dbLoad('batches'),
      dbLoad('classes'),
      dbLoad('homework_compliance'),
      dbLoad('payments'),
      dbLoad('orders'),
      dbLoad('expenses'),
      dbLoad('enrollment_requests'),
    ])
  return {
    students,
    courses,
    batches,
    classes,
    homeworkCompliance: hw,
    payments,
    orders,
    expenses,
    enrollmentRequests: requests,
  }
}

export async function clearAll() {
  for (const t of [
    'homework_compliance', 'payments', 'expenses', 'orders',
    'classes', 'batches', 'courses', 'enrollment_requests', 'students',
  ])
    await sb.from(t).delete().neq('id', '__none__')
}
