import { useMemo } from 'react'

interface Habit {
  id: string
  date: string
  habit_name: string
  completed: boolean
  duration?: number
  notes: string
}

interface Objective {
  id: string
  date: string
  habit_name: string
  completed: boolean
  duration?: number
  notes: string
  priority: number
  objective_text: string
}

interface HabitTrackerProps {
  habits: Habit[]
}

export default function HabitTracker({ habits }: HabitTrackerProps) {
  const { actualHabits, objectives } = useMemo(() => {
    const actualHabits = habits.filter(item => !item.habit_name.startsWith('Objective'))
    const objectives: Objective[] = habits.filter(item => item.habit_name.startsWith('Objective'))
      .map(obj => ({
        ...obj,
        priority: parseInt(obj.notes.replace('Priority: ', '') || '0'),
        objective_text: obj.habit_name.replace(/^Objective \d+: /, '')
      }))
    return { actualHabits, objectives }
  }, [habits])

  const habitStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number; streak: number }> = {}
    
    const sortedHabits = [...actualHabits].sort((a, b) => a.date.localeCompare(b.date))
    
    sortedHabits.forEach(habit => {
      if (!stats[habit.habit_name]) {
        stats[habit.habit_name] = { total: 0, completed: 0, streak: 0 }
      }
      
      stats[habit.habit_name].total++
      if (habit.completed) {
        stats[habit.habit_name].completed++
      }
    })
    
    return stats
  }, [actualHabits])

  const calendarData = useMemo(() => {
    const now = new Date()
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    const data = Array(52).fill(0).map(() => Array(7).fill(0))
    const monthLabels: string[] = []
    
    actualHabits.forEach(habit => {
      const habitDate = new Date(habit.date)
      if (habitDate >= oneYearAgo && habit.completed) {
        const weekIndex = Math.floor((now.getTime() - habitDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
        const dayIndex = habitDate.getDay()
        if (weekIndex < 52) {
          data[51 - weekIndex][dayIndex]++
        }
      }
    })
    
    for (let i = 0; i < 48; i++) {
      const date = new Date(now.getTime() - (47 - i) * 7 * 24 * 60 * 60 * 1000)
      const monthName = date.toLocaleString('default', { month: 'short' })
      if (i === 0 || monthName !== monthLabels[monthLabels.length - 1]) {
        monthLabels.push(monthName)
      }
    }
    
    return { data, monthLabels }
  }, [actualHabits])

  const getColor = (count: number, weekIndex: number, dayIndex: number) => {
    const today = new Date()
    const cellDate = new Date(today.getTime() - ((51 - weekIndex) * 7 + 6 - dayIndex) * 24 * 60 * 60 * 1000)
    
    if (cellDate > today) return '#6c7086'
    if (count === 0) return '#313244'
    
    const intensity = Math.min(count / 5, 1)
    const alpha = Math.floor(50 + intensity * 150).toString(16).padStart(2, '0')
    return `#89b4fa${alpha}`
  }

  return (
    <div className="space-y-6">
      {objectives.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Today's Objectives</h3>
          <div className="space-y-3">
            {objectives.sort((a, b) => a.priority - b.priority).map((objective) => (
              <div key={objective.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue/20 text-blue rounded-full flex items-center justify-center text-sm font-medium">
                  {objective.priority}
                </div>
                <div className="flex-1">
                  <p className="text-text">{objective.objective_text}</p>
                  <p className="text-xs text-subtext0 mt-1">
                    Set for {new Date(objective.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(habitStats).map(([habitName, stats]) => {
          const completionRate = (stats.completed / stats.total) * 100
          
          return (
            <div key={habitName} className="card p-4">
              <h3 className="font-semibold text-text mb-2">{habitName}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion Rate</span>
                  <span className="font-medium">{completionRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-surface1 rounded-full h-2">
                  <div 
                    className="bg-blue h-2 rounded-full" 
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-subtext0">
                  <span>{stats.completed}/{stats.total} completed</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Habit Calendar</h3>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-6 text-sm mb-4 text-subtext0">
            <div>
              <span className="font-semibold text-text">{actualHabits.filter(h => h.completed).length}</span> habits completed
            </div>
            <div>
              <span className="font-semibold text-text">{new Set(actualHabits.filter(h => h.completed).map(h => h.date)).size}</span> active days
            </div>
          </div>
          
          <div className="relative">
            <div className="flex gap-1 mb-1 px-6">
              {calendarData.monthLabels.map((month, index) => (
                <div
                  key={index}
                  className="text-xs text-subtext0"
                  style={{
                    position: 'absolute',
                    left: `${(index * 102) / calendarData.monthLabels.length + 1}%`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  {month}
                </div>
              ))}
            </div>
            <div className="flex gap-1 w-full min-h-[160px] justify-between mt-6">
              {calendarData.data.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((count, dayIndex) => {
                    const cellDate = new Date(new Date().getTime() - ((51 - weekIndex) * 7 + 6 - dayIndex) * 24 * 60 * 60 * 1000)
                    const isToday = cellDate.toDateString() === new Date().toDateString()
                    const isFuture = cellDate > new Date()
                    
                    return !isFuture && (
                      <div
                        key={dayIndex}
                        className={`w-4 h-4 transition-all duration-200 hover:scale-110 ${isToday ? 'ring-2 ring-blue' : ''}`}
                        style={{ 
                          backgroundColor: getColor(count, weekIndex, dayIndex),
                          borderRadius: '3px',
                        }}
                        title={`${count} habits completed on ${cellDate.toLocaleDateString('en-US', { 
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
            <div className="flex items-center justify-end gap-2 mt-4 text-subtext0">
              <span className="text-sm">Less</span>
              {[0, 2, 4, 6].map((count) => (
                <div
                  key={count}
                  className="w-4 h-4"
                  style={{ 
                    backgroundColor: getColor(count, 0, 0),
                    borderRadius: '3px',
                  }}
                />
              ))}
              <span className="text-sm">More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
