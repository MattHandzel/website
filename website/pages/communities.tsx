import { GetStaticProps } from 'next'
import PageLayout from '@/components/PageLayout'
import CommunityRenderer from '@/components/CommunityRenderer'
import { loadJsonDataSafe } from '@/lib/dataLoader'

interface CommunitiesProps {
  communities: any[]
}

export default function Communities({ communities }: CommunitiesProps) {
  return (
    <PageLayout 
      title="Communities" 
      description="Communities and social connections"
      currentPage="communities"
    >
      <h2 className="text-2xl font-bold text-text mb-6">Communities</h2>
      <CommunityRenderer communities={communities} />
    </PageLayout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const communities = await loadJsonDataSafe('communities.json')
  return {
    props: { communities }
  }
}
