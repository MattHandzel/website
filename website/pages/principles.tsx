import { GetStaticProps } from 'next'
import PageLayout from '@/components/PageLayout'
import PrinciplesRenderer from '@/components/PrinciplesRenderer'
import { loadJsonDataSafe } from '@/lib/dataLoader'

interface PrinciplesProps {
  principles: any[]
}

export default function Principles({ principles }: PrinciplesProps) {
  return (
    <PageLayout 
      title="Principles" 
      description="My operating principles"
      currentPage="principles"
    >
      <h2 className="text-2xl font-bold text-text mb-6">Principles</h2>
      <PrinciplesRenderer principles={principles} />
    </PageLayout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const principles = await loadJsonDataSafe('principles.json')
  return {
    props: { principles }
  }
}
