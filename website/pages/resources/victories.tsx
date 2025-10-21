import { GetStaticProps } from 'next'
import { promises as fs } from 'fs'
import path from 'path'
import Navigation from '@/components/Navigation'

interface Victory {
  id: number
  date: string
  date_display: string
  description: string
  created_date: string
  last_edited_date: string
}

interface VictoriesPageProps {
  victories: Victory[]
}

export default function VictoriesPage({ victories }: VictoriesPageProps) {
  return (
    <div className="min-h-screen bg-base">
      <Navigation currentPage="victories" />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-text mb-4">
            Victories
          </h1>
          <p className="text-muted dark:text-muted text-muted-light text-lg">
            A collection of my victories and achievements. Celebrating wins both big and small.
          </p>
        </div>

        <div className="frosted-card">
          {victories.length === 0 ? (
            <p className="text-muted text-center py-8">No victories recorded yet.</p>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-surface dark:bg-surface bg-surface-light" />
              
              <ul className="space-y-6">
                {victories.map((victory, index) => (
                  <li
                    key={victory.id}
                    className="flex items-start gap-6 relative"
                  >
                    {/* Timeline dot */}
                    <div className="flex-shrink-0 w-12 flex items-center justify-center relative z-10">
                      <div className="w-4 h-4 rounded-full bg-accent-2 dark:bg-accent-2 bg-accent-2-light border-4 border-base dark:border-base border-bg-light shadow-lg" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-accent-2 dark:text-accent-2 text-accent-2-light font-semibold text-sm">
                          {victory.date_display}
                        </span>
                      </div>
                      <p className="text-text dark:text-text text-text-light leading-relaxed">
                        {victory.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {victories.length > 0 && victories[0].last_edited_date && (
          <div className="mt-6 text-sm text-muted text-center">
            Last updated: {new Date(victories[0].last_edited_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const dataPath = path.join(process.cwd(), 'data', 'victories.json')
  const fileContents = await fs.readFile(dataPath, 'utf8')
  const victories: Victory[] = JSON.parse(fileContents)

  return {
    props: {
      victories,
    },
  }
}
