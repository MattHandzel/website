import { GetStaticProps } from 'next'
import { promises as fs } from 'fs'
import path from 'path'
import Navigation from '@/components/Navigation'

interface Failure {
  id: number
  date: string
  date_display: string
  description: string
  created_date: string
  last_edited_date: string
}

interface FailuresPageProps {
  failures: Failure[]
}

export default function FailuresPage({ failures }: FailuresPageProps) {
  return (
    <div className="min-h-screen bg-base">
      <Navigation currentPage="failures" />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-text mb-4">
            Failures
          </h1>
          <p className="text-muted dark:text-muted text-muted-light text-lg">
            A collection of my failures and rejections. Sharing these openly as part of learning and growth.
          </p>
        </div>

        <div className="frosted-card">
          {failures.length === 0 ? (
            <p className="text-muted text-center py-8">No failures recorded yet.</p>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-surface dark:bg-surface bg-surface-light" />
              
              <ul className="space-y-6">
                {failures.map((failure, index) => (
                  <li
                    key={failure.id}
                    className="flex items-start gap-6 relative"
                  >
                    {/* Timeline dot */}
                    <div className="flex-shrink-0 w-12 flex items-center justify-center relative z-10">
                      <div className="w-4 h-4 rounded-full bg-accent dark:bg-accent bg-accent-light border-4 border-base dark:border-base border-bg-light" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-accent dark:text-accent text-accent-light font-semibold text-sm">
                          {failure.date_display}
                        </span>
                      </div>
                      <p className="text-text dark:text-text text-text-light leading-relaxed">
                        {failure.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {failures.length > 0 && failures[0].last_edited_date && (
          <div className="mt-6 text-sm text-muted text-center">
            Last updated: {new Date(failures[0].last_edited_date).toLocaleDateString('en-US', {
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
  const dataPath = path.join(process.cwd(), 'data', 'failures.json')
  const fileContents = await fs.readFile(dataPath, 'utf8')
  const failures: Failure[] = JSON.parse(fileContents)

  return {
    props: {
      failures,
    },
  }
}
