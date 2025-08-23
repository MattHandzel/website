import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { isPostHogEnabled, posthog } from '../lib/posthog'

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
    { key: 'home', label: 'Home', href: '/' },
    { key: 'dailies', label: 'Dailies', href: '/dailies' },
    { key: 'financial', label: 'Financial', href: '/financial' },
    { key: 'metrics', label: 'Metrics', href: '/metrics' },
    { key: 'communities', label: 'Communities', href: '/communities' },
    { key: 'anki', label: 'Anki', href: '/anki' },
    { key: 'blog', label: 'Blog', href: '/blog' },
    { key: 'content-consumed', label: 'Content Consumed', href: '/content-consumed' },
    { key: 'github', label: 'Github', href: '/github' },
    { key: 'thoughts', label: 'Thoughts', href: '/thoughts' },
    { key: 'map', label: 'Map', href: '/map' },
    { key: 'about', label: 'About', href: '/about' }
  ]

  const isActive = (itemKey: string, href: string) => {
    if (currentPage) {
      return currentPage === itemKey
    }
    return router.pathname === href
  }

  return (
    <nav className="bg-surface0 shadow-lg border-b border-surface1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-text">
              Matt Handzel
            </Link>
          </div>
          <div className="flex space-x-8">
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
        </div>
      </div>
    </nav>
  )
}
