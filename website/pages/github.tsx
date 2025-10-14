import { GetStaticProps } from 'next'
import PageLayout from '@/components/PageLayout'
import GitHubHeatmap from '@/components/GitHubHeatmap'
import { loadJsonData } from '@/lib/dataLoader'

interface GitHubProps {
  githubData: any
}

export default function GitHub({ githubData }: GitHubProps) {
  return (
    <PageLayout 
      title="GitHub" 
      description="GitHub activity and contribution tracking"
      currentPage="github"
    >
      <h2 className="text-2xl font-bold text-text mb-6">GitHub Activity</h2>
      <GitHubHeatmap githubData={githubData} />
    </PageLayout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const githubData = await loadJsonData('github.json', { 
    heatmap_data: [], 
    total_commits: 0, 
    repositories: [], 
    repository_count: 0,
    last_updated: '' 
  })
  return {
    props: { githubData }
  }
}
