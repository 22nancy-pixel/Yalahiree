import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { FaBuilding, FaUserTie } from 'react-icons/fa'
import { useSession } from '../useSession'

function Original() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const session = useSession()

  // Redirect logged-in users
  if (session) {
    navigate('/dashboard')
    return null
  }

  const handleSelectType = (type) => {
    if (type === 'company') {
      navigate(`/auth?type=company`)
    } else if (type === 'jobseeker') {
      navigate(`/home`)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#F0F4F8',
        padding: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center',
          borderRadius: '12px',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
          backgroundColor: 'white',
        }}
      >
        <h1 style={{ color: '#004080' }}>{t('welcome_yala')}</h1>
        <p style={{ marginBottom: '2rem' }}>{t('original_msg')}</p>

        {/* Boxes */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2rem',
            marginTop: '2rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Company (Hiring) */}
          <button
            onClick={() => handleSelectType('company')}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              width: '200px',
              height: '200px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <FaBuilding size={60} color="white" />
            <p style={{ marginTop: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
              {t('company')}
            </p>
            <p style={{ fontSize: '0.9rem' }}>{t('hiring')}</p>
          </button>

          {/* Job Seeker */}
          <button
            onClick={() => handleSelectType('jobseeker')}
            style={{
              backgroundColor: '#007BFF',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              width: '200px',
              height: '200px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <FaUserTie size={60} color="white" />
            <p style={{ marginTop: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
              {t('job_seeker')}
            </p>
            <p style={{ fontSize: '0.9rem' }}>{t('looking_for_job')}</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Original
