"use client"

import { useState } from "react"
import {
  Home,
  MapPin,
  Users,
  Heart,
  GraduationCap,
  Zap,
  Droplets,
  Trash2,
  Vote,
  CheckCircle2,
  AlertTriangle,
  Send,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/lib/store"
import MapaInteractivo from "@/components/MapaInteractivo"

// ─── Types ──────────────────────────────────────────────────────────────────

interface FormState {
  calle: string
  numero: string
  piso: string
  barrio: string
  localidad: string
  lat: string
  lng: string
  adultos: string
  menores: string
  adultosMayores: string
  condicionVivienda: string
  observaciones: string
}

// ─── Static data ────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Domicilio",      short: "Domicilio",  icon: Home     },
  { id: 2, label: "Ubicación",      short: "Ubic.",      icon: MapPin   },
  { id: 3, label: "Familia",        short: "Familia",    icon: Users    },
  { id: 4, label: "Infraestructura",short: "Infra.",     icon: Zap      },
  { id: 5, label: "Intención voto", short: "Voto",       icon: Vote     },
]

const intencionVotoOptions = [
  { value: "oficialismo",       label: "Oficialismo",     color: "bg-blue-600 text-white border-blue-600"       },
  { value: "oposicion_moderada",label: "Oposición Mod.",  color: "bg-slate-600 text-white border-slate-600"     },
  { value: "oposicion_dura",    label: "Oposición Dura",  color: "bg-red-600 text-white border-red-600"         },
  { value: "indeciso",          label: "Indeciso",        color: "bg-amber-500 text-white border-amber-500"     },
  { value: "no_vota",           label: "No Vota",         color: "bg-gray-400 text-white border-gray-400"       },
]

const necesidadesOptions = [
  { id: "salud",        label: "Salud",       Icon: Heart          },
  { id: "educacion",    label: "Educación",   Icon: GraduationCap  },
  { id: "vivienda",     label: "Vivienda",    Icon: Home           },
  { id: "alimentacion", label: "Alimentación",Icon: Users          },
  { id: "trabajo",      label: "Trabajo",     Icon: Zap            },
]

const infraestructuraItems = [
  { id: "agua",      label: "Agua corriente", Icon: Droplets },
  { id: "cloacas",   label: "Cloacas",        Icon: Trash2   },
  { id: "gas",       label: "Gas natural",    Icon: Zap      },
  { id: "pavimento", label: "Pavimento",      Icon: MapPin   },
  { id: "alumbrado", label: "Alumbrado",      Icon: Zap      },
]

// ─── Reusable input styles ───────────────────────────────────────────────────

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
const labelClass =
  "block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1"

