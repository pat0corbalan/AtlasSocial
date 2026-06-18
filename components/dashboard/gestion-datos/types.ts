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

// types.ts
export interface Elector {
  _id: string;
  nOrden: number;
  apellidoNombre: string;
  documento: {
    tipo: string;
    nro: number;
  };
  mesa: string;
  circuito?: string;
  seccion?: string;
  domicilio?: string;
  anioNacimiento?: number;
  
  // Nuevos campos para el relevamiento en terreno
  visitado: boolean;
  fechaVisita?: string;
  geolocalizacion?: {
    lat: number;
    lng: number;
  };
  barrio?: string;
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