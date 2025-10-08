import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from './supabaseClient'
import { useSession } from './useSession'
import { Link, useNavigate, useLocation } from 'react-router-dom'


import Home from './pages/Home'
import ResumeBuilder from './pages/ResumeBuilder'
import EmployerDashboard from './pages/EmployerDashboard'
import LanguageSelector from './components/LanguageSelector'
import AuthForm from './components/AuthForm'

function App() {
  const { t } = useTranslation()
  const session = useSession()

  return (
    <Router>
      <div>
        <NavBar t={t} session={session} />
        <div style={{ padding: '2rem' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/resume" element={<ResumeBuilder />} />

            {/* Protected route */}
            <Route
              path="/dashboard"
              element={session ? <EmployerDashboard /> : <Navigate to="/auth" replace />}
            />

            {/* Auth route (signup/login) */}
            <Route
              path="/auth"
              element={
                session ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }}>
                    <AuthForm />
                  </div>
                )
              }
            />

            {/* fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

function NavBar({ t, session }) {
  const navigate = useNavigate()
  const location = useLocation()

  const onLogout = async () => {
    await supabase.auth.signOut()
    if (location.pathname.startsWith('/dashboard')) {
      navigate('/auth', { replace: true })
    }
  }

  return (
    <nav
      style={{
        padding: '1rem',
        background: '#f8f8f8',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>
        <Link to="/" style={{ marginRight: '1rem' }}>{t('home')}</Link>
        <Link to="/resume" style={{ marginRight: '1rem' }}>{t('resume')}</Link>
        <Link to="/dashboard" style={{ marginRight: '1rem' }}>{t('dashboard')}</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <LanguageSelector />
        {session ? (
          <>
            <span style={{ fontSize: 12, color: '#555' }}>
              {session.user?.email}
            </span>
            <button onClick={onLogout} style={{ padding: '6px 10px', cursor: 'pointer' }}>
              {t('logout') || 'Logout'}
            </button>
          </>
        ) : (
          <Link to="/auth">{t('login') || 'Login'}</Link>
        )}
      </div>
    </nav>
  )
}

export default App
