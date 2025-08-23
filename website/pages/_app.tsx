import React from 'react'
import type { AppProps } from 'next/app'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen bg-base">
      <Component {...pageProps} />
    </div>
  )
}
