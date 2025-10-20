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
        <script
            src="https://app.rybbit.io/api/script.js"
            data-site-id="d00441233611"
            defer
        ></script>
      </Head>

      <div className="min-h-screen bg-bg">
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
