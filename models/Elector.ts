import mongoose, { Schema, models, model } from "mongoose"

// 1. Interfaz que define la estructura de los datos del Elector
export interface IElector {
  distrito: string;
  seccion: string;
  circuito: string;
  mesa: string;
  nOrden: number;
  apellidoNombre: string;
  domicilio: string;
  documento: {
    nro: number;
    tipo: string;
  };
  anioNacimiento: number;
  voto: boolean;
  procesadoEn?: Date;
}

// 2. Interfaz que extiende de Document para el uso dentro de Mongoose
export interface IElectorDocument extends IElector, Document {}

// 3. Definición del Esquema
const ElectorSchema: Schema<IElectorDocument> = new Schema(
  {
    distrito: { 
      type: String, 
      required: true, 
      default: "DISTRITO 22 - SANTIAGO DEL ESTERO" 
    },
    seccion: { type: String, required: true },
    circuito: { type: String, required: true },
    mesa: { type: String, required: true },
    nOrden: { type: Number, required: true },
    apellidoNombre: { type: String, required: true, uppercase: true, trim: true },
    domicilio: { type: String, trim: true },
    documento: {
      nro: { type: Number, required: true },
      tipo: { type: String, required: true } // Ejemplo: 'DNI-EA', 'DNI-EB', 'L'
    },
    anioNacimiento: { type: Number, required: true },
    voto: { type: Boolean, default: false },
    procesadoEn: { type: Date, default: Date.now }
  },
  {
    // Opcional: Desactiva el flag __v si no lo necesitas
    versionKey: false 
  }
);

// 4. Índices para optimizar búsquedas y evitar registros duplicados por mesa
ElectorSchema.index({ distrito: 1, mesa: 1, nOrden: 1 }, { unique: true });

// 5. Exportación del Modelo controlando la re-compilación en Next.js
const Elector: Model<IElectorDocument> = 
  mongoose.models.Elector || mongoose.model<IElectorDocument>('Elector', ElectorSchema);

export default Elector;