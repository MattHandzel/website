type Metric = {
  label: string
  value: string
  note?: string
}

const metrics: Metric[] = [
  { label: "Resting HR", value: "54 bpm" },
  { label: "Sleep (avg, last 7d)", value: "7h 25m" },
  { label: "Weekly Runs", value: "4", note: "Includes long run" },
]

export default function Metrics() {
  return (
    <section className="card">
      <h2 className="section-title">Physiological & Habit Metrics</h2>
      <div className="grid">
        {metrics.map(m => (
          <div key={m.label} className="card">
            <div style={{ fontWeight: 700 }}>{m.label}</div>
            <div style={{ fontSize: 24, marginTop: 4 }}>{m.value}</div>
            {m.note ? <div className="small" style={{ marginTop: 4 }}>{m.note}</div> : null}
          </div>
        ))}
      </div>
      <div className="small" style={{ marginTop: 8 }}>
        Dummy data; future: pull from Obsidian and device exports.
      </div>
    </section>
  )
}
