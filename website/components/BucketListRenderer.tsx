import React, { useState, useMemo } from 'react';

export interface BucketListItem {
  description: string;
  status: string;
  motivation: string;
  type?: string;
  completed: string;
  completed_on: string;
  media: string[];
  tags: string[];
  time_frame: string;
  importance?: number; // Used internally for sorting, not displayed
}

interface BucketListRendererProps {
  items: BucketListItem[];
}



const TypeIcon = ({ type }: { type: string }) => {
  const iconClass = 'w-5 h-5 mr-2 text-text/60';
  if (type.toLowerCase() === 'achievement') {
    return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>; // Trophy/Achievement Icon
  }
  return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; // Experience/Person Icon
};

const getStatusBadge = (status: string) => {
    const baseClasses = "px-2.5 py-1 text-xs font-semibold rounded-full capitalize";
    switch (status.toLowerCase()) {
        case 'completed':
            return <span className={`${baseClasses} text-primary-dark bg-primary/20`}>{status}</span>;
        case 'in progress':
            return <span className={`${baseClasses} text-blue-800 bg-blue-100`}>{status}</span>;
        case 'planned':
            return <span className={`${baseClasses} text-yellow-800 bg-yellow-100`}>{status}</span>;
        case 'don\'t want it anymore':
            return <span className={`${baseClasses} text-red-800 bg-red-100`}>{status}</span>;
        case 'not yet':
        default:
            return <span className={`${baseClasses} text-gray-800 bg-gray-100`}>{status}</span>;
    }
};

const BucketListRenderer: React.FC<BucketListRendererProps> = ({ items }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string | null>(null);

  // Extract all unique timeframes from items
  const allTimeframes = useMemo(() => {
    const timeframeSet = new Set<string>();
    items.forEach(item => {
      if (item.time_frame) {
        timeframeSet.add(item.time_frame);
      }
    });
    // Sort in logical order
    const order = ['short-term', 'mid-term', 'long-term', 'lifetime'];
    return Array.from(timeframeSet).sort((a, b) => {
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [items]);

  // Extract all unique tags from items (excluding timeframe-related tags)
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    const timeframeValues = ['short-term', 'mid-term', 'long-term', 'lifetime'];
    items.forEach(item => {
      if (item.tags) {
        item.tags.forEach(tag => {
          if (!timeframeValues.includes(tag)) {
            tagSet.add(tag);
          }
        });
      }
    });
    return Array.from(tagSet).sort();
  }, [items]);

  // Filter items based on selected tags and timeframe
  const filteredItems = useMemo(() => {
    let filtered = items;
    
    // Apply timeframe filter
    if (selectedTimeframe) {
      filtered = filtered.filter(item => item.time_frame === selectedTimeframe);
    }
    
    // Apply tag filter (OR logic - any matching tag)
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item => 
        item.tags && selectedTags.some(tag => item.tags.includes(tag))
      );
    }
    
    return filtered;
  }, [items, selectedTags, selectedTimeframe]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const toggleTimeframe = (timeframe: string) => {
    setSelectedTimeframe(prev => prev === timeframe ? null : timeframe);
  };

  const clearAllFilters = () => {
    setSelectedTags([]);
    setSelectedTimeframe(null);
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="card p-6 space-y-6">
        {/* Timeframe Filter */}
        {allTimeframes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-text">Timeframe</h3>
              {selectedTimeframe && (
                <button
                  onClick={() => setSelectedTimeframe(null)}
                  className="text-sm text-secondary hover:text-secondary/80 underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allTimeframes.map(timeframe => (
                <button
                  key={timeframe}
                  onClick={() => toggleTimeframe(timeframe)}
                  className={`px-4 py-2 text-sm rounded-full border-2 transition-all font-medium ${
                    selectedTimeframe === timeframe
                      ? 'bg-primary text-white border-primary shadow-md scale-105'
                      : 'bg-white text-text border-border hover:border-primary hover:shadow-sm hover:scale-105'
                  }`}
                >
                  {timeframe}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-text">Tags</h3>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-sm text-secondary hover:text-secondary/80 underline"
                >
                  Clear ({selectedTags.length})
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 text-sm rounded-full border-2 transition-all font-medium ${
                    selectedTags.includes(tag)
                      ? 'bg-primary text-white border-primary shadow-md scale-105'
                      : 'bg-white text-text border-border hover:border-primary hover:shadow-sm hover:scale-105'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter Summary */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-sm text-subtext0">
            Showing <span className="font-semibold text-text">{filteredItems.length}</span> of <span className="font-semibold text-text">{items.length}</span> items
          </p>
          {(selectedTags.length > 0 || selectedTimeframe) && (
            <button
              onClick={clearAllFilters}
              className="text-sm px-3 py-1.5 bg-surface0 text-text rounded-lg hover:bg-surface1 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Bucket List Items */}
      {filteredItems.map((item, index) => (
        <div key={index} className="p-6 bg-white border border-border rounded-lg shadow-md transition-shadow hover:shadow-lg">
          <div className="flex justify-between items-center mb-3">
            {item.type && (
              <div className="flex items-center">
                <TypeIcon type={item.type} />
                <span className="text-sm font-medium text-text/60 capitalize">{item.type}</span>
              </div>
            )}
            {getStatusBadge(item.status)}
          </div>
          
          <h3 className="text-xl font-bold text-text mb-3">{item.description}</h3>
          
          {item.motivation && (
            <blockquote className="border-l-4 border-primary/50 pl-4 py-2 my-4 bg-background">
                <p className="text-text/80 italic">{item.motivation}</p>
            </blockquote>
          )}

          {item.completed === 'yes' && item.completed_on && (
            <p className="text-sm text-primary font-semibold">Completed on: {new Date(item.completed_on).toLocaleDateString()}</p>
          )}

          {/* Display Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {item.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs bg-surface0 text-subtext1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {item.media && item.media.length > 0 && (
            <div className="mt-4">
                <ul className="list-disc list-inside mt-1">
                    {item.media.map((link, i) => <li key={i}><a href={link} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">{link}</a></li>)}
                </ul>
            </div>
          )}
        </div>
      ))}

      {filteredItems.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-subtext1 text-lg">No bucket list items match the selected filters.</p>
          <button
            onClick={clearAllFilters}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default BucketListRenderer;
