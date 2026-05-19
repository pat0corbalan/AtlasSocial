"use client"

import { useEffect, useMemo, useState } from "react"
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
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/lib/store"

interface Relevamiento {
  _id: string
  calle: string
  numero: string
  barrio: string
  localidad: string
  adultos: string
  menores: string
  adultosMayores: string
  necesidades: string[]
  infraestructura: string[]
  voto: string
  condicionVivienda: string
  observaciones: string
  createdAt: string
  userId?: {
    nombre: string
    email: string
    role: "admin" | "encuestador"
  }
}

type SortKey =
  | "_id"
  | "domicilio"
  | "barrio"
  | "voto"
  | "createdAt"
  | "adultos"
  | "operador"
  | "alerta"

type SortDir = "asc" | "desc" | null

const alertaConfig = {
  alta: {
    label: "Alta",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    class: "text-red-600 bg-red-50 border-red-200",
  },
  media: {
    label: "Media",
    icon: <Clock className="w-3.5 h-3.5" />,
    class: "text-amber-600 bg-amber-50 border-amber-200",
  },
  baja: {
    label: "Normal",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    class: "text-green-600 bg-green-50 border-green-200",
  },
}

export function GestionDatos() {
  const { plan } = useApp()
  const [data, setData] = useState<Relevamiento[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [barrioFilter, setBarrioFilter] = useState("todos")
  const [operadorFilter, setOperadorFilter] = useState("todos")
  const [alertaFilter, setAlertaFilter] = useState("todos")
  const [sortKey, setSortKey] = useState<SortKey>("createdAt")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [page, setPage] = useState(1)

  const perPage = 8
  const canExport = plan !== "basico"

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const res = await fetch("/api/relevamientos")
      const json = await res.json()
      setData(json.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const barrios = useMemo(() => {
    return [...new Set(data.map((d) => d.barrio).filter(Boolean))].sort()
  }, [data])

  const operadores = useMemo(() => {
    return [...new Set(data.map((d) => d.userId?.nombre).filter(Boolean))].sort()
  }, [data])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(
        sortDir === "asc"
          ? "desc"
          : sortDir === "desc"
          ? null
          : "asc"
      )
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const getAlertaTipo = (necesidades: string[]) => {
    const total = necesidades?.length || 0
    if (total >= 3) return "alta"
    if (total >= 1) return "media"
    return "baja"
  }

  const filtered = useMemo(() => {
    let d = [...data]

    if (search) {
      const s = search.toLowerCase()
      d = d.filter((r) => {
        const domicilio = `${r.calle || ""} ${r.numero || ""}`.toLowerCase()
        return (
          domicilio.includes(s) ||
          r._id?.toLowerCase().includes(s) ||
          r.barrio?.toLowerCase().includes(s) ||
          r.userId?.nombre?.toLowerCase().includes(s)
        )
      })
    }

    if (barrioFilter !== "todos") {
      d = d.filter((r) => r.barrio === barrioFilter)
    }

    if (operadorFilter !== "todos") {
      d = d.filter((r) => r.userId?.nombre === operadorFilter)
    }

    if (alertaFilter !== "todos") {
      d = d.filter((r) => getAlertaTipo(r.necesidades) === alertaFilter)
    }

    if (sortDir) {
      d.sort((a, b) => {
        let av: string | number = ""
        let bv: string | number = ""

        if (sortKey === "domicilio") {
          av = `${a.calle || ""} ${a.numero || ""}`.toLowerCase()
          bv = `${b.calle || ""} ${b.numero || ""}`.toLowerCase()
        } else if (sortKey === "adultos") {
          av = Number(a.adultos || 0) + Number(a.menores || 0) + Number(a.adultosMayores || 0)
          bv = Number(b.adultos || 0) + Number(b.menores || 0) + Number(b.adultosMayores || 0)
        } else if (sortKey === "operador") {
          av = (a.userId?.nombre || "").toLowerCase()
          bv = (b.userId?.nombre || "").toLowerCase()
        } else if (sortKey === "alerta") {
          av = getAlertaTipo(a.necesidades)
          bv = getAlertaTipo(b.necesidades)
        } else if (sortKey === "createdAt") {
          av = new Date(a.createdAt).getTime()
          bv = new Date(b.createdAt).getTime()
        } else if (sortKey === "_id") {
          av = a._id
          bv = b._id
        } else {
          av = String((a as any)[sortKey] ?? "").toLowerCase()
          bv = String((b as any)[sortKey] ?? "").toLowerCase()
        }

        if (typeof av === "number" && typeof bv === "number") {
          return sortDir === "asc" ? av - bv : bv - av
        }

        return sortDir === "asc"
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av))
      })
    }

    return d
  }, [data, search, barrioFilter, operadorFilter, alertaFilter, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const handleExport = () => {
    if (!canExport) return

    const headers = [
      "ID",
      "Domicilio",
      "Barrio",
      "Localidad",
      "Adultos",
      "Menores",
      "Adultos Mayores",
      "Necesidades",
      "Infraestructura",
      "Voto",
      "Condición Vivienda",
      "Fecha",
      "Operador",
      "Alerta"
    ]

    const rows = filtered.map((r) => [
      r._id,
      `"${r.calle || ""} ${r.numero || ""}"`,
      `"${r.barrio || ""}"`,
      `"${r.localidad || ""}"`,
      r.adultos || "0",
      r.menores || "0",
      r.adultosMayores || "0",
      `"${r.necesidades?.join("; ") || ""}"`,
      `"${r.infraestructura?.join("; ") || ""}"`,
      `"${r.voto || ""}"`,
      `"${r.condicionVivienda || ""}"`,
      new Date(r.createdAt).toLocaleDateString(),
      `"${r.userId?.nombre || "Sin userId"}"`,
      getAlertaTipo(r.necesidades).toUpperCase()
    ])

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `censos_relevamiento_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleDelete(id: string) {
    const confirmar = confirm("¿Eliminar este relevamiento definitivo?")
    if (!confirmar) return

    try {
      const res = await fetch(`/api/relevamientos/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setData((prev) => prev.filter((r) => r._id !== id))
    } catch (error) {
      console.error(error)
      alert("Error al intentar eliminar el registro.")
    }
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col || !sortDir) return <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground/40" />
    return sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-primary" /> : <ChevronDown className="w-3.5 h-3.5 text-primary" />
  }

  const selectClass =
    "h-9 px-3 pr-7 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Gestión de Datos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} registros encontrados
          </p>
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
              placeholder="Buscar por domicilio, ID, barrio o encuestador..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />

            <select className={selectClass} value={barrioFilter} onChange={(e) => { setBarrioFilter(e.target.value); setPage(1) }}>
              <option value="todos">Todos los barrios</option>
              {barrios.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>

            <select className={selectClass} value={operadorFilter} onChange={(e) => { setOperadorFilter(e.target.value); setPage(1) }}>
              <option value="todos">Todos los operadores</option>
              {operadores.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>

            <select className={selectClass} value={alertaFilter} onChange={(e) => { setAlertaFilter(e.target.value); setPage(1) }}>
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
                  { key: "_id", label: "Id" },
                  { key: "domicilio", label: "Domicilio" },
                  { key: "barrio", label: "Barrio" },
                  { key: "adultos", label: "Familia" },
                  { key: "necesidades", label: "Necesidades" },
                  { key: "voto", label: "Intención" },
                  { key: "alerta", label: "Alerta" },
                  { key: "createdAt", label: "Fecha" },
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
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cargando relevamientos...
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No se encontraron registros con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                paginated.map((row) => {
                  const numA = Number(row.adultos || 0)
                  const numM = Number(row.menores || 0)
                  const numAM = Number(row.adultosMayores || 0)
                  const totalFamilia = numA + numM + numAM

                  const tipoAlerta = getAlertaTipo(row.necesidades)
                  const alerta = alertaConfig[tipoAlerta]

                  return (
                    <tr key={row._id} className="hover:bg-accent/40 transition-colors">
                      {/* 1. ID */}
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {row._id ? `...${row._id.slice(-6)}` : "—"}
                      </td>

                      {/* 2. Domicilio */}
                      <td className="px-4 py-3 font-medium text-foreground max-w-48 truncate">
                        {row.calle} {row.numero}
                      </td>

                      {/* 3. Barrio */}
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {row.barrio || "—"}
                      </td>

                      {/* 4. Familia */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-foreground">{totalFamilia}</span>
                        <span className="text-muted-foreground text-xs ml-1" title="Adultos / Menores / Adultos Mayores">
                          ({numA}A/{numM}M/{numAM}AM)
                        </span>
                      </td>

                      {/* 5. Necesidades */}
                      <td className="px-4 py-3 max-w-40">
                        <div className="flex flex-wrap gap-1">
                          {!row.necesidades || row.necesidades.length === 0 ? (
                            <span className="text-muted-foreground text-xs">—</span>
                          ) : (
                            <>
                              {row.necesidades.slice(0, 2).map((n) => (
                                <span key={n} className="inline-flex px-1.5 py-0.5 rounded bg-primary/10 text-primary capitalize text-xs font-medium">
                                  {n}
                                </span>
                              ))}
                              {row.necesidades.length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{row.necesidades.length - 2}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>

                      {/* 6. Intención (Voto) */}
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap capitalize text-xs">
                        {row.voto || "—"}
                      </td>

                      {/* 7. Alerta */}
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border", alerta.class)}>
                          {alerta.icon}
                          {alerta.label}
                        </span>
                      </td>

                      {/* 8. Fecha */}
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                        {new Date(row.createdAt).toLocaleDateString()}
                      </td>

                      {/* 9. Operador */}
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs font-medium">
                        {row.userId?.nombre}
                      </td>

                      {/* 10. Acciones */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground" title="Ver detalle">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(row._id)}
                            className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/30">
            <span className="text-xs text-muted-foreground">
              Página {page} de {totalPages} — {filtered.length} registros
            </span>

            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                    page === i + 1
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-accent"
                  )}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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