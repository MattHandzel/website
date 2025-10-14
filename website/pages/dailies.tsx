import { GetStaticProps } from 'next'
import Head from 'next/head'
import { promises as fs } from 'fs'
import path from 'path'
import Navigation from '@/components/Navigation'
import HabitTracker from '@/components/HabitTracker'
import DailiesTimeline from '@/components/DailiesTimeline'

interface DailiesProps {
  habits: any[]
  dailiesTimeline: any[]
}

export default function Dailies({ habits, dailiesTimeline }: DailiesProps) {
  return (
    <>
      <Head>
        <title>Dailies - Matt's Personal Website</title>
        <meta name="description" content="Daily reflections and habit tracking" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-bg">
        <Navigation currentPage="dailies" />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div>
              <div className="flex items-center mb-6">
                <h2 className="text-2xl font-bold text-text mr-3">Dailies</h2>
                <div className="group relative">
                  <svg 
                    className="w-5 h-5 text-muted hover:text-text cursor-help" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-surface text-text text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-80 z-10">
                    <div className="text-sm">
                      <p className="font-medium mb-2">What is a Daily?</p>
                      <p className="mb-2">A daily is something I write at the end of each day where I reflect on the day, check what habits I've completed, and capture thoughts about my experiences.</p>
                      <p className="text-xs text-muted">Format: Daily reflection + habit tracking + personal insights</p>
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
          </div>
        </main>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    
    const [habitsData, dailiesTimelineData] = await Promise.all([
      fs.readFile(path.join(dataDir, 'habits.json'), 'utf8'),
      fs.readFile(path.join(dataDir, 'dailies_timeline.json'), 'utf8').catch(() => '[]')
    ])

    const habits = JSON.parse(habitsData)
    const dailiesTimeline = JSON.parse(dailiesTimelineData)

    return {
      props: {
        habits,
        dailiesTimeline
      }
    }
  } catch (error) {
    console.error('Error reading dailies data files:', error)
    return {
      props: {
        habits: [],
        dailiesTimeline: []
      }
    }
  }
}
