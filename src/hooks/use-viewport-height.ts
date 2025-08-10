import * as React from "react"

// Sets a CSS variable --vh to be used as a reliable 100vh on mobile browsers
// Usage: CSS can use min-height: calc(var(--vh, 1vh) * 100)
export function useViewportHeight() {
  React.useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty("--vh", `${vh}px`)
    }

    setVh()
    window.addEventListener("resize", setVh)
    window.addEventListener("orientationchange", setVh)

    return () => {
      window.removeEventListener("resize", setVh)
      window.removeEventListener("orientationchange", setVh)
    }
  }, [])
}
