import React, { useMemo } from 'react'

interface Community {
  id: string
  community_name: string
  description: string
  personal_affiliation: number | null
  what_ive_done?: string
  created_date: string
  metadata: string
  related_notes?: string
  blog_posts?: string
  media_links?: string
  website_sections?: string
  projects?: string
  events_attended?: string
  contribution_level?: string
}

interface CommunityRendererProps {
  communities: Community[]
}

export default function CommunityRenderer({ communities }: CommunityRendererProps) {
  const sortedCommunities = useMemo(() => {
    return [...communities].sort((a, b) => {
      if (a.personal_affiliation === null && b.personal_affiliation === null) {
        return a.community_name.localeCompare(b.community_name)
      }
      if (a.personal_affiliation === null) return 1
      if (b.personal_affiliation === null) return -1
      
      if (a.personal_affiliation !== b.personal_affiliation) {
        return b.personal_affiliation - a.personal_affiliation
      }
      return a.community_name.localeCompare(b.community_name)
    })
  }, [communities])

  const parseWhatIveDone = (whatIveDone: string) => {
    if (!whatIveDone) return []
    
    return whatIveDone.split(';').map(item => item.trim()).filter(item => item.length > 0)
  }

  const renderWhatIveDoneItem = (item: string, index: number) => {
    if (item.includes('[[') && item.includes(']]')) {
      const obsidianMatch = item.match(/\[\[([^\]]+)\]\]/)
      if (obsidianMatch) {
        const noteName = obsidianMatch[1]
        const beforeLink = item.substring(0, obsidianMatch.index)
        const afterLink = item.substring(obsidianMatch.index! + obsidianMatch[0].length)
        return (
          <span key={index} className="text-sm text-subtext1">
            {beforeLink}
            <span className="text-mauve font-medium">📝 {noteName}</span>
            {afterLink}
          </span>
        )
      }
    }
    
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    const parts = []
    let lastIndex = 0
    let match
    
    while ((match = markdownLinkRegex.exec(item)) !== null) {
      if (match.index > lastIndex) {
        parts.push(item.substring(lastIndex, match.index))
      }
      
      const linkText = match[1]
      const linkUrl = match[2]
      parts.push(
        <a 
          key={`${index}-${match.index}`}
          href={linkUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue hover:text-sky underline"
        >
          {linkText}
        </a>
      )
      
      lastIndex = match.index + match[0].length
    }
    
    if (lastIndex < item.length) {
      parts.push(item.substring(lastIndex))
    }
    
    if (parts.length === 0) {
      return <span key={index} className="text-sm text-subtext1">{item}</span>
    }
    
    return <span key={index} className="text-sm text-subtext1">{parts}</span>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedCommunities.map((community) => (
          <div key={community.id} className="card p-4">
            <h3 className="font-semibold text-text mb-3">{community.community_name}</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Personal Affiliation</span>
                <span className="font-medium">
                  {community.personal_affiliation !== null 
                    ? `${community.personal_affiliation}/10` 
                    : 'Not rated'}
                </span>
              </div>
              {community.personal_affiliation !== null && (
                <div className="w-full bg-surface1 rounded-full h-2">
                  <div 
                    className="bg-blue h-2 rounded-full" 
                    style={{ width: `${(community.personal_affiliation / 10) * 100}%` }}
                  ></div>
                </div>
              )}
              
              {community.what_ive_done && (
                <div className="pt-2 border-t border-surface1">
                  <h4 className="text-sm font-medium text-text mb-2">What I've Done</h4>
                  <div className="space-y-1">
                    {parseWhatIveDone(community.what_ive_done).map((item, idx) => (
                      <div key={idx} className="flex items-start">
                        <span className="text-blue mr-2 mt-1">•</span>
                        <div className="flex-1">
                          {renderWhatIveDoneItem(item, idx)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {community.contribution_level && (
                <div className="flex justify-between text-sm">
                  <span>Contribution Level</span>
                  <span className="text-green font-medium">{community.contribution_level}</span>
                </div>
              )}
              
              {(community.related_notes || community.blog_posts || community.media_links || community.website_sections || community.projects || community.events_attended) && (
                <div className="pt-2 border-t border-surface1">
                  <div className="flex flex-wrap gap-1">
                    {community.related_notes && JSON.parse(community.related_notes).map((note: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-mauve/20 text-mauve rounded">
                        📝 Note
                      </span>
                    ))}
                    {community.blog_posts && JSON.parse(community.blog_posts).map((post: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-blue/20 text-blue rounded">
                        📄 Blog
                      </span>
                    ))}
                    {community.media_links && JSON.parse(community.media_links).map((media: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-green/20 text-green rounded">
                        🎥 Media
                      </span>
                    ))}
                    {community.website_sections && JSON.parse(community.website_sections).map((section: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-yellow/20 text-yellow rounded">
                        🔗 Section
                      </span>
                    ))}
                    {community.projects && JSON.parse(community.projects).map((project: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-teal/20 text-teal rounded">
                        🚀 Project
                      </span>
                    ))}
                    {community.events_attended && JSON.parse(community.events_attended).map((event: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-pink/20 text-pink rounded">
                        🎪 Event
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
