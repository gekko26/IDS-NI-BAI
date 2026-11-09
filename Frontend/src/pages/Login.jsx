import { useEffect, useState } from 'react'

// Real authentication via the FastAPI backend: POST /api/login returns a
// session token, checked server-side against the users table (hashed
// passwords). Wrong credentials and offline API produce distinct errors.
export default function Login({ tokenKey, onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
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
    setError('')
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
      setError(
        res.status === 401
          ? 'Invalid username or password.'
          : `Login failed (HTTP ${res.status}).`
      )
    } catch {
      setError('Cannot reach the API.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <main className="card">
        <div className="brand" aria-hidden="true">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3l7 3v5c0 4.4-2.9 8-7 10-4.1-2-7-5.6-7-10V6l7-3z" />
            <path d="M9.5 12l1.8 1.8 3.2-3.6" />
          </svg>
        </div>
        <h1>IDS Gateway</h1>
        <p className="subtitle">Sign in to the security dashboard</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck="false"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="operator"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
          />

          {error ? <p className="error">{error}</p> : null}

          <button
            type="submit"
            disabled={busy || !username.trim() || !password}
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <footer className={`apistatus apistatus-${api}`}>
          <span className="dot" aria-hidden="true" />
          <span>
            {api === 'checking'
              ? 'Checking API…'
              : api === 'online'
                ? 'API online'
                : 'API offline'}
          </span>
        </footer>
      </main>
    </div>
  )
}
