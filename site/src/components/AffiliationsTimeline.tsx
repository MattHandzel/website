type Affiliation = {
  org: string
  role?: string
  start: string
  end?: string
  highlights?: string[]
}

const affiliations: Affiliation[] = [
  { org: "UIUC", role: "Student", start: "2022-08-01", highlights: ["CS/engineering focus", "Communities & projects"] },
  { org: "Epic", role: "Intern", start: "2024-05-20", end: "2024-08-09", highlights: ["Shipped intern project", "Mentorship"] },
  { org: "Running Community", role: "Member", start: "2023-01-01", highlights: ["Group long runs", "Race volunteering"] },
]

export default function AffiliationsTimeline() {
  return (
    <section className="card">
      <h2 className="section-title">Organizational Affiliations</h2>
      <div>
        {affiliations.map((a) => (
          <div key={a.org + a.start} style={{ padding: "8px 0", borderBottom: "1px dashed #333" }}>
            <div><strong>{a.org}</strong> {a.role ? <span className="small">• {a.role}</span> : null}</div>
            <div className="small">{a.start} — {a.end ?? "Present"}</div>
            {a.highlights && a.highlights.length ? (
              <ul style={{ marginTop: 6 }}>
                {a.highlights.map(h => <li key={h}>{h}</li>)}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}
