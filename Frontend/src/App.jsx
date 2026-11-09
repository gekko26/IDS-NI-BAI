import { useEffect, useState } from 'react'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'

const TOKEN_KEY = 'ids_token'

export default function App() {
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(true)

  // On load: reuse a stored session token if /api/me accepts it.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setBooting(false)
      return
    }
    fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) =>
        res.ok
          ? res.json()
          : Promise.reject(res.status)
      )
      .then((data) => setUser({ name: data.username, token }))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setBooting(false))
  }, [])

  const handleLogout = () => {
    const token = user?.token
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    if (token) {
      fetch('/api/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})
    }
  }

  if (booting) {
    return (
      <div className="page">
        <p className="subtitle">Loading…</p>
      </div>
    )
  }

  return user ? (
    <Dashboard user={user} onLogout={handleLogout} />
  ) : (
    <Login tokenKey={TOKEN_KEY} onLogin={setUser} />
  )
}
