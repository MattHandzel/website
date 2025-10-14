import React, { useState } from 'react';

interface Idea {
  id: number;
  title: string;
  description: string;
}

interface IdeasRendererProps {
  ideas: Idea[];
}

const IdeasRenderer: React.FC<IdeasRendererProps> = ({ ideas }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIdeas = ideas.filter(idea =>
    idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search project ideas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-surface border border-white/10 rounded-lg text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
        />
      </div>

      <div className="space-y-3">
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            className="card p-4 transition-all hover:scale-[1.01]"
          >
            <div className="flex items-start">
              <span className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent/20 text-accent border border-accent/30 font-semibold text-sm mr-4">
                {idea.id}
              </span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text mb-1">
                  {idea.title}
                </h3>
                <p className="text-muted">
                  {idea.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredIdeas.length === 0 && (
        <div className="card p-8 text-center text-muted">
          No ideas found matching "{searchTerm}"
        </div>
      )}

      <div className="mt-6 text-sm text-muted">
        Showing <span className="font-semibold text-accent">{filteredIdeas.length}</span> of <span className="font-semibold text-text">{ideas.length}</span> ideas
      </div>
    </div>
  );
};

export default IdeasRenderer;
