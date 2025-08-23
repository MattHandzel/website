import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Navigation() {
  const router = useRouter()
  
  const isActive = (path: string) => {
    if (path === '/' && router.pathname === '/') return true
    if (path !== '/' && router.pathname === path) return true
    return false
  }

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/dailies', label: 'Dailies' },
    { path: '/thoughts', label: 'Thoughts' }
  ]

  return (
    <nav className="bg-surface0 shadow-lg border-b border-surface1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-text hover:text-blue">
              Matt Handzel
            </Link>
          </div>
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-tab ${
                  isActive(item.path)
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
