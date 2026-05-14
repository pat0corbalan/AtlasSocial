"use client"

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

const necesidadesData = [
  { name: "Vivienda", value: 142, fill: "#3b82f6" },
  { name: "Salud", value: 98, fill: "#22c55e" },
  { name: "Educación", value: 87, fill: "#f59e0b" },
  { name: "Trabajo", value: 76, fill: "#ef4444" },
  { name: "Alimentación", value: 61, fill: "#8b5cf6" },
]

const votoData = [
  { name: "Oficialismo", value: 38, color: "#3b82f6" },
  { name: "Oposición Mod.", value: 22, color: "#64748b" },
  { name: "Oposición Dura", value: 18, color: "#ef4444" },
  { name: "Indeciso", value: 15, color: "#f59e0b" },
  { name: "No Vota", value: 7, color: "#94a3b8" },
]

const barriosData = [
  { barrio: "Villa del Carmen", censos: 54, completado: 72 },
  { barrio: "Mariano Moreno", censos: 41, completado: 55 },
  { barrio: "Ejercito Argentino", censos: 38, completado: 51 },
  { barrio: "Borges", censos: 29, completado: 39 },
  { barrio: "8 de Abril", censos: 26, completado: 35 },
]

const mapMarkers = [
  { x: 20, y: 30, label: "Villa del Carmen", color: "#3b82f6", count: 54 },
  { x: 40, y: 55, label: "Mariano Moreno", color: "#ef4444", count: 41 },
  { x: 65, y: 25, label: "Ejercito Argentino", color: "#3b82f6", count: 38 },
  { x: 75, y: 60, label: "Borges", color: "#f59e0b", count: 29 },
  { x: 55, y: 42, label: "8 de Abril", color: "#22c55e", count: 26 },
  { x: 30, y: 70, label: "Congreso", color: "#ef4444", count: 18 },
  { x: 82, y: 38, label: "Sarmiento", color: "#3b82f6", count: 22 },
]

interface KpiCardProps {
  label: string
  value: string
  sub: string
  icon: React.ReactNode
  variant?: "default" | "warning" | "success"
}

function KpiCard({ label, value, sub, icon, variant = "default" }: KpiCardProps) {
  return (
    <div className={cn(
      "bg-card border rounded-xl p-5 flex flex-col gap-3 shadow-sm",
      variant === "warning" ? "border-amber-200" : "border-border",
      variant === "success" ? "border-green-200" : ""
    )}>
      <div className="flex items-start justify-between">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center",
          variant === "warning" ? "bg-amber-50 text-amber-600" :
          variant === "success" ? "bg-green-50 text-green-600" :
          "bg-primary/10 text-primary"
        )}>
          {icon}
        </div>
        <span className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
          variant === "warning" ? "bg-amber-50 text-amber-600" :
          variant === "success" ? "bg-green-50 text-green-600" :
          "bg-primary/10 text-primary"
        )}>
          {sub}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export function Estadisticas() {
  const { plan } = useApp()
  const isAdvanced = plan === "avanzado"
  const isLimited = plan === "basico"

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Panel de Estadísticas</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Resumen analítico del relevamiento territorial</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total de censos" value="396" sub="+24 hoy" icon={<ClipboardList className="w-4 h-4" />} />
        <KpiCard label="Alertas críticas" value="47" sub="Necesidad alta" icon={<AlertTriangle className="w-4 h-4" />} variant="warning" />
        <KpiCard label="Barrios cubiertos" value="12/18" sub="67% completado" icon={<MapPin className="w-4 h-4" />} />
        <KpiCard label="Familias censadas" value="1.240" sub="Esta semana" icon={<Users className="w-4 h-4" />} variant="success" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart - Necesidades */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-foreground">Necesidades más frecuentes</h2>
              <p className="text-xs text-muted-foreground">Acumulado relevamientos activos</p>
            </div>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={necesidadesData} barSize={32} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: "#64748b" }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: "#64748b" }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {necesidadesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart - Intención de Voto */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="mb-6">
            <h2 className="text-sm font-bold text-foreground">Intención de Voto</h2>
            <p className="text-xs text-muted-foreground">Distribución porcentual</p>
          </div>
          
          <div className="h-[250px] w-full">
            {isLimited ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 bg-accent/30 rounded-lg border border-dashed border-border">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
                <p className="text-[11px] font-bold text-muted-foreground px-4 text-center uppercase tracking-tight">Módulo Bloqueado</p>
                <p className="text-[10px] text-center text-muted-foreground px-4">Requiere Plan Intermedio</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
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
                    {votoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                    formatter={(value: number) => [`${value}%`, "Intención"]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Map + Barrios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Mapa de Cobertura Territorial</h2>
              <p className="text-xs text-muted-foreground">Marcadores por intención de voto</p>
            </div>
            <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
              {[
                { color: "#3b82f6", label: "Ofic." },
                { color: "#ef4444", label: "Opos." },
                { color: "#f59e0b", label: "Indec." },
                { color: "#22c55e", label: "Favor" },
              ].map(({ color, label }) => (
                <span key={label} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
          
          <div className="relative w-full h-72 bg-accent/40 rounded-lg overflow-hidden border border-border">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {Array.from({ length: 10 }).map((_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="#e2e8f0" strokeWidth="0.2" />
              ))}
              {Array.from({ length: 10 }).map((_, i) => (
                <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="#e2e8f0" strokeWidth="0.2" />
              ))}
              <path d="M0,50 Q30,40 50,50 T100,45" stroke="#94a3b8" strokeWidth="0.5" fill="none" opacity="0.3" />
              <path d="M20,0 Q25,30 30,50 T35,100" stroke="#94a3b8" strokeWidth="0.5" fill="none" opacity="0.3" />
            </svg>
            
            {mapMarkers.map((m, i) => (
              <div
                key={i}
                className="absolute flex flex-col items-center group pointer-events-auto"
                style={{ left: `${m.x}%`, top: `${m.y}%`, transform: "translate(-50%, -100%)" }}
              >
                <div
                  className="w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-[8px] font-bold cursor-pointer hover:scale-125 transition-transform"
                  style={{ background: m.color }}
                >
                  {m.count > 40 ? "!" : ""}
                </div>
                <div className="hidden group-hover:block absolute bottom-7 bg-foreground text-background text-[10px] px-2 py-1 rounded-md whitespace-nowrap z-50 font-bold shadow-xl">
                  {m.label}: {m.count} censos
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="mb-6">
            <h2 className="text-sm font-bold text-foreground">Progreso por Barrio</h2>
            <p className="text-xs text-muted-foreground">Censos / Objetivo</p>
          </div>
          <div className="space-y-4">
            {barriosData.map((b) => {
              const pct = Math.round((b.censos / b.completado) * 100)
              return (
                <div key={b.barrio}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-foreground truncate max-w-[120px]">{b.barrio}</span>
                    <span className="text-[10px] font-bold text-muted-foreground bg-accent px-1.5 py-0.5 rounded">{b.censos}/{b.completado}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${pct}%`,
                        background: pct >= 80 ? "#22c55e" : pct >= 60 ? "#3b82f6" : "#f59e0b",
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
                <span>IA Predictiva Activa</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}