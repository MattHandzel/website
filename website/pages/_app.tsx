import React, { useEffect } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { initPostHog, isPostHogEnabled, posthog } from '../lib/posthog'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
    <div className="min-h-screen bg-background">
      <Component {...pageProps} />
    </div>
  )
}
