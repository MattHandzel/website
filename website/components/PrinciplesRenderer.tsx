import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LinkableItem } from './LinkableItem';
import { useHighlightFromHash } from '../lib/useHighlightFromHash';

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

const PrincipleItem: React.FC<{ principle: Principle; targetPrincipleId?: string | null }> = ({ principle, targetPrincipleId }) => {
  // Auto-expand if this principle or any descendant matches the target
  const shouldAutoExpand = React.useMemo(() => {
    if (!targetPrincipleId) return false;
    
    const checkIfContainsTarget = (p: Principle): boolean => {
      if (p.id === targetPrincipleId.replace('principle-', '')) return true;
      if (p.children) {
        return p.children.some(child => checkIfContainsTarget(child));
      }
      return false;
    };
    
    return checkIfContainsTarget(principle);
  }, [principle, targetPrincipleId]);
  
  const [isOpen, setIsOpen] = useState(shouldAutoExpand);
  const hasChildren = !!principle.children && principle.children.length > 0;
  
  // Update isOpen when target changes
  React.useEffect(() => {
    if (shouldAutoExpand) {
      setIsOpen(true);
    }
  }, [shouldAutoExpand]);

  return (
    <LinkableItem id={`principle-${principle.id}`}>
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
            <PrincipleItem key={child.id} principle={child} targetPrincipleId={targetPrincipleId} />
          ))}
        </motion.div>
      )}
    </motion.div>
    </LinkableItem>
  );
};

const PrinciplesRenderer: React.FC<PrinciplesRendererProps> = ({ principles }) => {
  // Enable hash-based highlighting for deep links
  const currentHashId = useHighlightFromHash();
  const [targetPrincipleId, setTargetPrincipleId] = React.useState<string | null>(null);
  
  // Auto-expand principle when linked via hash
  React.useEffect(() => {
    const handleLinkableTarget = (e: CustomEvent) => {
      const targetId = e.detail.id;
      if (targetId && targetId.startsWith('principle-')) {
        setTargetPrincipleId(targetId);
      }
    };
    
    window.addEventListener('linkableItemTargeted', handleLinkableTarget as EventListener);
    
    return () => {
      window.removeEventListener('linkableItemTargeted', handleLinkableTarget as EventListener);
    };
  }, []);
  
  // Check hash on mount
  React.useEffect(() => {
    if (currentHashId && currentHashId.startsWith('principle-')) {
      setTargetPrincipleId(currentHashId);
    }
  }, [currentHashId]);
  
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
          <PrincipleItem principle={principle} targetPrincipleId={targetPrincipleId} />
        </motion.div>
      ))}
    </div>
  );
};

export default PrinciplesRenderer;
