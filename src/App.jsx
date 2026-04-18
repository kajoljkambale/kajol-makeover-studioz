import React from 'react'
import Website from './Website.jsx'
import AppDashboard from './AppDashboard.jsx'

/**
 * Simple client-side router (no react-router needed).
 *
 * URL routes:
 *   /           → Website  (public landing page)
 *   /app        → AppDashboard  (admin panel — password protected inside)
 *   /enroll     → AppDashboard  (enrollment form — handled inside AppDashboard)
 */
export default function App() {
  const path = window.location.pathname

  if (path.startsWith('/app') || path.startsWith('/enroll')) {
    return <AppDashboard />
  }

  return <Website />
}
