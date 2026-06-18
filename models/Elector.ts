import mongoose, {
  Schema,
  models,
  model,
  Model,
  Document
} from "mongoose"

export interface IElector {
  distrito: string
  seccion: string
  circuito: string
  mesa: string
  nOrden: number

  apellidoNombre: string
  domicilio: string

  // NUEVOS CAMPOS
  calle?: string
  barrio?: string

  geolocalizacion?: {
    type: "Point"
    coordinates: [number, number]
  }

  visitado?: boolean

  documento: {
    nro: number
    tipo: string
  }

  anioNacimiento: number
  voto: boolean
  procesadoEn?: Date
}

export interface IElectorDocument
  extends IElector,
    Document {}

const ElectorSchema: Schema<IElectorDocument> =
  new Schema(
    {
      distrito: {
        type: String,
        required: true,
        default:
          "DISTRITO 22 - SANTIAGO DEL ESTERO"
      },

      seccion: {
        type: String,
        required: true
      },

      circuito: {
        type: String,
        required: true
      },

      mesa: {
        type: String,
        required: true
      },

      nOrden: {
        type: Number,
        required: true
      },

      apellidoNombre: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
      },

      domicilio: {
        type: String,
        trim: true
      },

      // ==================
      // NUEVOS CAMPOS
      // ==================

      calle: {
        type: String,
        trim: true,
        uppercase: true
      },

      barrio: {
        type: String,
        trim: true,
        uppercase: true
      },

      geolocalizacion: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point"
        },

        coordinates: {
          type: [Number]
        }
      },

      visitado: {
        type: Boolean,
        default: false
      },

      // ==================

      documento: {
        nro: {
          type: Number,
          required: true
        },

        tipo: {
          type: String,
          required: true
        }
      },

      anioNacimiento: {
        type: Number,
        required: true
      },

      voto: {
        type: Boolean,
        default: false
      },

      procesadoEn: {
        type: Date,
        default: Date.now
      }
    },
    {
      versionKey: false
    }
  )

// Índice único
ElectorSchema.index(
  {
    distrito: 1,
    mesa: 1,
    nOrden: 1
  },
  { unique: true }
)

// Índice geoespacial
ElectorSchema.index({
  geolocalizacion: "2dsphere"
})

const Elector: Model<IElectorDocument> =
  models.Elector ||
  model<IElectorDocument>(
    "Elector",
    ElectorSchema
  )

export default Elector