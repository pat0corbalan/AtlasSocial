"use client"

import { useState, useEffect, FormEvent } from "react"
import { Plus, Trash2, UserCog } from "lucide-react"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// TIPOS E INTERFACES
// ---------------------------------------------------------------------------
interface Usuario {
  id: string
  nombre: string
  email: string
  role: "admin" | "encuestador"
}

export function Usuarios() {
  // ---------------------------------------------------------------------------
  // ESTADOS
  // ---------------------------------------------------------------------------
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    email: "",
    password: "",
    role: "encuestador",
  })

  // ---------------------------------------------------------------------------
  // EFECTOS (Carga inicial de datos)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    async function obtenerUsuarios() {
      try {
        const response = await fetch("/api/usuarios")
        if (!response.ok) throw new Error("Error al obtener usuarios")
        
        const data = await response.json()
        
        // Mapeo seguro del _id de MongoDB al id plano usado en front
        const usuariosMapeados = data.map((u: any) => ({
          id: u._id,
          nombre: u.nombre,
          email: u.email,
          role: u.role,
        }))
        
        setUsuarios(usuariosMapeados)
      } catch (error) {
        console.error("Error en la carga de usuarios:", error)
      } finally {
        setLoading(false)
      }
    }

    obtenerUsuarios()
  }, [])

  // ---------------------------------------------------------------------------
  // ACCIONES / ACCESOS AL BACKEND
  // ---------------------------------------------------------------------------
  async function agregarUsuario(e: FormEvent) {
    e.preventDefault()
    
    if (!nuevoUsuario.nombre || !nuevoUsuario.email || !nuevoUsuario.password) return

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoUsuario),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Hubo un problema al crear el usuario")
        return
      }

      // Añadimos el nuevo usuario al estado local
      setUsuarios((prev) => [...prev, data])

      // Reseteamos el formulario a su estado por defecto
      setNuevoUsuario({
        nombre: "",
        email: "",
        password: "",
        role: "encuestador",
      })
    } catch (error) {
      console.error("Error al guardar usuario:", error)
      alert("Error de conexión con el servidor")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function eliminarUsuario(id: string) {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return

    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "No se pudo eliminar")
      }

      // Sincronizamos el estado local removiendo el usuario
      setUsuarios((prev) => prev.filter((u) => u.id !== id))
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
      alert("No se pudo completar la operación en el servidor")
    }
  }

  // ---------------------------------------------------------------------------
  // RENDERIZADO
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6 max-w-6xl">
      {/* Sección de Control */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <UserCog className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Módulo de Cuentas y Accesos
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FORMULARIO DE REGISTRO */}
          <form 
            onSubmit={agregarUsuario} 
            className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm"
          >
            <h3 className="font-semibold text-sm text-foreground">
              Registrar Usuario
            </h3>

            <div>
              <label className="text-xs font-semibold mb-1 block text-muted-foreground">
                Nombre
              </label>
              <input
                type="text"
                required
                value={nuevoUsuario.nombre}
                onChange={(e) =>
                  setNuevoUsuario((p) => ({ ...p, nombre: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Nombre completo"
              />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                required
                value={nuevoUsuario.email}
                onChange={(e) =>
                  setNuevoUsuario((p) => ({ ...p, email: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="correo@dominio.com"
              />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block text-muted-foreground">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={nuevoUsuario.password}
                onChange={(e) =>
                  setNuevoUsuario((p) => ({ ...p, password: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="********"
              />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block text-muted-foreground">
                Rol Administrativo
              </label>
              <select
                value={nuevoUsuario.role}
                onChange={(e) =>
                  setNuevoUsuario((p) => ({ ...p, role: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="encuestador">Encuestador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? "Guardando..." : "Crear usuario"}
            </button>
          </form>

          {/* LISTA / TABLA DE REGISTROS */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border bg-muted/20">
              <h3 className="font-semibold text-sm text-foreground">
                Usuarios con acceso al sistema
              </h3>
            </div>

            <div className="divide-y divide-border">
              {loading ? (
                <div className="p-8 text-sm text-muted-foreground text-center">
                  Consultando base de datos territorial...
                </div>
              ) : usuarios.length === 0 ? (
                <div className="p-8 text-sm text-muted-foreground text-center">
                  No se encontraron operadores registrados.
                </div>
              ) : (
                usuarios.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {u.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {u.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full font-semibold capitalize",
                          u.role === "admin"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        )}
                      >
                        {u.role}
                      </span>

                      <button
                        type="button"
                        onClick={() => eliminarUsuario(u.id)}
                        className="text-muted-foreground hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}