import { motion } from 'framer-motion'

interface FlowDividerProps {
  variant?: 'wave' | 'curve' | 'pulse'
  className?: string
}

export default function FlowDivider({ variant = 'wave', className = '' }: FlowDividerProps) {
  const renderWave = () => (
    <svg
      className={`flow-divider ${className}`}
      viewBox="0 0 1200 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        d="M0,50 Q300,20 600,50 T1200,50 L1200,100 L0,100 Z"
        fill="none"
        stroke="url(#flowGradient)"
        strokeWidth="2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <defs>
        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(34, 184, 207, 0.3)" />
          <stop offset="50%" stopColor="rgba(110, 231, 240, 0.5)" />
          <stop offset="100%" stopColor="rgba(34, 184, 207, 0.3)" />
        </linearGradient>
      </defs>
    </svg>
  )

  const renderCurve = () => (
    <svg
      className={`flow-divider ${className}`}
      viewBox="0 0 1200 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        d="M0,80 C300,20 900,20 1200,80"
        fill="none"
        stroke="url(#curveGradient)"
        strokeWidth="2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <defs>
        <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(34, 184, 207, 0.2)" />
          <stop offset="50%" stopColor="rgba(110, 231, 240, 0.6)" />
          <stop offset="100%" stopColor="rgba(34, 184, 207, 0.2)" />
        </linearGradient>
      </defs>
    </svg>
  )

  const renderPulse = () => (
    <svg
      className={`flow-divider ${className}`}
      viewBox="0 0 1200 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        d="M0,50 L300,50 Q350,20 400,50 L600,50 Q650,80 700,50 L1200,50"
        fill="none"
        stroke="url(#pulseGradient)"
        strokeWidth="2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: 1, 
          opacity: [0, 1, 1, 0.5, 1],
        }}
        transition={{ 
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <defs>
        <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(34, 184, 207, 0.3)" />
          <stop offset="50%" stopColor="rgba(110, 231, 240, 0.7)" />
          <stop offset="100%" stopColor="rgba(34, 184, 207, 0.3)" />
        </linearGradient>
      </defs>
    </svg>
  )

  switch (variant) {
    case 'curve':
      return renderCurve()
    case 'pulse':
      return renderPulse()
    case 'wave':
    default:
      return renderWave()
  }
}
