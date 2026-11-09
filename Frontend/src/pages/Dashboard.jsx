import { useEffect, useState } from 'react'

const CLASS_LABELS = {
  benign: 'Benign',
  dos: 'Hping3 DoS',
  scan: 'Nmap scan',
  brute_force: 'Hydra brute force',
  arp_spoof: 'Ettercap ARP spoof',
}

function fmtTs(ts) {
  if (!ts) return '—'
  // 2026-11-09T12:09:14(.…Z) → 2026-11-09 12:09:14Z (UTC)
  return `${ts.slice(0, 10)} ${ts.slice(11, 19)}Z`
}

export default function Dashboard({ user, onLogout }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let live = true
    fetch('/api/detections?limit=200', {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) =>
        res.ok ? res.json() : Promise.reject(res.status)
      )
      .then((payload) => {
        if (live) setData(payload)
      })
      .catch((status) => {
        if (live)
          setError(
            status === 401
              ? 'Session expired — sign in again.'
              : 'Could not load detections.'
          )
      })
    return () => {
      live = false
    }
  }, [user.token])

  const summary = data?.summary
  const items = data?.items ?? []

  return (
    <div className="page">
      <main className="card wide">
        <header className="dash-head">
          <h1>Dashboard</h1>
          <button className="ghost" type="button" onClick={onLogout}>
            Sign out
          </button>
        </header>
        <p className="subtitle">
          Signed in as <strong>{user.name}</strong>
          {summary?.last_ts
            ? ` · last detection ${fmtTs(summary.last_ts)}`
            : ''}
        </p>

        {error ? (
          <p className="error">{error}</p>
        ) : summary ? (
          <>
            <div className="stats">
              <div className="stat">
                <div className="k">Windows analysed</div>
                <div className="v">{summary.total}</div>
              </div>
              <div className="stat">
                <div className="k">Attacks detected</div>
                <div className="v">{summary.attacks}</div>
              </div>
              <div className="stat">
                <div className="k">Benign windows</div>
                <div className="v">{summary.benign}</div>
              </div>
              <div className="stat">
                <div className="k">Classes seen</div>
                <div className="v">
                  {Object.keys(summary.by_class).length}
                </div>
              </div>
            </div>

            <div className="tablewrap">
              <table className="detections">
                <thead>
                  <tr>
                    <th>Time (UTC)</th>
                    <th>Classification</th>
                    <th>Confidence</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => {
                    const attack = row.predicted_class !== 'benign'
                    return (
                      <tr key={row.id}>
                        <td className="mono">{fmtTs(row.ts)}</td>
                        <td>
                          <span
                            className={`badge ${
                              attack ? 'badge-attack' : 'badge-benign'
                            }`}
                          >
                            {CLASS_LABELS[row.predicted_class] ??
                              row.predicted_class}
                          </span>
                        </td>
                        <td>{(row.confidence * 100).toFixed(1)}%</td>
                        <td>{row.source}</td>
                      </tr>
                    )
                  })}
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="empty">
                        No detections recorded yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="subtitle">Loading detections…</p>
        )}
      </main>
    </div>
  )
}
