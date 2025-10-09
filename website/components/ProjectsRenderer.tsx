import React, { useMemo } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

interface Project {
  id: string
  title: string
  description: string
  tags: string[]
  content: string
  public: boolean
  created_date: string
  last_edited_date: string
  metadata: {
    file_path: string
    folder_name: string
    file_name: string
    aliases: string[]
  }
}

interface ProjectsRendererProps {
  projects: Project[]
}

export default function ProjectsRenderer({ projects }: ProjectsRendererProps) {
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => 
      a.title.localeCompare(b.title)
    )
  }, [projects])

  const [expandedProject, setExpandedProject] = React.useState<string | null>(null)

  const toggleProject = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId)
  }

  return (
    <div className="space-y-6">
      {/* Projects List */}
      <div className="space-y-4">
        {sortedProjects.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
            No active projects found
          </div>
        ) : (
          sortedProjects.map(project => (
            <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div 
                className="p-6 cursor-pointer"
                onClick={() => toggleProject(project.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {project.title}
                    </h3>
                    
                    {project.description && (
                      <p className="text-gray-600 mb-3">
                        {project.description}
                      </p>
                    )}
                    
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.tags.map((tag, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>Created: {new Date(project.created_date).toLocaleDateString()}</span>
                      <span>Updated: {new Date(project.last_edited_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <button 
                    className="ml-4 text-primary hover:text-primary-dark transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleProject(project.id)
                    }}
                  >
                    <svg 
                      className={`w-6 h-6 transform transition-transform ${expandedProject === project.id ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {expandedProject === project.id && (
                <div className="px-6 pb-6 border-t border-gray-200 pt-4">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-gray-900 mb-3 mt-4" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-gray-800 mb-2 mt-3" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-medium text-gray-700 mb-2 mt-2" {...props} />,
                        h4: ({node, ...props}) => <h4 className="text-base font-medium text-gray-700 mb-1 mt-2" {...props} />,
                        p: ({node, ...props}) => <p className="text-gray-600 mb-3" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 text-gray-600" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 text-gray-600" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1" {...props} />,
                        a: ({node, ...props}) => <a className="text-primary hover:underline" {...props} />,
                        code: ({node, inline, ...props}: any) => 
                          inline ? (
                            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props} />
                          ) : (
                            <code className="block bg-gray-100 p-3 rounded text-sm overflow-x-auto" {...props} />
                          ),
                        blockquote: ({node, ...props}) => (
                          <blockquote className="border-l-4 border-primary pl-4 italic text-gray-600 my-3" {...props} />
                        ),
                      }}
                    >
                      {project.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
