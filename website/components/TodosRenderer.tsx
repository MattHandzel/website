'use client'

import React, { useMemo, useState } from 'react'
import { Task } from '@/pages/todos'
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
  Area, AreaChart, RadialBarChart, RadialBar
} from 'recharts'

interface TodosRendererProps {
  tasks: Task[]
}

export default function TodosRenderer({ tasks }: TodosRendererProps) {
  const [selectedVisualization, setSelectedVisualization] = useState<string>('all')
  const [daysToShow, setDaysToShow] = useState<number>(30)

  // Filter tasks by date (only show last N days)
  const filteredTasks = useMemo(() => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToShow)
    
    return tasks.filter(task => {
      const taskDate = task.completed_date || task.created_date
      if (!taskDate) return false
      return new Date(taskDate) >= cutoffDate
    })
  }, [tasks, daysToShow])

  // Data processing functions
  const completedTasks = useMemo(() => 
    filteredTasks.filter(t => t.status === 'completed'),
    [filteredTasks]
  )

  const pendingTasks = useMemo(() => 
    filteredTasks.filter(t => t.status === 'pending'),
    [filteredTasks]
  )

  const deletedTasks = useMemo(() => 
    filteredTasks.filter(t => t.status === 'deleted'),
    [filteredTasks]
  )

  // 1. Task Completion Timeline
  const completionTimeline = useMemo(() => {
    const dailyCounts: Record<string, number> = {}
    
    completedTasks.forEach(task => {
      if (task.completed_date) {
        const date = task.completed_date.split('T')[0]
        dailyCounts[date] = (dailyCounts[date] || 0) + 1
      }
    })

    return Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-90) // Last 90 days
  }, [completedTasks])

  // 2. Project Progress
  const projectProgress = useMemo(() => {
    const projectStats: Record<string, { completed: number; pending: number }> = {}
    
    tasks.forEach(task => {
      const project = task.project || 'No Project'
      if (!projectStats[project]) {
        projectStats[project] = { completed: 0, pending: 0 }
      }
      
      if (task.status === 'completed') {
        projectStats[project].completed++
      } else if (task.status === 'pending') {
        projectStats[project].pending++
      }
    })

    return Object.entries(projectStats)
      .map(([project, stats]) => ({
        project,
        completed: stats.completed,
        pending: stats.pending,
        total: stats.completed + stats.pending,
        completionRate: stats.completed / (stats.completed + stats.pending) * 100
      }))
      .filter(p => p.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
  }, [tasks])

  // 3. Task Aging / Lead Time
  const leadTimeData = useMemo(() => {
    return completedTasks
      .filter(task => task.lead_time_days !== null && task.created_date)
      .map(task => ({
        created: new Date(task.created_date!).getTime(),
        leadTime: task.lead_time_days!,
        description: task.description.substring(0, 50)
      }))
      .sort((a, b) => a.created - b.created)
      .slice(-100) // Last 100 completed tasks
  }, [completedTasks])

  // 4. Tag Usage Heatmap Data
  const tagStats = useMemo(() => {
    const tagCounts: Record<string, number> = {}
    
    tasks.forEach(task => {
      task.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)
  }, [tasks])

  // 5. Priority Breakdown
  const priorityBreakdown = useMemo(() => {
    const priorityStats: Record<string, { total: number; completed: number }> = {
      'H': { total: 0, completed: 0 },
      'M': { total: 0, completed: 0 },
      'L': { total: 0, completed: 0 },
      'None': { total: 0, completed: 0 }
    }

    tasks.forEach(task => {
      const priority = task.priority || 'None'
      if (!priorityStats[priority]) {
        priorityStats[priority] = { total: 0, completed: 0 }
      }
      priorityStats[priority].total++
      if (task.status === 'completed') {
        priorityStats[priority].completed++
      }
    })

    return Object.entries(priorityStats)
      .map(([priority, stats]) => ({
        priority,
        total: stats.total,
        completed: stats.completed,
        pending: stats.total - stats.completed,
        completionRate: stats.total > 0 ? (stats.completed / stats.total * 100) : 0
      }))
      .filter(p => p.total > 0)
  }, [tasks])

  // 6. Status Distribution
  const statusDistribution = useMemo(() => {
    const statusCounts: Record<string, number> = {}
    
    tasks.forEach(task => {
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1
    })

    return Object.entries(statusCounts)
      .map(([status, count]) => ({ status, count }))
  }, [tasks])

  // 7. Utility vs Effort Scatter
  const utilityEffortData = useMemo(() => {
    return pendingTasks
      .filter(task => task.utility !== undefined && task.effort !== undefined)
      .filter(task => task.utility !== null && task.effort !== null)
      .map(task => {
        // Parse utility and effort as numbers (TaskWarrior stores them as strings)
        const effortNum = typeof task.effort === 'string' ? parseFloat(task.effort) : task.effort!
        const utilityNum = typeof task.utility === 'string' ? parseFloat(task.utility) : task.utility!
        
        return {
          effort: isNaN(effortNum) ? 0 : effortNum,
          utility: isNaN(utilityNum) ? 0 : utilityNum,
          description: task.description.substring(0, 40),
          urgency: task.urgency
        }
      })
  }, [pendingTasks])

  // 8. Weekly completion rhythm
  const weeklyRhythm = useMemo(() => {
    const dayOfWeekCounts = Array(7).fill(0)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    completedTasks.forEach(task => {
      if (task.completed_date) {
        const date = new Date(task.completed_date)
        const dayOfWeek = date.getDay()
        dayOfWeekCounts[dayOfWeek]++
      }
    })

    return dayNames.map((day, index) => ({
      day,
      count: dayOfWeekCounts[index]
    }))
  }, [completedTasks])

  // 9. Task Flow Efficiency
  const taskFlowEfficiency = useMemo(() => {
    // Group by week
    const weeklyStats: Record<string, { added: number; completed: number }> = {}
    
    tasks.forEach(task => {
      if (task.created_date) {
        const date = new Date(task.created_date)
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        const weekKey = weekStart.toISOString().split('T')[0]
        
        if (!weeklyStats[weekKey]) {
          weeklyStats[weekKey] = { added: 0, completed: 0 }
        }
        weeklyStats[weekKey].added++
      }
      
      if (task.status === 'completed' && task.completed_date) {
        const date = new Date(task.completed_date)
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        const weekKey = weekStart.toISOString().split('T')[0]
        
        if (!weeklyStats[weekKey]) {
          weeklyStats[weekKey] = { added: 0, completed: 0 }
        }
        weeklyStats[weekKey].completed++
      }
    })

    return Object.entries(weeklyStats)
      .map(([week, stats]) => ({
        week,
        added: stats.added,
        completed: stats.completed,
        netChange: stats.completed - stats.added
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-12) // Last 12 weeks
  }, [tasks])

  // 10. Urgency distribution for pending tasks
  const urgencyDistribution = useMemo(() => {
    const buckets = [
      { min: 0, max: 1, label: 'Very Low' },
      { min: 1, max: 5, label: 'Low' },
      { min: 5, max: 10, label: 'Medium' },
      { min: 10, max: 15, label: 'High' },
      { min: 15, max: Infinity, label: 'Very High' }
    ]

    const distribution = buckets.map(bucket => ({
      label: bucket.label,
      count: pendingTasks.filter(t => t.urgency >= bucket.min && t.urgency < bucket.max).length
    }))

    return distribution
  }, [pendingTasks])

  const colors = {
    primary: '#22B8CF',
    secondary: '#6EE7F0',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#a855f7',
    pink: '#ec4899',
    muted: '#9AB0BE'
  }

  const pieColors = [colors.primary, colors.secondary, colors.success, colors.warning, colors.danger, colors.purple]

  return (
    <div className="space-y-8">
      {/* Time Range Filter */}
      <div className="bg-surface p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <label className="text-sm font-medium text-text mb-2 block">
          Show tasks from the last:
        </label>
        <div className="flex gap-2 flex-wrap">
          {[7, 14, 30, 60, 90, 180, 365].map(days => (
            <button
              key={days}
              onClick={() => setDaysToShow(days)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                daysToShow === days
                  ? 'bg-accent text-white shadow-lg'
                  : 'bg-surface border-2 border-gray-300 dark:border-gray-600 text-text hover:border-accent hover:shadow-sm'
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-muted mb-1">Total Tasks (Last {daysToShow} Days)</div>
          <div className="text-3xl font-bold text-text">{filteredTasks.length}</div>
        </div>
        <div className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-muted mb-1">Pending</div>
          <div className="text-3xl font-bold text-accent">{pendingTasks.length}</div>
        </div>
        <div className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-muted mb-1">Completed</div>
          <div className="text-3xl font-bold text-green-500">{completedTasks.length}</div>
        </div>
        <div className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-muted mb-1">Completion Rate</div>
          <div className="text-3xl font-bold text-text">
            {filteredTasks.length > 0 ? Math.round((completedTasks.length / filteredTasks.length) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Visualization Selector */}
      <div className="flex flex-wrap gap-2">
        {['all', 'timeline', 'projects', 'leadtime', 'tags', 'priority', 'utility', 'rhythm', 'flow'].map(viz => (
          <button
            key={viz}
            onClick={() => setSelectedVisualization(viz)}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              selectedVisualization === viz
                ? 'bg-accent text-white shadow-lg'
                : 'bg-surface border-2 border-gray-300 dark:border-gray-600 text-text hover:border-accent hover:shadow-sm'
            }`}
          >
            {viz.charAt(0).toUpperCase() + viz.slice(1)}
          </button>
        ))}
      </div>

      {/* Visualizations */}
      {(selectedVisualization === 'all' || selectedVisualization === 'timeline') && (
        <div className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-text mb-4">📈 Task Completion Timeline (Last 90 Days)</h3>
          <p className="text-sm text-muted mb-4">When am I most productive?</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={completionTimeline}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#9AB0BE', fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fill: '#9AB0BE' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#121619', border: '1px solid #22B8CF', borderRadius: '8px' }}
                labelStyle={{ color: '#E6EEF3' }}
              />
              <Area type="monotone" dataKey="count" stroke={colors.primary} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {(selectedVisualization === 'all' || selectedVisualization === 'projects') && (
        <div className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-text mb-4">📊 Project Progress (Top 10)</h3>
          <p className="text-sm text-muted mb-4">Tasks completed vs. remaining per project</p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={projectProgress} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis type="number" tick={{ fill: '#9AB0BE' }} />
              <YAxis 
                dataKey="project" 
                type="category" 
                width={150}
                tick={{ fill: '#9AB0BE', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#121619', border: '1px solid #22B8CF', borderRadius: '8px' }}
                labelStyle={{ color: '#E6EEF3' }}
              />
              <Legend />
              <Bar dataKey="completed" fill={colors.success} name="Completed" />
              <Bar dataKey="pending" fill={colors.warning} name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {(selectedVisualization === 'all' || selectedVisualization === 'leadtime') && leadTimeData.length > 0 && (
        <div className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-text mb-4">⏱️ Task Lead Time (Last 100 Completed)</h3>
          <p className="text-sm text-muted mb-4">How long tasks take from creation to completion</p>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="created" 
                type="number"
                domain={['dataMin', 'dataMax']}
                tick={{ fill: '#9AB0BE', fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                name="Created Date"
              />
              <YAxis 
                dataKey="leadTime" 
                tick={{ fill: '#9AB0BE' }}
                name="Days to Complete"
                label={{ value: 'Days', angle: -90, position: 'insideLeft', fill: '#9AB0BE' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#121619', border: '1px solid #22B8CF', borderRadius: '8px', color: '#E6EEF3' }}
                labelStyle={{ color: '#E6EEF3' }}
                itemStyle={{ color: '#E6EEF3' }}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <Scatter data={leadTimeData} fill={colors.secondary} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      {(selectedVisualization === 'all' || selectedVisualization === 'tags') && (
        <div className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-text mb-4">🏷️ Tag Usage (Top 15)</h3>
          <p className="text-sm text-muted mb-4">Balance between life/work domains</p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={tagStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="tag" 
                tick={{ fill: '#9AB0BE', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis tick={{ fill: '#9AB0BE' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#121619', border: '1px solid #22B8CF', borderRadius: '8px' }}
                labelStyle={{ color: '#E6EEF3' }}
              />
              <Bar dataKey="count" fill={colors.primary} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {(selectedVisualization === 'all' || selectedVisualization === 'priority') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-text mb-4">⚡ Priority Breakdown</h3>
            <p className="text-sm text-muted mb-4">Tasks by priority level</p>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121619', border: '1px solid #22B8CF', borderRadius: '8px', color: '#E6EEF3' }}
                  labelStyle={{ color: '#E6EEF3' }}
                  itemStyle={{ color: '#E6EEF3' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-text mb-4">🎯 Priority Completion Rate</h3>
            <p className="text-sm text-muted mb-4">Are you prioritizing the right things?</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="priority" tick={{ fill: '#9AB0BE' }} />
                <YAxis tick={{ fill: '#9AB0BE' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121619', border: '1px solid #22B8CF', borderRadius: '8px' }}
                  labelStyle={{ color: '#E6EEF3' }}
                />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill={colors.success} name="Completed" />
                <Bar dataKey="pending" stackId="a" fill={colors.warning} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {(selectedVisualization === 'all' || selectedVisualization === 'utility') && utilityEffortData.length > 0 && (
        <div className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-text mb-4">💎 Utility vs Effort Matrix</h3>
          <p className="text-sm text-muted mb-4">Find high-value, low-effort tasks (top-left quadrant)</p>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="effort" 
                tick={{ fill: '#9AB0BE' }}
                name="Effort"
                label={{ value: 'Effort →', position: 'insideBottom', offset: -5, fill: '#9AB0BE' }}
                type="number"
              />
              <YAxis 
                dataKey="utility" 
                tick={{ fill: '#9AB0BE' }}
                name="Utility"
                label={{ value: 'Utility →', angle: -90, position: 'insideLeft', fill: '#9AB0BE' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#121619', border: '1px solid #22B8CF', borderRadius: '8px', color: '#E6EEF3' }}
                labelStyle={{ color: '#E6EEF3' }}
                itemStyle={{ color: '#E6EEF3' }}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <Scatter data={utilityEffortData} fill={colors.primary}>
                {utilityEffortData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors.primary} 
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      {(selectedVisualization === 'all' || selectedVisualization === 'rhythm') && (
        <div className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-text mb-4">📅 Weekly Completion Rhythm</h3>
          <p className="text-sm text-muted mb-4">Your weekly energy rhythm</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyRhythm}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="day" tick={{ fill: '#9AB0BE' }} />
              <YAxis tick={{ fill: '#9AB0BE' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#121619', border: '1px solid #22B8CF', borderRadius: '8px' }}
                labelStyle={{ color: '#E6EEF3' }}
              />
              <Bar dataKey="count" fill={colors.secondary} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {(selectedVisualization === 'all' || selectedVisualization === 'flow') && (
        <div className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-text mb-4">🔄 Task Flow Efficiency (Last 12 Weeks)</h3>
          <p className="text-sm text-muted mb-4">Tasks added vs. completed - reducing task debt</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={taskFlowEfficiency}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="week" 
                tick={{ fill: '#9AB0BE', fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fill: '#9AB0BE' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#121619', border: '1px solid #22B8CF', borderRadius: '8px' }}
                labelStyle={{ color: '#E6EEF3' }}
              />
              <Legend />
              <Line type="monotone" dataKey="added" stroke={colors.danger} name="Tasks Added" />
              <Line type="monotone" dataKey="completed" stroke={colors.success} name="Tasks Completed" />
              <Line type="monotone" dataKey="netChange" stroke={colors.primary} name="Net Change" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Urgency Distribution */}
      {selectedVisualization === 'all' && (
        <div className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-text mb-4">🚨 Urgency Distribution (Pending Tasks)</h3>
          <p className="text-sm text-muted mb-4">How urgent are your pending tasks?</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={urgencyDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="label" tick={{ fill: '#9AB0BE' }} />
              <YAxis tick={{ fill: '#9AB0BE' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#121619', border: '1px solid #22B8CF', borderRadius: '8px' }}
                labelStyle={{ color: '#E6EEF3' }}
              />
              <Bar dataKey="count">
                {urgencyDistribution.map((entry, index) => {
                  const colors_urgency = ['#9AB0BE', '#22B8CF', '#f59e0b', '#ef4444', '#dc2626']
                  return <Cell key={`cell-${index}`} fill={colors_urgency[index]} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Pending Tasks by Urgency - COMMENTED OUT FOR PRIVACY */}
      {/* <div className="bg-surface p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-text mb-4">🔥 Top 10 Most Urgent Pending Tasks</h3>
        <div className="space-y-2">
          {pendingTasks
            .sort((a, b) => b.urgency - a.urgency)
            .slice(0, 10)
            .map((task, index) => (
              <div 
                key={task.uuid}
                className="flex items-start gap-3 p-3 rounded-lg bg-bg border border-gray-200 dark:border-gray-700 hover:border-accent transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-accent text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="text-text font-medium">{task.description}</div>
                  <div className="flex gap-3 mt-1 text-xs text-muted">
                    <span>Urgency: {task.urgency.toFixed(2)}</span>
                    {task.priority && <span>Priority: {task.priority}</span>}
                    {task.project && <span>Project: {task.project}</span>}
                    {task.utility !== undefined && <span>Utility: {task.utility}</span>}
                    {task.effort !== undefined && <span>Effort: {task.effort}</span>}
                  </div>
                  {task.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {task.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div> */}
    </div>
  )
}
