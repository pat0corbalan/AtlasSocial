"use client"

import { useEffect, useState } from "react"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts"

import {
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Users,
  CheckCircle,
} from "lucide-react"

import { useApp } from "@/lib/store"
import { cn } from "@/lib/utils"



// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface Relevamiento {
  _id: string

  barrio: string

  voto: string

  necesidades: string[]

  createdAt: string
}



// ─────────────────────────────────────────────────────────────
// KPI CARD
// ─────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string
  sub: string
  icon: React.ReactNode
  variant?: "default" | "warning" | "success"
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  variant = "default",
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "bg-card border rounded-xl p-5 flex flex-col gap-3 shadow-sm",

        variant === "warning"
          ? "border-amber-200"
          : "border-border",

        variant === "success"
          ? "border-green-200"
          : ""
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center",

            variant === "warning"
              ? "bg-amber-50 text-amber-600"
              : variant === "success"
              ? "bg-green-50 text-green-600"
              : "bg-primary/10 text-primary"
          )}
        >
          {icon}
        </div>

        <span
          className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",

            variant === "warning"
              ? "bg-amber-50 text-amber-600"
              : variant === "success"
              ? "bg-green-50 text-green-600"
              : "bg-primary/10 text-primary"
          )}
        >
          {sub}
        </span>
      </div>

      <div>
        <p className="text-2xl font-bold text-foreground">
          {value}
        </p>

        <p className="text-sm text-muted-foreground mt-0.5">
          {label}
        </p>
      </div>
    </div>
  )
}



// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

