import React, { useMemo } from 'react'

interface Community {
  id: string
  community_name: string
  description: string
  personal_affiliation: number | null
  created_date: string
  metadata: string
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

  const affiliationStats = useMemo(() => {
    const rated = communities.filter(c => c.personal_affiliation !== null)
    const avgAffiliation = rated.length > 0 
      ? rated.reduce((sum, c) => sum + c.personal_affiliation!, 0) / rated.length 
      : 0
    
    return {
      total: communities.length,
      rated: rated.length,
      unrated: communities.length - rated.length,
      avgAffiliation
    }
  }, [communities])

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{affiliationStats.total}</div>
            <div className="text-sm text-gray-500">Total Communities</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{affiliationStats.rated}</div>
            <div className="text-sm text-gray-500">Rated</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">{affiliationStats.unrated}</div>
            <div className="text-sm text-gray-500">Unrated</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{affiliationStats.avgAffiliation.toFixed(1)}</div>
            <div className="text-sm text-gray-500">Avg Affiliation</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedCommunities.map((community) => (
          <div key={community.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-2">{community.community_name}</h3>
            <p className="text-sm text-gray-600 mb-3">{community.description}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Personal Affiliation</span>
                <span className="font-medium">
                  {community.personal_affiliation !== null 
                    ? `${community.personal_affiliation}/10` 
                    : 'Not rated'}
                </span>
              </div>
              {community.personal_affiliation !== null && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(community.personal_affiliation / 10) * 100}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
