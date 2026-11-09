import { useEffect, useState } from 'react'
import BrandPanel from '../components/BrandPanel.jsx'
import {
  IconAlert,
  IconArrowRight,
  IconEye,
  IconEyeOff,
  IconLock,
  IconRefresh,
  IconShield,
  IconUser,
} from '../components/Icons.jsx'

// Real authentication via the FastAPI backend: POST /api/login returns a
// session token, checked server-side against the users table (hashed
// passwords). Wrong credentials shake the form and explain themselves.
export default function Login({ tokenKey, onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null) // { message }
  const [errorTick, setErrorTick] = useState(0) // replays the shake animation
  const [busy, setBusy] = useState(false)
  const [api, setApi] = useState('checking') // checking | online | offline

  useEffect(() => {
    let live = true
    fetch('/api/health')
      .then((res) => {
        if (live) setApi(res.ok ? 'online' : 'offline')
      })
      .catch(() => {
        if (live) setApi('offline')
      })
    return () => {
      live = false
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })
      if (res.ok) {
        const data = await res.json()
        localStorage.setItem(tokenKey, data.token)
        onLogin({ name: data.username, token: data.token })
        return
      }
      setError({
        message:
          res.status === 401
            ? 'That username and password combination was not recognised.'
            : `The gateway returned HTTP ${res.status}. Try again.`,
      })
      setErrorTick((t) => t + 1)
    } catch {
      setError({ message: 'Could not reach the gateway. Is the API running?' })
      setErrorTick((t) => t + 1)
    } finally {
      setBusy(false)
    }
  }

  const statusText =
    api === 'checking' ? 'Checking API…' : api === 'online' ? 'API online' : 'API offline'

  return (
    <div className="login-shell">
      <BrandPanel />

      <div className="form-panel">
        <main className="form-card">
          <div className="form-logo up-enter" style={{ '--d': '0ms' }}>
            <IconShield size={22} />
          </div>

          <h1 className="up-enter" style={{ '--d': '60ms' }}>
            Welcome back
          </h1>
          <p className="form-sub up-enter" style={{ '--d': '120ms' }}>
            Sign in to the security dashboard
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field up-enter" style={{ '--d': '190ms' }}>
              <span className="field-icon">
                <IconUser size={18} />
              </span>
              <input
                id="username"
                name="username"
                placeholder=" "
                autoComplete="username"
                autoCapitalize="none"
                spellCheck="false"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <label htmlFor="username">Username</label>
            </div>

            <div className="field up-enter" style={{ '--d': '240ms' }}>
              <span className="field-icon">
                <IconLock size={18} />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder=" "
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className="eye"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <IconEyeOff size={17} /> : <IconEye size={17} />}
              </button>
            </div>

            {error ? (
              <div
                className="login-error shake-enter"
                key={errorTick}
                role="alert"
              >
                <IconAlert size={17} />
                <p>{error.message}</p>
              </div>
            ) : null}

            <button
              type="submit"
              className="btn-primary up-enter"
              style={{ '--d': '300ms' }}
              disabled={busy || !username.trim() || !password}
            >
              <span>{busy ? 'Signing in…' : 'Sign in'}</span>
              {busy ? <IconRefresh size={17} className="spin" /> : <IconArrowRight size={17} className="nudge" />}
            </button>
          </form>

          <div
            className={`apistatus up-enter apistatus-${api}`}
            style={{ '--d': '360ms' }}
          >
            <span className="dot" aria-hidden="true" />
            <span>{statusText}</span>
          </div>

          <p className="form-foot up-enter" style={{ '--d': '420ms' }}>
            IDS Gateway · localhost development build
          </p>
        </main>
      </div>
    </div>
  )
}
