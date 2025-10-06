import { useMemo } from 'react'

interface Metric {
  id: string
  date: string
  metric_type: string
  metric_name: string
  value: number
  unit: string
  metadata: string
}

interface MetricsDashboardProps {
  metrics: Metric[]
}

export default function MetricsDashboard({ metrics }: MetricsDashboardProps) {
  const latestMetrics = useMemo(() => {
    const metricGroups: Record<string, Metric> = {}
    
    metrics.forEach(metric => {
      const key = metric.metric_name
      if (!metricGroups[key] || metric.date > metricGroups[key].date) {
        metricGroups[key] = metric
      }
    })
    
    return Object.values(metricGroups)
  }, [metrics])

  const sleepData = useMemo(() => {
    return metrics
      .filter(m => m.metric_name === 'Sleep Data (Last 7 Days)')
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 7)
  }, [metrics])

  const formatMetricValue = (metric: Metric) => {
    if (metric.unit === '%') {
      return `${metric.value}${metric.unit}`
    } else if (metric.unit === 'hours') {
      return `${metric.value} ${metric.unit}`
    } else if (metric.unit === 'bpm' || metric.unit === 'ms') {
      return `${metric.value} ${metric.unit}`
    } else {
      return `${metric.value.toLocaleString()}${metric.unit ? ` ${metric.unit}` : ''}`
    }
  }

  const getMetricColor = (metricName: string) => {
    if (metricName.toLowerCase().includes('sleep')) return 'bg-mauve/20 text-mauve'
    if (metricName.toLowerCase().includes('heart')) return 'bg-red/20 text-red'
    if (metricName.toLowerCase().includes('steps')) return 'bg-green/20 text-green'
    if (metricName.toLowerCase().includes('recovery')) return 'bg-blue/20 text-blue'
    return 'bg-surface1 text-subtext1'
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {latestMetrics.map((metric: Metric) => (
          <div key={metric.id} className="card p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-text">{metric.metric_name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${getMetricColor(metric.metric_name)}`}>
                {metric.metric_type}
              </span>
            </div>
            <p className="text-2xl font-bold text-text mt-2">
              {formatMetricValue(metric)}
            </p>
            <p className="text-xs text-subtext0 mt-1">
              Last updated: {new Date(metric.date).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {sleepData.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Sleep Trends (Last 7 Days)</h3>
          <div className="space-y-3">
            {sleepData.map(sleep => (
              <div key={sleep.id} className="flex items-center justify-between py-2 border-b border-surface1 last:border-b-0">
                <span className="text-sm text-subtext1">
                  {new Date(sleep.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">
                    {sleep.value} hours
                  </span>
                  <div className="w-20 bg-surface1 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        sleep.value >= 8 ? 'bg-green' : 
                        sleep.value >= 7 ? 'bg-yellow' : 'bg-red'
                      }`}
                      style={{ width: `${Math.min((sleep.value / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-subtext0">
            Average: {(sleepData.reduce((sum, s) => sum + s.value, 0) / sleepData.length).toFixed(1)} hours
          </div>
        </div>
      )}

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Health Goals</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text">Sleep Target</span>
            <span className="text-sm text-subtext0">7.5-8.5 hours nightly</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text">Daily Steps</span>
            <span className="text-sm text-subtext0">10,000+ steps</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text">Weekly Exercise</span>
            <span className="text-sm text-subtext0">5 sessions</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text">HRV Target</span>
            <span className="text-sm text-subtext0">Above 40ms</span>
          </div>
        </div>
      </div>
    </div>
  )
}
