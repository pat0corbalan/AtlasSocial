"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import {
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al iniciar sesión")
        setLoading(false)
        return
      }

      // Guardar token
      localStorage.setItem("token", data.token)

      // Guardar token por cookie
      document.cookie = `token=${data.token}; path=/; max-age=604800`

      // Guardar usuario
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      )

      // Redirección por rol
      if (data.user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/encuestador")
      }
    } catch (error) {
      console.log(error)

      setError("Error del servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>

            <h1 className="text-2xl font-bold text-foreground">
              Iniciar Sesión
            </h1>

            <p className="text-sm text-muted-foreground mt-2 text-center">
              Sistema de Censo Barrial y Gestión Territorial
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Correo electrónico
              </label>

              <input
                type="email"
                placeholder="admin@test.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Contraseña
              </label>

              <div className="relative">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  className="w-full h-11 px-4 pr-12 rounded-xl border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Acceso exclusivo para administradores y encuestadores
          </div>
        </div>
      </div>
    </div>
  )
}