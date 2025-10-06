import { GetStaticProps } from 'next'
import Head from 'next/head'
import { promises as fs } from 'fs'
import path from 'path'
import Navigation from '@/components/Navigation'
import MetricsDashboard from '@/components/MetricsDashboard'

interface MetricsProps {
  metrics: any[]
}

export default function Metrics({ metrics }: MetricsProps) {
  return (
    <>
      <Head>
        <title>Metrics - Matt's Personal Website</title>
        <meta name="description" content="Health and physiological metrics tracking" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-base">
        <Navigation currentPage="metrics" />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div>
              <h2 className="text-2xl font-bold text-text mb-6">Health &amp; Metrics</h2>
              <MetricsDashboard metrics={metrics} />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    const metricsData = await fs.readFile(path.join(dataDir, 'metrics.json'), 'utf8')
    const metrics = JSON.parse(metricsData)

    return {
      props: {
        metrics
      }
    }
  } catch (error) {
    console.error('Error reading metrics data:', error)
    return {
      props: {
        metrics: []
      }
    }
  }
}
