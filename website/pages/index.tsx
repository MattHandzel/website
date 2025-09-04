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
