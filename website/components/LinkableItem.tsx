import React from 'react';

interface LinkableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper component that makes any item linkable via URL hash
 * Adds a unique ID and enables right-click "Copy link address"
 * The item will be highlighted when accessed via direct link
 */
export const LinkableItem: React.FC<LinkableItemProps> = ({ 
  id, 
  children, 
  className = '' 
}) => {
  return (
    <div 
      id={id} 
      className={`linkable-item relative ${className}`}
      style={{ scrollMarginTop: '100px' }} // Offset for fixed navigation
      data-linkable-id={id}
    >
      {/* Invisible anchor for right-click "Copy link address" */}
      <a 
        href={`#${id}`}
        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg hover:bg-surface/50 z-10"
        title="Copy link to this item"
        onClick={(e) => {
          e.preventDefault();
          // Update URL without scrolling
          window.history.pushState(null, '', `#${id}`);
          // Copy to clipboard
          navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#${id}`);
        }}
      >
        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </a>
      {children}
    </div>
  );
};
