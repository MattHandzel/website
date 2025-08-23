import React from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { promises as fs } from 'fs'
import path from 'path'
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

      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600">
                  Matt Handzel
                </Link>
              </div>
              <div className="flex items-center space-x-8">
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </Link>
                <span className="text-gray-900 font-medium">Thoughts</span>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Captured Thoughts</h1>
              <p className="mt-2 text-gray-600">
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
