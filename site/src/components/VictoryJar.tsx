type Victory = {
  title: string
  date: string
  note?: string
}

const victories: Victory[] = [
  { title: "Went skydiving", date: "2024-06-15", note: "Tandem jump over Chicago." },
  { title: "Ran a marathon", date: "2023-10-08", note: "Chicago Marathon finished strong." },
  { title: "Ran to work", date: "2024-09-03" },
]

export default function VictoryJar() {
  return (
    <section className="card">
      <h2 className="section-title">Victory Jar</h2>
      <p className="small">Small wins that add up over time</p>
      <ul>
        {victories.map((v) => (
          <li key={v.title + v.date} style={{ margin: "8px 0" }}>
            <strong>{v.title}</strong> <span className="small">• {v.date}</span>
            {v.note ? <div style={{ color: "#bbb" }}>{v.note}</div> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
