import React, { useMemo, useRef, useEffect, useState } from 'react'
import { LinkableItem } from './LinkableItem'
import { useHighlightFromHash } from '../lib/useHighlightFromHash'

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
  // Enable hash-based highlighting for deep links
  useHighlightFromHash() // No auto-expand needed for thoughts
  
  // Filter states
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagSearchQuery, setTagSearchQuery] = useState('')
  const [showAllTags, setShowAllTags] = useState(false)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const sortedThoughts = useMemo(() => {
    return [...thoughts].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }, [thoughts])

  // Extract all unique tags with counts
  const allTagsWithCounts = useMemo(() => {
    const tagCounts: { [key: string]: number } = {}
    thoughts.forEach(thought => {
      try {
        const tags = JSON.parse(thought.tags || '[]').filter((t: string) => t !== 'public')
        tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      } catch (e) {
        // Skip if JSON parsing fails
      }
    })
    
    // Convert to array and sort by count (descending)
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
  }, [thoughts])

  // Filter tags based on search query
  const filteredTags = useMemo(() => {
    if (!tagSearchQuery) return allTagsWithCounts
    return allTagsWithCounts.filter(({ tag }) => 
      tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
    )
  }, [allTagsWithCounts, tagSearchQuery])

  // Get top 10 tags or all tags based on state
  const displayedTags = useMemo(() => {
    if (showAllTags) return filteredTags
    return filteredTags.slice(0, 10)
  }, [filteredTags, showAllTags])

  // Filter thoughts based on selected tags and date range
  const filteredThoughts = useMemo(() => {
    let filtered = sortedThoughts
    
    // Apply tag filter (OR logic - any matching tag)
    if (selectedTags.length > 0) {
      filtered = filtered.filter(thought => {
        try {
          const thoughtTags = JSON.parse(thought.tags || '[]')
          return selectedTags.some(tag => thoughtTags.includes(tag))
        } catch (e) {
          return false
        }
      })
    }
    
    // Apply date range filter
    if (startDate || endDate) {
      filtered = filtered.filter(thought => {
        const thoughtDate = new Date(thought.timestamp)
        const start = startDate ? new Date(startDate) : null
        const end = endDate ? new Date(endDate) : null
        
        if (start && end) {
          // Set end date to end of day for inclusive comparison
          end.setHours(23, 59, 59, 999)
          return thoughtDate >= start && thoughtDate <= end
        } else if (start) {
          return thoughtDate >= start
        } else if (end) {
          end.setHours(23, 59, 59, 999)
          return thoughtDate <= end
        }
        return true
      })
    }
    
    return filtered
  }, [sortedThoughts, selectedTags, startDate, endDate])

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

  // Use user's local timezone with military time (24-hour format)
  const dateFormatter = useMemo(() =>
    new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'medium',
      hour12: false,
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

  // Convert capture_id to URL-safe slug using base64 encoding (must match [capture_id].tsx)
  const createSlug = (captureId: string): string => {
    if (typeof window !== 'undefined') {
      // Client-side: use btoa
      return btoa(captureId)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
    } else {
      // Server-side: use Buffer
      return Buffer.from(captureId, 'utf-8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
    }
  }

  const parseMarkdown = (text: string) => {
    // Simple markdown parser for basic syntax
    let html = text
      // Bold: **text** or __text__
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      // Italic: *text* or _text_
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      // Code: `code`
      .replace(/`(.*?)`/g, '<code class="bg-surface1 px-1 py-0.5 rounded text-sm">$1</code>')
      // Line breaks
      .replace(/\n/g, '<br />')

    return { __html: html }
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

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearAllFilters = () => {
    setSelectedTags([])
    setTagSearchQuery('')
    setStartDate('')
    setEndDate('')
  }

  const clearDateFilter = () => {
    setStartDate('')
    setEndDate('')
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="card p-6 space-y-6">
        {/* Date Range Filter */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-text">Time Range</h3>
            {(startDate || endDate) && (
              <button
                onClick={clearDateFilter}
                className="text-sm text-accent hover:text-accent-2 underline transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="start-date" className="block text-sm text-muted mb-2">
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="end-date" className="block text-sm text-muted mb-2">
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
            </div>
          </div>
          {startDate && endDate && new Date(startDate) > new Date(endDate) && (
            <p className="text-sm text-red-400 mt-2">Start date must be before end date</p>
          )}
        </div>

        {/* Tag Filter */}
        {allTagsWithCounts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-text">Tags</h3>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}  
                  className="text-sm text-accent hover:text-accent-2 underline transition-colors"
                >
                  Clear ({selectedTags.length})
                </button>
              )}
            </div>
            
            {/* Tag Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search tags..."
                value={tagSearchQuery}
                onChange={(e) => setTagSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
            </div>

            {/* Tag Buttons */}
            <div className="flex flex-wrap gap-2">
              {displayedTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full border-2 transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-accent text-white border-accent shadow-md hover:shadow-lg transform hover:scale-105'
                      : 'bg-white dark:bg-surface text-text border-border hover:border-accent hover:shadow-sm hover:scale-105'
                  }`}
                >
                  {tag} <span className="text-xs opacity-70">({count})</span>
                </button>
              ))}
            </div>

            {/* Load More Button */}
            {filteredTags.length > 10 && (
              <button
                onClick={() => setShowAllTags(!showAllTags)}
                className="mt-4 text-sm text-accent hover:text-accent-2 underline transition-colors flex items-center gap-1"
              >
                {showAllTags ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Show Less
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Load More ({filteredTags.length - 10} more tags)
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Filter Summary */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <p className="text-sm text-muted">
            Showing <span className="font-semibold text-accent">{filteredThoughts.length}</span> of <span className="font-semibold text-text">{thoughts.length}</span> thoughts
          </p>
          {(selectedTags.length > 0 || startDate || endDate) && (
            <button
              onClick={clearAllFilters}
              className="text-sm px-4 py-2 bg-accent/20 text-accent rounded-full hover:bg-accent/30 transition-all hover:scale-105 border border-accent/30"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredThoughts.map((thought) => {
          const modalities = parseJsonField(thought.modalities)
          const sources = parseJsonField(thought.sources)
          const tags = parseJsonField(thought.tags).filter((t: string) => t !== "public").sort()
          const location = getLocationString(thought)
          const isFocused = focusedCaptureId === thought.capture_id
          
          return (
            <LinkableItem key={thought.id} id={`thought-${thought.id}`}>
            <article 
              ref={isFocused ? focusedThoughtRef : null}
              className={`card p-6 ${isFocused ? 'ring-6 ring-blue shadow-lg' : ''}`}
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
                <div 
                  className="text-text leading-relaxed"
                  dangerouslySetInnerHTML={parseMarkdown(thought.content)}
                />
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
                    onClick={() => copyToClipboard(`${window.location.origin}/thoughts/${createSlug(thought.capture_id)}`)}
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
            </LinkableItem>
          )
        })}
      </div>
      
      {filteredThoughts.length === 0 && thoughts.length > 0 && (
        <div className="card p-6 text-center">
          <p className="text-subtext0">No thoughts match the current filters. Try adjusting your search criteria.</p>
        </div>
      )}
      
      {thoughts.length === 0 && (
        <div className="card p-6 text-center">
          <p className="text-subtext0">No thoughts found. Add some captured thoughts to the raw_capture directory to get started!</p>
        </div>
      )}
    </div>
  )
}
