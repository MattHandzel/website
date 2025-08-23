import React, { useState, useMemo } from 'react'

interface Event {
  id: string
  title: string
  location: string
  start_date: string
  end_date: string
  latitude: number | null
  longitude: number | null
  event_type: string
  tags: string
  is_public: boolean
  content: string
  created_date: string
  last_edited_date: string
  metadata: string
}

interface EventsRendererProps {
  events: Event[]
}

export default function EventsRenderer({ events }: EventsRendererProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEventType, setSelectedEventType] = useState<string>('all')

  const parseJsonField = (field: string) => {
    try {
      return JSON.parse(field || '[]')
    } catch {
      return []
    }
  }

  const eventTypes = useMemo(() => {
    const types = new Set(events.map(event => event.event_type).filter(Boolean))
    return Array.from(types).sort()
  }, [events])

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = searchTerm === '' || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.content.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = selectedEventType === 'all' || event.event_type === selectedEventType
      
      return matchesSearch && matchesType
    })
  }, [events, searchTerm, selectedEventType])

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  const getDateRange = (startDate: string, endDate: string) => {
    if (startDate === endDate) {
      return formatDate(startDate)
    }
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  const getEventTypeColor = (eventType: string) => {
    const colors: { [key: string]: string } = {
      'conference': 'bg-blue text-white',
      'business': 'bg-green text-white',
      'personal': 'bg-purple text-white',
      'vacation': 'bg-yellow text-black',
      'work': 'bg-red text-white',
      'education': 'bg-teal text-white'
    }
    return colors[eventType] || 'bg-surface1 text-text'
  }

  if (events.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-subtext0">No travel events found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Travel Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue">{filteredEvents.length}</div>
            <div className="text-sm text-subtext0">Events Displayed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green">{events.length}</div>
            <div className="text-sm text-subtext0">Total Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow">{eventTypes.length}</div>
            <div className="text-sm text-subtext0">Event Types</div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Filter Events</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by title, location, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-surface1 rounded-md bg-base text-text placeholder-subtext0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">Event Type</label>
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="w-full px-3 py-2 border border-surface1 rounded-md bg-base text-text"
            >
              <option value="all">All Types</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredEvents.map((event) => (
          <div key={event.id} className="card p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-text">{event.title}</h3>
                  {event.event_type && (
                    <span className={`px-2 py-1 text-xs rounded-full ${getEventTypeColor(event.event_type)}`}>
                      {event.event_type}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-subtext1 mb-3">
                  <div className="flex items-center gap-1">
                    <span>📍</span>
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📅</span>
                    <span>{getDateRange(event.start_date, event.end_date)}</span>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none text-text mb-4">
                  {event.content.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="mb-2">
                        {paragraph.replace(/^#+\s*/, '')}
                      </p>
                    )
                  ))}
                </div>

                {parseJsonField(event.tags).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {parseJsonField(event.tags).map((tag: string) => (
                      <span key={tag} className="px-2 py-1 text-xs bg-surface1 text-subtext1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {event.latitude && event.longitude && (
                <div className="text-xs text-subtext0 md:text-right">
                  <div>Coordinates:</div>
                  <div>{event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && events.length > 0 && (
        <div className="card p-6 text-center">
          <p className="text-subtext0">No events match your current filters.</p>
        </div>
      )}
    </div>
  )
}
