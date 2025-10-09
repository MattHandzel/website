import { GetStaticProps } from 'next'
import PageLayout from '@/components/PageLayout'
import ProjectsRenderer from '@/components/ProjectsRenderer'
import { loadJsonDataSafe } from '@/lib/dataLoader'

interface ProjectsProps {
  projects: any[]
}

export default function Projects({ projects }: ProjectsProps) {
  return (
    <PageLayout 
      title="Active Projects" 
      description="Current projects I'm working on"
      currentPage="projects"
    >
      <h2 className="text-2xl font-bold text-text mb-6">Active Projects</h2>
      <ProjectsRenderer projects={projects} />
    </PageLayout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const projects = await loadJsonDataSafe('projects.json')
  return {
    props: { projects }
  }
}
