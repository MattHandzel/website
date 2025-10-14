interface ContentRendererProps {
  content: {
    id: string
    title: string
    content: string
    type: string
    created_date: string
    last_edited_date: string
  }
  showTitle?: boolean
}

export default function ContentRenderer({ content, showTitle = true }: ContentRendererProps) {
  const formatMarkdown = (text: string) => {
    return text
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-display font-bold text-accent mb-4">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-display font-semibold text-text mb-3 mt-6">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-medium text-text mb-2 mt-4">$1</h3>')
      .replace(/^\- (.+)$/gm, '<li class="ml-4 text-muted">$1</li>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-accent-2">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic text-muted">$1</em>')
      // Markdown links: [text](url) => <a href="url">text</a>
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-accent underline hover:text-accent-2 transition-colors">$1</a>')
      .replace(/\n\n/g, '</p><p class="mb-4 text-muted">')
      .replace(/^(?!<[h|l])/gm, '<p class="mb-4 text-muted">')
      .replace(/<p class="mb-4 text-muted">(<[h|l])/g, '$1')
  }

  return (
    <>
      {showTitle && (
        <div className="mb-6">
          <h1 className="text-4xl font-display font-bold text-accent mb-2">{content.title}</h1>
          <p className="text-sm text-muted mt-2">
            Last updated: {new Date(content.last_edited_date).toLocaleDateString()}
          </p>
        </div>
      )}
      <div 
        className="prose prose-lg max-w-none prose-invert"
        dangerouslySetInnerHTML={{ 
          __html: formatMarkdown(content.content) 
        }}
      />
    </>
  )
}
