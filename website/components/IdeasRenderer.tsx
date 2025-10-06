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
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
        />
      </div>

      <div className="space-y-3">
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start">
              <span className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold text-sm mr-4">
                {idea.id}
              </span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  {idea.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {idea.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredIdeas.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No ideas found matching "{searchTerm}"
        </div>
      )}

      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredIdeas.length} of {ideas.length} ideas
      </div>
    </div>
  );
};

export default IdeasRenderer;
