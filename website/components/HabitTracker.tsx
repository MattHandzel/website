import { useMemo } from 'react'

interface Habit {
  id: string
  date: string
  habit_name: string
  completed: boolean
  duration?: number
  notes: string
}

interface HabitTrackerProps {
  habits: Habit[]
}

export default function HabitTracker({ habits }: HabitTrackerProps) {
  const habitStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number; streak: number }> = {}
    
    const sortedHabits = [...habits].sort((a, b) => a.date.localeCompare(b.date))
    
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
  }, [habits])

  const recentHabits = useMemo(() => {
    const last7Days = [...habits]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 35)
    
    const groupedByDate: Record<string, Habit[]> = {}
    last7Days.forEach(habit => {
      if (!groupedByDate[habit.date]) {
        groupedByDate[habit.date] = []
      }
      groupedByDate[habit.date].push(habit)
    })
    
    return groupedByDate
  }, [habits])

  return (
    <div className="space-y-6">
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
        <h3 className="text-lg font-semibold text-text mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {Object.entries(recentHabits)
            .sort(([a], [b]) => b.localeCompare(a))
            .slice(0, 7)
            .map(([date, dayHabits]) => (
              <div key={date} className="border-b border-surface1 pb-3 last:border-b-0">
                <h4 className="font-medium text-text mb-2">
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {dayHabits.map(habit => (
                    <div 
                      key={habit.id}
                      className={`p-2 rounded text-xs ${
                        habit.completed 
                          ? 'bg-green/20 text-green' 
                          : 'bg-red/20 text-red'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          habit.completed ? 'bg-green' : 'bg-red'
                        }`}></span>
                        {habit.habit_name}
                      </div>
                      {habit.duration && (
                        <div className="text-xs text-subtext0 mt-1">
                          {habit.duration} min
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
