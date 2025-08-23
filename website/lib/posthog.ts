import posthog from 'posthog-js'

let initialized = false

export function initPostHog() {
  if (initialized) return
  const enabled = process.env.NEXT_PUBLIC_ENABLE_POSTHOG === 'true'
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY || ''
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || undefined
  if (!enabled) return
  if (!key) return
  posthog.init(key, { api_host: host })
  initialized = true
}

export function isPostHogEnabled() {
  return initialized
}

export { posthog }
