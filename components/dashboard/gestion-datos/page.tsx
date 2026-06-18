// components/dashboard/gestion-datos/page.tsx

"use client"

import React, { useEffect, useState } from "react"
import { Download, Loader2, Upload, UserCheck, Database } from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/lib/store"
import { Relevamiento, Elector } from "./types"
import { RelevamientosView } from "./components/RelevamientosView"
import { PadronView } from "./components/PadronView"

export function GestionDatos() {
  const { plan } = useApp()

  // Control de Vistas / Pestañas
  const [activeTab, setActiveTab] = useState<"relevamientos" | "padron">("relevamientos")

  // Estados estructurales globales
  const [data, setData] = useState<Relevamiento[]>([])
  const [loading, setLoading] = useState(true)

  const [electores, setElectores] = useState<Elector[]>([])
  const [loadingPadron, setLoadingPadron] = useState(false)
  const [padronSearch, setPadronSearch] = useState("")
  const [padronPage, setPadronPage] = useState(1)
  const [padronTotalPages, setPadronTotalPages] = useState(1)
  const [padronTotalRecords, setPadronTotalRecords] = useState(0)
  const [electorSeleccionado, setElectorSeleccionado] = useState<Elector | null>(null)

  const [importing, setImporting] = useState(false)

  const canExport = plan !== "basico"

  useEffect(() => {
    fetchData()
  }, [])

  // Debounce para llamadas del padrón CNE
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

  // Manejador para persistir el relevamiento enviado desde el panel lateral del Padrón
  const handleActualizarElector = async (formData: {
    electorId: string
    calle: string
    barrio: string
    lat: string
    lng: string
  }) => {
    try {
      const res = await fetch(
        `/api/padron/${formData.electorId}/territorio`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            calle: formData.calle,
            barrio: formData.barrio,

            geolocalizacion: {
              type: "Point",
              coordinates: [
                Number(formData.lng),
                Number(formData.lat),
              ],
            },

            visitado: true,
          }),
        }
      )

      const json = await res.json()

      if (!res.ok) {
        throw new Error(
          json?.error || "Error actualizando elector"
        )
      }

      setElectores((prev) =>
        prev.map((e) =>
          e._id === formData.electorId
            ? {
                ...e,
                visitado: true,
                barrio: formData.barrio,
              }
            : e
        )
      )

      alert("Elector actualizado correctamente.")
    } catch (error: any) {
      console.error(error)

      alert(
        error?.message ||
          "No se pudo actualizar el elector."
      )
    }
  }

  const handleExport = () => {
    if (!canExport) return

    const headers = [
      "ID", "Domicilio", "Barrio", "Localidad", "Adultos", "Menores",
      "Adultos Mayores", "Necesidades", "Infraestructura", "Voto",
      "Condición Vivienda", "Fecha", "Operador", "Alerta"
    ]

    const rows = data.map((r) => [
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
      (r.necesidades?.length >= 3 ? "ALTA" : r.necesidades?.length >= 1 ? "MEDIA" : "BAJA")
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Gestión de Datos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeTab === "relevamientos"
              ? `${data.length} relevamientos encontrados`
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

      {activeTab === "relevamientos" ? (
        <RelevamientosView data={data} loading={loading} onDelete={handleDelete} />
      ) : (
        <PadronView
          electores={electores}
          loading={loadingPadron}
          search={padronSearch}
          onSearchChange={setPadronSearch}
          page={padronPage}
          onPageChange={setPadronPage}
          totalPages={padronTotalPages}
          totalRecords={padronTotalRecords}
          selectedElector={electorSeleccionado}
          onSelectElector={setElectorSeleccionado}
          onActualizarElector={handleActualizarElector}
        />
      )}
    </div>
  )
}