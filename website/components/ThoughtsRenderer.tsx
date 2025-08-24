import React, { useMemo } from 'react'

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
}

export default function ThoughtsRenderer({ thoughts }: ThoughtsRendererProps) {
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

  const parseJsonField = (field: string) => {
    try {
      return JSON.parse(field || '[]')
    } catch {
      return []
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString()
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

  return (
    <div className="space-y-6">

      <div className="space-y-4">
        {sortedThoughts.map((thought) => {
          const modalities = parseJsonField(thought.modalities)
          const sources = parseJsonField(thought.sources)
          const tags = parseJsonField(thought.tags)
          const location = getLocationString(thought)
          
          return (
            <article key={thought.id} className="card p-6">
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
                        {sources.sort((a,b) => a < b).map((source: string, index: number) => (
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
              
              {tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-surface1">
                  <div className="flex flex-wrap gap-2">
                    {tags.filter(t => t != "public").map((tag: string) => (
                      <span key={tag} className="px-2 py-1 text-xs bg-surface1 text-subtext1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
