import React from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { promises as fs } from 'fs'
import path from 'path'
import dynamic from 'next/dynamic'
import Navigation from '../components/Navigation'

const ThoughtsMapRenderer = dynamic(() => import('../components/ThoughtsMapRenderer'), { 
  ssr: false,
  loading: () => <div className="card p-6 text-center"><p className="text-subtext0">Loading map component...</p></div>
})

interface MapPageProps {
  thoughts: any[]
}

export default function MapPage({ thoughts }: MapPageProps) {
  return (
    <>
      <Head>
        <title>Thought Locations Map - Matt's Personal Website</title>
        <meta name="description" content="Interactive map showing locations where thoughts were captured" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-base">
        <Navigation currentPage="map" />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-text">Thought Locations</h1>
              <p className="mt-2 text-subtext1">
                Interactive map showing where thoughts were captured over time
              </p>
            </div>
            <ThoughtsMapRenderer thoughts={thoughts} />
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
