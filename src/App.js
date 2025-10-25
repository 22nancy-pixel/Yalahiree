// src/App.js
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from './supabaseClient'
import { useSession } from './useSession'

import Home from './pages/Home'
import Original from './pages/Original'
import AuthForm from './components/AuthForm'
import EmployerDashboard from './pages/EmployerDashboard'
import BlueCollarProfile from './pages/BlueCollarProfile'
import WhiteCollarProfile from './pages/WhiteCollarProfile'
import CompanyProfile from './pages/CompanyProfile'
import LanguageSelector from './components/LanguageSelector'

function App() {
  const { t } = useTranslation()
  const session = useSession()
  const userType = session?.user?.user_metadata?.type

  return (
    <Router>
      <div>
        <NavBar t={t} session={session} userType={userType} />

        <div style={{ padding: '2rem' }}>
          <Routes>
            {/* Landing */}
            <Route path="/" element={<Original />} />
            <Route path="/home" element={<Home />} />

            {/* Auth */}
            <Route path="/auth" element={<AuthForm />} />

            {/* Protected routes */}
            <Route
              path="/whitecollar"
              element={
                session && userType === 'white' ? (
                  <WhiteCollarProfile />
                ) : (
                  <Navigate to="hiteCollarProfile" replace />
                )
              }
            />
            <Route
              path="/bluecollar"
              element={
                session && userType === 'blue' ? <BlueCollarProfile /> : <Navigate to="BlueCollarProfile" replace />
              }
            />
            <Route
              path="/dashboard"
              element={
                session && userType === 'company' ? <EmployerDashboard /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/company-profile"
              element={
                session && userType === 'company' ? <CompanyProfile /> : <Navigate to="/" replace />
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

// NavBar
function NavBar({ t, session, userType }) {
  const navigate = useNavigate()

  const onLogout = async () => {
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }

  const links = [
    { name: t('home'), path: '/home', roles: ['white', 'blue', 'company'] },
    { name: t('whitecollar'), path: '/whitecollar', roles: ['white'] },
    { name: t('bluecollar'), path: '/bluecollar', roles: ['blue'] },
    { name: t('dashboard'), path: '/dashboard', roles: ['company'] },
    { name: t('company_profile'), path: '/company-profile', roles: ['company'] },
  ]

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
        {links
          .filter(link => session && link.roles.includes(userType))
          .map(link => (
            <Link key={link.path} to={link.path} style={{ marginRight: '1rem' }}>
              {link.name}
            </Link>
          ))}
        {!session && <Link to="/auth">{t('login')}</Link>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <LanguageSelector />
        {session && (
          <>
            <span style={{ fontSize: 12, color: '#555' }}>{session.user?.email}</span>
            <button onClick={onLogout} style={{ padding: '6px 10px', cursor: 'pointer' }}>
              {t('logout')}
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export default App

