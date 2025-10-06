import { GetStaticProps } from 'next'
import Head from 'next/head'
import { promises as fs } from 'fs'
import path from 'path'
import Navigation from '@/components/Navigation'
import ContentRenderer from '@/components/ContentRenderer'

interface HomeProps {
  content: any[]
}

export default function Home({ content }: HomeProps) {
  const homeContent = content.find((c: any) => c.id === 'about-this-site')

  return (
    <>
      <Head>
        <title>Home - Matt's Personal Website</title>
        <meta name="description" content="About this website and Matt Handzel" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-base">
        <Navigation currentPage="home" />

        {/* Feedback Banner */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-6 shadow-lg flex flex-col items-center justify-center text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Anonymous Feedback Welcomed!</h2>
          <p className="mb-4 max-w-2xl">
            I’m doing this because I don’t want to hide anything and I want people to be able to tell me when I’m doing things wrong. I appreciate the feedback that I’m given and I’m happy that you’re able to take the time to help me become better.
          </p>
          <a
            href="https://www.admonymous.co/matthew-handzel"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-lg font-semibold px-8 py-3 rounded shadow hover:scale-105 transition-transform"
          >
            Leave Anonymous Feedback
          </a>
        </div>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {homeContent && (
              <ContentRenderer content={homeContent} showTitle={false} />
            )}
          </div>
        </main>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    const contentData = await fs.readFile(path.join(dataDir, 'content.json'), 'utf8')
    const content = JSON.parse(contentData)

    return {
      props: {
        content
      }
    }
  } catch (error) {
    console.error('Error reading content data:', error)
    return {
      props: {
        content: []
      }
    }
  }
}
