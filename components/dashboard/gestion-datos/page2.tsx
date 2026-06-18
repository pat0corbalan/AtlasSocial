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
  Upload,
  UserCheck,
  Database,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/lib/store"

// Interfaces del sistema de Relevamientos
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

// Interface para reflejar los datos del Padrón Electoral CNE importado
interface Elector {
  _id: string
  distrito: string
  seccion: string
  circuito: string
  mesa: string
  nOrden: number
  apellidoNombre: string
  domicilio: string
  documento: {
    nro: number
    tipo: string
  }
  anioNacimiento: number
  voto: boolean
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
  
  // Control de Vistas / Pestañas
  const [activeTab, setActiveTab] = useState<"relevamientos" | "padron">("relevamientos")

  // Estados - Relevamientos
  const [data, setData] = useState<Relevamiento[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [barrioFilter, setBarrioFilter] = useState("todos")
  const [operadorFilter, setOperadorFilter] = useState("todos")
  const [alertaFilter, setAlertaFilter] = useState("todos")
  const [sortKey, setSortKey] = useState<SortKey>("createdAt")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [page, setPage] = useState(1)

  // Estados - Padrón Electoral (Paginación + Filtros de servidor por volumen de datos)
  const [electores, setElectores] = useState<Elector[]>([])
  const [loadingPadron, setLoadingPadron] = useState(false)
  const [padronSearch, setPadronSearch] = useState("")
  const [padronPage, setPadronPage] = useState(1)
  const [padronTotalPages, setPadronTotalPages] = useState(1)
  const [padronTotalRecords, setPadronTotalRecords] = useState(0)
  const [electorSeleccionado, setElectorSeleccionado] = useState<Elector | null>(null)

  const [importing, setImporting] = useState(false)

  const perPage = 8
  const canExport = plan !== "basico"

  useEffect(() => {
    fetchData()
  }, [])

  // Hook para controlar la búsqueda reactiva del padrón sin saturar llamadas
  useEffect(() => {
    if (activeTab === "padron") {
      const delayDebounce = setTimeout(() => {
        fetchPadronData(padronPage, padronSearch)
      }, 350)
      return () => clearTimeout(delayDebounce)
    }
  }, [padronPage, padronSearch, activeTab])

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

  async function fetchPadronData(pageNumber: number, querySearch: string) {
    try {
      setLoadingPadron(true)
      // Pasamos los filtros por query params a tu endpoint GET de electores
      const res = await fetch(`/api/padron?page=${pageNumber}&limit=10&search=${encodeURIComponent(querySearch)}`)
      const json = await res.json()
      
      setElectores(json.data?.electores || [])
      setPadronTotalPages(json.data?.totalPages || 1)
      setPadronTotalRecords(json.data?.total || 0)
    } catch (error) {
      console.error("Error fetching padron:", error)
    } finally {
      setLoadingPadron(false)
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

  // Filtrado en memoria (Solo Relevamientos)
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
      "ID", "Domicilio", "Barrio", "Localidad", "Adultos", "Menores",
      "Adultos Mayores", "Necesidades", "Infraestructura", "Voto",
      "Condición Vivienda", "Fecha", "Operador", "Alerta"
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
      `"${r.userId?.nombre || "Sin operador"}"`,
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

  async function handleImportPadron(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      setImporting(true)
      const res = await fetch("/api/padron", {
        method: "POST",
        body: formData,
      })

      const json = await res.json()

      if (!res.ok) throw new Error(json?.error || "Error al importar el padrón")

      alert(json?.data?.mensaje || `Importación finalizada. ${json?.data?.registrosProcesados ?? 0} registros cargados`)
      
      // Al finalizar con éxito, forzamos la vista al padrón y cargamos la primera hoja
      setActiveTab("padron")
      setPadronPage(1)
      await fetchPadronData(1, "")
    } catch (error: any) {
      console.error(error)
      alert(error?.message || "Error al importar el padrón")
    } finally {
      setImporting(false)
      if (event.target) event.target.value = ""
    }
  }

  return (
    <div className="space-y-5">
      {/* Header Superior */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Gestión de Datos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeTab === "relevamientos" 
              ? `${filtered.length} relevamientos encontrados` 
              : `${padronTotalRecords} ciudadanos en padrón`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <label
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-sm",
              importing ? "bg-muted text-muted-foreground" : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {importing ? "Importando PDF..." : "Importar Padrón PDF"}
            <input type="file" accept=".pdf" className="hidden" onChange={handleImportPadron} disabled={importing} />
          </label>

          {activeTab === "relevamientos" && (
            <button
              onClick={handleExport}
              disabled={!canExport}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                canExport ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
              title={!canExport ? "Requiere Plan Intermedio o Avanzado" : "Exportar a CSV"}
            >
              <Download className="w-4 h-4" />
              Exportar CSV
              {!canExport && <span className="text-xs opacity-70 ml-0.5">(Bloqueado)</span>}
            </button>
          )}
        </div>
      </div>

      {/* Selector de Pestañas (Tabs) */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab("relevamientos")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px",
            activeTab === "relevamientos" ? "border-primary text-primary font-semibold" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <UserCheck className="w-4 h-4" />
          Relevamientos en Territorio
        </button>
        <button
          onClick={() => {
            setActiveTab("padron")
            if (electores.length === 0) fetchPadronData(1, "")
          }}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px",
            activeTab === "padron" ? "border-primary text-primary font-semibold" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Database className="w-4 h-4" />
          Padrón Electoral CNE
        </button>
      </div>

      {/* VISTA 1: RELEVAMIENTOS */}
      {activeTab === "relevamientos" && (
        <>
          {/* Filters Relevamientos */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-48 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Buscar por domicilio, ID, barrio o encuestador..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
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

          {/* Tabla de Relevamientos */}
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Cargando relevamientos...</td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">No se encontraron registros con los filtros aplicados.</td>
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
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">...{row._id.slice(-6)}</td>
                          <td className="px-4 py-3 font-medium text-foreground max-w-48 truncate">{row.calle} {row.numero}</td>
                          <td className="px-4 py-3 text-muted-foreground">{row.barrio || "—"}</td>
                          <td className="px-4 py-3">
                            <span className="text-foreground">{totalFamilia}</span>
                            <span className="text-muted-foreground text-xs ml-1">({numA}A/{numM}M/{numAM}AM)</span>
                          </td>
                          <td className="px-4 py-3 max-w-40">
                            <div className="flex flex-wrap gap-1">
                              {row.necesidades?.slice(0, 2).map((n) => (
                                <span key={n} className="inline-flex px-1.5 py-0.5 rounded bg-primary/10 text-primary capitalize text-xs font-medium">{n}</span>
                              ))}
                              {row.necesidades?.length > 2 && <span className="text-xs text-muted-foreground">+{row.necesidades.length - 2}</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground capitalize text-xs">{row.voto || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border", alerta.class)}>
                              {alerta.icon} {alerta.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(row.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs font-medium">{row.userId?.nombre || "—"}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <button className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground"><Eye className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDelete(row._id)} className="p-1.5 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Relevamientos */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/30">
                <span className="text-xs text-muted-foreground">Página {page} de {totalPages}</span>
                <div className="flex gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs rounded-lg border border-border disabled:opacity-40 hover:bg-accent">Anterior</button>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs rounded-lg border border-border disabled:opacity-40 hover:bg-accent">Siguiente</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* VISTA 2: PADRÓN ELECTORAL NACIONAL */}
      {activeTab === "padron" && (
    <>
      {/* Barra de Búsqueda de Servidor */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar por nombre, apellido, DNI, mesa o N° orden..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            value={padronSearch}
            onChange={(e) => {
              setPadronSearch(e.target.value)
              setPadronPage(1)
            }}
          />
        </div>
      </div>

      {/* Tabla de Padrón Adaptativa */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-16">Orden</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Apellido y Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Documento</th>
                {/* Oculto en móviles (hidden), visible desde tablets (sm:table-cell) */}
                <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mesa</th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Circuito</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {loadingPadron ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2 text-blue-600" />
                    Buscando en el padrón...
                  </td>
                </tr>
              ) : electores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No se encontraron electores.
                  </td>
                </tr>
              ) : (
                electores.map((elector) => (
                  <tr key={elector._id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-3 py-3 font-mono text-xs font-bold text-blue-600">
                      {String(elector.nOrden).padStart(3, "0")}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground uppercase truncate max-w-[160px] sm:max-w-none">
                      {elector.apellidoNombre}
                    </td>
                    <td className="px-4 py-3 text-foreground font-medium whitespace-nowrap text-xs sm:text-sm">
                      {elector.documento.tipo} {elector.documento.nro.toLocaleString("es-AR")}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3">
                      <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded font-mono text-xs font-bold">
                        {elector.mesa}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-muted-foreground text-xs">
                      {elector.circuito}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setElectorSeleccionado(elector)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-secondary hover:bg-accent text-secondary-foreground rounded-md text-xs font-medium transition-colors"
                        title="Ver Ficha Completa"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Ver Ficha</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginador */}
        {!loadingPadron && padronTotalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/30">
            <span className="text-xs text-muted-foreground truncate max-w-[180px] sm:max-w-none">
              Pág. <strong>{padronPage}</strong> de {padronTotalPages} ({padronTotalRecords} ref)
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPadronPage((p) => Math.max(1, p - 1))}
                disabled={padronPage === 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-border disabled:opacity-40 hover:bg-accent bg-background"
              >
                Anterior
              </button>
              <button
                onClick={() => setPadronPage((p) => Math.min(padronTotalPages, p + 1))}
                disabled={padronPage === padronTotalPages}
                className="px-3 py-1.5 text-xs rounded-lg border border-border disabled:opacity-40 hover:bg-accent bg-background"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL / DIALOG DETALLE DEL ELECTOR */}
      {electorSeleccionado && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-background border border-border rounded-xl w-full max-w-md overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            {/* Cabecera */}
            <div className="bg-secondary p-4 border-b border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Ficha de Elector</span>
                <h3 className="text-sm font-mono font-bold text-blue-600">N° ORDEN: {String(electorSeleccionado.nOrden).padStart(3, "0")}</h3>
              </div>
              <button 
                onClick={() => setElectorSeleccionado(null)}
                className="text-xs px-2.5 py-1 rounded bg-background hover:bg-accent border border-border transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
            
            {/* Cuerpo de Datos */}
            <div className="p-5 space-y-4 text-sm">
              <div>
                <label className="text-xs text-muted-foreground block mb-0.5">Apellido y Nombre</label>
                <p className="font-bold text-foreground text-base uppercase">{electorSeleccionado.apellidoNombre}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-0.5">Documento</label>
                  <p className="font-semibold text-foreground">{electorSeleccionado.documento.tipo} {electorSeleccionado.documento.nro.toLocaleString("es-AR")}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-0.5">Año de Nacimiento</label>
                  <p className="font-semibold text-foreground font-mono">{electorSeleccionado.anioNacimiento || "—"}</p>
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <label className="text-xs text-muted-foreground block mb-0.5">Domicilio Registrado</label>
                <p className="text-foreground capitalize">{electorSeleccionado.domicilio?.toLowerCase() || "Sin especificar"}</p>
              </div>

              <div className="border-t border-border pt-3 grid grid-cols-3 gap-2 text-center">
                <div className="bg-secondary/50 p-2 rounded-lg border border-border">
                  <span className="text-[10px] text-muted-foreground block uppercase font-medium">Mesa</span>
                  <span className="font-mono font-bold text-foreground text-sm">{electorSeleccionado.mesa}</span>
                </div>
                <div className="bg-secondary/50 p-2 rounded-lg border border-border">
                  <span className="text-[10px] text-muted-foreground block uppercase font-medium">Circuito</span>
                  <span className="font-mono font-bold text-foreground text-sm">{electorSeleccionado.circuito}</span>
                </div>
                <div className="bg-secondary/50 p-2 rounded-lg border border-border">
                  <span className="text-[10px] text-muted-foreground block uppercase font-medium">Sección</span>
                  <span className="font-mono font-bold text-foreground text-xs truncate block">{electorSeleccionado.seccion}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )}
    </div>
  )
}