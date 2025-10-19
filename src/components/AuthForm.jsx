import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../supabaseClient'
import { useNavigate, useLocation } from 'react-router-dom'

export default function AuthForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [contact, setContact] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [userType, setUserType] = useState(null) // company | white | blue | null

  // Read userType from query param
  useEffect(() => {
    const query = new URLSearchParams(location.search)
    const type = query.get('type') // company | white | blue
    if (type === 'company' || type === 'white' || type === 'blue') {
      setUserType(type)
    }
  }, [location.search])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    if (!contact) return setErrors({ contact: t('Required') })
    if ((userType === 'white' || userType === 'company' || userType === 'blue') && mode === 'login' && !password)
      return setErrors({ password: t('Required')})

    setLoading(true)

    try {
      // Company or White Collar → email/password
      if (userType === 'white' || userType === 'company') {
        if (mode === 'signup') {
          const { error } = await supabase.auth.signUp({
            email: contact,
            password,
            options: { data: { type: userType } },
          })
          if (error) throw error
          alert(t('Sign-up successful! Check your inbox.'))
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email: contact,
            password,
          })
          if (error) throw error
          alert(t('Logged in successfully!'))
        }
      }

      // Blue Collar → phone + password login/signup
      if (userType === 'blue') {
        if (mode === 'signup') {
          // Signup: store phone and password (optional) in Supabase
          const { error } = await supabase.auth.signUp({
            email: contact + '@bluecollar.local', // dummy email for Supabase
            password,
            options: { data: { type: 'blue', phone: contact } },
          })
          if (error) throw error
          alert(t('Sign-up successful! Check your phone for OTP.'))
        } else {
          // Login with OTP
          const { error } = await supabase.auth.signInWithOtp({ phone: contact })
          if (error) throw error
          alert(t('OTP sent to your phone!'))
        }
      }

      navigate('/dashboard')
    } catch (err) {
      setErrors({ form: err.message })
    } finally {
      setLoading(false)
    }
  }

  const renderForm = () => {
      if (userType === null) {
    // Wait until useEffect runs
    return <p style={{ textAlign: 'center' }}>{t('Loading...')}</p>
  }

    if (!['company', 'white', 'blue'].includes(userType)) {
      return (
        <p style={{ textAlign: 'center' }}>
          {t('Please pick your role (Company, Blue or White Collar) first.')}
        </p>
      )
    }


    return (
      <>
        <form onSubmit={handleSubmit}>
          {/* Contact and Password Fields */}
          {(userType === 'white' || userType === 'company' || userType === 'blue') && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type={userType === 'blue' ? 'tel' : 'email'}
                  placeholder={userType === 'blue' ? t('Phone Number') : t('Email')}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                />
                {errors.contact && <div style={{ color: 'red', fontSize: '0.85rem' }}>{errors.contact}</div>}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="password"
                  placeholder={t('Password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                />
                {errors.password && <div style={{ color: 'red', fontSize: '0.85rem' }}>{errors.password}</div>}
              </div>
            </>
          )}

          {errors.form && <div style={{ color: 'red', marginBottom: '1rem' }}>{errors.form}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {loading
              ? t('loading') || 'Loading...'
              : mode === 'signup'
              ? t('sign_up') || 'Sign Up'
              : t('login') || 'Login'}
          </button>
        </form>

        {/* Sign Up / Forgot Password */}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          {mode === 'signup' ? (
            <p>
              {t('Already have an account?')}{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}
              >
                {t('Login')}
              </button>
            </p>
          ) : (
            <p>
              {t("Don't have an account?")}{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}
              >
                {t('Sign Up')}
              </button>{' '}
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}
              >
                {t('Forgot Password')}
              </button>
            </p>
          )}
        </div>
      </>
    )
  }

  return <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>{renderForm()}</div>
}
