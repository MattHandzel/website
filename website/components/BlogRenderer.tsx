import React, { useMemo } from 'react'

interface BlogPost {
  id: string
  title: string
  content: string
  type: string
  created_date: string
  last_edited_date: string
  metadata: string
}

interface BlogRendererProps {
  blog: BlogPost[]
}

export default function BlogRenderer({ blog }: BlogRendererProps) {
  const sortedPosts = useMemo(() => {
    return [...blog].sort((a, b) => 
      new Date(b.last_edited_date).getTime() - new Date(a.last_edited_date).getTime()
    )
  }, [blog])

  const blogStats = useMemo(() => {
    const totalPosts = blog.length
    const drafts = blog.filter(post => {
      try {
        const metadata = JSON.parse(post.metadata)
        return metadata.status === 'draft'
      } catch {
        return false
      }
    }).length
    const published = totalPosts - drafts
    
    return { totalPosts, drafts, published }
  }, [blog])

  const formatMarkdown = (text: string) => {
    return text
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-gray-900 mb-4">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold text-gray-800 mb-3 mt-6">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-medium text-gray-700 mb-2 mt-4">$1</h3>')
      .replace(/^\- (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^(?!<[h|l])/gm, '<p class="mb-4">')
      .replace(/<p class="mb-4">(<[h|l])/g, '$1')
  }

  const getMetadata = (post: BlogPost) => {
    try {
      return JSON.parse(post.metadata)
    } catch {
      return {}
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Blog Overview</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{blogStats.totalPosts}</div>
            <div className="text-sm text-gray-500">Total Posts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{blogStats.published}</div>
            <div className="text-sm text-gray-500">Published</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{blogStats.drafts}</div>
            <div className="text-sm text-gray-500">Drafts</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sortedPosts.map((post) => {
          const metadata = getMetadata(post)
          return (
            <article key={post.id} className="bg-white shadow rounded-lg p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{post.title}</h2>
                  <div className="flex items-center space-x-2">
                    {metadata.status && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        metadata.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {metadata.status}
                      </span>
                    )}
                    {metadata.reading_time_minutes && (
                      <span className="text-sm text-gray-500">
                        {metadata.reading_time_minutes} min read
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  {metadata.author && (
                    <span>By {metadata.author}</span>
                  )}
                  <span>
                    {new Date(post.last_edited_date).toLocaleDateString()}
                  </span>
                  {metadata.revision_history && metadata.revision_history.length > 0 && (
                    <span>{metadata.revision_history.length} revisions</span>
                  )}
                </div>
                
                {metadata.excerpt && (
                  <p className="text-gray-600 mt-2 italic">{metadata.excerpt}</p>
                )}
              </div>
              
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: formatMarkdown(post.content) 
                }}
              />
              
              {metadata.revision_history && metadata.revision_history.length > 0 && (
                <details className="mt-6 border-t pt-4">
                  <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                    Revision History ({metadata.revision_history.length})
                  </summary>
                  <div className="mt-2 space-y-1">
                    {metadata.revision_history.map((revision: any, index: number) => (
                      <div key={index} className="text-xs text-gray-500 flex justify-between">
                        <span>{revision.description}</span>
                        <span>{revision.date}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </article>
          )
        })}
      </div>
      
      {blog.length === 0 && (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No blog posts found. Add some markdown files to the blog directory to get started!</p>
        </div>
      )}
    </div>
  )
}
