// "use client"

// import {
//   Shield,
//   Check,
//   Lock,
//   Zap,
//   Globe,
//   Database,
//   BarChart3,
//   Vote,
//   FileDown,
//   Map,
//   Bell,
//   Users,
//   MapPin,
//   ClipboardList,
//   Smartphone,
//   WifiOff,
//   ShieldCheck,
//   FileText,
//   Layers,
//   SearchCheck,
//   CloudUpload,
// } from "lucide-react"
// import { cn } from "@/lib/utils"
// import { useApp, Plan } from "@/lib/store"

// const planes: { id: Plan; label: string; price: string; color: string; features: { icon: React.ReactNode; label: string; included: boolean }[] }[] = [
//   {
//     id: "basico",
//     label: "Módulo Operativo (Base)",
//     price: "USD 500",
//     color: "border-slate-200",
//     features: [
//       { icon: <Database className="w-4 h-4" />, label: "Ficha digital por vecino (Nombre, DNI, etc.)", included: true },
//       { icon: <MapPin className="w-4 h-4" />, label: "Ubicación automática de la encuesta", included: true },
//       { icon: <ClipboardList className="w-4 h-4" />, label: "Censo de salud, vivienda y educación", included: true },
//       { icon: <Vote className="w-4 h-4" />, label: "Registro de intención de voto", included: true },
//       { icon: <Smartphone className="w-4 h-4" />, label: "App lista para usar en el celular", included: true },
//       { icon: <BarChart3 className="w-4 h-4" />, label: "Gráficos estadísticos avanzados", included: false },
//       { icon: <Map className="w-4 h-4" />, label: "Mapa con colores por zona/barrio", included: false },
//       { icon: <WifiOff className="w-4 h-4" />, label: "Uso sin conexión a internet", included: false },
//     ],
//   },
//   {
//     id: "intermedio",
//     label: "Módulo Analítico (Intermedio)",
//     price: "USD 1.000",
//     color: "border-blue-500",
//     features: [
//       { icon: <BarChart3 className="w-4 h-4" />, label: "Tablero con estadísticas en tiempo real", included: true },
//       { icon: <Map className="w-4 h-4" />, label: "Mapa interactivo de urgencias y votos", included: true },
//       { icon: <FileDown className="w-4 h-4" />, label: "Descarga de datos a Excel y CSV", included: true },
//       { icon: <ShieldCheck className="w-4 h-4" />, label: "Control de acceso (Admin vs. Encuestador)", included: true },
//       { icon: <Database className="w-4 h-4" />, label: "Ficha digital por vecino", included: true },
//       { icon: <ClipboardList className="w-4 h-4" />, label: "Censo de salud y vivienda", included: true },
//       { icon: <WifiOff className="w-4 h-4" />, label: "Uso sin conexión a internet", included: false },
//       { icon: <FileText className="w-4 h-4" />, label: "Reportes automáticos en PDF", included: false },
//     ],
//   },
//   {
//     id: "avanzado",
//     label: "Solución Integral (Premium)",
//     price: "USD 2.500",
//     color: "border-green-500",
//     features: [
//       { icon: <WifiOff className="w-4 h-4" />, label: "Funciona en el monte o zonas sin señal", included: true },
//       { icon: <FileText className="w-4 h-4" />, label: "Generación de informes PDF automáticos", included: true },
//       { icon: <Layers className="w-4 h-4" />, label: "Manejo de varias campañas a la vez", included: true },
//       { icon: <SearchCheck className="w-4 h-4" />, label: "Auditoría (ver quién cargó cada dato)", included: true },
//       { icon: <Users className="w-4 h-4" />, label: "Capacitación presencial para el equipo", included: true },
//       { icon: <CloudUpload className="w-4 h-4" />, label: "Copia de seguridad automática", included: true },
//       { icon: <BarChart3 className="w-4 h-4" />, label: "Estadísticas y mapas de calor", included: true },
//       { icon: <ShieldCheck className="w-4 h-4" />, label: "Garantía y soporte prioritario", included: true },
//     ],
//   },
// ]

