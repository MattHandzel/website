import { GetStaticProps } from 'next'
import Head from 'next/head'
import { promises as fs } from 'fs'
import path from 'path'
import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import ContentRenderer from '@/components/ContentRenderer'
import ForceGraphMesh from '@/components/ForceGraphMesh'
import FlowDivider from '@/components/FlowDivider'
import { motion } from 'framer-motion'

interface HomeProps {
  content: any[]
}

export default function Home({ content }: HomeProps) {
  const homeContent = content.find((c: any) => c.id === 'about-this-site')
  const [activeSection, setActiveSection] = useState('home')

  return (
    <>
      <Head>
        <title>Home - Matt's Personal Website</title>
        <meta name="description" content="About this website and Matt Handzel" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-bg">
        <Navigation currentPage="home" />

        {/* Hero Section with Force Graph Mesh */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <ForceGraphMesh activeSection={activeSection} />
          </div>
          
          <motion.div 
            className="relative z-10 max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 data-glow">
              <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
                Matt Handzel
              </span>
            </h1>
          </motion.div>
        </div>

        <FlowDivider variant="wave" />

        {/* Feedback Banner */}
        <motion.div 
          className="max-w-5xl mx-auto mb-12 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="card p-8 text-center border-accent/30">
            <h2 className="text-3xl font-display font-bold mb-4 text-accent">Anonymous Feedback Welcomed!</h2>
            <p className="mb-6 text-muted text-lg max-w-3xl mx-auto">
              I welcome you to give me feedback on what I am doing wrong and what I am doing right! My most important{' '}
              <a href="https://www.matthandzel.com/principles/" className="text-accent hover:text-accent-2 underline font-semibold">
                principle
              </a>{' '}
              is growth. Your feedback helps me do that 🥰
            </p>
            <a
              href="https://www.admonymous.co/matthew-handzel"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-lg font-semibold inline-block"
            >
              Leave Anonymous Feedback
            </a>
          </div>
        </motion.div>

        <FlowDivider variant="curve" />

        <main className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
          <motion.div 
            className="px-4 py-6 sm:px-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {homeContent && (
              <div className="card p-8">
                <ContentRenderer content={homeContent} showTitle={false} />
              </div>
            )}
          </motion.div>
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
