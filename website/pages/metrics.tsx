import { GetStaticProps } from 'next'
import PageLayout from '@/components/PageLayout'
import MetricsDashboard from '@/components/MetricsDashboard'
import { loadJsonDataSafe } from '@/lib/dataLoader'

interface MetricsProps {
  metrics: any[]
}

export default function Metrics({ metrics }: MetricsProps) {
  return (
    <PageLayout 
      title="Metrics" 
      description="Health and physiological metrics tracking"
      currentPage="metrics"
    >
      <h2 className="text-2xl font-bold text-text mb-6">Health & Metrics</h2>
      <MetricsDashboard metrics={metrics} />
    </PageLayout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const metrics = await loadJsonDataSafe('metrics.json')
  return {
    props: { metrics }
  }
}
