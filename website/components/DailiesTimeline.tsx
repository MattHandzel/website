import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DailiesTimelineProps {
  dailiesTimeline: Array<{
    date: string
    count: number
    formatted_date: string
  }>
}

export default function DailiesTimeline({ dailiesTimeline }: DailiesTimelineProps) {
  if (!dailiesTimeline || dailiesTimeline.length === 0) {
    return (
      <div className="card p-6 mb-6">
        <h3 className="text-lg font-semibold text-text mb-4">Daily Writing Timeline</h3>
        <div className="text-subtext1 text-sm">
          No dailies data available. Start writing daily notes to see your timeline!
        </div>
      </div>
    )
  }

  let cumulativeCount = 0
  const cumulativeData = dailiesTimeline.map(entry => {
    cumulativeCount += entry.count
    return {
      ...entry,
      cumulative: cumulativeCount
    }
  })

  const totalDailies = cumulativeCount
  const dateRange = dailiesTimeline.length > 0 ? 
    `${dailiesTimeline[0].formatted_date} - ${dailiesTimeline[dailiesTimeline.length - 1].formatted_date}` : 
    'No data'

  return (
    <div className="card p-6 mb-6">
      <h3 className="text-lg font-semibold text-text mb-4">Daily Writing Timeline</h3>
      <div className="mb-4">
        <p className="text-subtext1 text-sm">
          <span className="font-medium text-text">{totalDailies}</span> dailies written
          {dailiesTimeline.length > 1 && (
            <span> from {dateRange}</span>
          )}
        </p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={cumulativeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#313244" />
            <XAxis 
              dataKey="date" 
              stroke="#7f849c"
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              }}
            />
            <YAxis 
              stroke="#7f849c"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1e1e2e',
                border: '1px solid #313244',
                borderRadius: '8px',
                color: '#cdd6f4'
              }}
              formatter={(value: number) => [value, 'Total Dailies']}
              labelFormatter={(label) => {
                const date = new Date(label)
                return date.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })
              }}
            />
            <Line 
              type="monotone" 
              dataKey="cumulative" 
              stroke="#89b4fa" 
              strokeWidth={2}
              dot={{ fill: '#89b4fa', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#89b4fa', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
