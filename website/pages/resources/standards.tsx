import { GetStaticProps } from 'next'
import { promises as fs } from 'fs'
import path from 'path'
import Navigation from '@/components/Navigation'
import ReactMarkdown from 'react-markdown'

interface StandardsData {
  title: string
  content: string
  created_date: string
  last_edited_date: string
}

interface StandardsPageProps {
  data: StandardsData
}

export default function StandardsPage({ data }: StandardsPageProps) {
  return (
    <div className="min-h-screen bg-base">
      <Navigation currentPage="standards" />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        <div className="frosted-card">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => (
                  <h1 className="text-3xl font-display font-bold text-text mb-4 mt-8 first:mt-0" {...props} />
                ),
                h2: ({node, ...props}) => (
                  <h2 className="text-2xl font-display font-semibold text-text mb-3 mt-6" {...props} />
                ),
                h3: ({node, ...props}) => (
                  <h3 className="text-xl font-display font-semibold text-accent mb-3 mt-5" {...props} />
                ),
                h4: ({node, ...props}) => (
                  <h4 className="text-lg font-medium text-text mb-2 mt-4" {...props} />
                ),
                p: ({node, ...props}) => (
                  <p className="text-text dark:text-text text-text-light mb-4 leading-relaxed" {...props} />
                ),
                ul: ({node, ...props}) => (
                  <ul className="list-disc list-inside mb-4 text-text dark:text-text text-text-light space-y-2 ml-4" {...props} />
                ),
                ol: ({node, ...props}) => (
                  <ol className="list-decimal list-inside mb-4 text-text dark:text-text text-text-light space-y-2 ml-4" {...props} />
                ),
                li: ({node, ...props}) => (
                  <li className="mb-2 leading-relaxed" {...props} />
                ),
                a: ({node, ...props}) => (
                  <a 
                    className="text-accent hover:text-accent-2 transition-colors underline" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    {...props} 
                  />
                ),
                code: ({node, inline, ...props}: any) => 
                  inline ? (
                    <code className="bg-surface dark:bg-surface bg-surface-light px-2 py-1 rounded text-sm text-accent-2 font-mono" {...props} />
                  ) : (
                    <code className="block bg-surface dark:bg-surface bg-surface-light p-4 rounded-lg text-sm overflow-x-auto text-accent-2 font-mono my-4" {...props} />
                  ),
                blockquote: ({node, ...props}) => (
                  <blockquote className="border-l-4 border-accent pl-4 italic text-muted my-4" {...props} />
                ),
                strong: ({node, ...props}) => (
                  <strong className="font-semibold text-text dark:text-text text-text-light" {...props} />
                ),
                em: ({node, ...props}) => (
                  <em className="italic text-text dark:text-text text-text-light" {...props} />
                ),
              }}
            >
              {data.content}
            </ReactMarkdown>
          </div>
        </div>

        {data.last_edited_date && (
          <div className="mt-6 text-sm text-muted text-center">
            Last updated: {new Date(data.last_edited_date).toLocaleDateString('en-US', {
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
  const dataPath = path.join(process.cwd(), 'data', 'standards.json')
  const fileContents = await fs.readFile(dataPath, 'utf8')
  const data: StandardsData = JSON.parse(fileContents)

  return {
    props: {
      data,
    },
  }
}
