import React from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'

interface HeatmapValue {
  date: string
  count: number
}

interface GitHubData {
  heatmap_data: HeatmapValue[]
  total_commits: number
  repositories: string[]
  repository_count: number
  last_updated: string
  error?: string
}

interface GitHubHeatmapProps {
  githubData: GitHubData
}

export default function GitHubHeatmap({ githubData }: GitHubHeatmapProps) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 1)

  if (githubData.error) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text mb-4">GitHub Activity</h3>
        <div className="text-red text-sm">
          Error loading commits: {githubData.error}
        </div>
        <p className="text-subtext1 text-xs mt-2">
          Last updated: {new Date(githubData.last_updated).toLocaleDateString()}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text mb-4">GitHub Activity</h3>
        <div className="mb-4">
          <p className="text-subtext1 text-sm">
            {githubData.total_commits} commits in the last year across {githubData.repositories.length} repositories
          </p>
          <p className="text-subtext0 text-xs mt-1">
            Last updated: {new Date(githubData.last_updated).toLocaleDateString()}
          </p>
        </div>
        <div className="overflow-x-auto">
          <CalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={githubData.heatmap_data}
            classForValue={(value) => {
              if (!value || value.count === 0) return 'color-empty'
              if (value.count < 3) return 'color-scale-1'
              if (value.count < 6) return 'color-scale-2'
              if (value.count < 9) return 'color-scale-3'
              return 'color-scale-4'
            }}
            showWeekdayLabels
          />
        </div>
      </div>
    </div>
  )
}
