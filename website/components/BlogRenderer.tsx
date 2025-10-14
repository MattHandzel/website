import React, { useMemo } from 'react'
import Link from 'next/link'

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
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-display font-bold text-accent mb-4">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-display font-semibold text-text mb-3 mt-6">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-medium text-text mb-2 mt-4">$1</h3>')
      .replace(/^\- (.+)$/gm, '<li class="ml-4 text-muted">$1</li>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-accent-2">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic text-muted">$1</em>')
      .replace(/\n\n/g, '</p><p class="mb-4 text-muted">')
      .replace(/^(?!<[h|l])/gm, '<p class="mb-4 text-muted">')
      .replace(/<p class="mb-4 text-muted">(<[h|l])/g, '$1')
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

      <div className="space-y-6">
        {sortedPosts.map((post) => {
          const metadata = getMetadata(post)
          const excerpt = metadata.excerpt || post.content.substring(0, 200) + '...'
          
          return (
            <article key={post.id} className="card p-6 transition-all hover:scale-[1.01]">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <Link href={`/blog/${post.id}`}>
                    <h2 className="text-2xl font-display font-bold text-text hover:text-accent cursor-pointer transition-colors">
                      {post.title}
                    </h2>
                  </Link>
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
                      <span className="text-sm text-muted">
                        {metadata.reading_time_minutes} min read
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-muted space-x-4">
                  {metadata.author && (
                    <span>By {metadata.author}</span>
                  )}
                  <span>
                    {new Date(post.last_edited_date).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-muted mt-3 line-clamp-3">
                  {excerpt}
                </p>
              </div>
              
              <Link 
                href={`/blog/${post.id}`}
                className="inline-flex items-center text-accent hover:text-accent-2 font-medium"
              >
                Read More
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </article>
          )
        })}
      </div>
      
      {blog.length === 0 && (
        <div className="card p-6 text-center">
          <p className="text-muted">No blogs yet, they are brewing 🍲</p>
        </div>
      )}
    </div>
  )
}
