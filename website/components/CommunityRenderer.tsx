import React, { useMemo } from 'react'

interface Community {
  id: string
  community_name: string
  description: string
  personal_affiliation: number | null
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedCommunities.map((community) => (
          <div key={community.id} className="card p-4">
            <h3 className="font-semibold text-text mb-2">{community.community_name}</h3>
            <p className="text-sm text-subtext1 mb-3">{community.description}</p>
            
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