// ─── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-6">
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-secondary rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((current - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-between">
        {STEPS.map((step) => {
          const done    = step.id < current
          const active  = step.id === current
          const Icon    = step.icon

          return (
            <div key={step.id} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                  done   && "bg-primary border-primary text-primary-foreground",
                  active && "bg-background border-primary text-primary scale-110 shadow-md",
                  !done && !active && "bg-background border-border text-muted-foreground",
                )}
              >
                {done ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold text-center leading-tight hidden sm:block",
                  active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.short}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step panels ─────────────────────────────────────────────────────────────

function StepDomicilio({
  form,
  setForm,
}: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
}) {
  return (
    <div className="space-y-4">
      <StepHeading icon={<Home className="w-5 h-5" />} title="Datos del Domicilio" />

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className={labelClass}>Calle / Avenida</label>
          <input
            className={inputClass}
            placeholder="Av. San Martín"
            value={form.calle}
            onChange={(e) => setForm((f) => ({ ...f, calle: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Número</label>
          <input
            className={inputClass}
            placeholder="1234"
            value={form.numero}
            onChange={(e) => setForm((f) => ({ ...f, numero: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
         <div>
          <label className={labelClass}>Barrio</label>
          <select
            className={inputClass}
            value={form.barrio}
            onChange={(e) => setForm((f) => ({ ...f, barrio: e.target.value }))}
          >
            <option value="">Seleccionar barrio</option>
            <option value="Casanova">Casanova</option>
            <option value="Belgrano">Belgrano</option>
            <option value="Pueblo Nuevo">Pueblo Nuevo</option>
            <option value="Centro">Centro</option>
            <option value="Sur">Sur</option>
            <option value="Sauce">Sauce</option>
            <option value="Challua">Challua</option>
            <option value="Lavalle Norte">Lavalle Norte</option>
            <option value="Dolores">Dolores</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Localidad</label>
          <input
            className={inputClass}
            placeholder="Santiago del Estero"
            value={form.localidad}
            onChange={(e) => setForm((f) => ({ ...f, localidad: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Condición de la vivienda</label>
        <select
          className={inputClass}
          value={form.condicionVivienda}
          onChange={(e) => setForm((f) => ({ ...f, condicionVivienda: e.target.value }))}
        >
          <option value="solida">Sólida (material)</option>
          <option value="precaria">Precaria (madera / chapa)</option>
          <option value="mixta">Mixta</option>
          <option value="container">Container / Villa</option>
        </select>
      </div>
    </div>
  )
}

function StepGeolocalizacion({
  form,
  setForm,
  locked,
}: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  locked: boolean
}) {
  // Estado local para manejar el text o estado de carga del botón de ubicación
  const [loadingLocation, setLoadingLocation] = useState(false)

  // Forzamos el parseo seguro de strings a floats para Leaflet
  const numericLat = parseFloat(form.lat) || -34.6037
  const numericLng = parseFloat(form.lng) || -58.3816

  const handleCoordsChange = (newLat: string, newLng: string) => {
    setForm((f) => ({ ...f, lat: newLat, lng: newLng }))
  }

  // Función para obtener la ubicación del GPS/Navegador
  const handleGetActualLocation = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta la geolocalización.")
      return
    }

    setLoadingLocation(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLat = position.coords.latitude.toFixed(6)
        const currentLng = position.coords.longitude.toFixed(6)
        
        setForm((f) => ({
          ...f,
          lat: currentLat,
          lng: currentLng,
        }))
        setLoadingLocation(false)
      },
      (error) => {
        console.error(error)
        setLoadingLocation(false)
        
        // Manejo amigable de errores comunes de GPS
        if (error.code === 1) {
          alert("Permiso denegado. Por favor, habilita los permisos de ubicación en tu navegador.")
        } else {
          alert("No se pudo obtener tu ubicación actual de forma precisa.")
        }
      },
      {
        enableHighAccuracy: true, // Fuerza al dispositivo a usar GPS si está disponible en vez de solo redes móviles
        timeout: 10000,           // Tiempo máximo de espera: 10 segundos
        maximumAge: 0             // No usar ubicaciones viejas guardadas en caché
      }
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <StepHeading icon={<MapPin className="w-5 h-5" />} title="Geolocalización" />
        
        {/* 🚀 Botón de Ubicación Actual (Solo si no está bloqueado por el plan) */}
        {!locked && (
          <button
            type="button"
            onClick={handleGetActualLocation}
            disabled={loadingLocation}
            className={cn(
              "text-xs font-bold px-3 py-1.5 rounded-lg border border-primary text-primary transition-all flex items-center gap-1.5",
              loadingLocation 
                ? "opacity-50 cursor-not-allowed bg-secondary border-border text-muted-foreground animate-pulse" 
                : "hover:bg-primary hover:text-primary-foreground active:scale-95"
            )}
          >
            <MapPin className="w-3.5 h-3.5" />
            {loadingLocation ? "Obteniendo..." : "Mi ubicación"}
          </button>
        )}
      </div>

      {locked ? (
        <PlanLockNotice />
      ) : (
        <>
          {/* Mapa dinámico sin SSR */}
          <MapaInteractivo 
            lat={numericLat} 
            lng={numericLng} 
            onChangeCoords={handleCoordsChange} 
          />

          <p className="text-xs text-muted-foreground text-center">
            Puedes arrastrar el marcador o hacer clic en cualquier punto del mapa para actualizar las coordenadas.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Latitud</label>
              <input
                className={inputClass}
                value={form.lat}
                onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>Longitud</label>
              <input
                className={inputClass}
                value={form.lng}
                onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StepFamilia({
  form,
  setForm,
  necesidades,
  toggleNecesidad,
}: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  necesidades: string[]
  toggleNecesidad: (id: string) => void
}) {
  return (
    <div className="space-y-5">
      <StepHeading icon={<Users className="w-5 h-5" />} title="Grupo Familiar y Necesidades" />

      <div>
        <label className={labelClass}>Integrantes del hogar</label>
        <div className="grid grid-cols-3 gap-3 mt-1">
          {[
            { key: "adultos",        label: "Adultos"       },
            { key: "menores",        label: "Menores"       },
            { key: "adultosMayores", label: "Ad. Mayores"   },
          ].map(({ key, label }) => (
            <div key={key} className="flex flex-col items-center gap-2 bg-secondary rounded-xl p-3">
              <span className="text-xs font-semibold text-muted-foreground">{label}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-lg font-bold text-foreground hover:bg-accent transition-colors"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      [key]: String(Math.max(0, Number(f[key as keyof FormState]) - 1)),
                    }))
                  }
                >
                  −
                </button>
                <span className="w-6 text-center text-lg font-bold text-foreground tabular-nums">
                  {form[key as keyof FormState]}
                </span>
                <button
                  type="button"
                  className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-lg font-bold text-foreground hover:bg-accent transition-colors"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      [key]: String(Number(f[key as keyof FormState]) + 1),
                    }))
                  }
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Necesidades del grupo familiar</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {necesidadesOptions.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => toggleNecesidad(id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                necesidades.includes(id)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:border-primary",
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Observaciones</label>
        <textarea
          className={cn(inputClass, "resize-none")}
          rows={3}
          placeholder="Situación particular de la familia..."
          value={form.observaciones}
          onChange={(e) => setForm((f) => ({ ...f, observaciones: e.target.value }))}
        />
      </div>
    </div>
  )
}

function StepInfraestructura({
  infra,
  toggleInfra,
}: {
  infra: string[]
  toggleInfra: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      <StepHeading icon={<Zap className="w-5 h-5" />} title="Infraestructura del Barrio" />
      <p className="text-sm text-muted-foreground">
        Marque los servicios disponibles en el domicilio:
      </p>
      <div className="grid grid-cols-2 gap-3">
        {infraestructuraItems.map(({ id, label, Icon }) => {
          const active = infra.includes(id)
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggleInfra(id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all",
                active
                  ? "bg-green-50 text-green-800 border-green-400"
                  : "bg-background text-muted-foreground border-border hover:border-primary/40",
              )}
            >
              <span
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  active ? "bg-green-100 text-green-700" : "bg-secondary text-muted-foreground",
                )}
              >
                <Icon className="w-4 h-4" />
              </span>
              <span>{label}</span>
              {active && <Check className="w-4 h-4 ml-auto text-green-600" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepVoto({
  voto,
  setVoto,
  locked,
}: {
  voto: string
  setVoto: (v: string) => void
  locked: boolean
}) {
  return (
    <div className="space-y-4">
      <StepHeading icon={<Vote className="w-5 h-5" />} title="Intención de Voto" />

      {locked ? (
        <PlanLockNotice />
      ) : (
        <div className="space-y-2">
          {intencionVotoOptions.map((opt) => {
            const selected = voto === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setVoto(opt.value)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 text-sm font-semibold transition-all",
                  selected
                    ? cn(opt.color, "shadow-sm")
                    : "bg-background text-foreground border-border hover:border-primary/50",
                )}
              >
                <span>{opt.label}</span>
                {selected && <Check className="w-4 h-4" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Small shared pieces ─────────────────────────────────────────────────────

function StepHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-2">
      <span className="text-primary">{icon}</span>
      <h2 className="text-base font-bold text-foreground">{title}</h2>
    </div>
  )
}

function PlanLockNotice() {
  return (
    <div className="flex items-start gap-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-4">
      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <span>Esta sección requiere Plan Intermedio o Avanzado. Actualizá tu plan en Configuración.</span>
    </div>
  )
}

// ─── Success screen ──────────────────────────────────────────────────────────

function SuccessScreen({
  form,
  voto,
  onReset,
}: {
  form: FormState
  voto: string
  onReset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle2 className="w-9 h-9 text-green-600" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground">Relevamiento guardado</h2>
        <p className="text-sm text-muted-foreground mt-1">El censo fue registrado correctamente.</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-4 w-full max-w-sm text-sm space-y-2.5 text-left">
        <SummaryRow label="Domicilio"  value={`${form.calle} ${form.numero}`.trim() || "—"} />
        <SummaryRow label="Barrio"     value={form.barrio     || "—"} />
        <SummaryRow label="Localidad"  value={form.localidad  || "—"} />
        <SummaryRow label="Intención"  value={voto            || "—"} />
      </div>
      <button
        onClick={onReset}
        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
      >
        Nuevo relevamiento
      </button>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right capitalize">{value}</span>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function Formulario() {
  const { plan } = useApp()

  const [step, setStep]           = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [voto, setVoto]           = useState("")
  const [necesidades, setNecesidades] = useState<string[]>([])
  const [infra, setInfra]         = useState<string[]>([])
  const [form, setForm]           = useState<FormState>({
    calle: "", numero: "", piso: "", barrio: "", localidad: "",
    lat: "-34.6037", lng: "-58.3816",
    adultos: "2", menores: "1", adultosMayores: "0",
    condicionVivienda: "precaria",
    observaciones: "",
  })

  const isGeoLocked  = plan === "basico"
  const isVotoLocked = plan === "basico"

  const toggleNecesidad = (id: string) =>
    setNecesidades((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id],
    )

  const toggleInfra = (id: string) =>
    setInfra((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id],
    )

  const handleReset = () => {
    setSubmitted(false)
    setStep(1)
    setVoto("")
    setNecesidades([])
    setInfra([])
    setForm({
      calle: "", numero: "", piso: "", barrio: "", localidad: "",
      lat: "-34.6037", lng: "-58.3816",
      adultos: "2", menores: "1", adultosMayores: "0",
      condicionVivienda: "precaria",
      observaciones: "",
    })
  }

  const isLastStep = step === STEPS.length

  const handleNext = async () => {
  if (isLastStep) {
    try {
      const response = await fetch("/api/relevamientos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          voto,
          necesidades,
          infraestructura: infra,
        }),
      })

      const data = await response.json()

      if (data.ok) {
        setSubmitted(true)
      } else {
        alert("Error al guardar")
      }
    } catch (error) {
      console.error(error)
      alert("Error del servidor")
    }

    return
  }

  setStep((s) => s + 1)
}

  const handleBack = () => setStep((s) => s - 1)

  if (submitted) {
    return <SuccessScreen form={form} voto={voto} onReset={handleReset} />
  }

  return (
    <div className="max-w-lg mx-auto pb-32">
      {/* Page header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground">Formulario de Relevamiento</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Paso {step} de {STEPS.length} — {STEPS[step - 1].label}
        </p>
      </div>

      {/* Step indicator */}
      <StepIndicator current={step} />

      {/* Step content card */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-5">
        {step === 1 && (
          <StepDomicilio form={form} setForm={setForm} />
        )}
        {step === 2 && (
          <StepGeolocalizacion form={form} setForm={setForm} locked={isGeoLocked} />
        )}
        {step === 3 && (
          <StepFamilia
            form={form}
            setForm={setForm}
            necesidades={necesidades}
            toggleNecesidad={toggleNecesidad}
          />
        )}
        {step === 4 && (
          <StepInfraestructura infra={infra} toggleInfra={toggleInfra} />
        )}
        {step === 5 && (
          <StepVoto voto={voto} setVoto={setVoto} locked={isVotoLocked} />
        )}
      </div>

      {/* Navigation bar — fixed on mobile */}
      <div className="fixed bottom-0 left-0 right-0 lg:static bg-background/95 backdrop-blur border-t border-border lg:border-none lg:bg-transparent lg:backdrop-blur-none px-4 py-3 lg:px-0 lg:mt-5">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {/* Back */}
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className={cn(
              "flex items-center gap-1.5 px-4 py-3 rounded-xl border border-border text-sm font-semibold transition-all",
              step === 1
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-secondary active:scale-95",
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          {/* Next / Submit */}
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-md"
          >
            {isLastStep ? (
              <>
                <Send className="w-4 h-4" />
                Guardar Relevamiento
              </>
            ) : (
              <>
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Step dots for mobile (mini indicator below buttons) */}
        <div className="flex justify-center gap-1.5 mt-2 lg:hidden">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                s.id === step
                  ? "w-5 bg-primary"
                  : s.id < step
                  ? "w-2 bg-primary/40"
                  : "w-2 bg-border",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
