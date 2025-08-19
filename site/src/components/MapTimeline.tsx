type Stop = {
  place: string
  start: string
  end?: string
  lat: number
  lng: number
}

const stops: Stop[] = [
  { place: "Champaign, IL", start: "2024-01-01", end: "2024-02-14", lat: 40.1164, lng: -88.2434 },
  { place: "New York City, NY", start: "2024-02-14", end: "2024-02-21", lat: 40.7128, lng: -74.0060 },
  { place: "Champaign, IL", start: "2024-02-21", end: "2024-05-01", lat: 40.1164, lng: -88.2434 },
  { place: "Lockport, IL", start: "2024-05-01", end: "2024-08-01", lat: 41.5890, lng: -88.0578 },
  { place: "Champaign, IL", start: "2024-08-01", end: "2025-04-01", lat: 40.1164, lng: -88.2434 },
  { place: "Madison, WI", start: "2025-04-01", end: "2025-08-01", lat: 43.0722, lng: -89.4008 },
  { place: "San Francisco, CA", start: "2025-08-01", end: "2025-09-01", lat: 37.7749, lng: -122.4194 },
]

function formatRange(s: Stop) {
  return `${s.start} — ${s.end ?? "Present"}`
}

export default function MapTimeline() {
  return (
    <section className="card">
      <h2 className="section-title">Where I've Been</h2>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="card">
          <svg viewBox="-125 -65 250 130" width="100%" height="300" style={{ background: "#0a0a0a", borderRadius: 12 }}>
            {stops.map((s, i) => {
              const x = s.lng
              const y = -s.lat / 2
              const next = stops[i + 1]
              const nx = next ? next.lng : null
              const ny = next ? -next.lat / 2 : null
              return (
                <g key={s.place + s.start}>
                  {nx !== null && ny !== null ? (
                    <line x1={x} y1={y} x2={nx!} y2={ny!} stroke="#3b82f6" strokeWidth="1.5" opacity="0.6" />
                  ) : null}
                  <circle cx={x} cy={y} r="2.8" fill="#60a5fa" />
                </g>
              )
            })}
            <rect x="-125" y="-65" width="250" height="130" fill="none" stroke="#333" />
          </svg>
          <div className="small" style={{ marginTop: 8 }}>
            Simplified world map projection with stops connected chronologically. Not to scale.
          </div>
        </div>
        <div className="card">
          <ol>
            {stops.map((s) => (
              <li key={s.place + s.start} style={{ marginBottom: 10 }}>
                <strong>{s.place}</strong>
                <div className="small">{formatRange(s)}</div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
