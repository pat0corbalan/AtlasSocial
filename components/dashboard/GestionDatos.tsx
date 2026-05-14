"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Filter,
  Download,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/lib/store"

interface CensoRecord {
  id: string
  domicilio: string
  barrio: string
  adultos: number
  menores: number
  necesidades: string[]
  voto: string
  infraestructura: string[]
  fecha: string
  operador: string
  alerta: "alta" | "media" | "baja"
}

const mockData: CensoRecord[] = [
  { id: "CEN-001", domicilio: "Av. San Martín 1234", barrio: "Villa del Carmen", adultos: 3, menores: 2, necesidades: ["Vivienda", "Salud"], voto: "Oficialismo", infraestructura: ["Agua", "Luz"], fecha: "2024-06-01", operador: "J. Rodríguez", alerta: "alta" },
  { id: "CEN-002", domicilio: "Calle 15 Nº 456", barrio: "Mariano", adultos: 2, menores: 1, necesidades: ["Educación"], voto: "Indeciso", infraestructura: ["Agua", "Gas", "Luz"], fecha: "2024-06-01", operador: "M. López", alerta: "baja" },
  { id: "CEN-003", domicilio: "Urquiza 789", barrio: "Ejercito Argentino", adultos: 4, menores: 3, necesidades: ["Vivienda", "Trabajo", "Alimentación"], voto: "Oposición Dura", infraestructura: [], fecha: "2024-06-02", operador: "L. García", alerta: "alta" },
  { id: "CEN-004", domicilio: "Italia 321", barrio: "Borges", adultos: 2, menores: 0, necesidades: ["Salud"], voto: "Oposición Mod.", infraestructura: ["Agua", "Gas", "Luz", "Cloacas"], fecha: "2024-06-02", operador: "J. Rodríguez", alerta: "media" },
  { id: "CEN-005", domicilio: "Río de Janeiro 555", barrio: "Flores", adultos: 1, menores: 2, necesidades: ["Educación", "Alimentación"], voto: "Indeciso", infraestructura: ["Agua", "Luz"], fecha: "2024-06-03", operador: "M. López", alerta: "media" },
  { id: "CEN-006", domicilio: "Lacarra 67", barrio: "8 de Abril", adultos: 5, menores: 4, necesidades: ["Vivienda", "Salud", "Trabajo"], voto: "No Vota", infraestructura: ["Luz"], fecha: "2024-06-03", operador: "L. García", alerta: "alta" },
  { id: "CEN-007", domicilio: "Av. Eva Perón 1100", barrio: "Congreso", adultos: 2, menores: 2, necesidades: ["Trabajo"], voto: "Oficialismo", infraestructura: ["Agua", "Gas", "Luz", "Cloacas"], fecha: "2024-06-04", operador: "J. Rodríguez", alerta: "baja" },
  { id: "CEN-008", domicilio: "Escalada 234", barrio: "Sarmiento", adultos: 3, menores: 1, necesidades: ["Salud", "Vivienda"], voto: "Oposición Mod.", infraestructura: ["Agua", "Luz"], fecha: "2024-06-04", operador: "M. López", alerta: "media" },
  { id: "CEN-009", domicilio: "Fonrouge 890", barrio: "Flores", adultos: 2, menores: 3, necesidades: ["Educación", "Salud"], voto: "Indeciso", infraestructura: ["Gas", "Luz"], fecha: "2024-06-05", operador: "L. García", alerta: "media" },
  { id: "CEN-010", domicilio: "Nazca 445", barrio: "Flores", adultos: 4, menores: 0, necesidades: ["Trabajo"], voto: "Oficialismo", infraestructura: ["Agua", "Gas", "Luz", "Cloacas"], fecha: "2024-06-05", operador: "J. Rodríguez", alerta: "baja" },
  { id: "CEN-011", domicilio: "Varela 123", barrio: "Ejercito Argentino", adultos: 3, menores: 2, necesidades: ["Vivienda"], voto: "Oposición Dura", infraestructura: ["Agua", "Luz"], fecha: "2024-06-06", operador: "M. López", alerta: "alta" },
  { id: "CEN-012", domicilio: "Av. Rivadavia 6700", barrio: "Villa del Carmen", adultos: 2, menores: 1, necesidades: [], voto: "Oficialismo", infraestructura: ["Agua", "Gas", "Luz", "Cloacas"], fecha: "2024-06-06", operador: "L. García", alerta: "baja" },
]

const barrios = [...new Set(mockData.map(d => d.barrio))]
const operadores = [...new Set(mockData.map(d => d.operador))]

type SortKey = keyof CensoRecord
type SortDir = "asc" | "desc" | null

const alertaConfig = {
  alta: { label: "Alta", icon: <AlertTriangle className="w-3.5 h-3.5" />, class: "text-red-600 bg-red-50 border-red-200" },
  media: { label: "Media", icon: <Clock className="w-3.5 h-3.5" />, class: "text-amber-600 bg-amber-50 border-amber-200" },
  baja: { label: "Normal", icon: <CheckCircle className="w-3.5 h-3.5" />, class: "text-green-600 bg-green-50 border-green-200" },
}

