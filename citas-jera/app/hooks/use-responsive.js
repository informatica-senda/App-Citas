"use client"

import { useState, useEffect } from "react"
import { Dimensions, Platform } from "react-native"

export function useResponsive() {
  const [windowDimensions, setWindowDimensions] = useState(Dimensions.get("window"))
  const [isWeb] = useState(Platform.OS === "web")

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(Dimensions.get("window"))
    }

    Dimensions.addEventListener("change", handleResize)
    return () => {
      // Clean up event listener
      if (Dimensions.removeEventListener) {
        Dimensions.removeEventListener("change", handleResize)
      }
    }
  }, [])

  const isDesktop = isWeb && windowDimensions.width >= 1024
  const isTablet = isWeb && windowDimensions.width >= 768 && windowDimensions.width < 1024
  const isMobile = !isDesktop && !isTablet

  return {
    width: windowDimensions.width,
    height: windowDimensions.height,
    isWeb,
    isDesktop,
    isTablet,
    isMobile,
  }
}

