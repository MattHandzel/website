import React from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { promises as fs } from 'fs'
import path from 'path'
import Navigation from '../components/Navigation'
import EventsRenderer from '../components/EventsRenderer'

interface WhereIveBeenPageProps {
  events: any[]
}

export default function WhereIveBeenPage({ events }: WhereIveBeenPageProps) {
  return (
    <>
      <Head>
        <title>Where I've Been - Matt's Personal Website</title>
        <meta name="description" content="Travel events and places I've visited" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-base">
        <Navigation currentPage="where-ive-been" />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-text">Where I've Been</h1>
              <p className="mt-2 text-subtext1">
                Travel events, conferences, and places I've visited
              </p>
            </div>
            <EventsRenderer events={events} />
          </div>
        </main>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    const eventsData = await fs.readFile(path.join(dataDir, 'events.json'), 'utf8').catch(() => '[]')
    const events = JSON.parse(eventsData)

    return {
      props: {
        events
      }
    }
  } catch (error) {
    console.error('Error reading events data:', error)
    return {
      props: {
        events: []
      }
    }
  }
}
