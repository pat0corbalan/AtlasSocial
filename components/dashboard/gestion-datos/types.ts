// components/dashboard/gestion-datos/types.ts

export interface Relevamiento {
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

export interface Elector {
  _id: string
  distrito: string
  seccion: string
  circuito: string
  mesa: string
  nOrden: number
  apellidoNombre: string
  domicilio: string
  calle?: string
  barrio?: string
  geolocalizacion?: {
    type: "Point"
    coordinates: [number, number] // [longitud, latitud]
  }
  visitado?: boolean
  documento: {
    nro: number
    tipo: string
  }
  anioNacimiento: number
  voto: boolean
  procesadoEn?: string | Date
}

export type SortKey =
  | "_id"
  | "domicilio"
  | "barrio"
  | "voto"
  | "createdAt"
  | "adultos"
  | "operador"
  | "alerta"

export type SortDir = "asc" | "desc" | null