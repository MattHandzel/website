import { useEffect, useRef, useState } from 'react'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'

interface Node {
  id: string
  x: number
  y: number
  vx?: number
  vy?: number
  cluster?: string
}

interface Link {
  source: string | Node
  target: string | Node
}

interface ForceGraphMeshProps {
  activeSection?: string
  className?: string
}

export default function ForceGraphMesh({ activeSection, className = '' }: ForceGraphMeshProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const simulationRef = useRef<any>(null)
  const nodesRef = useRef<Node[]>([])
  const linksRef = useRef<Link[]>([])
  const animationFrameRef = useRef<number>()

  // Initialize nodes and links
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const { clientWidth, clientHeight } = canvasRef.current.parentElement || canvasRef.current
        setDimensions({ width: clientWidth, height: clientHeight })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return

    // Create nodes with clusters
    const clusters = ['principles', 'bucket-list', 'projects', 'thoughts', 'dailies']
    const nodesPerCluster = 8
    const nodes: Node[] = []

    clusters.forEach((cluster, clusterIndex) => {
      const clusterX = (dimensions.width / (clusters.length + 1)) * (clusterIndex + 1)
      const clusterY = dimensions.height / 2

      for (let i = 0; i < nodesPerCluster; i++) {
        nodes.push({
          id: `${cluster}-${i}`,
          x: clusterX + (Math.random() - 0.5) * 100,
          y: clusterY + (Math.random() - 0.5) * 100,
          cluster,
        })
      }
    })

    nodesRef.current = nodes

    // Create links - connect nodes within clusters and some between clusters
    const links: Link[] = []
    clusters.forEach((cluster) => {
      const clusterNodes = nodes.filter((n) => n.cluster === cluster)
      for (let i = 0; i < clusterNodes.length - 1; i++) {
        if (Math.random() > 0.4) {
          links.push({
            source: clusterNodes[i].id,
            target: clusterNodes[i + 1].id,
          })
        }
      }
    })

    // Add some inter-cluster links
    for (let i = 0; i < 15; i++) {
      const source = nodes[Math.floor(Math.random() * nodes.length)]
      const target = nodes[Math.floor(Math.random() * nodes.length)]
      if (source.cluster !== target.cluster) {
        links.push({ source: source.id, target: target.id })
      }
    }

    linksRef.current = links

    // Create force simulation
    const simulation = forceSimulation(nodes as any)
      .force('link', forceLink(links).id((d: any) => d.id).distance(50).strength(0.3))
      .force('charge', forceManyBody().strength(-30))
      .force('center', forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collide', forceCollide(15))
      .alphaDecay(0.01)
      .velocityDecay(0.3)

    simulationRef.current = simulation

    return () => {
      simulation.stop()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [dimensions])

  // Animate the graph
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !dimensions.width || !dimensions.height) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frameCount = 0
    const targetFPS = 15 // Low FPS for performance

    const render = () => {
      frameCount++
      
      // Only render at target FPS
      if (frameCount % Math.floor(60 / targetFPS) !== 0) {
        animationFrameRef.current = requestAnimationFrame(render)
        return
      }

      ctx.clearRect(0, 0, dimensions.width, dimensions.height)

      const nodes = nodesRef.current
      const links = linksRef.current

      // Calculate active cluster based on section
      const activeCluster = activeSection || 'principles'

      // Draw edges
      ctx.strokeStyle = 'rgba(34, 184, 207, 0.15)'
      ctx.lineWidth = 1
      links.forEach((link) => {
        const source = nodes.find((n) => n.id === link.source || (typeof link.source === 'object' && n.id === (link.source as Node).id))
        const target = nodes.find((n) => n.id === link.target || (typeof link.target === 'object' && n.id === (link.target as Node).id))
        
        if (source && target) {
          const isActive = source.cluster === activeCluster || target.cluster === activeCluster
          ctx.strokeStyle = isActive 
            ? 'rgba(110, 231, 240, 0.3)' 
            : 'rgba(34, 184, 207, 0.08)'
          ctx.beginPath()
          ctx.moveTo(source.x, source.y)
          ctx.lineTo(target.x, target.y)
          ctx.stroke()
        }
      })

      // Draw nodes
      nodes.forEach((node) => {
        const isActive = node.cluster === activeCluster
        const radius = isActive ? 4 : 2.5
        const alpha = isActive ? 0.8 : 0.3

        // Node glow
        if (isActive) {
          const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 3)
          gradient.addColorStop(0, `rgba(110, 231, 240, ${alpha * 0.3})`)
          gradient.addColorStop(1, 'rgba(110, 231, 240, 0)')
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(node.x, node.y, radius * 3, 0, 2 * Math.PI)
          ctx.fill()
        }

        // Node circle
        ctx.fillStyle = isActive ? `rgba(110, 231, 240, ${alpha})` : `rgba(34, 184, 207, ${alpha})`
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI)
        ctx.fill()
      })

      animationFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [dimensions, activeSection])

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className={`absolute inset-0 ${className}`}
      style={{ opacity: 0.6 }}
    />
  )
}
