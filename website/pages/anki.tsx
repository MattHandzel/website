import { GetStaticProps } from 'next'
import PageLayout from '@/components/PageLayout'
import AnkiRenderer from '@/components/AnkiRenderer'
import { loadJsonDataSafe } from '@/lib/dataLoader'

interface AnkiProps {
  anki: any[]
}

export default function Anki({ anki }: AnkiProps) {
  return (
    <PageLayout 
      title="Anki" 
      description="Anki learning and spaced repetition data"
      currentPage="anki"
    >
      <h2 className="text-2xl font-bold text-text mb-6">Anki Learning</h2>
      <AnkiRenderer anki={anki} />
    </PageLayout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const anki = await loadJsonDataSafe('anki.json')
  return {
    props: { anki }
  }
}
