import { GetStaticProps } from 'next'
import Head from 'next/head'
import { promises as fs } from 'fs'
import path from 'path'
import Navigation from '@/components/Navigation'
import PrinciplesRenderer from '@/components/PrinciplesRenderer'

interface PrinciplesProps {
  principles: any[]
}

export default function Principles({ principles }: PrinciplesProps) {
  return (
    <>
      <Head>
        <title>Principles - Matt's Personal Website</title>
        <meta name="description" content="My operating principles" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-base">
        <Navigation currentPage="principles" />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div>
              <h2 className="text-2xl font-bold text-text mb-6">Principles</h2>
              <PrinciplesRenderer principles={principles} />
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
    const principlesData = await fs.readFile(path.join(dataDir, 'principles.json'), 'utf8')
    const principles = JSON.parse(principlesData)

    return {
      props: {
        principles
      }
    }
  } catch (error) {
    console.error('Error reading principles data:', error)
    return {
      props: {
        principles: []
      }
    }
  }
}
