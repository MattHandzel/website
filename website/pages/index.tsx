import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import ContentRenderer from '@/components/ContentRenderer'
import HabitTracker from '@/components/HabitTracker'
import FinancialDashboard from '@/components/FinancialDashboard'
import MetricsDashboard from '@/components/MetricsDashboard'

interface HomeProps {
  content: any[]
  habits: any[]
  financial: any[]
  metrics: any[]
}

export default function Home({ content, habits, financial, metrics }: HomeProps) {
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

      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Matt Handzel</h1>
              </div>
              <div className="flex space-x-8">
                {['home', 'habits', 'financial', 'metrics', 'about'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      activeTab === tab
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Habit Tracking</h2>
                <HabitTracker habits={habits} />
              </div>
            )}
            
            {activeTab === 'financial' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Dashboard</h2>
                <FinancialDashboard financial={financial} />
              </div>
            )}
            
            {activeTab === 'metrics' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Health & Metrics</h2>
                <MetricsDashboard metrics={metrics} />
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

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' 
      : 'http://localhost:3000'

    const [contentRes, habitsRes, financialRes, metricsRes] = await Promise.all([
      fetch(`${baseUrl}/api/content`),
      fetch(`${baseUrl}/api/habits`),
      fetch(`${baseUrl}/api/financial`),
      fetch(`${baseUrl}/api/metrics`)
    ])

    const content = await contentRes.json()
    const habits = await habitsRes.json()
    const financial = await financialRes.json()
    const metrics = await metricsRes.json()

    return {
      props: {
        content,
        habits,
        financial,
        metrics
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    return {
      props: {
        content: [],
        habits: [],
        financial: [],
        metrics: []
      }
    }
  }
}
