import { useEffect, useState } from 'react';

/**
 * Custom hook that highlights an element when the URL hash matches its ID
 * and scrolls it into view with smooth behavior.
 * Returns the current hash ID for components to use for auto-expanding.
 */
export function useHighlightFromHash() {
  const [currentHashId, setCurrentHashId] = useState<string | null>(null);

  useEffect(() => {
    // Function to handle hash-based highlighting
    const handleHashHighlight = () => {
      // Get hash and clean it (handle both /page#hash and /page/#hash)
      let hash = window.location.hash;
      
      if (!hash) {
        setCurrentHashId(null);
        return;
      }
      
      // Remove the '#' and any leading slashes
      const elementId = hash.substring(1).replace(/^\/+/, '');
      setCurrentHashId(elementId);
      
      const element = document.getElementById(elementId);
      
      if (element) {
        // Small delay to ensure the page is fully rendered
        setTimeout(() => {
          // Dispatch custom event for components to handle expansion
          window.dispatchEvent(new CustomEvent('linkableItemTargeted', { 
            detail: { id: elementId } 
          }));
          
          // Additional delay to allow expansion animation to complete
          setTimeout(() => {
            // Scroll into view with smooth behavior
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            
            // Add highlight class
            element.classList.add('hash-highlighted');
            
            // Remove highlight after animation completes
            setTimeout(() => {
              element.classList.remove('hash-highlighted');
            }, 3000); // 3 seconds highlight duration
          }, 200); // Wait for expansion
        }, 100);
      }
    };
    
    // Handle on mount and when hash changes
    handleHashHighlight();
    
    // Listen for hash changes (e.g., when clicking internal links)
    window.addEventListener('hashchange', handleHashHighlight);
    
    return () => {
      window.removeEventListener('hashchange', handleHashHighlight);
    };
  }, []);
  
  return currentHashId;
}
