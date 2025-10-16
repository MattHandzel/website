import React, { useEffect, useState } from 'react'

interface DailiesTimelineProps {
  dailiesTimeline: Array<{
    date: string
    count: number
    formatted_date: string
  }>
}

export default function DailiesTimeline({ dailiesTimeline }: DailiesTimelineProps) {
  const [historyData, setHistoryData] = useState<number[][]>([])
  const [months, setMonths] = useState<string[]>([])
  const [stats, setStats] = useState({
    totalDailies: 0,
    totalDays: 0,
    averagePerDay: 0,
  })
  const [hoveredCell, setHoveredCell] = useState<{ weekIndex: number; dayIndex: number; count: number; date: string } | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const endOfThisWeek = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysUntilEndOfWeek = 6 - dayOfWeek
    const endOfWeek = new Date(now)
    endOfWeek.setDate(now.getDate() + daysUntilEndOfWeek)
    endOfWeek.setHours(23, 59, 59, 999)
    return endOfWeek
  }

  const getLocalDate = (timestamp: string | number) => {
    const localDate = new Date(timestamp)
    localDate.setHours(0, 0, 0, 0)
    return localDate
  }

  useEffect(() => {
    if (!dailiesTimeline || dailiesTimeline.length === 0) {
      setHistoryData([])
      setMonths([])
      setStats({ totalDailies: 0, totalDays: 0, averagePerDay: 0 })
      return
    }

    const endOfWeekDate = endOfThisWeek()
    const now = endOfWeekDate
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    const data = Array(52).fill(0).map(() => Array(7).fill(0))
    const monthLabels: string[] = []
    const daysWithDailies = new Set()

    dailiesTimeline.forEach(daily => {
      const localDate = getLocalDate(daily.date)
      if (localDate >= oneYearAgo) {
        const weekIndex = Math.floor((now.getTime() - localDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
        const dayIndex = localDate.getDay()
        if (weekIndex < 52) {
          data[51 - weekIndex][dayIndex] = daily.count
          daysWithDailies.add(daily.date)
        }
      }
    })

    const iDontWant13Months = 4
    for (let i = 0; i < 52 - iDontWant13Months; i++) {
      const date = new Date(now.getTime() - (51 - iDontWant13Months - i) * 7 * 24 * 60 * 60 * 1000)
      const monthName = date.toLocaleString('default', { month: 'short' })
      if (i === 0 || monthName !== monthLabels[monthLabels.length - 1]) {
        monthLabels.push(monthName)
      }
    }

    const totalDailies = dailiesTimeline.reduce((sum, daily) => sum + daily.count, 0)
    const totalDays = daysWithDailies.size
    const averagePerDay = totalDays > 0 ? Number((totalDailies / totalDays).toFixed(1)) : 0

    setHistoryData(data)
    setMonths(monthLabels)
    setStats({ totalDailies, totalDays, averagePerDay })
  }, [dailiesTimeline])

  const getColor = (count: number, weekIndex: number, dayIndex: number) => {
    const today = getLocalDate(Date.now())
    const todayWeekIndex = 0
    const todayDayIndex = today.getDay()
    
    if (weekIndex === 0 && dayIndex > todayDayIndex) return '#313244'
    if (count === 0) return '#45475a'
    
    if (count === 1) return '#89b4fa'
    return '#74c7ec'
  }

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

  return (
    <div className="card p-4 md:p-6 mb-2">
      <div className="">
        <div>
          <h3 className="text-lg font-semibold text-text mb-2">Daily Writing Timeline</h3>
        </div>
        
        {/* Mobile: Scrollable container */}
        <div className="relative overflow-x-auto md:overflow-x-visible -mx-4 md:mx-0 px-4 md:px-0">
          <div className="min-w-[600px] md:min-w-0">
            {/* Month labels */}
            <div className="flex gap-1 mb-1 px-2 md:px-6 relative h-5">
              {months.map((month, index) => (
                <div
                  key={index}
                  className="text-xs text-subtext0 absolute"
                  style={{
                    left: `${(index * 102) / months.length + 1}%`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  {month}
                </div>
              ))}
            </div>
            
            {/* Grid */}
            <div className="flex gap-[2px] md:gap-1 w-full min-h-[120px] md:min-h-[160px] justify-between mt-6">
              {historyData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[2px] md:gap-1">
                  {week.map((count, dayIndex) => {
                    const today = getLocalDate(Date.now())
                    const todayDayIndex = today.getDay()
                    const shouldShow = !(weekIndex === 51 && dayIndex > todayDayIndex)
                    
                    if (!shouldShow) return null
                    
                    const endOfWeekDate = endOfThisWeek()
                    const cellDate = new Date(endOfWeekDate.getTime() - ((51 - weekIndex) * 7 + 6 - dayIndex) * 24 * 60 * 60 * 1000)
                    
                    return (
                      <div
                        key={dayIndex}
                        className="w-3 h-3 md:w-4 md:h-4 transition-all duration-200 hover:scale-125 hover:ring-2 hover:ring-blue hover:z-10 rounded-sm cursor-pointer relative"
                        style={{ 
                          backgroundColor: getColor(count, 51 - weekIndex, dayIndex),
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect()
                          setTooltipPosition({ 
                            x: rect.left - rect.width * 52 - rect.width / 2, 
                            y: rect.top - rect.height * 7
                          })
                          setHoveredCell({ 
                            weekIndex: 51 - weekIndex, 
                            dayIndex, 
                            count, 
                            date: cellDate.toLocaleDateString('en-US', { 
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) 
                          })
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
          
          {/* Scroll indicator for mobile */}
          <div className="md:hidden mt-2 text-center">
            <p className="text-xs text-subtext0">← Scroll to see full timeline →</p>
          </div>
        </div>
        
        {/* Custom Tooltip */}
        {hoveredCell && (
          <div 
            className="fixed pointer-events-none z-50"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y - 10}px`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="bg-surface0 text-text px-4 py-3 rounded-lg shadow-xl border border-surface1 min-w-[200px]">
              <div className="text-sm font-semibold mb-1">
                {hoveredCell.count} {hoveredCell.count === 1 ? 'Daily' : 'Dailies'}
              </div>
              <div className="text-xs text-subtext1">
                {hoveredCell.date}
              </div>
              {hoveredCell.count > 0 && (
                <div className="mt-2 pt-2 border-t border-surface1">
                  <div className="text-xs text-blue font-medium">
                    ✓ Completed
                  </div>
                </div>
              )}
            </div>
            {/* Tooltip arrow */}
            <div 
              className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid var(--surface0)',
                bottom: '-6px'
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
