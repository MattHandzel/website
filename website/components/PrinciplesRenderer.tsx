import React, { useState } from 'react';
import { motion } from 'framer-motion';

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
    <motion.div 
      className="border-l-2 border-accent/30 pl-4 mb-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-surface/50 rounded-lg transition-colors"
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-text">{principle.title}</h3>
        {hasChildren && (
          <svg 
            className={`w-5 h-5 text-muted transform transition-transform ${isOpen ? 'rotate-90' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
      <div className="p-4">
        <p className="text-muted leading-relaxed">{principle.content}</p>
      </div>
      {isOpen && hasChildren && (
        <motion.div 
          className="pl-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          {principle.children?.map(child => (
            <PrincipleItem key={child.id} principle={child} />
          ))}
        </motion.div>
      )}
    </motion.div>
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
      {hierarchicalPrinciples.map((principle, index) => (
        <motion.div
          key={principle.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <PrincipleItem principle={principle} />
        </motion.div>
      ))}
    </div>
  );
};

export default PrinciplesRenderer;
