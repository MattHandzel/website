import Head from 'next/head'
import Navigation from './Navigation'

interface PageLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  currentPage?: string
}

export default function PageLayout({ 
  children, 
  title, 
  description = "Matt's Personal Website",
  currentPage 
}: PageLayoutProps) {
  const fullTitle = `${title} - Matt's Personal Website`
  
  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-base">
        <Navigation currentPage={currentPage} />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {children}
          </div>
        </main>
      </div>
    </>
  )
}