export function Estadisticas() {
  const { plan } = useApp()

  const isAdvanced = plan === "avanzado"

  const isLimited = plan === "basico"



  const [loading, setLoading] = useState(true)

  const [relevamientos, setRelevamientos] =
    useState<Relevamiento[]>([])



  // ─────────────────────────────────────────────────────────────
  // FETCH
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          "/api/relevamientos"
        )

        const data = await response.json()
        console.log("API RESPONSE:", data)
        setRelevamientos(data.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])



  // ─────────────────────────────────────────────────────────────
  // KPI
  // ─────────────────────────────────────────────────────────────

  const totalCensos = relevamientos.length

  const totalFamilias = relevamientos.length

  const barriosUnicos = [
    ...new Set(
      relevamientos
        .map((r) => r.barrio)
        .filter(Boolean)
    ),
  ]



  // ─────────────────────────────────────────────────────────────
  // NECESIDADES
  // ─────────────────────────────────────────────────────────────

  const necesidadesCount: Record<
    string,
    number
  > = {}

  relevamientos.forEach((r) => {
    r.necesidades?.forEach((n) => {
      necesidadesCount[n] =
        (necesidadesCount[n] || 0) + 1
    })
  })

  const necesidadesColors: Record<
    string,
    string
  > = {
    vivienda: "#3b82f6",
    salud: "#22c55e",
    educacion: "#f59e0b",
    trabajo: "#ef4444",
    alimentacion: "#8b5cf6",
  }

  const necesidadesData = Object.entries(
    necesidadesCount
  ).map(([name, value]) => ({
    name:
      name.charAt(0).toUpperCase() +
      name.slice(1),

    value,

    fill:
      necesidadesColors[name] ||
      "#64748b",
  }))



  // ─────────────────────────────────────────────────────────────
  // VOTO
  // ─────────────────────────────────────────────────────────────

  const votoCount: Record<string, number> = {}

  relevamientos.forEach((r) => {
    if (!r.voto) return

    votoCount[r.voto] =
      (votoCount[r.voto] || 0) + 1
  })

  const votoLabels: Record<string, string> = {
    oficialismo: "Oficialismo",

    oposicion_moderada:
      "Oposición Mod.",

    oposicion_dura:
      "Oposición Dura",

    indeciso: "Indeciso",

    no_vota: "No Vota",
  }

  const votoColors: Record<string, string> =
    {
      oficialismo: "#3b82f6",

      oposicion_moderada:
        "#64748b",

      oposicion_dura: "#ef4444",

      indeciso: "#f59e0b",

      no_vota: "#94a3b8",
    }

  const votoData = Object.entries(votoCount).map(
    ([key, value]) => ({
      name: votoLabels[key] || key,

      value,

      color:
        votoColors[key] || "#64748b",
    })
  )



  // ─────────────────────────────────────────────────────────────
  // BARRIOS
  // ─────────────────────────────────────────────────────────────

  const barriosMap: Record<string, number> =
    {}

  relevamientos.forEach((r) => {
    if (!r.barrio) return

    barriosMap[r.barrio] =
      (barriosMap[r.barrio] || 0) + 1
  })

  const barriosData = Object.entries(
    barriosMap
  )
    .map(([barrio, censos]) => ({
      barrio,

      censos,

      completado: censos + 10,
    }))
    .sort((a, b) => b.censos - a.censos)



  // ─────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-sm text-muted-foreground">
          Cargando estadísticas...
        </p>
      </div>
    )
  }



  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">
          Panel de Estadísticas
        </h1>

        <p className="text-sm text-muted-foreground mt-0.5">
          Resumen analítico del relevamiento territorial
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total de censos"
          value={String(totalCensos)}
          sub="Base general"
          icon={
            <ClipboardList className="w-4 h-4" />
          }
        />

        <KpiCard
          label="Barrios cubiertos"
          value={String(barriosUnicos.length)}
          sub="Con actividad"
          icon={<MapPin className="w-4 h-4" />}
        />

        <KpiCard
          label="Familias censadas"
          value={String(totalFamilias)}
          sub="Relevamientos"
          icon={<Users className="w-4 h-4" />}
          variant="success"
        />

        <KpiCard
          label="Necesidades detectadas"
          value={String(
            Object.values(
              necesidadesCount
            ).reduce((a, b) => a + b, 0)
          )}
          sub="Sociales"
          icon={
            <AlertTriangle className="w-4 h-4" />
          }
          variant="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* BAR */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Necesidades más frecuentes
              </h2>

              <p className="text-xs text-muted-foreground">
                Datos reales desde MongoDB
              </p>
            </div>

            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={necesidadesData}
                barSize={32}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip />

                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                >
                  {necesidadesData.map(
                    (entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.fill}
                      />
                    )
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="mb-6">
            <h2 className="text-sm font-bold text-foreground">
              Intención de Voto
            </h2>

            <p className="text-xs text-muted-foreground">
              Distribución real
            </p>
          </div>

          <div className="h-[250px] w-full">
            {isLimited ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 bg-accent/30 rounded-lg border border-dashed border-border">
                <AlertTriangle className="w-8 h-8 text-amber-500" />

                <p className="text-[11px] font-bold text-muted-foreground">
                  Módulo Bloqueado
                </p>
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={votoData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {votoData.map(
                      (entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.color}
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* BARRIOS */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="mb-6">
          <h2 className="text-sm font-bold text-foreground">
            Progreso por Barrio
          </h2>

          <p className="text-xs text-muted-foreground">
            Relevamientos registrados
          </p>
        </div>

        <div className="space-y-4">
          {barriosData.map((b) => {
            const pct = Math.round(
              (b.censos / b.completado) * 100
            )

            return (
              <div key={b.barrio}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-foreground truncate">
                    {b.barrio}
                  </span>

                  <span className="text-[10px] font-bold text-muted-foreground bg-accent px-1.5 py-0.5 rounded">
                    {b.censos}
                  </span>
                </div>

                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out bg-primary"
                    style={{
                      width: `${pct}%`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {isAdvanced && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-[10px] text-green-600 font-bold uppercase tracking-widest">
              <CheckCircle className="w-3 h-3" />

              <span>
                IA Predictiva Activa
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}