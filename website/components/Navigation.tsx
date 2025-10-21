import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { isPostHogEnabled, posthog } from '../lib/posthog'

const ThemeToggle = dynamic(() => import('./ThemeToggle'), { ssr: false })

interface NavigationProps {
  currentPage?: string
}

export default function Navigation({ currentPage }: NavigationProps) {
  const router = useRouter()
  const [showResourcesDropdown, setShowResourcesDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const resourcesDropdownTimeout = useRef<ReturnType<typeof setTimeout>>();
  
  const onNavClick = useCallback((page: string) => {
    if (isPostHogEnabled()) {
      posthog.capture('nav_page_clicked', { page })
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowResourcesDropdown(false)
      }
    }

    if (showResourcesDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showResourcesDropdown])

  const navItems = [
    // { key: 'about', label: 'About', href: '/about' },
    { key: 'bucket-list', label: 'Bucket List', href: '/bucket-list' },
    { key: 'dailies', label: 'Dailies', href: '/dailies' },
    { key: 'todos', label: 'To-Dos', href: '/todos' },
    // { key: 'financial', label: 'Financial', href: '/financial' },
    // { key: 'metrics', label: 'Metrics', href: '/metrics' },
    { key: 'communities', label: 'Communities', href: '/communities' },
    { key: 'principles', label: 'Principles', href: '/principles' },
    { key: 'projects', label: 'Projects', href: '/projects' },
    // { key: 'anki', label: 'Anki', href: '/anki' },
    { key: 'blog', label: 'Blog', href: '/blog' },
    { key: 'thoughts', label: 'Thoughts', href: '/thoughts' },
    // { key: 'map', label: 'Map', href: '/map' },
    // { key: 'where-ive-been', label: 'Where I\'ve Been', href: '/where-ive-been' },
    // { key: 'about', label: 'About', href: '/about' }
  ]

  const moreItems = [
    { key: 'content-consumed', label: 'Content Consumed', href: '/content-consumed' },
    { key: 'failures', label: 'Failures', href: '/failures' },
    { key: 'victories', label: 'Victories', href: '/victories' },
    { key: 'github', label: 'Github', href: '/github' },
    { key: 'line-dancing', label: 'Line Dancing', href: '/line-dancing' },
    { key: 'project-ideas', label: 'Project Ideas', href: '/project-ideas' },
    { key: 'standards', label: 'Standards', href: '/standards' },
  ]

  const isActive = (itemKey: string, href: string) => {
    if (currentPage) {
      return currentPage === itemKey
    }
    return router.pathname === href
  }

  const isMoreActive = 
    currentPage === 'line-dancing' || 
    currentPage === 'content-consumed' || 
    currentPage === 'failures' ||
    currentPage === 'victories' ||
    currentPage === 'github' || 
    currentPage === 'project-ideas' ||
    currentPage === 'standards'

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
            
            {/* More Dropdown */}
            <div 
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => {
                if (resourcesDropdownTimeout.current) {
                  clearTimeout(resourcesDropdownTimeout.current);
                }
                setShowResourcesDropdown(true);
              }}
              onMouseLeave={() => {
                resourcesDropdownTimeout.current = setTimeout(() => {
                  setShowResourcesDropdown(false);
                }, 300); // 300ms delay before closing
              }}
            >
              <button
                onClick={() => setShowResourcesDropdown(!showResourcesDropdown)}
                className={`nav-tab ${
                  isMoreActive
                    ? 'nav-tab-active'
                    : 'nav-tab-inactive'
                }`}
              >
                More
                <svg
                  className={`ml-1 w-4 h-4 inline transition-transform ${
                    showResourcesDropdown ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {showResourcesDropdown && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-surface/95 backdrop-blur-lg rounded-lg shadow-xl border border-white/10 py-2 z-50 dark:text-text text-text-light">
                  {moreItems.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={() => {
                        onNavClick(item.key)
                        setShowResourcesDropdown(false)
                      }}
                      className="block px-4 py-2 hover:bg-white/5 dark:hover:bg-white/5 hover:text-accent dark:hover:text-accent transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
