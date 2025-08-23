import { GetStaticProps } from 'next'
import Head from 'next/head'
import { useState, useCallback } from 'react'
import { promises as fs } from 'fs'
import path from 'path'
import ContentRenderer from '@/components/ContentRenderer'
import HabitTracker from '@/components/HabitTracker'
import FinancialDashboard from '@/components/FinancialDashboard'
import MetricsDashboard from '@/components/MetricsDashboard'
import CommunityRenderer from '@/components/CommunityRenderer'
import AnkiRenderer from '@/components/AnkiRenderer'
import BlogRenderer from '@/components/BlogRenderer'
import GitHubHeatmap from '@/components/GitHubHeatmap'
import DailiesTimeline from '@/components/DailiesTimeline'
import BooksRenderer from '@/components/BooksRenderer'
import { isPostHogEnabled, posthog } from '../lib/posthog'

interface HomeProps {
  content: any[]
  habits: any[]
  financial: any[]
  metrics: any[]
  communities: any[]
  anki: any[]
  blog: any[]
  dailiesTimeline: any[]
  books: any[]
  githubData: any
  exportMetadata: any
}

export default function Home({ content, habits, financial, metrics, communities, anki, blog, dailiesTimeline, books, githubData, exportMetadata }: HomeProps) {
  const [activeTab, setActiveTab] = useState('home')
  const onTabClick = useCallback((tab: string) => {
    setActiveTab(tab)
    if (isPostHogEnabled()) {
      posthog.capture('nav_tab_clicked', { tab })
    }
  }, [])
  
  const homeContent = content.find((c: any) => c.id === 'home-page')
  const aboutContent = content.find((c: any) => c.id === 'about-this-site')

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
                {['home', 'dailies', 'financial', 'metrics', 'communities', 'anki', 'blog', 'content-consumed', 'github', 'thoughts', 'about'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => onTabClick(tab)}
                    className={`nav-tab ${
                      activeTab === tab
                        ? 'nav-tab-active'
                        : 'nav-tab-inactive'
                    }`}
                  >
                    {tab === 'content-consumed' ? 'Content Consumed' : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
            
            {activeTab === 'dailies' && (
              <div>
                <div className="flex items-center mb-6">
                  <h2 className="text-2xl font-bold text-text mr-3">Dailies</h2>
                  <div className="group relative">
                    <svg 
                      className="w-5 h-5 text-subtext1 hover:text-text cursor-help" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-surface0 text-text text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-80 z-10">
                      <div className="text-sm">
                        <p className="font-medium mb-2">What is a Daily?</p>
                        <p className="mb-2">A daily is something I write at the end of each day where I reflect on the day, check what habits I've completed, and capture thoughts about my experiences.</p>
                        <p className="text-xs text-subtext1">Format: Daily reflection + habit tracking + personal insights</p>
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-surface0"></div>
                    </div>
                  </div>
                </div>
                <DailiesTimeline dailiesTimeline={dailiesTimeline} />
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-text mb-4">Habit Tracking</h3>
                  <HabitTracker habits={habits} />
                </div>
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
                <h2 className="text-2xl font-bold text-text mb-6">Health &amp; Metrics</h2>
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
            
            {activeTab === 'content-consumed' && (
              <div>
                <h2 className="text-2xl font-bold text-text mb-6">Content Consumed</h2>
                <BooksRenderer books={books} exportMetadata={exportMetadata} />
              </div>
            )}
            
            {activeTab === 'github' && (
              <div>
                <h2 className="text-2xl font-bold text-text mb-6">GitHub Activity</h2>
                <GitHubHeatmap githubData={githubData} />
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
    
    const [contentData, habitsData, financialData, metricsData, communitiesData, ankiData, blogData, dailiesTimelineData, booksData, githubData, exportMetadata] = await Promise.all([
      fs.readFile(path.join(dataDir, 'content.json'), 'utf8'),
      fs.readFile(path.join(dataDir, 'habits.json'), 'utf8'),
      fs.readFile(path.join(dataDir, 'financial.json'), 'utf8'),
      fs.readFile(path.join(dataDir, 'metrics.json'), 'utf8'),
      fs.readFile(path.join(dataDir, 'communities.json'), 'utf8'),
      fs.readFile(path.join(dataDir, 'anki.json'), 'utf8').catch(() => '[]'),
      fs.readFile(path.join(dataDir, 'blog.json'), 'utf8').catch(() => '[]'),
      fs.readFile(path.join(dataDir, 'dailies_timeline.json'), 'utf8').catch(() => '[]'),
      fs.readFile(path.join(dataDir, 'books.json'), 'utf8').catch(() => '[]'),
      fs.readFile(path.join(dataDir, 'github.json'), 'utf8').catch(() => '{"heatmap_data":[],"total_commits":0,"repositories":[],"last_updated":""}'),
      fs.readFile(path.join(dataDir, 'export_metadata.json'), 'utf8').catch(() => '{"last_updated":""}')
    ])

    const content = JSON.parse(contentData)
    const habits = JSON.parse(habitsData)
    const financial = JSON.parse(financialData)
    const metrics = JSON.parse(metricsData)
    const communities = JSON.parse(communitiesData)
    const anki = JSON.parse(ankiData)
    const blog = JSON.parse(blogData)
    const dailiesTimeline = JSON.parse(dailiesTimelineData)
    const books = JSON.parse(booksData)
    const githubDataParsed = JSON.parse(githubData)
    const exportMetadataParsed = JSON.parse(exportMetadata)

    return {
      props: {
        content,
        habits,
        financial,
        metrics,
        communities,
        anki,
        blog,
        dailiesTimeline,
        books,
        githubData: githubDataParsed,
        exportMetadata: exportMetadataParsed
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
        blog: [],
        dailiesTimeline: [],
        books: [],
        githubData: { heatmap_data: [], total_commits: 0, repositories: [], last_updated: '' },
        exportMetadata: { last_updated: '' }
      }
    }
  }
}
