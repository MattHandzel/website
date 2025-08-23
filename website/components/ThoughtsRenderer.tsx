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

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thoughts Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{thoughtsStats.totalThoughts}</div>
            <div className="text-sm text-gray-500">Total Thoughts</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Modalities</div>
            <div className="space-y-1">
              {Object.entries(thoughtsStats.modalityStats).map(([modality, count]) => (
                <div key={modality} className="flex justify-between text-xs">
                  <span className="capitalize">{modality}</span>
                  <span className="text-gray-500">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Sources</div>
            <div className="space-y-1">
              {Object.entries(thoughtsStats.sourceStats).map(([source, count]) => (
                <div key={source} className="flex justify-between text-xs">
                  <span className="capitalize">{source}</span>
                  <span className="text-gray-500">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sortedThoughts.map((thought) => {
          const modalities = parseJsonField(thought.modalities)
          const sources = parseJsonField(thought.sources)
          const tags = parseJsonField(thought.tags)
          const location = getLocationString(thought)
          
          return (
            <article key={thought.id} className="bg-white shadow rounded-lg p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 font-mono">
                      {thought.capture_id}
                    </span>
                    {modalities.map((modality: string) => (
                      <span key={modality} className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {modality}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatTimestamp(thought.timestamp)}
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  {sources.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <span>Sources:</span>
                      {sources.map((source: string, index: number) => (
                        <span key={source} className="capitalize">
                          {source}{index < sources.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                  {location && (
                    <div className="flex items-center space-x-1">
                      <span>📍</span>
                      <span>{location}</span>
                    </div>
                  )}
                  {thought.processing_status && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      thought.processing_status === 'raw' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {thought.processing_status}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-800 leading-relaxed">{thought.content}</p>
              </div>
              
              {tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
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
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No thoughts found. Add some captured thoughts to the raw_capture directory to get started!</p>
        </div>
      )}
    </div>
  )
}
