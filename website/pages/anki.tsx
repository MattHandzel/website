import { GetStaticProps } from 'next'
import Head from 'next/head'
import { promises as fs } from 'fs'
import path from 'path'
import Navigation from '@/components/Navigation'
import AnkiRenderer from '@/components/AnkiRenderer'

interface AnkiProps {
  anki: any[]
}

export default function Anki({ anki }: AnkiProps) {
  return (
    <>
      <Head>
        <title>Anki - Matt's Personal Website</title>
        <meta name="description" content="Anki learning and spaced repetition data" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-base">
        <Navigation currentPage="anki" />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div>
              <h2 className="text-2xl font-bold text-text mb-6">Anki Learning</h2>
              <AnkiRenderer anki={anki} />
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
    const ankiData = await fs.readFile(path.join(dataDir, 'anki.json'), 'utf8').catch(() => '[]')
    const anki = JSON.parse(ankiData)

    return {
      props: {
        anki
      }
    }
  } catch (error) {
    console.error('Error reading anki data:', error)
    return {
      props: {
        anki: []
      }
    }
  }
}
