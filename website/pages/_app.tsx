import React, { useEffect } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { initPostHog, isPostHogEnabled, posthog } from '../lib/posthog'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    initPostHog()
    if (isPostHogEnabled()) {
      posthog.capture('$pageview')
    }
    const handleRouteChange = () => {
      if (isPostHogEnabled()) {
        posthog.capture('$pageview')
      }
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router])
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const btn = target.closest('button.nav-tab') as HTMLElement | null
      if (btn && isPostHogEnabled()) {
        const tab = btn.textContent?.toLowerCase() || undefined
        posthog.capture('nav_tab_clicked', { tab })
      }
    }
    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [])

  return (
    <div className="min-h-screen bg-base">
      <Component {...pageProps} />
    </div>
  )
}
