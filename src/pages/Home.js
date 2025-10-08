// src/pages/Home.js
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { FaHardHat, FaBriefcase } from 'react-icons/fa'
import { useSession } from '../useSession'

function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const session = useSession()

  // If logged in, render nothing (blank page)
  if (session) return <div></div>

  const handleSelectType = (type) => {
    navigate(`/auth?type=${type}`)
  }

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '2rem auto',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#F0F4F8',
        borderRadius: '12px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h1 style={{ color: '#004080' }}>{t('welcome_yala')}</h1>
      <p style={{ marginBottom: '2rem' }}>{t('helping_find_jobs')}</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
        <button
          onClick={() => handleSelectType('blue')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}
        >
          <FaHardHat size={60} color="#FF6600" />
          <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>Blue Collar</p>
        </button>

        <button
          onClick={() => handleSelectType('white')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}
        >
          <FaBriefcase size={60} color="#004080" />
          <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>White Collar</p>
        </button>
      </div>
    </div>
  )
}

export default Home
