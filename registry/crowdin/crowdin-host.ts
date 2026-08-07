// Bridge to the Crowdin host for apps embedded in the Crowdin iframe via
// https://cdn.crowdin.com/apps/dist/iframe.js (the AP global). CSS custom
// properties never cross the iframe boundary, so the host palette must be
// pulled: request it with AP.getCssVariables and write it onto <html> - the
// @crowdin/app-theme CSS then resolves its var(--crowdin-*) references to
// live host values. Everything no-ops outside the iframe (local dev), where
// that CSS falls back to the canonical Crowdin values.

export type CrowdinThemeMode = "light" | "dark"

type CssVariables = Record<string, string>

interface CrowdinHost {
  getTheme?: (callback: (theme: string) => void) => void
  getCssVariables?: (callback: (variables: CssVariables) => void) => void
  events?: {
    on?: (event: string, callback: (data?: unknown) => void) => void
  }
}

// Deliberately not a global Window augmentation: consumers commonly declare
// their own AP global and interface merging would conflict on any type
// mismatch. A local cast keeps this file free of global-scope footprint.
function host(): CrowdinHost | undefined {
  if (typeof window === "undefined") return undefined
  return (window as Window & { AP?: CrowdinHost }).AP
}

export function applyCrowdinCssVariables() {
  host()?.getCssVariables?.((variables) => {
    for (const [name, value] of Object.entries(variables)) {
      // The --color-* passthrough mirrors the apps SDK on purpose: it lets
      // the host pin Tailwind-level tokens directly, at the cost of such a
      // host value overriding a local @theme name if the two ever collide.
      if (name.startsWith("--crowdin-") || name.startsWith("--color-")) {
        document.documentElement.style.setProperty(name, value)
      }
    }
  })
}

// iframe.js is typically loaded async, so AP may appear after the app
// mounts; probe for a while before concluding we are outside the iframe.
const PROBE_INTERVAL_MS = 250
const PROBE_LIMIT = 40

// Reports the host theme mode (now and on every host theme change) and
// keeps the host palette applied. Outside the Crowdin iframe it never
// fires. Returns a cancel function that stops probing and mutes callbacks.
export function onCrowdinTheme(onMode: (mode: CrowdinThemeMode) => void) {
  let cancelled = false
  let probeTimer: ReturnType<typeof setTimeout> | undefined

  const wire = (ap: CrowdinHost) => {
    const sync = () => {
      if (cancelled) return
      ap.getTheme?.((theme) => {
        if (!cancelled) onMode(theme === "dark" ? "dark" : "light")
      })
      applyCrowdinCssVariables()
    }
    sync()
    ap.events?.on?.("theme.changed", sync)
  }

  const probe = (attemptsLeft: number) => {
    if (cancelled) return
    const ap = host()
    if (ap?.getTheme) {
      wire(ap)
    } else if (attemptsLeft > 0) {
      probeTimer = setTimeout(() => probe(attemptsLeft - 1), PROBE_INTERVAL_MS)
    }
  }
  if (typeof window !== "undefined") probe(PROBE_LIMIT)

  return () => {
    cancelled = true
    if (probeTimer !== undefined) clearTimeout(probeTimer)
  }
}
