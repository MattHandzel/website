import React, { useState } from 'react';
import ExpandableText from './ExpandableText';
import ReactMarkdown from 'react-markdown'
import StarsDisplay from './StarsDisplay'
import { getStatusColor } from '@/lib/utils'
import { LinkableItem } from './LinkableItem'
import { useHighlightFromHash } from '../lib/useHighlightFromHash'

interface Book {
  id: string
  title: string
  content: string
  public: boolean
  created_date: string
  last_edited_date: string
  metadata: {
    book_title?: string
    author?: string
    rating?: number
    status?: string
    tags?: string[]
    book_directory?: string
    has_public_notes?: boolean
    notes_count?: number
    note_type?: string
  }
}

interface BooksRendererProps {
  books: Book[]
  exportMetadata?: {
    last_updated: string
  }
}

export default function BooksRenderer({ books, exportMetadata }: BooksRendererProps) {
  // Enable hash-based highlighting for deep links
  const currentHashId = useHighlightFromHash()
  
  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set())

  const bookGroups = books.reduce((groups: Record<string, Book[]>, book) => {
    const bookDir = book.metadata.book_directory || 'unknown'
    if (!groups[bookDir]) {
      groups[bookDir] = []
    }
    groups[bookDir].push(book)
    return groups
  }, {})

  const toggleBook = (bookDir: string) => {
    setExpandedBooks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(bookDir)) {
        newSet.delete(bookDir)
      } else {
        newSet.add(bookDir)
      }
      return newSet
    })
  }
  
  // Auto-expand book when linked via hash
  React.useEffect(() => {
    const handleLinkableTarget = (e: CustomEvent) => {
      const targetId = e.detail.id
      // Check if the target is a book (format: book-{directory})
      if (targetId && targetId.startsWith('book-')) {
        const bookDir = targetId.replace('book-', '')
        setExpandedBooks(prev => new Set(prev).add(bookDir))
      }
    }
    
    window.addEventListener('linkableItemTargeted', handleLinkableTarget as EventListener)
    
    return () => {
      window.removeEventListener('linkableItemTargeted', handleLinkableTarget as EventListener)
    }
  }, [])
  
  // Check hash on mount for initial expansion
  React.useEffect(() => {
    if (currentHashId && currentHashId.startsWith('book-')) {
      const bookDir = currentHashId.replace('book-', '')
      setExpandedBooks(prev => new Set(prev).add(bookDir))
    }
  }, [currentHashId])

  return (
    <div className="space-y-3">
      {exportMetadata && (
        <div className="text-xs text-subtext0 mb-4">
          Last updated: {new Date(exportMetadata.last_updated).toLocaleDateString()}
        </div>
      )}
      
      {Object.entries(bookGroups).map(([bookDir, bookEntries]) => {
        const mainBook = bookEntries.find(book => book.id.startsWith('book-')) || bookEntries[0]
        const notes = bookEntries.filter(book => !book.id.startsWith('book-'))
        const publicNotes = notes.filter(note => note.public)
        const isExpanded = expandedBooks.has(bookDir)
        
        return (
          <LinkableItem key={bookDir} id={`book-${bookDir}`}>
          <div className="card overflow-hidden">
            {/* Collapsed view - clickable header */}
            <button
              onClick={() => toggleBook(bookDir)}
              className="w-full p-4 text-left hover:bg-surface0 transition-colors duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text">
                    {mainBook.metadata.book_title || mainBook.title}
                  </h3>
                  {mainBook.metadata.author && (
                    <p className="text-sm text-subtext1 mt-1">
                      by {mainBook.metadata.author}
                    </p>
                  )}
                  {!isExpanded && (
                    <p className="text-xs text-subtext0 mt-2">
                      {notes.length} note{notes.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-3 ml-4">
                  <StarsDisplay rating={mainBook.metadata.rating} />
                  {mainBook.metadata.status && (
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(mainBook.metadata.status)}`}>
                      {mainBook.metadata.status}
                    </span>
                  )}
                  <svg
                    className={`w-5 h-5 text-subtext1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Expanded view - details */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-surface0">
                <div className="pt-4">
                  <div className="mb-4">
                    <p className="text-sm text-subtext1">
                      {notes.length} note{notes.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  {publicNotes.length > 0 && (
                    <div className="space-y-4">
                      {publicNotes.map(note => (
                        <div key={note.id} className="border-l-2 border-primary pl-4">
                          <div className="text-sm text-subtext1 prose prose-sm max-w-none prose-headings:text-text prose-strong:text-text prose-code:text-mauve prose-code:bg-surface0 prose-code:px-1 prose-code:rounded prose-blockquote:border-l-primary prose-blockquote:text-subtext1">
                            <ExpandableText text={note.content} maxLength={300} />
                          </div>
                          <p className="text-xs text-subtext0 mt-2">
                            Last updated: {new Date(note.last_edited_date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {publicNotes.length === 0 && notes.length > 0 && (
                    <div className="text-sm text-subtext1 italic">
                      This book has notes, but they are marked as private.
                    </div>
                  )}
                  
                  {mainBook.metadata.tags && mainBook.metadata.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {mainBook.metadata.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 text-xs bg-surface1 text-subtext1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          </LinkableItem>
        )
      })}
      
      {Object.keys(bookGroups).length === 0 && (
        <div className="card p-6 text-center">
          <p className="text-subtext1">No books found. Add some book notes to see them here!</p>
        </div>
      )}
    </div>
  )
}