export function GestionDatos() {
  const { plan } = useApp()
  const [search, setSearch] = useState("")
  const [barrioFilter, setBarrioFilter] = useState("todos")
  const [operadorFilter, setOperadorFilter] = useState("todos")
  const [alertaFilter, setAlertaFilter] = useState("todos")
  const [sortKey, setSortKey] = useState<SortKey>("fecha")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [page, setPage] = useState(1)
  const perPage = 8

  const canExport = plan !== "basico"

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const filtered = useMemo(() => {
    let d = mockData
    if (search) d = d.filter(r => r.domicilio.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()) || r.operador.toLowerCase().includes(search.toLowerCase()))
    if (barrioFilter !== "todos") d = d.filter(r => r.barrio === barrioFilter)
    if (operadorFilter !== "todos") d = d.filter(r => r.operador === operadorFilter)
    if (alertaFilter !== "todos") d = d.filter(r => r.alerta === alertaFilter)
    if (sortDir) {
      d = [...d].sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey]
        const cmp = String(av).localeCompare(String(bv))
        return sortDir === "asc" ? cmp : -cmp
      })
    }
    return d
  }, [search, barrioFilter, operadorFilter, alertaFilter, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const handleExport = () => {
    const headers = ["ID", "Domicilio", "Barrio", "Adultos", "Menores", "Necesidades", "Voto", "Infraestructura", "Fecha", "Operador", "Alerta"]
    const rows = filtered.map(r => [r.id, r.domicilio, r.barrio, r.adultos, r.menores, r.necesidades.join("; "), r.voto, r.infraestructura.join("; "), r.fecha, r.operador, r.alerta])
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `censos_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col || !sortDir) return <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground/40" />
    return sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-primary" /> : <ChevronDown className="w-3.5 h-3.5 text-primary" />
  }

  const selectClass = "h-9 px-3 pr-7 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Gestión de Datos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} registros encontrados</p>
        </div>
        <button
          onClick={handleExport}
          disabled={!canExport}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
            canExport
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
          title={!canExport ? "Requiere Plan Intermedio o Avanzado" : "Exportar a CSV"}
        >
          <Download className="w-4 h-4" />
          Exportar CSV
          {!canExport && <span className="text-xs opacity-70 ml-0.5">(Bloqueado)</span>}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar por domicilio, ID u operador..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <select className={selectClass} value={barrioFilter} onChange={e => { setBarrioFilter(e.target.value); setPage(1) }}>
              <option value="todos">Todos los barrios</option>
              {barrios.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select className={selectClass} value={operadorFilter} onChange={e => { setOperadorFilter(e.target.value); setPage(1) }}>
              <option value="todos">Todos los operadores</option>
              {operadores.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <select className={selectClass} value={alertaFilter} onChange={e => { setAlertaFilter(e.target.value); setPage(1) }}>
              <option value="todos">Todas las alertas</option>
              <option value="alta">Alerta Alta</option>
              <option value="media">Alerta Media</option>
              <option value="baja">Normal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                {[
                  { key: "id", label: "ID" },
                  { key: "domicilio", label: "Domicilio" },
                  { key: "barrio", label: "Barrio" },
                  { key: "adultos", label: "Familia" },
                  { key: "necesidades", label: "Necesidades" },
                  { key: "voto", label: "Intención" },
                  { key: "alerta", label: "Alerta" },
                  { key: "fecha", label: "Fecha" },
                  { key: "operador", label: "Operador" },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key as SortKey)}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      <SortIcon col={key as SortKey} />
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No se encontraron registros con los filtros aplicados.
                  </td>
                </tr>
              ) : paginated.map((row) => {
                const alerta = alertaConfig[row.alerta]
                return (
                  <tr key={row.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{row.id}</td>
                    <td className="px-4 py-3 font-medium text-foreground max-w-48 truncate">{row.domicilio}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{row.barrio}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-foreground">{row.adultos + row.menores}</span>
                      <span className="text-muted-foreground text-xs ml-1">({row.adultos}A/{row.menores}M)</span>
                    </td>
                    <td className="px-4 py-3 max-w-40">
                      <div className="flex flex-wrap gap-1">
                        {row.necesidades.length === 0 ? (
                          <span className="text-muted-foreground text-xs">—</span>
                        ) : row.necesidades.slice(0, 2).map(n => (
                          <span key={n} className="inline-flex px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">{n}</span>
                        ))}
                        {row.necesidades.length > 2 && (
                          <span className="text-xs text-muted-foreground">+{row.necesidades.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{row.voto}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border", alerta.class)}>
                        {alerta.icon}
                        {alerta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{row.fecha}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{row.operador}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground" title="Ver detalle">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive" title="Eliminar">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/30">
            <span className="text-xs text-muted-foreground">
              Página {page} de {totalPages} — {filtered.length} registros
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-border disabled:opacity-40 hover:bg-accent transition-colors"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-lg border transition-colors",
                    page === i + 1 ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs rounded-lg border border-border disabled:opacity-40 hover:bg-accent transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
