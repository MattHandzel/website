import { GetStaticProps } from 'next'
import Head from 'next/head'
import { promises as fs } from 'fs'
import path from 'path'
import Navigation from '@/components/Navigation'
import CommunityRenderer from '@/components/CommunityRenderer'

interface CommunitiesProps {
  communities: any[]
}

export default function Communities({ communities }: CommunitiesProps) {
  return (
    <>
      <Head>
        <title>Communities - Matt's Personal Website</title>
        <meta name="description" content="Communities and social connections" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-base">
        <Navigation currentPage="communities" />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div>
              <h2 className="text-2xl font-bold text-text mb-6">Communities</h2>
              <CommunityRenderer communities={communities} />
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
    const communitiesData = await fs.readFile(path.join(dataDir, 'communities.json'), 'utf8')
    const communities = JSON.parse(communitiesData)

    return {
      props: {
        communities
      }
    }
  } catch (error) {
    console.error('Error reading communities data:', error)
    return {
      props: {
        communities: []
      }
    }
  }
}
