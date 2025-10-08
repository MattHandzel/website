import { GetStaticProps } from 'next'
import PageLayout from '@/components/PageLayout'
import IdeasRenderer from '@/components/IdeasRenderer'
import { loadJsonDataSafe } from '@/lib/dataLoader'

interface Idea {
  id: number;
  title: string;
  description: string;
}

interface ProjectIdeasProps {
  ideas: Idea[]
}

export default function ProjectIdeas({ ideas }: ProjectIdeasProps) {
  return (
    <PageLayout 
      title="Project Ideas" 
      description="My project ideas and future work"
      currentPage="project-ideas"
    >
      <h2 className="text-2xl font-bold text-text mb-2">Project Ideas</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        A collection of project ideas and things I'd like to build in the future
      </p>
      <IdeasRenderer ideas={ideas} />
    </PageLayout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const ideas = await loadJsonDataSafe('ideas.json')
  return {
    props: { ideas }
  }
}
