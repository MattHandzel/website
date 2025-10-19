import { GetStaticProps } from 'next'
import { promises as fs } from 'fs'
import path from 'path'
import Navigation from '@/components/Navigation'
import { useState } from 'react'

interface Dance {
  name: string
  artist: string | null
  tutorial_link: string | null
  my_video: string | null
  notes: string | null
}

interface LineDancingData {
  dances_i_know: Dance[]
  dances_to_learn: Dance[]
}

interface LineDancingPageProps {
  data: LineDancingData
}

function DanceList({ dances, title }: { dances: Dance[]; title: string }) {
  const [expandedDances, setExpandedDances] = useState<Set<string>>(new Set())

  const toggleDance = (danceName: string) => {
    setExpandedDances(prev => {
      const newSet = new Set(prev)
      if (newSet.has(danceName)) {
        newSet.delete(danceName)
      } else {
        newSet.add(danceName)
      }
      return newSet
    })
  }

  const getYouTubeEmbedUrl = (url: string) => {
    // Convert YouTube watch URLs to embed URLs
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${videoId}`
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    return url
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-display font-bold text-accent mb-4">{title}</h2>
      {dances.length === 0 ? (
        <p className="text-muted">No dances yet.</p>
      ) : (
        <div className="space-y-2">
          {dances.map((dance, index) => {
            const isExpanded = expandedDances.has(dance.name)
            const hasContent = dance.tutorial_link || dance.my_video

            return (
              <div
                key={`${dance.name}-${index}`}
                className="frosted-card overflow-hidden transition-all duration-200"
              >
                {/* Dance Header - Always Visible */}
                <button
                  onClick={() => hasContent && toggleDance(dance.name)}
                  className={`w-full text-left px-6 py-4 flex items-center justify-between ${
                    hasContent ? 'hover:bg-white/5 cursor-pointer' : 'cursor-default'
                  }`}
                  disabled={!hasContent}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-text">
                        {dance.name}
                      </h3>
                      {dance.artist && (
                        <span className="text-sm text-muted">
                          by {dance.artist}
                        </span>
                      )}
                    </div>
                  </div>
                  {hasContent && (
                    <svg
                      className={`w-5 h-5 text-accent transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </button>

                {/* Expanded Content */}
                {isExpanded && hasContent && (
                  <div className="px-6 pb-6 space-y-4 border-t border-white/10">
                    {/* Tutorial Link */}
                    {dance.tutorial_link && (
                      <div className="pt-4">
                        <h4 className="text-sm font-medium text-accent mb-2">Tutorial</h4>
                        <a
                          href={dance.tutorial_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-2 hover:text-accent underline break-all text-sm"
                        >
                          {dance.tutorial_link}
                        </a>
                        
                        {/* Embed YouTube video if it's a YouTube link */}
                        {(dance.tutorial_link.includes('youtube.com') || 
                          dance.tutorial_link.includes('youtu.be')) && (
                          <div className="mt-3 aspect-video rounded-lg overflow-hidden">
                            <iframe
                              src={getYouTubeEmbedUrl(dance.tutorial_link)}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* My Video */}
                    {dance.my_video && (
                      <div>
                        <h4 className="text-sm font-medium text-accent mb-2">My Video</h4>
                        {(dance.my_video.includes('youtube.com') || 
                          dance.my_video.includes('youtu.be')) ? (
                          <div className="aspect-video rounded-lg overflow-hidden">
                            <iframe
                              src={getYouTubeEmbedUrl(dance.my_video)}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <a
                            href={dance.my_video}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-2 hover:text-accent underline break-all text-sm"
                          >
                            {dance.my_video}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function LineDancingPage({ data }: LineDancingPageProps) {
  return (
    <div className="min-h-screen bg-base">
      <Navigation currentPage="line-dancing" />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-text mb-2">
            Line Dancing
          </h1>
          <p className="text-muted">
            My journey learning line dances. Click on a dance to see tutorials and videos.
          </p>
        </div>

        <div className="space-y-12">
          <DanceList dances={data.dances_i_know} title="Dances I Know" />
          <DanceList dances={data.dances_to_learn} title="Dances I Want to Learn" />
        </div>
      </main>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const dataPath = path.join(process.cwd(), 'data', 'line_dancing.json')
  const fileContents = await fs.readFile(dataPath, 'utf8')
  const data: LineDancingData = JSON.parse(fileContents)

  return {
    props: {
      data,
    },
  }
}
