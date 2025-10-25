import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../supabaseClient'
import { useNavigate, useLocation } from 'react-router-dom'

export default function AuthForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [userType, setUserType] = useState(null) // 'white' | 'blue'

  // Get userType from URL query
  useEffect(() => {
    const query = new URLSearchParams(location.search)
    const type = query.get('type') // white | blue
    if (['white', 'blue'].includes(type)) setUserType(type)
  }, [location.search])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    // Validation
    if (!email) return setErrors({ email: t('Required') })
    if (!password) return setErrors({ password: t('Required') })
    if (!username && mode === 'signup') return setErrors({ username: t('Required') })

    try {
      let supabaseUser

      // ------------------------
      // SIGNUP
      // ------------------------
      if (mode === 'signup') {
        if (!userType) throw new Error('User type not defined')

        // Signup via Supabase Auth
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { type: userType } },
        })
        if (authError) throw authError
        supabaseUser = data.user

        // Decide table based on userType
        const tableName = userType === 'blue' ? 'blue_users' : 'white_users'

        // Insert user into their specific table if not already exists
        const { data: existing } = await supabase
          .from(tableName)
          .select('id')
          .eq('id', supabaseUser.id)

        if (existing.length === 0) {
          const { error: dbError } = await supabase
            .from(tableName)
            .insert([
              {
                id: supabaseUser.id,
                email,
                username,
                profile_data: {},
              },
            ])
          if (dbError) throw dbError
        }

        // Automatically log in after signup
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
        if (loginError) throw loginError

        alert(t('Signed up and logged in successfully!'))
        navigate('/dashboard')
      }

      // ------------------------
      // LOGIN
      // ------------------------
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        alert(t('Logged in successfully!'))
        navigate('/dashboard')
      }
    } catch (err) {
      setErrors({ form: err.message })
      console.error('AUTH/DB ERROR:', err)
    } finally {
      setLoading(false)
    }
  }

  if (userType === null) return <p style={{ textAlign: 'center' }}>{t('Loading...')}</p>

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder={t('Email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '0.5rem' }}
        />

        {mode === 'signup' && (
          <input
            type="text"
            placeholder={t('Username')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '0.5rem' }}
          />
        )}

        <input
          type="password"
          placeholder={t('Password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '0.5rem' }}
        />

        {errors.form && <p style={{ color: 'red' }}>{errors.form}</p>}

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
          {loading ? t('loading') : mode === 'signup' ? t('Sign Up') : t('Login')}
        </button>
      </form>

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
            </button>
          </p>
        )}
      </div>
    </div>
  )
}

