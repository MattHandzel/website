import React from 'react'
import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import { promises as fs } from 'fs'
import path from 'path'
import Navigation from '@/components/Navigation'
import ThoughtsRenderer from '@/components/ThoughtsRenderer'

interface Thought {
  id: string
  capture_id: string
  timestamp: string
  content: string
  modalities: string
  context: string
  sources: string
  tags: string
  location_latitude: number | null
  location_longitude: number | null
  location_city: string | null
  location_country: string | null
  location_timezone: string | null
  processing_status: string
  created_date: string
  last_edited_date: string
  metadata: string
}

interface ThoughtPageProps {
  thought: Thought | null
  thoughts: Thought[]
  captureId: string
}

export default function ThoughtPage({ thought, thoughts, captureId }: ThoughtPageProps) {
  // Get a preview of the content (first 150 chars)
  const contentPreview = thought ? 
    thought.content.length > 150 ? 
      thought.content.substring(0, 150) + '...' : 
      thought.content 
    : 'Thought not found'

  const pageTitle = thought ? 
    `${thought.content.substring(0, 60)}${thought.content.length > 60 ? '...' : ''} - Matt's Thoughts` : 
    'Thought Not Found - Matt\'s Thoughts'

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={contentPreview} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={contentPreview} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://matthandzel.com'}/thoughts/${encodeURIComponent(captureId)}`} />
        <meta property="og:site_name" content="Matt's Personal Website" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={contentPreview} />
        
        {thought && (
          <>
            <meta property="article:published_time" content={thought.timestamp} />
            <meta property="article:author" content="Matt Handzel" />
          </>
        )}
      </Head>

      <div className="min-h-screen bg-base">
        <Navigation currentPage="thoughts" />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-text">
                {thought ? 'Captured Thought' : 'Thought Not Found'}
              </h1>
              <p className="mt-2 text-subtext1">
                {thought ? 
                  `From my knowledge capture system` : 
                  `The thought with ID "${captureId}" could not be found.`
                }
              </p>
            </div>
            
            {!thought ? (
              <div className="card p-6">
                <p className="text-subtext0 mb-4">
                  This thought may have been removed or the link may be incorrect.
                </p>
                <a 
                  href="/thoughts" 
                  className="text-blue hover:text-blue/80 underline"
                >
                  View all thoughts →
                </a>
              </div>
            ) : (
              <ThoughtsRenderer 
                thoughts={thoughts} 
                focusedCaptureId={captureId}
              />
            )}
          </div>
        </main>
      </div>
    </>
  )
}

// Convert capture_id to URL-safe slug using base64 encoding
const createSlug = (captureId: string): string => {
  return Buffer.from(captureId, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// Convert slug back to capture_id
const parseSlug = (slug: string): string => {
  try {
    // Add padding if needed
    let base64 = slug.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    return Buffer.from(base64, 'base64').toString('utf-8')
  } catch (error) {
    console.error('Error parsing slug:', error)
    return ''
  }
}

export const getStaticPaths = async () => {
  try {
    const dataDir = path.join(process.cwd(), 'website', 'data')
    const thoughtsData = await fs.readFile(path.join(dataDir, 'thoughts.json'), 'utf8').catch(() => '[]')
    const thoughts = JSON.parse(thoughtsData) as Thought[]
    
    const paths = thoughts.map((thought) => ({
      params: { capture_id: createSlug(thought.capture_id) }
    }))

    return {
      paths,
      fallback: false // Generate 404 for non-existent thoughts
    }
  } catch (error) {
    console.error('Error generating static paths:', error)
    return {
      paths: [],
      fallback: false
    }
  }
}

export const getStaticProps = async ({ params }: { params: { capture_id: string } }) => {
  const slug = params?.capture_id
  
  if (!slug) {
    return {
      notFound: true
    }
  }

  try {
    const dataDir = path.join(process.cwd(), 'website', 'data')
    const thoughtsData = await fs.readFile(path.join(dataDir, 'thoughts.json'), 'utf8').catch(() => '[]')
    const thoughts = JSON.parse(thoughtsData) as Thought[]
    
    // Convert slug back to capture_id and find the thought
    const originalCaptureId = parseSlug(slug)
    const thought = thoughts.find(t => t.capture_id === originalCaptureId)
    
    if (!thought) {
      return {
        notFound: true
      }
    }
    
    return {
      props: {
        thought,
        thoughts,
        captureId: originalCaptureId
      }
    }
  } catch (error) {
    console.error('Error reading thoughts data:', error)
    return {
      notFound: true
    }
  }
}
