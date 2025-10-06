import { GetStaticProps } from 'next'
import Head from 'next/head'
import { promises as fs } from 'fs'
import path from 'path'
import Navigation from '@/components/Navigation'
import IdeasRenderer from '@/components/IdeasRenderer'

interface Idea {
  id: number;
  title: string;
  description: string;
}

interface ProjectIdeasProps {
  ideas: Idea[]
}

export default function ProjectIdeas({ ideas }: ProjectIdeasProps) {
  return (
    <>
      <Head>
        <title>Project Ideas - Matt's Personal Website</title>
        <meta name="description" content="My project ideas and future work" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-base">
        <Navigation currentPage="project-ideas" />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div>
              <h2 className="text-2xl font-bold text-text mb-2">Project Ideas</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                A collection of project ideas and things I'd like to build in the future
              </p>
              <IdeasRenderer ideas={ideas} />
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
    const ideasData = await fs.readFile(path.join(dataDir, 'ideas.json'), 'utf8')
    const ideas = JSON.parse(ideasData)

    return {
      props: {
        ideas
      }
    }
  } catch (error) {
    console.error('Error reading ideas data:', error)
    return {
      props: {
        ideas: []
      }
    }
  }
}
