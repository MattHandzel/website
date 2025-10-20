import React, { useEffect } from 'react'
import Script from 'next/script'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { initPostHog, isPostHogEnabled, posthog } from '../lib/posthog'
import { ThemeProvider } from '../lib/ThemeContext'
import '../styles/globals.css'
import '../styles/heatmap.css'

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

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Component {...pageProps} />
        <Script
              src="https://app.rybbit.io/api/script.js"
              data-site-id="d00441233611"
              strategy="afterInteractive"
            />
      </div>
    </ThemeProvider>
  )
}
