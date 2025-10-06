import { GetStaticProps } from 'next'
import Head from 'next/head'
import { promises as fs } from 'fs'
import path from 'path'
import Navigation from '@/components/Navigation'
import BlogRenderer from '@/components/BlogRenderer'

interface BlogProps {
  blog: any[]
}

export default function Blog({ blog }: BlogProps) {
  return (
    <>
      <Head>
        <title>Blog - Matt's Personal Website</title>
        <meta name="description" content="Blog posts and articles" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-base">
        <Navigation currentPage="blog" />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div>
              <h2 className="text-2xl font-bold text-text mb-6">Blog</h2>
              <BlogRenderer blog={blog} />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    const blogData = await fs.readFile(path.join(dataDir, 'blog.json'), 'utf8').catch(() => '[]')
    const blog = JSON.parse(blogData)

    return {
      props: {
        blog
      }
    }
  } catch (error) {
    console.error('Error reading blog data:', error)
    return {
      props: {
        blog: []
      }
    }
  }
}
