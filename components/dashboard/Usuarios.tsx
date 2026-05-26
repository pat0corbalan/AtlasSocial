"use client"

import { useState } from "react"
import {
  Shield,
  Check,
  Lock,
  Zap,
  Database,
  BarChart3,
  Vote,
  FileDown,
  Map,
  Users,
  MapPin,
  ClipboardList,
  Smartphone,
  WifiOff,
  ShieldCheck,
  FileText,
  Layers,
  SearchCheck,
  CloudUpload,
  Plus,
  Trash2,
  UserCog,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useApp, Plan } from "@/lib/store"

export function Usuarios() {
  const [usuarios, setUsuarios] = useState([
    {
      id: 1,
      nombre: "Administrador",
      email: "admin@demo.com",
      role: "admin",
    },
  ])

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    email: "",
    password: "",
    role: "encuestador",
  })

  function agregarUsuario() {
    if (
      !nuevoUsuario.nombre ||
      !nuevoUsuario.email ||
      !nuevoUsuario.password
    ) return

    setUsuarios((prev) => [
      ...prev,
      {
        id: Date.now(),
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        role: nuevoUsuario.role,
      },
    ])

    setNuevoUsuario({
      nombre: "",
      email: "",
      password: "",
      role: "encuestador",
    })
  }

  function eliminarUsuario(id: number) {
    setUsuarios((prev) => prev.filter((u) => u.id !== id))
  }

  return (
    <div className="space-y-8 max-w-6xl">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">
          Administración del Sistema
        </h1>

        <p className="text-sm text-muted-foreground mt-1">
          Gestión de módulos y usuarios encuestadores
        </p>
      </div>

      {/* USUARIOS */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <UserCog className="w-4 h-4 text-primary" />

          <h2 className="text-sm font-bold uppercase tracking-wide">
            Gestión de Usuarios
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* FORM */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">

            <h3 className="font-semibold text-sm">
              Registrar Usuario
            </h3>

            <div>
              <label className="text-xs font-semibold mb-1 block">
                Nombre
              </label>

              <input
                type="text"
                value={nuevoUsuario.nombre}
                onChange={(e) =>
                  setNuevoUsuario((p) => ({
                    ...p,
                    nombre: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                placeholder="Nombre completo"
              />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">
                Email
              </label>

              <input
                type="email"
                value={nuevoUsuario.email}
                onChange={(e) =>
                  setNuevoUsuario((p) => ({
                    ...p,
                    email: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                placeholder="correo@dominio.com"
              />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">
                Contraseña
              </label>

              <input
                type="password"
                value={nuevoUsuario.password}
                onChange={(e) =>
                  setNuevoUsuario((p) => ({
                    ...p,
                    password: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                placeholder="********"
              />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">
                Rol
              </label>

              <select
                value={nuevoUsuario.role}
                onChange={(e) =>
                  setNuevoUsuario((p) => ({
                    ...p,
                    role: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
              >
                <option value="encuestador">
                  Encuestador
                </option>

                <option value="admin">
                  Administrador
                </option>
              </select>
            </div>

            <button
              onClick={agregarUsuario}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear usuario
            </button>
          </div>

          {/* TABLA */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">

            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-sm">
                Usuarios registrados
              </h3>
            </div>

            <div className="divide-y divide-border">
              {usuarios.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {u.nombre}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {u.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">

                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded-full font-semibold",
                        u.role === "admin"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      )}
                    >
                      {u.role}
                    </span>

                    <button
                      onClick={() => eliminarUsuario(u.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}