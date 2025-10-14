import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import dynamic from 'next/dynamic'
import { isPostHogEnabled, posthog } from '../lib/posthog'

const ThemeToggle = dynamic(() => import('./ThemeToggle'), { ssr: false })

interface NavigationProps {
  currentPage?: string
}

export default function Navigation({ currentPage }: NavigationProps) {
  const router = useRouter()
  
  const onNavClick = useCallback((page: string) => {
    if (isPostHogEnabled()) {
      posthog.capture('nav_page_clicked', { page })
    }
  }, [])

  const navItems = [
    // { key: 'about', label: 'About', href: '/about' },
    { key: 'bucket-list', label: 'Bucket List', href: '/bucket-list' },
    { key: 'dailies', label: 'Dailies', href: '/dailies' },
    // { key: 'financial', label: 'Financial', href: '/financial' },
    // { key: 'metrics', label: 'Metrics', href: '/metrics' },
    { key: 'communities', label: 'Communities', href: '/communities' },
    { key: 'principles', label: 'Principles', href: '/principles' },
    { key: 'project-ideas', label: 'Project Ideas', href: '/project-ideas' },
    { key: 'projects', label: 'Active Projects', href: '/projects' },
    // { key: 'anki', label: 'Anki', href: '/anki' },
    { key: 'blog', label: 'Blog', href: '/blog' },
    { key: 'content-consumed', label: 'Content Consumed', href: '/content-consumed' },
    { key: 'github', label: 'Github', href: '/github' },
    { key: 'thoughts', label: 'Thoughts', href: '/thoughts' },
    // { key: 'map', label: 'Map', href: '/map' },
    // { key: 'where-ive-been', label: 'Where I\'ve Been', href: '/where-ive-been' },
    // { key: 'about', label: 'About', href: '/about' }
  ]

  const isActive = (itemKey: string, href: string) => {
    if (currentPage) {
      return currentPage === itemKey
    }
    return router.pathname === href
  }

  return (
    <nav className="bg-surface/80 backdrop-blur-lg shadow-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-display font-bold text-accent data-glow hover:text-accent-2 transition-all duration-180">
              Matt Handzel
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => onNavClick(item.key)}
                className={`nav-tab ${
                  isActive(item.key, item.href)
                    ? 'nav-tab-active'
                    : 'nav-tab-inactive'
                }`}
              >
                {item.label}
              </Link>
            ))}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
