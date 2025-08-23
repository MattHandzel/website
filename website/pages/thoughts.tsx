import React from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { promises as fs } from 'fs'
import path from 'path'
import Navigation from '@/components/Navigation'
import ThoughtsRenderer from '@/components/ThoughtsRenderer'

interface ThoughtsPageProps {
  thoughts: any[]
}

export default function ThoughtsPage({ thoughts }: ThoughtsPageProps) {
  return (
    <>
      <Head>
        <title>Thoughts - Matt's Personal Website</title>
        <meta name="description" content="Captured thoughts from my knowledge capture system" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-base">
        <Navigation />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-text">Captured Thoughts</h1>
              <p className="mt-2 text-subtext1">
                A chronological feed of thoughts from my knowledge capture system
              </p>
            </div>
            <ThoughtsRenderer thoughts={thoughts} />
          </div>
        </main>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    const thoughtsData = await fs.readFile(path.join(dataDir, 'thoughts.json'), 'utf8').catch(() => '[]')
    const thoughts = JSON.parse(thoughtsData)

    return {
      props: {
        thoughts
      }
    }
  } catch (error) {
    console.error('Error reading thoughts data:', error)
    return {
      props: {
        thoughts: []
      }
    }
  }
}
