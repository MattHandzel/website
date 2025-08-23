import { GetStaticProps } from 'next'
import Head from 'next/head'
import { promises as fs } from 'fs'
import path from 'path'
import Navigation from '@/components/Navigation'
import GitHubHeatmap from '@/components/GitHubHeatmap'

interface GitHubProps {
  githubData: any
}

export default function GitHub({ githubData }: GitHubProps) {
  return (
    <>
      <Head>
        <title>GitHub - Matt's Personal Website</title>
        <meta name="description" content="GitHub activity and contribution tracking" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-base">
        <Navigation currentPage="github" />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div>
              <h2 className="text-2xl font-bold text-text mb-6">GitHub Activity</h2>
              <GitHubHeatmap githubData={githubData} />
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
    const githubData = await fs.readFile(path.join(dataDir, 'github.json'), 'utf8').catch(() => '{"heatmap_data":[],"total_commits":0,"repositories":[],"last_updated":""}')
    const githubDataParsed = JSON.parse(githubData)

    return {
      props: {
        githubData: githubDataParsed
      }
    }
  } catch (error) {
    console.error('Error reading github data:', error)
    return {
      props: {
        githubData: { heatmap_data: [], total_commits: 0, repositories: [], last_updated: '' }
      }
    }
  }
}
