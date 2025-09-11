import React, { useState } from 'react';

interface Principle {
  id: string;
  title: string;
  content: string;
  level: number;
  parent_id: string | null;
  children?: Principle[];
}

interface PrinciplesRendererProps {
  principles: Principle[];
}

const PrincipleItem: React.FC<{ principle: Principle }> = ({ principle }) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasChildren = !!principle.children && principle.children.length > 0;

  return (
    <div className={`pl-${principle.level * 4} border-l-2 border-gray-200 dark:border-gray-700`}>
      <div 
        className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{principle.title}</h3>
        {hasChildren && (
          <svg 
            className={`w-5 h-5 text-gray-500 transform transition-transform ${isOpen ? 'rotate-90' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
      <div className="p-4">
        <p className="text-gray-600 dark:text-gray-400">{principle.content}</p>
      </div>
      {isOpen && hasChildren && (
        <div className="pl-4">
          {principle.children?.map(child => (
            <PrincipleItem key={child.id} principle={child} />
          ))}
        </div>
      )}
    </div>
  );
};

const PrinciplesRenderer: React.FC<PrinciplesRendererProps> = ({ principles }) => {
  const buildHierarchy = (items: Principle[]): Principle[] => {
    const rootItems: Principle[] = [];
    const lookup: { [id: string]: Principle } = {};

    items.forEach(item => {
      lookup[item.id] = { ...item, children: [] };
    });

    items.forEach(item => {
      if (item.parent_id && lookup[item.parent_id]) {
        lookup[item.parent_id].children?.push(lookup[item.id]);
      } else {
        rootItems.push(lookup[item.id]);
      }
    });

    return rootItems;
  };

  const hierarchicalPrinciples = buildHierarchy(principles);

  return (
    <div className="space-y-4">
      {hierarchicalPrinciples.map(principle => (
        <PrincipleItem key={principle.id} principle={principle} />
      ))}
    </div>
  );
};

export default PrinciplesRenderer;
