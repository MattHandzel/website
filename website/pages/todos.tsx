import { GetStaticProps } from 'next'
import PageLayout from '@/components/PageLayout'
import TodosRenderer from '@/components/TodosRenderer'
import { loadJsonDataSafe } from '@/lib/dataLoader'

export interface Task {
  id: number;
  uuid: string;
  description: string;
  status: string;
  entry: string;
  modified: string;
  due?: string;
  end?: string;
  priority: string;
  project: string;
  tags: string[];
  urgency: number;
  utility?: number;
  effort?: number;
  next_action?: string;
  created_date?: string;
  completed_date?: string;
  due_date?: string;
  lead_time_days?: number;
}

interface TodosProps {
  tasks: Task[]
}

export default function Todos({ tasks }: TodosProps) {
  return (
    <PageLayout 
      title="To-Dos" 
      description="Task management and productivity analytics from TaskWarrior"
      currentPage="todos"
    >
      <h2 className="text-2xl font-bold text-text mb-2">To-Do List & Productivity Analytics</h2>
      <p className="text-muted mb-6">
        Visualizing my task management data from TaskWarrior
      </p>
      <TodosRenderer tasks={tasks} />
    </PageLayout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const tasks = await loadJsonDataSafe('tasks.json')
  return {
    props: { tasks }
  }
}
