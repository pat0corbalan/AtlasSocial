"use client"

import { useApp } from "@/lib/store"
import { Sidebar, SidebarToggle } from "./Sidebar"
import { Formulario } from "./Formulario"
import { Estadisticas } from "./Estadisticas"
import { GestionDatos } from "./GestionDatos"
import { Configuracion } from "./Configuracion"
import { Bell, Settings } from "lucide-react"

const viewTitles: Record<string, string> = {
  formulario: "Relevamiento de Campo",
  estadisticas: "Panel de Estadísticas",
  datos: "Gestión de Datos",
  configuracion: "Configuración del Sistema",
}

export function DashboardShell() {
  const { view, setView } = useApp()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 h-14 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-card shadow-sm">
          <div className="flex items-center gap-3">
            <SidebarToggle />
            <div>
              <h2 className="text-sm font-bold text-foreground leading-tight">{viewTitles[view]}</h2>
              <p className="text-xs text-muted-foreground hidden sm:block">Sistema de Relevamiento Territorial</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button className="relative p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            {/* Quick settings */}
            <button
              onClick={() => setView("configuracion")}
              className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
            >
              <Settings className="w-4 h-4" />
            </button>
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground cursor-pointer">
              OP
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 lg:px-6 py-6">
            {view === "formulario" && <Formulario />}
            {view === "estadisticas" && <Estadisticas />}
            {view === "datos" && <GestionDatos />}
            {view === "configuracion" && <Configuracion />}
          </div>
        </main>
      </div>
    </div>
  )
}
