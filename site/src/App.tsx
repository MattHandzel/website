import "./App.css"
import "./index.css"
import VictoryJar from "./components/VictoryJar"
import AffiliationsTimeline from "./components/AffiliationsTimeline"
import Projects from "./components/Projects"
import SkillsTree from "./components/SkillsTree"
import Metrics from "./components/Metrics"

function App() {
  return (
    <>
      <nav>
        <div className="inner">
          <div style={{ fontWeight: 800 }}>matthandzel.com</div>
          <div className="links">
            <a href="#victories">Victories</a>
            <a href="#affiliations">Affiliations</a>
            <a href="#projects">Projects</a>
            <a href="#skills">Skills</a>
            <a href="#metrics">Metrics</a>
          </div>
        </div>
      </nav>
      <main className="container" style={{ display: "grid", gap: 16 }}>
        <section id="intro" className="card">
          <h1 style={{ margin: 0 }}>Hi, I’m Matt</h1>
          <p className="small">A living personal site powered by my notes.</p>
          <p>
            This v1 shows a possible direction: victories, affiliations, projects, skills, and a small metrics panel.
            Future versions will ingest selective data from my Obsidian vault.
          </p>
        </section>

        <section id="victories">
          <VictoryJar />
        </section>

        <section id="affiliations">
          <AffiliationsTimeline />
        </section>

        <section id="projects">
          <Projects />
        </section>

        <section id="skills">
          <SkillsTree />
        </section>

        <section id="metrics">
          <Metrics />
        </section>
      </main>
      <footer className="container" style={{ paddingBottom: 48 }}>
        <div className="small">Draft v1 — dummy data. Inspired by Obsidian notes and future autolinking ideas.</div>
      </footer>
    </>
  )
}

export default App
