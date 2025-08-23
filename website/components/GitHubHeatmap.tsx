import React, { useState, useEffect, useMemo } from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'

interface GitHubCommit {
  sha: string
  commit: {
    author: {
      date: string
    }
  }
}

interface HeatmapValue {
  date: string
  count: number
}

interface GitHubHeatmapProps {
  username?: string
  repositories?: string[]
}

export default function GitHubHeatmap({ 
  username = 'MattHandzel', 
  repositories = ['website', 'KnowledgeManagementSystem'] 
}: GitHubHeatmapProps) {
  const [commits, setCommits] = useState<GitHubCommit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCommits = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const allCommits: GitHubCommit[] = []
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      
      for (const repo of repositories) {
        const response = await fetch(
          `https://api.github.com/repos/${username}/${repo}/commits?since=${oneYearAgo.toISOString()}&per_page=100`,
          {
            headers: {
              'Accept': 'application/vnd.github+json',
              ...(process.env.NEXT_PUBLIC_GITHUB_TOKEN && {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`
              })
            }
          }
        )
        
        if (!response.ok) {
          if (response.status === 404) {
            console.warn(`Repository ${username}/${repo} not found or not accessible`)
            continue
          }
          throw new Error(`Failed to fetch commits for ${repo}: ${response.statusText}`)
        }
        
        const repoCommits = await response.json()
        allCommits.push(...repoCommits)
      }
      
      setCommits(allCommits)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch commits')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommits()
  }, [username, repositories])

  const heatmapData = useMemo(() => {
    const commitsByDate: Record<string, number> = {}
    
    commits.forEach(commit => {
      const date = commit.commit.author.date.split('T')[0]
      commitsByDate[date] = (commitsByDate[date] || 0) + 1
    })
    
    return Object.entries(commitsByDate).map(([date, count]) => ({
      date,
      count
    }))
  }, [commits])

  const endDate = new Date()
  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 1)

  if (loading) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text mb-4">GitHub Activity</h3>
        <div className="flex items-center justify-center h-32">
          <div className="text-subtext1">Loading commit history...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text mb-4">GitHub Activity</h3>
        <div className="text-red text-sm">
          Error loading commits: {error}
        </div>
        <button 
          onClick={fetchCommits}
          className="mt-2 px-3 py-1 bg-blue text-white rounded text-sm hover:bg-sky"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text mb-4">GitHub Activity</h3>
        <div className="mb-4">
          <p className="text-subtext1 text-sm">
            {commits.length} commits in the last year across {repositories.length} repositories
          </p>
        </div>
        <div className="overflow-x-auto">
          <CalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={heatmapData}
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
