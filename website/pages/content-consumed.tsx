import { GetStaticProps } from 'next'
import Head from 'next/head'
import { promises as fs } from 'fs'
import path from 'path'
import Navigation from '@/components/Navigation'
import BooksRenderer from '@/components/BooksRenderer'

interface ContentConsumedProps {
  books: any[]
  exportMetadata: any
}

export default function ContentConsumed({ books, exportMetadata }: ContentConsumedProps) {
  return (
    <>
      <Head>
        <title>Content Consumed - Matt's Personal Website</title>
        <meta name="description" content="Books and content consumed tracking" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-bg">
        <Navigation currentPage="content-consumed" />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div>
              <h2 className="text-2xl font-bold text-text mb-6">Content Consumed</h2>
              <BooksRenderer books={books} exportMetadata={exportMetadata} />
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
    
    const [booksData, exportMetadata] = await Promise.all([
      fs.readFile(path.join(dataDir, 'books.json'), 'utf8').catch(() => '[]'),
      fs.readFile(path.join(dataDir, 'export_metadata.json'), 'utf8').catch(() => '{"last_updated":""}')
    ])

    const books = JSON.parse(booksData)
    const exportMetadataParsed = JSON.parse(exportMetadata)

    const booksWithParsedMetadata = books.map((book: any) => ({
      ...book,
      metadata: typeof book.metadata === 'string' ? JSON.parse(book.metadata) : book.metadata
    }))

    return {
      props: {
        books: booksWithParsedMetadata,
        exportMetadata: exportMetadataParsed
      }
    }
  } catch (error) {
    console.error('Error reading content consumed data:', error)
    return {
      props: {
        books: [],
        exportMetadata: { last_updated: '' }
      }
    }
  }
}
