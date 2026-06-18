// components/dashboard/gestion-datos/constants.tsx

import React from "react"
import { AlertTriangle, Clock, CheckCircle } from "lucide-react"

export const ALERTA_CONFIG = {
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
} as const

export const SELECT_CLASS =
  "h-9 px-3 pr-7 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"