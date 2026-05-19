import mongoose, { Schema, models, model } from "mongoose"

const UserSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "encuestador"],
      default: "encuestador",
    },
  },
  {
    timestamps: true,
  }
)

export default models.User || model("User", UserSchema)