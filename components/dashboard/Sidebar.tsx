"use client"

import { useApp, View } from "@/lib/store"
import {
  ClipboardList,
  BarChart3,
  Database,
  Settings,
  MapPin,
  Menu,
  X,
  ChevronRight,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems: { id: View; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: "formulario",
    label: "Relevamiento",
    icon: <ClipboardList className="w-5 h-5" />,
    description: "Formulario de campo",
  },
  {
    id: "estadisticas",
    label: "Estadísticas",
    icon: <BarChart3 className="w-5 h-5" />,
    description: "Panel analítico",
  },
  {
    id: "datos",
    label: "Gestión de Datos",
    icon: <Database className="w-5 h-5" />,
    description: "Tabla y exportación",
  },
  {
    id: "configuracion",
    label: "Configuración",
    icon: <Settings className="w-5 h-5" />,
    description: "Planes y ajustes",
  },
]

const planLabels: Record<string, { label: string; color: string }> = {
  basico: { label: "Plan Básico", color: "bg-muted-foreground/30 text-sidebar-foreground" },
  intermedio: { label: "Plan Intermedio", color: "bg-primary/20 text-primary" },
  avanzado: { label: "Plan Avanzado", color: "bg-success/20 text-green-400" },
}

export function Sidebar() {
  const { view, setView, plan, sidebarOpen, setSidebarOpen } = useApp()
  const planInfo = planLabels[plan]

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-30 flex flex-col transition-transform duration-300 ease-in-out",
          "bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
          "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static lg:z-auto"
        )}
      >
        {/* Logo / Header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <MapPin className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-sidebar-foreground leading-tight truncate">CensoBarrial</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">Relevamiento Territorial</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-sidebar-foreground/50 hover:text-sidebar-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Plan Badge */}
        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", planInfo.color)}>
            <Shield className="w-3 h-3" />
            {planInfo.label}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            Módulos
          </p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id)
                setSidebarOpen(false)
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                view === item.id
                  ? "bg-sidebar-accent text-sidebar-foreground font-semibold"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <span className={cn(
                "flex-shrink-0",
                view === item.id ? "text-primary" : "text-sidebar-foreground/50"
              )}>
                {item.icon}
              </span>
              <div className="flex-1 text-left min-w-0">
                <p className="truncate">{item.label}</p>
                <p className="text-xs text-sidebar-foreground/40 truncate font-normal">{item.description}</p>
              </div>
              {view === item.id && (
                <ChevronRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-bold text-sidebar-foreground">
              OP
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">Operador Campo</p>
              <p className="text-xs text-sidebar-foreground/40 truncate">Zona Norte</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export function SidebarToggle() {
  const { setSidebarOpen, sidebarOpen } = useApp()
  return (
    <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      className="lg:hidden p-2 rounded-lg hover:bg-accent text-foreground"
    >
      <Menu className="w-5 h-5" />
    </button>
  )
}
