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
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-gray-900 mb-4">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold text-gray-800 mb-3 mt-6">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-medium text-gray-700 mb-2 mt-4">$1</h3>')
      .replace(/^\- (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      // Markdown links: [text](url) => <a href="url">text</a>
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline hover:text-blue-800">$1</a>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^(?!<[h|l])/gm, '<p class="mb-4">')
      .replace(/<p class="mb-4">(<[h|l])/g, '$1')
  }

  return (
    <>
      {showTitle && (
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date(content.last_edited_date).toLocaleDateString()}
          </p>
        </div>
      )}
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ 
          __html: formatMarkdown(content.content) 
        }}
      />
    </>
  )
}
