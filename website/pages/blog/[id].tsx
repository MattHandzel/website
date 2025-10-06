import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { promises as fs } from 'fs'
import path from 'path'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import React from 'react'

interface BlogPost {
  id: string
  title: string
  content: string
  type: string
  created_date: string
  last_edited_date: string
  metadata: string
}

interface BlogPostPageProps {
  post: BlogPost
}

export default function BlogPostPage({ post }: BlogPostPageProps) {
  const metadata = React.useMemo(() => {
    try {
      return JSON.parse(post.metadata)
    } catch {
      return {}
    }
  }, [post.metadata])

  const formatMarkdown = (text: string) => {
    return text
      .replace(/^# (.+)$/gm, '<h1 class="text-4xl font-bold text-gray-900 mb-6">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-3xl font-semibold text-gray-800 mb-4 mt-8">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-2xl font-medium text-gray-700 mb-3 mt-6">$1</h3>')
      .replace(/^\- (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^(?!<[h|l])/gm, '<p class="mb-4">')
      .replace(/<p class="mb-4">(<[h|l])/g, '$1')
  }

  const seoTitle = metadata.seo_title || post.title
  const seoDescription = metadata.seo_description || metadata.excerpt || post.content.substring(0, 150)

  return (
    <>
      <Head>
        <title>{seoTitle} - Matt's Personal Website</title>
        <meta name="description" content={seoDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        {metadata.featured_image && (
          <meta property="og:image" content={metadata.featured_image} />
        )}
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        {metadata.featured_image && (
          <meta name="twitter:image" content={metadata.featured_image} />
        )}
      </Head>

      <div className="min-h-screen bg-base">
        <Navigation currentPage="blog" />

        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Back to Blog Link */}
            <Link 
              href="/blog"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>

            {/* Blog Post Article */}
            <article className="bg-white shadow rounded-lg p-8">
              {/* Header */}
              <header className="mb-8 border-b pb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {post.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {metadata.author && (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {metadata.author}
                    </span>
                  )}
                  
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {new Date(post.last_edited_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  
                  {metadata.reading_time_minutes && (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {metadata.reading_time_minutes} min read
                    </span>
                  )}
                  
                  {metadata.status && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      metadata.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {metadata.status}
                    </span>
                  )}
                </div>

                {metadata.excerpt && (
                  <p className="text-lg text-gray-600 mt-4 italic">
                    {metadata.excerpt}
                  </p>
                )}
              </header>

              {/* Content */}
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: formatMarkdown(post.content) 
                }}
              />

              {/* Tags */}
              {metadata.tags && metadata.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <div className="flex flex-wrap gap-2">
                    {metadata.tags.map((tag: string, index: number) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Revision History */}
              {metadata.revision_history && metadata.revision_history.length > 0 && (
                <details className="mt-8 pt-6 border-t">
                  <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                    Revision History ({metadata.revision_history.length} revisions)
                  </summary>
                  <div className="mt-4 space-y-2">
                    {metadata.revision_history.map((revision: any, index: number) => (
                      <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">{revision.description}</span>
                        <span className="text-xs text-gray-500 ml-4">{revision.date}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </article>
          </div>
        </main>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    const blogData = await fs.readFile(path.join(dataDir, 'blog.json'), 'utf8').catch(() => '[]')
    const blog: BlogPost[] = JSON.parse(blogData)

    const paths = blog.map((post) => ({
      params: { id: post.id }
    }))

    return {
      paths,
      fallback: false
    }
  } catch (error) {
    console.error('Error generating blog post paths:', error)
    return {
      paths: [],
      fallback: false
    }
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    const blogData = await fs.readFile(path.join(dataDir, 'blog.json'), 'utf8').catch(() => '[]')
    const blog: BlogPost[] = JSON.parse(blogData)

    const post = blog.find((p) => p.id === params?.id)

    if (!post) {
      return {
        notFound: true
      }
    }

    return {
      props: {
        post
      }
    }
  } catch (error) {
    console.error('Error reading blog post:', error)
    return {
      notFound: true
    }
  }
}
