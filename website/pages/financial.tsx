import { GetStaticProps } from 'next'
import PageLayout from '@/components/PageLayout'
import FinancialDashboard from '@/components/FinancialDashboard'
import { loadJsonDataSafe } from '@/lib/dataLoader'

interface FinancialProps {
  financial: any[]
}

export default function Financial({ financial }: FinancialProps) {
  return (
    <PageLayout 
      title="Financial" 
      description="Financial dashboard and budget tracking"
      currentPage="financial"
    >
      <h2 className="text-2xl font-bold text-text mb-6">Financial Dashboard</h2>
      <FinancialDashboard financial={financial} />
    </PageLayout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const financial = await loadJsonDataSafe('financial.json')
  return {
    props: { financial }
  }
}
