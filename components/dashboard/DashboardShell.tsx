"use client"

import { useEffect, useState } from "react"

import { useApp } from "@/lib/store"

import { Sidebar, SidebarToggle } from "./Sidebar"

import { Formulario } from "./Formulario"
import { Estadisticas } from "./Estadisticas"
import { GestionDatos } from "./GestionDatos"
import { Configuracion } from "./Configuracion"
import { Usuarios } from "./Usuarios"

import { logout } from "@/lib/logout"

import {
  Bell,
  Settings,
} from "lucide-react"

const viewTitles: Record<string, string> = {
  formulario: "Relevamiento de Campo",
  estadisticas: "Panel de Estadísticas",
  datos: "Gestión de Datos",
  usuarios: "Gestion de Usuarios",
  configuracion: "Configuración del Sistema",
}

interface User {
  _id: string
  nombre: string
  email: string
  role: "admin" | "encuestador"
}

export function DashboardShell() {
  const { view, setView } = useApp()

  const [user, setUser] = useState<User | null>(null)

  const [loadingUser, setLoadingUser] = useState(true)

  // ─────────────────────────────────────────────────────────────
  // Obtener usuario logueado
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/me")

        const data = await response.json()

        if (data.ok) {
          setUser(data.user)
        } else {
          window.location.href = "/login"
        }
      } catch (error) {
        console.error(error)

        window.location.href = "/login"
      } finally {
        setLoadingUser(false)
      }
    }

    fetchUser()
  }, [])

  // ─────────────────────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────────────────────

  if (loadingUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">
          Cargando sistema...
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 h-14 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-card shadow-sm">
          {/* Left */}
          <div className="flex items-center gap-3">
            <SidebarToggle />

            <div>
              <h2 className="text-sm font-bold text-foreground leading-tight">
                {viewTitles[view]}
              </h2>

              <p className="text-xs text-muted-foreground hidden sm:block">
                Sistema de Relevamiento Territorial
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground">
              <Bell className="w-4 h-4" />

              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Settings */}
            <button
              onClick={() => setView("configuracion")}
              className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User */}
            <div className="flex items-center gap-3 ml-2">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold text-foreground">
                  {user?.nombre || "Usuario"}
                </span>

                <span className="text-[11px] text-muted-foreground capitalize">
                  {user?.role}
                </span>
              </div>

              {/* Avatar */}
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground hover:opacity-90 transition"
              >
                {user?.nombre?.charAt(0).toUpperCase() || "U"}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 lg:px-6 py-6">
            {/* FORMULARIO */}
            {view === "formulario" && (
              <Formulario />
            )}

            {/* ESTADISTICAS */}
            {view === "estadisticas" &&
              user?.role === "admin" && (
                <Estadisticas />
              )}

            {/* GESTION DATOS */}
            {view === "datos" &&
              user?.role === "admin" && (
                <GestionDatos />
              )}

            {/* GESTION DE USUARIOS */}
            {view === "usuarios" &&
              user?.role === "admin" && (
                <Usuarios />
              )}

            {/* CONFIGURACION */}
            {view === "configuracion" && 
              user?.role === "admin" && (
              <Configuracion />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}