/**
 * App.jsx
 * Kajol Makeover Studioz — Root Router
 *
 * Routes:
 *   /        → Website.jsx  (public portfolio)
 *   /app     → AppDashboard.jsx (admin app, password protected)
 *   /enroll  → handled inside AppDashboard.jsx via its own internal logic
 */

import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Website      from './pages/Website'
import AppDashboard from './pages/AppDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"       element={<Website />} />
        <Route path="/app"    element={<AppDashboard />} />
        <Route path="/enroll" element={<AppDashboard />} />
        {/* Catch-all → website */}
        <Route path="*"       element={<Website />} />
      </Routes>
    </BrowserRouter>
  )
}
