import { GetStaticProps } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import { promises as fs } from 'fs'
import path from 'path'
import ContentRenderer from '@/components/ContentRenderer'
import HabitTracker from '@/components/HabitTracker'
import FinancialDashboard from '@/components/FinancialDashboard'
import MetricsDashboard from '@/components/MetricsDashboard'
import CommunityRenderer from '@/components/CommunityRenderer'
import AnkiRenderer from '@/components/AnkiRenderer'
import BlogRenderer from '@/components/BlogRenderer'

interface HomeProps {
  content: any[]
  habits: any[]
  financial: any[]
  metrics: any[]
  communities: any[]
  anki: any[]
  blog: any[]
}

export default function Home({ content, habits, financial, metrics, communities, anki, blog }: HomeProps) {
  const [activeTab, setActiveTab] = useState('home')
  
  const homeContent = content.find(c => c.id === 'home-page')
  const aboutContent = content.find(c => c.id === 'about-this-site')

  return (
    <>
      <Head>
        <title>Matt's Personal Website</title>
        <meta name="description" content="Personal website showcasing quantified self data and digital life" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-base">
        <nav className="bg-surface0 shadow-lg border-b border-surface1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-text">Matt Handzel</h1>
              </div>
              <div className="flex space-x-8">
                {['home', 'habits', 'financial', 'metrics', 'communities', 'anki', 'blog', 'thoughts', 'about'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`nav-tab ${
                      activeTab === tab
                        ? 'nav-tab-active'
                        : 'nav-tab-inactive'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {activeTab === 'home' && homeContent && (
              <ContentRenderer content={homeContent} />
            )}
            
            {activeTab === 'habits' && (
              <div>
                <h2 className="text-2xl font-bold text-text mb-6">Habit Tracking</h2>
                <HabitTracker habits={habits} />
              </div>
            )}
            
            {activeTab === 'financial' && (
              <div>
                <h2 className="text-2xl font-bold text-text mb-6">Financial Dashboard</h2>
                <FinancialDashboard financial={financial} />
              </div>
            )}
            
            {activeTab === 'metrics' && (
              <div>
                <h2 className="text-2xl font-bold text-text mb-6">Health & Metrics</h2>
                <MetricsDashboard metrics={metrics} />
              </div>
            )}
            
            {activeTab === 'communities' && (
              <div>
                <h2 className="text-2xl font-bold text-text mb-6">Communities</h2>
                <CommunityRenderer communities={communities} />
              </div>
            )}
            
            {activeTab === 'anki' && (
              <div>
                <h2 className="text-2xl font-bold text-text mb-6">Anki Learning</h2>
                <AnkiRenderer anki={anki} />
              </div>
            )}
            
            {activeTab === 'blog' && (
              <div>
                <h2 className="text-2xl font-bold text-text mb-6">Blog</h2>
                <BlogRenderer blog={blog} />
              </div>
            )}
            
            {activeTab === 'thoughts' && (
              <div>
                <h2 className="text-2xl font-bold text-text mb-6">Thoughts</h2>
                <p className="text-subtext1 mb-6">
                  Captured thoughts from my knowledge capture system. Visit{' '}
                  <a href="/thoughts" className="text-blue hover:text-sky underline">
                    /thoughts
                  </a>{' '}
                  for the full experience.
                </p>
              </div>
            )}
            
            {activeTab === 'about' && aboutContent && (
              <ContentRenderer content={aboutContent} />
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
    
    const [contentData, habitsData, financialData, metricsData, communitiesData, ankiData, blogData] = await Promise.all([
      fs.readFile(path.join(dataDir, 'content.json'), 'utf8'),
      fs.readFile(path.join(dataDir, 'habits.json'), 'utf8'),
      fs.readFile(path.join(dataDir, 'financial.json'), 'utf8'),
      fs.readFile(path.join(dataDir, 'metrics.json'), 'utf8'),
      fs.readFile(path.join(dataDir, 'communities.json'), 'utf8'),
      fs.readFile(path.join(dataDir, 'anki.json'), 'utf8').catch(() => '[]'),
      fs.readFile(path.join(dataDir, 'blog.json'), 'utf8').catch(() => '[]')
    ])

    const content = JSON.parse(contentData)
    const habits = JSON.parse(habitsData)
    const financial = JSON.parse(financialData)
    const metrics = JSON.parse(metricsData)
    const communities = JSON.parse(communitiesData)
    const anki = JSON.parse(ankiData)
    const blog = JSON.parse(blogData)

    return {
      props: {
        content,
        habits,
        financial,
        metrics,
        communities,
        anki,
        blog
      }
    }
  } catch (error) {
    console.error('Error reading static data files:', error)
    return {
      props: {
        content: [],
        habits: [],
        financial: [],
        metrics: [],
        communities: [],
        anki: [],
        blog: []
      }
    }
  }
}
