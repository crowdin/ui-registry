import * as React from "react"

import { onCrowdinTheme, type CrowdinThemeMode } from "@/lib/crowdin-host"

// Tracks the Crowdin host theme mode and keeps the host palette applied.
// Outside the Crowdin iframe it stays on defaultMode - wire your own
// standalone theming (e.g. next-themes) off the returned value.
export function useCrowdinTheme(defaultMode: CrowdinThemeMode = "light") {
  const [mode, setMode] = React.useState<CrowdinThemeMode>(defaultMode)

  React.useEffect(() => onCrowdinTheme(setMode), [])

  return mode
}
