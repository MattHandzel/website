import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'

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
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())

  const toggleNoteExpansion = (noteId: string) => {
    const newExpanded = new Set(expandedNotes)
    if (newExpanded.has(noteId)) {
      newExpanded.delete(noteId)
    } else {
      newExpanded.add(noteId)
    }
    setExpandedNotes(newExpanded)
  }

  const getPreviewContent = (content: string, maxLines: number = 3) => {
    const lines = content.split('\n')
    if (lines.length <= maxLines) {
      return content
    }
    return lines.slice(0, maxLines).join('\n')
  }

  const shouldShowPreview = (content: string) => {
    return content.split('\n').length > 3 || content.length > 300
  }
  const bookGroups = books.reduce((groups: Record<string, Book[]>, book) => {
    const bookDir = book.metadata.book_directory || 'unknown'
    if (!groups[bookDir]) {
      groups[bookDir] = []
    }
    groups[bookDir].push(book)
    return groups
  }, {})

  const renderStars = (rating?: number) => {
    if (!rating) return null
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`text-sm ${star <= rating ? 'text-yellow' : 'text-surface2'}`}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green/20 text-green'
      case 'reading': return 'bg-blue/20 text-blue'
      case 'to-read': return 'bg-yellow/20 text-yellow'
      default: return 'bg-surface1 text-subtext1'
    }
  }

  return (
    <div className="space-y-6">
      {exportMetadata && (
        <div className="text-xs text-subtext0 mb-4">
          Last updated: {new Date(exportMetadata.last_updated).toLocaleDateString()}
        </div>
      )}
      
      {Object.entries(bookGroups).map(([bookDir, bookEntries]) => {
        const mainBook = bookEntries.find(book => book.id.startsWith('book-')) || bookEntries[0]
        const notes = bookEntries.filter(book => !book.id.startsWith('book-'))
        const publicNotes = notes.filter(note => note.public)
        
        return (
          <div key={bookDir} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-text">
                  {mainBook.metadata.book_title || mainBook.title}
                </h3>
                {mainBook.metadata.author && (
                  <p className="text-sm text-subtext1 mt-1">
                    by {mainBook.metadata.author}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {mainBook.metadata.rating && renderStars(mainBook.metadata.rating)}
                {mainBook.metadata.status && (
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(mainBook.metadata.status)}`}>
                    {mainBook.metadata.status}
                  </span>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-subtext1">
                {notes.length} note{notes.length !== 1 ? 's' : ''} 
                {publicNotes.length > 0 && (
                  <span> • {publicNotes.length} public</span>
                )}
              </p>
            </div>
            
            {publicNotes.length > 0 && (
              <div className="space-y-4">
                {publicNotes.map(note => {
                  const isExpanded = expandedNotes.has(note.id)
                  const showPreviewOption = shouldShowPreview(note.content)
                  const contentToShow = isExpanded || !showPreviewOption 
                    ? note.content 
                    : getPreviewContent(note.content)
                  
                  return (
                    <div key={note.id} className="border-l-2 border-blue pl-4">
                      <div className="text-sm text-subtext1 prose prose-sm max-w-none prose-headings:text-text prose-strong:text-text prose-code:text-mauve prose-code:bg-surface0 prose-code:px-1 prose-code:rounded prose-blockquote:border-l-blue prose-blockquote:text-subtext1">
                        <ReactMarkdown>{contentToShow}</ReactMarkdown>
                      </div>
                      {showPreviewOption && (
                        <button
                          onClick={() => toggleNoteExpansion(note.id)}
                          className="mt-2 text-xs text-blue hover:text-blue/80 underline cursor-pointer"
                        >
                          {isExpanded ? 'Show less' : 'Read more'}
                        </button>
                      )}
                      <p className="text-xs text-subtext0 mt-2">
                        Last updated: {new Date(note.last_edited_date).toLocaleDateString()}
                      </p>
                    </div>
                  )
                })}
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
