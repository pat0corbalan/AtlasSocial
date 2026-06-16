import mongoose, { Schema, models, model } from "mongoose"

const RelevamientoSchema = new Schema(
  {
    // ─── Usuario que realizó el relevamiento ─────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ─── Datos del domicilio ────────────────────────────────────
    calle: {
      type: String,
      required: true,
      trim: true,
    },

    // numero: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },

    piso: {
      type: String,
      default: "",
      trim: true,
    },

    barrio: {
      type: String,
      default: "",
      trim: true,
    },

    localidad: {
      type: String,
      default: "",
      trim: true,
    },

    // ─── Geolocalización ────────────────────────────────────────
    lat: {
      type: String,
      default: "",
    },

    lng: {
      type: String,
      default: "",
    },

    // ─── Grupo familiar ─────────────────────────────────────────
    adultos: {
      type: Number,
      default: 0,
      min: 0,
    },

    menores: {
      type: Number,
      default: 0,
      min: 0,
    },

    adultosMayores: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ─── Vivienda ───────────────────────────────────────────────
    condicionVivienda: {
      type: String,
      enum: ["solida", "precaria", "mixta", "container"],
      default: "precaria",
    },

    observaciones: {
      type: String,
      default: "",
      trim: true,
    },

    // ─── Intención de voto ──────────────────────────────────────
    voto: {
      type: String,
      enum: [
        "pancho",
        "sole",
        "tala",
        "hugul",
        "otro",
      ],
      default: "indeciso",
    },

    // ─── Necesidades ────────────────────────────────────────────
    necesidades: [
      {
        type: String,
        enum: [
          "salud",
          "educacion",
          "vivienda",
          "alimentacion",
          "trabajo",
        ],
      },
    ],

    // ─── Infraestructura ────────────────────────────────────────
    infraestructura: [
      {
        type: String,
        enum: [
          "agua",
          "cloacas",
          // "gas",
          "calle", //antes se llamaba pavimento
          "alumbrado",
          // "seguridad",
          // "espacio",
          "salud", //Antes se llamaba "sala"
          "basura",
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
)

export default models.Relevamiento ||
  model("Relevamiento", RelevamientoSchema)