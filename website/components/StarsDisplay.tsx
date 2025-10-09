import { getStarRating } from '@/lib/utils'

interface StarsDisplayProps {
  rating?: number
  className?: string
}

export default function StarsDisplay({ rating, className = '' }: StarsDisplayProps) {
  const { filled, empty } = getStarRating(rating)
  
  if (!rating) return null
  
  return (
    <div className={`flex items-center ${className}`}>
      {Array.from({ length: filled }).map((_, i) => (
        <span key={`filled-${i}`} className="text-sm text-yellow-500">
          ★
        </span>
      ))}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`empty-${i}`} className="text-sm text-gray-300">
          ★
        </span>
      ))}
    </div>
  )
}
