# Deep Linking Feature

## Overview

All components across your website now support **deep linking** - the ability to link directly to individual items (projects, thoughts, principles, books, etc.) and have them automatically highlighted and scrolled into view.

## How It Works

### For Users (Sharing Links)

There are **two ways** to copy a link to a component:

**Option 1: Hover and Click the Link Icon**
1. **Navigate to any page** with components (Projects, Thoughts, Principles, Books, Bucket List, Ideas, Communities, Blog)
2. **Hover over any component** - a small link icon will appear in the top-right corner
3. **Click the link icon** - the link is automatically copied to your clipboard
4. The URL in your browser will also update to include the hash

**Option 2: Right-Click the Link Icon**
1. **Hover over any component** to reveal the link icon
2. **Right-click the link icon**
3. **Select "Copy link address"** from the context menu

**User Experience:**
- Hover to reveal link icon → Click to copy (or right-click for context menu)
- Visible but subtle link icon (opacity-0 until hover)
- Auto-expands collapsed items when linked
- Handles both `/page#hash` and `/page/#hash` URL formats
- Smooth scroll with highlight animation (3 seconds)
- Works with nested/hierarchical items (e.g., nested principles)

**When someone opens your shared link:**
- The page scrolls directly to that component
- Collapsible items (Projects, Books, Principles) automatically expand
- The component is highlighted with a glowing accent-colored outline
- The highlight fades away after 3 seconds

### URL Format

Links follow this pattern:
```
https://yourwebsite.com/page-name#component-type-id
```

Examples:
- `https://yourwebsite.com/projects#project-123`
- `https://yourwebsite.com/thoughts#thought-456`
- `https://yourwebsite.com/principles#principle-789`
- `https://yourwebsite.com/bucket-list#bucket-5`

### Component ID Patterns

Each component type has its own ID pattern:

| Page | ID Pattern | Example |
|------|------------|---------|
| Projects | `project-{id}` | `#project-abc123` |
| Thoughts | `thought-{id}` | `#thought-xyz789` |
| Principles | `principle-{id}` | `#principle-001` |
| Books | `book-{directory}` | `#book-atomic-habits` |
| Bucket List | `bucket-{index}` | `#bucket-0` |
| Ideas | `idea-{id}` | `#idea-42` |
| Communities | `community-{id}` | `#community-mit` |
| Blog | `blog-{id}` | `#blog-post-slug` |

## Technical Implementation

### Architecture

The system consists of three main parts:

1. **`LinkableItem` Component** (`components/LinkableItem.tsx`)
   - Wrapper component that adds a unique ID to any item
   - Provides scroll offset (100px) to account for fixed navigation
   - Includes a hover-revealed link icon in top-right corner
   - Click icon to copy link to clipboard (using Clipboard API)
   - Right-click icon for browser's "Copy link address" option
   - Updates URL hash without scrolling when clicked
   - Link icon positioned absolutely with z-10 to stay on top
   - Uses relative positioning on wrapper for proper icon placement

2. **`useHighlightFromHash` Hook** (`lib/useHighlightFromHash.ts`)
   - Detects URL hash on page load and hash changes
   - Handles both `/page#hash` and `/page/#hash` formats (strips leading slashes)
   - Dispatches `linkableItemTargeted` custom event for components
   - Returns current hash ID for auto-expand logic
   - Finds the target element by ID
   - Waits 200ms for expansion animations to complete
   - Smoothly scrolls to the element
   - Adds highlight animation class
   - Removes highlight after 3 seconds

3. **CSS Animations** (`styles/globals.css`)
   - Defines `hash-highlighted` class
   - Creates pulsing outline effect with accent color
   - Separate animations for light and dark modes
   - Smooth fade-out transition

### Auto-Expand Functionality

Components with collapsible items automatically expand when linked:

- **ProjectsRenderer**: Expands the target project's content
- **BooksRenderer**: Expands the target book's notes and details
- **PrinciplesRenderer**: Expands the target principle AND all parent principles (for nested hierarchies)

This is achieved through:
1. The hook dispatches a custom `linkableItemTargeted` event
2. Components listen for this event and update their expand state
3. A 200ms delay allows expansion animations to complete before scrolling
4. For nested items, parent items recursively check if they contain the target

### Overall Technical Details

- **Modular and reusable** - Same pattern works across all component types
- **URL hash fragments** - Uses standard `#component-id` format
- **Handles Next.js quirks** - Strips leading slashes from hash (handles both `/page#hash` and `/page/#hash`)
- **Event-driven** - Uses custom events for loose coupling between hook and components
- **Performance** - Uses `useMemo` and `useEffect` with proper dependencies
- **Accessibility** - Link icons are keyboard accessible and have proper ARIA labels

### Adding to New Components

To add deep linking to a new component:

```tsx
// 1. Import the required components
import { LinkableItem } from './LinkableItem'
import { useHighlightFromHash } from '../lib/useHighlightFromHash'

// 2. Add the hook at the top of your component
export default function MyRenderer({ items }) {
  useHighlightFromHash()
  
  // ... rest of component
}

// 3. Wrap each item with LinkableItem
return (
  <div>
    {items.map(item => (
      <LinkableItem key={item.id} id={`mytype-${item.id}`}>
        <div className="card">
          {/* Your existing component JSX */}
        </div>
      </LinkableItem>
    ))}
  </div>
)
```

**Important**: 
- Use a consistent ID pattern (e.g., `mytype-{id}`)
- The `key` prop stays on `LinkableItem`
- Remove the `key` prop from the inner component
- The ID should be unique within the page

### Browser Compatibility

- ✅ Chrome/Edge (Modern)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers
- Uses standard Web APIs (`window.location.hash`, `getElementById`, `scrollIntoView`)

## Benefits

1. **No UI clutter** - No share buttons or extra icons needed
2. **Native browser behavior** - Uses standard right-click menu
3. **Universal** - Works across all component types
4. **Accessible** - Keyboard navigation friendly
5. **Performant** - Minimal JavaScript, CSS animations
6. **Persistent** - Links work forever (as long as the ID remains)

## Future Enhancements

Possible improvements:
- Add "Copy link" button that appears on hover
- Support for opening items in expanded state
- Analytics tracking for shared links
- QR code generation for mobile sharing
- Social media preview cards with component metadata
