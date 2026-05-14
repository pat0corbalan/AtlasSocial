"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type View =
  | "formulario"
  | "estadisticas"
  | "datos"
  | "configuracion"

export type Plan = "basico" | "intermedio" | "avanzado"

interface AppState {
  view: View
  setView: (v: View) => void
  plan: Plan
  setPlan: (p: Plan) => void
  sidebarOpen: boolean
  setSidebarOpen: (o: boolean) => void
}

const AppContext = createContext<AppState>({} as AppState)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<View>("estadisticas")
  const [plan, setPlan] = useState<Plan>("intermedio")

  // 👇 IMPORTANTE: iniciar cerrado evita bugs en iOS
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // 👇 sincroniza estado según tamaño de pantalla (desktop vs mobile)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")

    const sync = (e: MediaQueryList | MediaQueryListEvent) => {
      setSidebarOpen(e.matches)
    }

    sync(mq)
    mq.addEventListener("change", sync)

    return () => mq.removeEventListener("change", sync)
  }, [])

  return (
    <AppContext.Provider
      value={{
        view,
        setView,
        plan,
        setPlan,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)