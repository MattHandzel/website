type Skill = {
  name: string
  level: number
  evidence?: string[]
}

const skills: Skill[] = [
  { name: "Python", level: 4, evidence: ["Data tools", "Scripting"] },
  { name: "C++", level: 3, evidence: ["Algorithms", "Robotics projects"] },
  { name: "React", level: 3, evidence: ["UI prototypes", "Personal site"] },
]

export default function SkillsTree() {
  return (
    <section className="card">
      <h2 className="section-title">Skills</h2>
      <div className="grid">
        {skills.map(s => (
          <div key={s.name} className="card">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{s.name}</strong>
              <span className="small">Level {s.level}/5</span>
            </div>
            <div style={{ background: "#222", borderRadius: 8, overflow: "hidden", marginTop: 8 }}>
              <div style={{ width: `${s.level * 20}%`, background: "#60a5fa", height: 8 }} />
            </div>
            {s.evidence && s.evidence.length ? (
              <ul style={{ marginTop: 8 }}>
                {s.evidence.map(e => <li key={e}>{e}</li>)}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}
