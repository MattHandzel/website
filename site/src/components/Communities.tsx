import { useEffect, useState } from "react"

type Community = {
  name: string
  description: string
  estSizeSF?: number | string | null
  online: string
  irl: string
  personalAffiliation?: number | string | null
}

const fallbackCommunities: Community[] = [
  { name: "Neovim", description: "People that use Neovim for programming and enjoy customizing it", estSizeSF: 6, online: "r/neovim subreddit, #neovim:matrix.org, GitHub neovim/neovim", irl: "SF Vim Hackers meetup (premier Bay Area meetup), tech company events", personalAffiliation: 7 },
  { name: "Polish Community", description: "People that speak Polish and are interested in Polish culture", estSizeSF: 10, online: "Polish Club of San Francisco Facebook, Polish Professional Women of Silicon Valley", irl: "Polish Club of San Francisco (3040 22nd St), East Bay Polish American Association, Polish festivals at Golden Gate Park", personalAffiliation: 8.5 },
  { name: "Optimizing productivity", description: "People that enjoy optimizing their productivity", estSizeSF: 8, online: "Ben Vallack YouTube, Getting Things Done communities, Notion communities", irl: "Women's Productivity Group Bay Area meetup, productivity coworking spaces", personalAffiliation: 2 },
  { name: "Line Dancing", description: "People that enjoy line dancing and want to learn more about it", estSizeSF: 9, online: "Lower Haight Line Dancing Instagram, San Jose Line Dancing Meetup", irl: "Westwood Gold (weekly Wed/Thu), Sundance Saloon, Stud Country queer dancing, Lower Haight garage sessions", personalAffiliation: 5 },
]

export default function Communities() {
  const [items, setItems] = useState<Community[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/communities.json", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as Community[]
        if (Array.isArray(data)) {
          setItems(data)
        } else {
          throw new Error("Invalid JSON shape")
        }
      })
      .catch(() => {
        setError("Using fallback data. Generate site/public/communities.json via scripts/parse_communities.py.")
        setItems(fallbackCommunities)
      })
  }, [])

  const communities = items ?? fallbackCommunities

  return (
    <section className="card">
      <h2 className="section-title">Communities</h2>
      {error ? <div className="small" style={{ marginBottom: 8, color: "#f59e0b" }}>{error}</div> : null}
      <div className="grid">
        {communities.map((c) => (
          <div key={c.name} className="card" style={{ padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <strong>{c.name}</strong>
              {c.personalAffiliation !== undefined && c.personalAffiliation !== null ? (
                <span className="small">Affiliation: {c.personalAffiliation}</span>
              ) : null}
            </div>
            <div style={{ marginTop: 6 }}>{c.description}</div>
            <div className="small" style={{ marginTop: 8 }}>
              <strong>Online:</strong> {c.online || "—"}
            </div>
            <div className="small" style={{ marginTop: 4 }}>
              <strong>IRL:</strong> {c.irl || "—"}
            </div>
            {c.estSizeSF ? (
              <div className="small" style={{ marginTop: 4 }}>
                <strong>Est. size (SF):</strong> {c.estSizeSF}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}
