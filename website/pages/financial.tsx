import { GetStaticProps } from 'next'
import Head from 'next/head'
import { promises as fs } from 'fs'
import path from 'path'
import Navigation from '@/components/Navigation'
import FinancialDashboard from '@/components/FinancialDashboard'

interface FinancialProps {
  financial: any[]
}

export default function Financial({ financial }: FinancialProps) {
  return (
    <>
      <Head>
        <title>Financial - Matt's Personal Website</title>
        <meta name="description" content="Financial dashboard and budget tracking" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-base">
        <Navigation currentPage="financial" />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div>
              <h2 className="text-2xl font-bold text-text mb-6">Financial Dashboard</h2>
              <FinancialDashboard financial={financial} />
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
    const financialData = await fs.readFile(path.join(dataDir, 'financial.json'), 'utf8')
    const financial = JSON.parse(financialData)

    return {
      props: {
        financial
      }
    }
  } catch (error) {
    console.error('Error reading financial data:', error)
    return {
      props: {
        financial: []
      }
    }
  }
}
