// components/dashboard/gestion-datos/components/RelevamientosView.tsx

import { useMemo, useState } from "react"
import { Search, Filter, ChevronUp, ChevronDown, ChevronsUpDown, Loader2, Eye, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Relevamiento, SortKey, SortDir } from "../types"
import { ALERTA_CONFIG, SELECT_CLASS } from "../constants"

interface RelevamientosViewProps {
  data: Relevamiento[]
  loading: boolean
  onDelete: (id: string) => Promise<void>
}

export function RelevamientosView({ data, loading, onDelete }: RelevamientosViewProps) {
  const [search, setSearch] = useState("")
  const [barrioFilter, setBarrioFilter] = useState("todos")
  const [operadorFilter, setOperadorFilter] = useState("todos")
  const [alertaFilter, setAlertaFilter] = useState("todos")
  const [sortKey, setSortKey] = useState<SortKey>("createdAt")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [page, setPage] = useState(1)

  const perPage = 8

  const barrios = useMemo(() => {
    return [...new Set(data.map((d) => d.barrio).filter(Boolean))].sort()
  }, [data])

  const operadores = useMemo(() => {
    return [...new Set(data.map((d) => d.userId?.nombre).filter(Boolean))].sort()
  }, [data])

  const getAlertaTipo = (necesidades: string[]) => {
    const total = necesidades?.length || 0
    if (total >= 3) return "alta"
    if (total >= 1) return "media"
    return "baja"
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
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

    if (barrioFilter !== "todos") d = d.filter((r) => r.barrio === barrioFilter)
    if (operadorFilter !== "todos") d = d.filter((r) => r.userId?.nombre === operadorFilter)
    if (alertaFilter !== "todos") d = d.filter((r) => getAlertaTipo(r.necesidades) === alertaFilter)

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

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col || !sortDir) return <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground/40" />
    return sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-primary" /> : <ChevronDown className="w-3.5 h-3.5 text-primary" />
  }

  return (
    <>
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
            <select className={SELECT_CLASS} value={barrioFilter} onChange={(e) => { setBarrioFilter(e.target.value); setPage(1) }}>
              <option value="todos">Todos los barrios</option>
              {barrios.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>

            <select className={SELECT_CLASS} value={operadorFilter} onChange={(e) => { setOperadorFilter(e.target.value); setPage(1) }}>
              <option value="todos">Todos los operadores</option>
              {operadores.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>

            <select className={SELECT_CLASS} value={alertaFilter} onChange={(e) => { setAlertaFilter(e.target.value); setPage(1) }}>
              <option value="todos">Todas las alertas</option>
              <option value="alta">Alerta Alta</option>
              <option value="media">Alerta Media</option>
              <option value="baja">Normal</option>
            </select>
          </div>
        </div>
      </div>

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
                  <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />Cargando relevamientos...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
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
                  const alerta = ALERTA_CONFIG[tipoAlerta]

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
                          <button onClick={() => onDelete(row._id)} className="p-1.5 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/30">
            <span className="text-xs text-muted-foreground">Página {page} de {totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs rounded-lg border border-border disabled:opacity-40 hover:bg-accent bg-background">Anterior</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs rounded-lg border border-border disabled:opacity-40 hover:bg-accent bg-background">Siguiente</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}