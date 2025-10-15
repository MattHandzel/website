import React, { useMemo } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import Image from 'next/image'

interface Project {
  id: string
  title: string
  description: string
  tags: string[]
  content: string
  public: boolean
  created_date: string
  last_edited_date: string
  status?: string
  links?: string[]
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

interface Section {
  heading: string
  content: string
}

// Helper function to parse markdown into sections and filter out empty ones
function parseSections(markdown: string): Section[] {
  const lines = markdown.split('\n')
  const sections: Section[] = []
  let currentHeading = ''
  let currentContent: string[] = []

  for (const line of lines) {
    // Check if line is a heading (## or ###)
    const headingMatch = line.match(/^(#{2,3})\s+(.+)$/)
    
    if (headingMatch) {
      // Save previous section if it has content
      if (currentHeading && currentContent.some(l => l.trim())) {
        sections.push({
          heading: currentHeading,
          content: currentContent.join('\n').trim()
        })
      }
      // Start new section
      currentHeading = headingMatch[2]
      currentContent = []
    } else if (currentHeading) {
      // Add line to current section
      currentContent.push(line)
    }
  }

  // Add last section if it has content
  if (currentHeading && currentContent.some(l => l.trim())) {
    sections.push({
      heading: currentHeading,
      content: currentContent.join('\n').trim()
    })
  }

  return sections
}

function getStatusColor(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'paused':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'completed':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'planned':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    case 'archived':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    default:
      return 'bg-accent/20 text-accent border-accent/30'
  }
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
          <div className="card p-6 text-center text-muted">
            No active projects found
          </div>
        ) : (
          sortedProjects.map(project => {
            const sections = parseSections(project.content)
            
            return (
            <div key={project.id} className="card transition-all hover:scale-[1.01]">
              <div 
                className="p-6 cursor-pointer"
                onClick={() => toggleProject(project.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {project.status && (
                        <span className={`px-2 py-1 text-xs rounded-full border font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      )}
                      <h3 className="text-xl font-semibold text-text">
                        {project.title}
                      </h3>
                      {project.links && project.links.length > 0 && (
                        <div className="flex items-center gap-2">
                          {project.links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-accent hover:text-accent-2 transition-colors"
                              title={link}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {project.description && (
                      <p className="text-muted mb-3">
                        {project.description}
                      </p>
                    )}
                    
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.tags.map((tag, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full border border-accent/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                  </div>
                  
                  <button 
                    className="ml-4 text-accent hover:text-accent-2 transition-colors"
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
              
              {expandedProject === project.id && sections.length > 0 && (
                <div className="px-6 pb-6 border-t border-white/10 pt-4">
                  <div className="space-y-6">
                    {sections.map((section, idx) => (
                      <div key={idx} className="">
                        <h3 className="text-lg font-display font-semibold text-accent mb-3">
                          {section.heading}
                        </h3>
                        <div className="prose prose-sm max-w-none prose-invert">
                          <ReactMarkdown
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-xl font-display font-bold text-text mb-2 mt-3" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-lg font-display font-semibold text-text mb-2 mt-3" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-base font-medium text-text mb-2 mt-2" {...props} />,
                              h4: ({node, ...props}) => <h4 className="text-sm font-medium text-text mb-1 mt-2" {...props} />,
                              p: ({node, ...props}) => <p className="text-muted mb-3 leading-relaxed" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 text-muted space-y-1" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 text-muted space-y-1" {...props} />,
                              li: ({node, ...props}) => <li className="mb-1" {...props} />,
                              a: ({node, ...props}) => <a className="text-accent hover:text-accent-2 transition-colors underline" target="_blank" rel="noopener noreferrer" {...props} />,
                              img: ({node, ...props}) => {
                                const src = props.src || ''
                                const alt = props.alt || ''
                                return (
                                  <span className="block my-4">
                                    <img src={src} alt={alt} className="rounded-lg max-w-full h-auto" />
                                  </span>
                                )
                              },
                              code: ({node, inline, ...props}: any) => 
                                inline ? (
                                  <code className="bg-surface px-1 py-0.5 rounded text-sm text-accent-2 font-mono" {...props} />
                                ) : (
                                  <code className="block bg-surface p-3 rounded text-sm overflow-x-auto text-accent-2 font-mono" {...props} />
                                ),
                              blockquote: ({node, ...props}) => (
                                <blockquote className="border-l-4 border-accent pl-4 italic text-muted my-3" {...props} />
                              ),
                            }}
                          >
                            {section.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            )
          })
        )}
      </div>
    </div>
  )
}
