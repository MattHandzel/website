import { useMemo } from 'react';
import HabitGrid from './HabitGrid';

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
                    className="bg-primary h-2 rounded-full"
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
        <HabitGrid habits={actualHabits} />
      </div>
    </div>
  )
}