// const configSections = [
//   {
//     label: "Organización",
//     fields: [
//       { label: "Nombre de la organización", placeholder: "Municipio / ONG / Partido", type: "text" },
//       { label: "Zona de trabajo", placeholder: "Ej: Zona Sur — Santiago del Estero", type: "text" },
//       { label: "Responsable técnico", placeholder: "Nombre completo", type: "text" },
//     ],
//   },
//   {
//     label: "Notificaciones",
//     fields: [
//       { label: "Email de alertas críticas", placeholder: "admin@organización.gob.ar", type: "email" },
//       { label: "Umbral de alerta (familias/día)", placeholder: "50", type: "number" },
//     ],
//   },
// ]

// export function Configuracion() {
//   const { plan, setPlan } = useApp()

//   return (
//     <div className="space-y-8 max-w-5xl">
//       {/* Header */}
//       <div>
//         <h1 className="text-xl font-bold text-foreground">Configuración</h1>
//         <p className="text-sm text-muted-foreground mt-0.5">Administre el plan y las preferencias del sistema</p>
//       </div>

//       {/* Plan selector */}
//       <section>
//         <div className="flex items-center gap-2 mb-4">
//           <Shield className="w-4 h-4 text-primary" />
//           <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Selección de Plan</h2>
//         </div>
//         <p className="text-sm text-muted-foreground mb-5">
//           Simule las funcionalidades según el plan activo. El plan actual determina qué módulos están disponibles en toda la plataforma.
//         </p>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {planes.map((p) => {
//             const isActive = plan === p.id
//             const isRecommended = p.id === "intermedio"
//             return (
//               <div
//                 key={p.id}
//                 className={cn(
//                   "relative bg-card rounded-xl border-2 p-5 cursor-pointer transition-all duration-200",
//                   isActive ? p.color + " shadow-md" : "border-border hover:border-muted-foreground/40",
//                 )}
//                 onClick={() => setPlan(p.id)}
//               >
//                 {isRecommended && (
//                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
//                     Recomendado
//                   </div>
//                 )}
//                 <div className="flex items-start justify-between mb-4">
//                   <div>
//                     <h3 className="font-bold text-foreground text-sm">{p.label}</h3>
//                     <p className="text-xs text-muted-foreground mt-0.5">{p.price}</p>
//                   </div>
//                   <div className={cn(
//                     "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
//                     isActive ? "border-primary bg-primary" : "border-border bg-background"
//                   )}>
//                     {isActive && <Check className="w-3 h-3 text-primary-foreground" />}
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   {p.features.map((f, i) => (
//                     <div key={i} className="flex items-center gap-2 text-xs">
//                       <span className={f.included ? "text-green-600" : "text-muted-foreground/40"}>
//                         {f.included ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
//                       </span>
//                       <span className={f.included ? "text-foreground" : "text-muted-foreground/50 line-through"}>
//                         {f.label}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//                 {isActive && (
//                   <div className="mt-4 pt-3 border-t border-border">
//                     <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
//                       <Zap className="w-3.5 h-3.5" />
//                       Plan activo actualmente
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )
//           })}
//         </div>
//       </section>

//       {/* System config */}
//       <section>
//         <div className="flex items-center gap-2 mb-4">
//           <Database className="w-4 h-4 text-primary" />
//           <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Configuración del Sistema</h2>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {configSections.map((section) => (
//             <div key={section.label} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
//               <h3 className="text-sm font-semibold text-foreground">{section.label}</h3>
//               {section.fields.map((field) => (
//                 <div key={field.label}>
//                   <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
//                     {field.label}
//                   </label>
//                   <input
//                     type={field.type}
//                     placeholder={field.placeholder}
//                     className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
//                   />
//                 </div>
//               ))}
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Save */}
//       <div className="flex justify-end">
//         <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm">
//           <Check className="w-4 h-4" />
//           Guardar configuración
//         </button>
//       </div>
//     </div>
//   )
// }
