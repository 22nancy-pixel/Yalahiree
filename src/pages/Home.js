import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { FaHardHat, FaBriefcase } from 'react-icons/fa'
import { useSession } from '../useSession'

function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const session = useSession()

  // If logged in, skip Home and go directly to profile
  useEffect(() => {
    if (!session) return
    const type = session.user?.user_metadata?.type
    if (type === 'blue') navigate('/BlueCollarProfile', { replace: true })
    else if (type === 'white') navigate('/WhiteCollarProfile', { replace: true })
    else if (type === 'company') navigate('/dashboard', { replace: true })
  }, [session, navigate])

  const handleSelectType = (type) => {
    navigate(`/auth?type=${type}`)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
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
        <h1 style={{ color: '#004080' }}>{t('choose_type_title') || t('choose_your_type')}</h1>
        <p style={{ marginBottom: '2rem' }}>
          {t('choose_type_msg') || t('please_select_your_job_type')}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleSelectType('blue')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s ease' }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <FaHardHat size={60} color="#004080" />
            <p style={{ marginTop: '0.5rem', fontWeight: 'bold', color: '#004080' }}>{t('blue_collar')}</p>
          </button>

          <button
            onClick={() => handleSelectType('white')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s ease' }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <FaBriefcase size={60} color="#B3C5DD" />
            <p style={{ marginTop: '0.5rem', fontWeight: 'bold', color: '#B3C5DD' }}>{t('white_collar')}</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
