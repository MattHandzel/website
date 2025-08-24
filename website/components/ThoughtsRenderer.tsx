import React, { useMemo, useRef, useEffect } from 'react'

interface Thought {
  id: string
  capture_id: string
  timestamp: string
  content: string
  modalities: string
  context: string
  sources: string
  tags: string
  location_latitude: number | null
  location_longitude: number | null
  location_city: string | null
  location_country: string | null
  location_timezone: string | null
  processing_status: string
  created_date: string
  last_edited_date: string
  metadata: string
}

interface ThoughtsRendererProps {
  thoughts: Thought[]
  focusedCaptureId?: string
}

export default function ThoughtsRenderer({ thoughts, focusedCaptureId }: ThoughtsRendererProps) {
  const sortedThoughts = useMemo(() => {
    return [...thoughts].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }, [thoughts])

  const thoughtsStats = useMemo(() => {
    const totalThoughts = thoughts.length
    const modalityStats: { [key: string]: number } = {}
    const sourceStats: { [key: string]: number } = {}
    
    thoughts.forEach(thought => {
      try {
        const modalities = JSON.parse(thought.modalities || '[]')
        const sources = JSON.parse(thought.sources || '[]')
        
        modalities.forEach((modality: string) => {
          modalityStats[modality] = (modalityStats[modality] || 0) + 1
        })
        
        sources.forEach((source: string) => {
          sourceStats[source] = (sourceStats[source] || 0) + 1
        })
      } catch (e) {
      }
    })
    
    return { totalThoughts, modalityStats, sourceStats }
  }, [thoughts])

  // Use a deterministic date formatter to avoid SSR/CSR mismatches due to locale/timezone
  const dateFormatter = useMemo(() =>
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
  [])

  const parseJsonField = (field: string) => {
    try {
      return JSON.parse(field || '[]')
    } catch {
      return []
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return dateFormatter.format(new Date(timestamp))
    } catch {
      return timestamp
    }
  }

  const getLocationString = (thought: Thought) => {
    if (thought.location_city && thought.location_country) {
      return `${thought.location_city}, ${thought.location_country}`
    }
    if (thought.location_latitude && thought.location_longitude) {
      return `${thought.location_latitude.toFixed(4)}, ${thought.location_longitude.toFixed(4)}`
    }
    return null
  }

  const formatSourceDisplay = (source: string) => {
    try {
      const url = new URL(source)
      const domain = url.hostname.replace('www.', '')
      const pathAndQuery = url.pathname + url.search + url.hash
      
      if (pathAndQuery.length <= 24) {
        return domain + pathAndQuery
      } else {
        return domain + pathAndQuery.substring(0, 24) + '...'
      }
    } catch {
      // Not a valid URL, return as is
      return source
    }
  }

  const isValidUrl = (source: string) => {
    try {
      new URL(source)
      return true
    } catch {
      return false
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }

  const focusedThoughtRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (focusedCaptureId && focusedThoughtRef.current) {
      focusedThoughtRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
    }
  }, [focusedCaptureId])

  return (
    <div className="space-y-6">

      <div className="space-y-4">
        {sortedThoughts.map((thought) => {
          const modalities = parseJsonField(thought.modalities)
          const sources = parseJsonField(thought.sources)
          const tags = parseJsonField(thought.tags).filter((t: string) => t !== "public").sort()
          const location = getLocationString(thought)
          const isFocused = focusedCaptureId === thought.capture_id
          
          return (
            <article 
              key={thought.id} 
              ref={isFocused ? focusedThoughtRef : null}
              className={`card p-6 ${isFocused ? 'ring-2 ring-blue shadow-lg' : ''}`}
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-subtext0">
                    {formatTimestamp(thought.timestamp)}
                  </div>
                  <div className="flex items-center space-x-2">

                  {location && (
                    <div className="flex items-center space-x-1 text-sm">
                      <span>📍</span>
                      <span>{location}</span>
                    </div>
                  )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-subtext0">
                  <div className="flex items-center space-x-4">
                    {sources.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <span>Sources:</span>
                        {[...sources].sort((a: string, b: string) => a.localeCompare(b)).map((source: string, index: number) => (
                          <span key={source}>
                            {isValidUrl(source) ? (
                              <a 
                                href={source} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue hover:text-blue/80 underline"
                              >
                                {formatSourceDisplay(source)}
                              </a>
                            ) : (
                              source
                            )}
                            {index < sources.length - 1 ? ',' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-text leading-relaxed">{thought.content}</p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-surface1">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {tags.length > 0 && tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 text-xs bg-surface1 text-subtext1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => copyToClipboard(`${window.location.origin}/thoughts/${thought.capture_id.replace(" ","%20")}`)}
                    className="flex items-center space-x-1 px-2 py-1 text-xs text-subtext1 hover:text-text hover:bg-surface1 rounded transition-colors"
                    title="Copy link to this thought"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
      
      {thoughts.length === 0 && (
        <div className="card p-6 text-center">
          <p className="text-subtext0">No thoughts found. Add some captured thoughts to the raw_capture directory to get started!</p>
        </div>
      )}
    </div>
  )
}
