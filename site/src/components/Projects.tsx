type Project = {
  name: string
  description: string
  progress: number
  link?: string
}

const projects: Project[] = [
  { name: "Marathon Training", description: "Building endurance and tracking progress.", progress: 80 },
  { name: "Personal Website", description: "Unifying Obsidian data into a living site.", progress: 20, link: "https://github.com/MattHandzel/website" },
  { name: "SF Trip Reflection", description: "Trip write-up and learnings.", progress: 30 },
]

export default function Projects() {
  return (
    <section className="card">
      <h2 className="section-title">Projects</h2>
      <div className="grid">
        {projects.map((p) => (
          <div key={p.name} className="card" style={{ padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <strong>{p.name}</strong>
              {p.link ? <a href={p.link} target="_blank" className="small" rel="noreferrer">GitHub</a> : null}
            </div>
            <div style={{ margin: "8px 0" }}>{p.description}</div>
            <div style={{ background: "#222", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ width: `${p.progress}%`, background: "#4ade80", height: 8 }} />
            </div>
            <div className="small" style={{ marginTop: 6 }}>{p.progress}%</div>
          </div>
        ))}
      </div>
    </section>
  )
}
