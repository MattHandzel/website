import React, { useMemo } from 'react'

interface AnkiReview {
  id: string
  card_id: string
  deck_name: string
  note_content: string
  review_date: string
  ease_button: number | null
  interval_days: number | null
  previous_interval_days: number | null
  ease_factor: number | null
  time_spent_ms: number | null
  review_type: number | null
  created_date: string
  metadata: string
}

interface AnkiRendererProps {
  anki: AnkiReview[]
}

export default function AnkiRenderer({ anki }: AnkiRendererProps) {
  const ankiStats = useMemo(() => {
    const totalReviews = anki.length
    const avgTimeSpent = anki
      .filter(r => r.time_spent_ms)
      .reduce((sum, r) => sum + (r.time_spent_ms || 0), 0) / totalReviews / 1000
    
    const easeButtonCounts = anki.reduce((acc, r) => {
      if (r.ease_button) {
        acc[r.ease_button] = (acc[r.ease_button] || 0) + 1
      }
      return acc
    }, {} as Record<number, number>)
    
    const successRate = totalReviews > 0 
      ? ((easeButtonCounts[2] || 0) + (easeButtonCounts[3] || 0) + (easeButtonCounts[4] || 0)) / totalReviews * 100
      : 0
    
    const uniqueDecks = new Set(anki.map(r => r.deck_name)).size
    
    return {
      totalReviews,
      avgTimeSpent: Math.round(avgTimeSpent),
      successRate: Math.round(successRate),
      uniqueDecks,
      easeButtonCounts
    }
  }, [anki])

  const recentReviews = useMemo(() => {
    return anki
      .sort((a, b) => new Date(b.review_date).getTime() - new Date(a.review_date).getTime())
      .slice(0, 10)
  }, [anki])

  return (
    <div className="space-y-6">
      <div className="card p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-text mb-4">Anki Learning Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-accent">{ankiStats.totalReviews}</div>
            <div className="text-sm text-muted">Total Reviews</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{ankiStats.successRate}%</div>
            <div className="text-sm text-muted">Success Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{ankiStats.avgTimeSpent}s</div>
            <div className="text-sm text-muted">Avg Time/Card</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{ankiStats.uniqueDecks}</div>
            <div className="text-sm text-muted">Active Decks</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-text mb-4">Answer Button Distribution</h3>
          <div className="space-y-2">
            {Object.entries(ankiStats.easeButtonCounts).map(([button, count]) => {
              const buttonNames = { '1': 'Again', '2': 'Hard', '3': 'Good', '4': 'Easy' }
              const buttonColors = { '1': 'bg-red-500', '2': 'bg-yellow-500', '3': 'bg-green-500', '4': 'bg-blue-500' }
              const percentage = (count / ankiStats.totalReviews) * 100
              
              return (
                <div key={button} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{buttonNames[button as keyof typeof buttonNames]}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${buttonColors[button as keyof typeof buttonColors]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted">{count}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-text mb-4">Recent Reviews</h3>
          <div className="space-y-3">
            {recentReviews.map((review) => (
              <div key={review.id} className="border-l-4 border-blue-500 pl-3">
                <div className="text-sm font-medium text-text truncate">
                  {review.note_content || 'Card content'}
                </div>
                <div className="text-xs text-muted">
                  {review.deck_name} • {new Date(review.review_date).toLocaleDateString()}
                  {review.time_spent_ms && ` • ${Math.round(review.time_spent_ms / 1000)}s`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
