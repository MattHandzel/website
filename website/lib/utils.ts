/**
 * Safely parse JSON field, returning empty array on error
 */
export function parseJsonField<T = any>(field: string | null | undefined, fallback: T[] = []): T[] {
  if (!field) return fallback
  try {
    return JSON.parse(field) as T[]
  } catch {
    return fallback
  }
}

/**
 * Safely parse JSON field as object, returning empty object on error
 */
export function parseJsonObject<T = any>(field: string | null | undefined, fallback: T = {} as T): T {
  if (!field) return fallback
  try {
    return JSON.parse(field) as T
  } catch {
    return fallback
  }
}

/**
 * Format timestamp using user's local timezone with 24-hour format
 */
export function formatTimestamp(timestamp: string | Date, options?: Intl.DateTimeFormatOptions): string {
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
    const defaultOptions: Intl.DateTimeFormatOptions = {
      dateStyle: 'medium',
      timeStyle: 'medium',
      hour12: false,
      ...options
    }
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(date)
  } catch {
    return timestamp.toString()
  }
}

/**
 * Format date to locale date string
 */
export function formatDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString()
  } catch {
    return date.toString()
  }
}

/**
 * Get status color classes for Tailwind
 */
export function getStatusColor(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'published':
    case 'done':
      return 'bg-green-100 text-green-800'
    case 'reading':
    case 'in-progress':
    case 'active':
      return 'bg-blue-100 text-blue-800'
    case 'to-read':
    case 'draft':
    case 'planned':
      return 'bg-yellow-100 text-yellow-800'
    case 'abandoned':
    case 'archived':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Convert markdown to HTML with basic formatting
 * Note: For more complex markdown, consider using react-markdown
 */
export function formatMarkdown(text: string): string {
  return text
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-gray-900 mb-4">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold text-gray-800 mb-3 mt-6">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-medium text-gray-700 mb-2 mt-4">$1</h3>')
    .replace(/^\- (.+)$/gm, '<li class="ml-4">$1</li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^(?!<[h|l])/gm, '<p class="mb-4">')
    .replace(/<p class="mb-4">(<[h|l])/g, '$1')
}

/**
 * Sort array by date field in descending order (most recent first)
 */
export function sortByDateDesc<T extends Record<string, any>>(
  array: T[], 
  dateField: keyof T
): T[] {
  return [...array].sort((a, b) => 
    new Date(b[dateField]).getTime() - new Date(a[dateField]).getTime()
  )
}

/**
 * Sort array by date field in ascending order (oldest first)
 */
export function sortByDateAsc<T extends Record<string, any>>(
  array: T[], 
  dateField: keyof T
): T[] {
  return [...array].sort((a, b) => 
    new Date(a[dateField]).getTime() - new Date(b[dateField]).getTime()
  )
}

/**
 * Group array by a specific field
 */
export function groupBy<T extends Record<string, any>>(
  array: T[], 
  field: keyof T
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const key = String(item[field])
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

/**
 * Calculate statistics from an array
 */
export function calculateStats<T>(
  array: T[],
  categorizer: (item: T) => string
): Record<string, number> {
  return array.reduce((stats, item) => {
    const category = categorizer(item)
    stats[category] = (stats[category] || 0) + 1
    return stats
  }, {} as Record<string, number>)
}

/**
 * Get star rating as a string (for use in components)
 * Returns filled and empty stars based on rating
 */
export function getStarRating(rating?: number): { filled: number; empty: number } {
  const validRating = Math.min(Math.max(rating || 0, 0), 5)
  return {
    filled: Math.floor(validRating),
    empty: 5 - Math.floor(validRating)
  }
}

/**
 * Format URL for display (domain + path)
 */
export function formatUrlDisplay(url: string, maxLength: number = 50): string {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace('www.', '')
    const pathAndQuery = urlObj.pathname + urlObj.search + urlObj.hash
    
    const fullUrl = domain + pathAndQuery
    if (fullUrl.length <= maxLength) {
      return fullUrl
    }
    
    // Truncate path if too long
    return domain + truncateText(pathAndQuery, maxLength - domain.length)
  } catch {
    return truncateText(url, maxLength)
  }
}

/**
 * Get location string from coordinates or city/country
 */
export function getLocationString(
  city: string | null,
  country: string | null,
  latitude: number | null,
  longitude: number | null
): string | null {
  if (city && country) {
    return `${city}, ${country}`
  }
  if (latitude && longitude) {
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
  }
  return null
}
