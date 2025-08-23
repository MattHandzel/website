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
    const monthLabels = []
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
    <div className="card p-6 mb-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-text mb-2">Daily Writing Timeline</h3>
          <div className="flex flex-wrap gap-6 text-sm mb-4 text-subtext1">
            <div>
              <span className="font-semibold text-text">{stats.totalDailies}</span> dailies written
            </div>
            <div>
              <span className="font-semibold text-text">{stats.totalDays}</span> days of writing
            </div>
            <div>
              <span className="font-semibold text-text">{stats.averagePerDay}</span> average per day
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div className="flex gap-1 mb-1 px-6">
            {months.map((month, index) => (
              <div
                key={index}
                className="text-xs text-subtext0"
                style={{
                  position: 'absolute',
                  left: `${(index * 102) / months.length + 1}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                {month}
              </div>
            ))}
          </div>
          <div className="flex gap-1 w-full min-h-[160px] justify-between mt-6 md:w-auto">
            {historyData.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
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
                      className="w-4 h-4 transition-all duration-200 hover:scale-110 rounded-sm"
                      style={{ 
                        backgroundColor: getColor(count, 51 - weekIndex, dayIndex),
                      }}
                      title={`${count} dailies on ${cellDate.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 text-subtext0">
            <span className="text-sm">Less</span>
            {[0, 1, 2].map((count) => (
              <div
                key={count}
                className="w-4 h-4 rounded-sm"
                style={{ 
                  backgroundColor: getColor(count, 0, 0),
                }}
              />
            ))}
            <span className="text-sm">More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
