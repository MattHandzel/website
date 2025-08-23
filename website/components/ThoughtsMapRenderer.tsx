import React, { useState, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

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

interface ThoughtsMapRendererProps {
  thoughts: Thought[]
}

export default function ThoughtsMapRenderer({ thoughts }: ThoughtsMapRendererProps) {
  const [selectedDateRange, setSelectedDateRange] = useState<[Date, Date] | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })
      })
    }
  }, [])
  
  const thoughtsWithLocation = useMemo(() => {
    return thoughts.filter(thought => 
      thought.location_latitude !== null && 
      thought.location_longitude !== null
    )
  }, [thoughts])

  const mapCenter = useMemo(() => {
    if (thoughtsWithLocation.length === 0) {
      return [40.1047, -88.2062]
    }
    
    const avgLat = thoughtsWithLocation.reduce((sum, thought) => 
      sum + (thought.location_latitude || 0), 0) / thoughtsWithLocation.length
    const avgLng = thoughtsWithLocation.reduce((sum, thought) => 
      sum + (thought.location_longitude || 0), 0) / thoughtsWithLocation.length
    
    return [avgLat, avgLng]
  }, [thoughtsWithLocation])

  const dateRange = useMemo(() => {
    if (thoughtsWithLocation.length === 0) return null
    
    const dates = thoughtsWithLocation.map(thought => new Date(thought.timestamp))
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
    
    return [minDate, maxDate] as [Date, Date]
  }, [thoughtsWithLocation])

  const filteredThoughts = useMemo(() => {
    if (!selectedDateRange) return thoughtsWithLocation
    
    return thoughtsWithLocation.filter(thought => {
      const thoughtDate = new Date(thought.timestamp)
      return thoughtDate >= selectedDateRange[0] && thoughtDate <= selectedDateRange[1]
    })
  }, [thoughtsWithLocation, selectedDateRange])

  useEffect(() => {
    if (dateRange && !selectedDateRange) {
      setSelectedDateRange(dateRange)
    }
  }, [dateRange, selectedDateRange])

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
    return `${thought.location_latitude?.toFixed(4)}, ${thought.location_longitude?.toFixed(4)}`
  }

  const parseJsonField = (field: string) => {
    try {
      return JSON.parse(field || '[]')
    } catch {
      return []
    }
  }

  if (thoughtsWithLocation.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-subtext0">No thoughts with location data found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Thought Locations Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue">{filteredThoughts.length}</div>
            <div className="text-sm text-subtext0">Thoughts Displayed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green">{thoughtsWithLocation.length}</div>
            <div className="text-sm text-subtext0">Total with Location</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow">{thoughts.length}</div>
            <div className="text-sm text-subtext0">All Thoughts</div>
          </div>
        </div>
      </div>

      {dateRange && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Time Filter</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-subtext1">
              <span>From: {dateRange[0].toLocaleDateString()}</span>
              <span>To: {dateRange[1].toLocaleDateString()}</span>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text">Start Date</label>
              <input
                type="date"
                value={selectedDateRange?.[0] && !isNaN(selectedDateRange[0].getTime()) 
                  ? selectedDateRange[0].toISOString().split('T')[0] 
                  : ''}
                onChange={(e) => {
                  const newDate = new Date(e.target.value)
                  if (selectedDateRange && !isNaN(newDate.getTime())) {
                    setSelectedDateRange([newDate, selectedDateRange[1]])
                  }
                }}
                className="w-full px-3 py-2 border border-surface1 rounded-md bg-base text-text"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text">End Date</label>
              <input
                type="date"
                value={selectedDateRange?.[1] && !isNaN(selectedDateRange[1].getTime()) 
                  ? selectedDateRange[1].toISOString().split('T')[0] 
                  : ''}
                onChange={(e) => {
                  const newDate = new Date(e.target.value)
                  if (selectedDateRange && !isNaN(newDate.getTime())) {
                    setSelectedDateRange([selectedDateRange[0], newDate])
                  }
                }}
                className="w-full px-3 py-2 border border-surface1 rounded-md bg-base text-text"
              />
            </div>
            <button
              onClick={() => setSelectedDateRange(dateRange)}
              className="w-full px-4 py-2 bg-blue text-white rounded-md hover:bg-blue/80 transition-colors"
            >
              Reset to Full Range
            </button>
          </div>
        </div>
      )}

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Thought Locations Map</h3>
        <div className="h-96 w-full rounded-lg overflow-hidden">
          {isClient ? (
            <MapContainer
              center={mapCenter as [number, number]}
              zoom={10}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredThoughts.map((thought) => (
                <Marker
                  key={thought.id}
                  position={[thought.location_latitude!, thought.location_longitude!]}
                >
                  <Popup>
                    <div className="max-w-sm">
                      <div className="font-semibold text-sm mb-2">
                        {getLocationString(thought)}
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        {formatTimestamp(thought.timestamp)}
                      </div>
                      <div className="text-sm mb-2">
                        {thought.content.length > 100 
                          ? `${thought.content.substring(0, 100)}...`
                          : thought.content
                        }
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {parseJsonField(thought.tags).map((tag: string) => (
                          <span key={tag} className="px-1 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full bg-surface1 rounded-lg">
              <p className="text-subtext0">Loading map...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
