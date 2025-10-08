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

  // Get user type from query param
  const [userType, setUserType] = useState(null)
  useEffect(() => {
    const query = new URLSearchParams(location.search)
    const type = query.get('type')
    if (type === 'blue' || type === 'white') setUserType(type)
  }, [location.search])

  const validateContact = (value) => /\S+@\S+\.\S+/.test(value)

  const handleSubmit = async (e) => {
    e.preventDefault()

    let newErrors = {}
    if (!contact) newErrors.contact = t('required')
    else if (!validateContact(contact)) newErrors.contact = t('invalid_email_or_phone')
    if (!password) newErrors.password = t('required')

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)

    try {
      if (mode === 'signup') {
        // Sign up user with type saved in Supabase
        const { error } = await supabase.auth.signUp({
          email: contact,
          password: password,
          options: {
            data: { type: userType } // store user type
          }
        })
        if (error) throw error

        alert(t('sign_up_success_check_email') || 'Sign-up successful, check your inbox!')
        navigate('/dashboard')
      } else {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email: contact,
          password
        })
        if (error) throw error

        alert(t('logging_in_success') || 'Logged in successfully!')
        navigate('/dashboard')
      }
    } catch (err) {
      setErrors({ form: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', width: '100%' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
        {mode === 'signup' ? t('sign_up') || 'Sign Up' : t('login') || 'Login'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder={t('email') || 'Email'}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
          {errors.contact && <div style={{ color: 'red', fontSize: '0.85rem' }}>{errors.contact}</div>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <input
            type="password"
            placeholder={t('password') || 'Password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
          {errors.password && <div style={{ color: 'red', fontSize: '0.85rem' }}>{errors.password}</div>}
        </div>

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
            cursor: 'pointer'
          }}
        >
          {loading
            ? t('loading') || 'Loading...'
            : mode === 'signup'
            ? t('sign_up') || 'Sign Up'
            : t('login') || 'Login'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        {mode === 'signup' ? (
          <p>
            {t('already_have_account') || 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setMode('login')}
              style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}
            >
              {t('login') || 'Login'}
            </button>
          </p>
        ) : (
          <p>
            {t('no_account_yet') || "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setMode('signup')}
              style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}
            >
              {t('sign_up') || 'Sign Up'}
            </button>
          </p>
        )}
      </div>
    </div>
  )
}



