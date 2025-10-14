# Living Systems Theme Documentation

## Overview

The website has been transformed with the "Living Systems" theme - a dynamic, dark-mode design that visualizes your life as an interconnected system with flows, feedback loops, and emergent structures.

## Design Philosophy

**Concept**: Your life as a dynamic system with networks, pulses, and gradients that "breathe"

**Visual Language**: 
- Networks and node-based visualizations
- Flowing, organic transitions
- Frosted glass (backdrop-filter blur) effects
- Subtle glows and pulses
- Data-driven aesthetics

## Color Palette

```css
--bg: #0C0F10          /* Charcoal background */
--surface: #121619     /* Surface elements */
--text: #E6EEF3        /* Primary text */
--muted: #9AB0BE       /* Muted text */
--accent: #22B8CF      /* Data teal - primary accent */
--accent-2: #6EE7F0    /* Glow teal - secondary accent */
```

## Typography

- **Display/Headings**: Inter Tight (fallback: Inter, Space Grotesk)
- **Body Text**: Inter
- **Code/Mono**: IBM Plex Mono (fallback: JetBrains Mono)

## Key Features

### 1. Animated Force Graph Mesh (Hero)
- Low FPS (12-18) animated network visualization
- Subtle cluster animations that respond to page sections
- Organic, breathing quality

### 2. Flow Dividers
Three variants of SVG-based section separators:
- **Wave**: Smooth flowing waves
- **Curve**: Elegant bezier curves
- **Pulse**: Animated pulsing lines

### 3. Frosted Glass Cards
- `backdrop-filter: blur(8px)` for depth
- Subtle border: `color-mix(in srgb, var(--accent) 12%, transparent)`
- Hover effects with glow transitions
- Inner highlights for dimensionality

### 4. Interactive Graph Visualizations

#### Principles Page
- Force-directed node graph
- Each principle is a clickable node
- Edges show relationships between principles
- Animated edge drawing on hover
- Expandable detail panels

#### Bucket List
- Filter chips become interactive nodes
- Progress rings with pulse animations
- Completion celebrations with particle effects

### 5. Motion System

**Timing**:
- Standard transitions: 140-200ms ease-out
- Elastic springs for node interactions
- Smooth page crossfades

**Hover Effects**:
- 2-3px outer glow on nodes
- Edge ripples to connected neighbors
- Scale transforms (hover:scale-105)

**Page Transitions**:
- Crossfade with network zoom effect
- Staggered animations for content reveal

## Component Styles

### Cards
```css
.card {
  @apply bg-surface/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/10;
  background: linear-gradient(135deg, rgba(18, 22, 25, 0.9) 0%, rgba(18, 22, 25, 0.7) 100%);
}
```

### Buttons
```css
.btn-primary {
  @apply bg-accent hover:bg-accent-2 text-bg px-6 py-3 rounded-full;
  @apply shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent-2/30;
  @apply hover:scale-105 active:scale-95;
}
```

### Filter Chips
- Inactive: transparent background, visible border, hover effects
- Active: accent background, white text, shadow, scale effect
- Clear visual feedback for all interactions

### Navigation
- Frosted glass with backdrop-blur
- Sticky positioning
- Glowing underline for active tabs
- Smooth color transitions

## Animation Classes

```css
/* Tailwind custom animations */
animate-fade-in         /* Simple fade in */
animate-slide-up        /* Slide up with fade */
animate-pulse-glow      /* Infinite pulsing glow */
animate-draw-edge       /* SVG edge drawing animation */
animate-node-glow       /* Node highlight on interaction */
```

## Accessibility

- Maintains 4.5:1 contrast ratio for text
- Keyboard navigation support for graph interactions
- Optional list view toggle for screen readers
- ARIA labels on interactive elements
- Reduced motion support (respects prefers-reduced-motion)

## New Components

### 1. ForceGraphMesh
Location: `/components/ForceGraphMesh.tsx`
- Canvas-based animated network visualization
- D3-force simulation
- Responds to active section prop
- Low-FPS performance optimization

### 2. FlowDivider
Location: `/components/FlowDivider.tsx`
- Three variant types (wave, curve, pulse)
- Framer Motion animations
- SVG-based with gradients

### 3. Enhanced PrinciplesRenderer
Location: `/components/PrinciplesRenderer.tsx`
- Force-directed graph visualization
- Interactive node system
- Expandable detail panels
- D3-force integration

## Updated Components

### Navigation
- Dark frosted glass background
- Glowing active state indicators
- Sticky positioning with blur effect

### BucketListRenderer
- New filter chip styles
- Dark card backgrounds
- Animated hover states
- Improved visual hierarchy

### ContentRenderer
- Dark theme prose styling
- Accent color links
- Improved typography

### PageLayout
- Dark background (bg-bg)
- Consistent spacing

## Pages Updated

1. **Home** - Animated hero with force graph mesh, flow dividers
2. **Bucket List** - Enhanced filters, dark cards, animations
3. **Principles** - Force-directed graph visualization
4. All pages updated with dark theme backgrounds

## Dependencies Added

```json
{
  "framer-motion": "^latest",
  "d3-force": "^latest",
  "@types/d3-force": "^latest",
  "react-spring": "^latest"
}
```

## Future Enhancements

Suggested additions for the theme:
1. Particle burst animations for bucket list completions
2. "Signal vs. noise" scrollytelling for blog posts
3. Micro-sparklines in data cards
4. Network zoom transition between pages
5. Causal link edges in principles graph
6. Hover tooltips with connection paths

## Browser Support

- Modern browsers with CSS backdrop-filter support
- Fallback styles for older browsers
- Progressive enhancement approach

## Performance Considerations

- Force graph mesh runs at 12-18 FPS for battery savings
- Canvas-based rendering for animations
- Debounced window resize handlers
- Lazy loading for heavy visualizations
- Optimized re-renders with React.memo where appropriate

## Build Output

All features compile successfully:
- Next.js static site generation (SSG)
- No build errors
- Production-ready bundle sizes
- Proper code splitting

---

**Theme Author**: AI Assistant  
**Implementation Date**: October 2025  
**Design System**: Living Systems v1.0
