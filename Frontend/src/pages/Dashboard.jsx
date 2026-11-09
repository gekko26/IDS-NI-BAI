// Scaffold dashboard. Live detections, Snort comparisons and telemetry
// replace this once detection runs produce data.
export default function Dashboard({ user, onLogout }) {
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
          Signed in as <strong>{user.name}</strong>. Detected attacks,
          classification, timestamps, CPU and memory usage, packet statistics,
          historical logs and Snort baseline results will appear here as the
          pipeline is wired up.
        </p>
      </main>
    </div>
  )
}
