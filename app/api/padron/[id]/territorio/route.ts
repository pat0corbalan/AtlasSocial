// api/padron/[id]/territorio/route.ts

import { NextResponse } from "next/server"
import ElectorModel from "@/models/Elector"

type Context = {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(req: Request, context: Context) {
  try {
    const body = await req.json()

    // Await de params (Correcto para Next.js 15)
    const { id } = await context.params

    // Validamos que vengan las coordenadas para evitar crasheos de parseo
    const latNum = Number(body.geolocalizacion?.coordinates?.[1] ?? body.lat)
    const lngNum = Number(body.geolocalizacion?.coordinates?.[0] ?? body.lng)

    const updated = await ElectorModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          calle: body.calle,
          barrio: body.barrio,
          visitado: true,
          // Mapeamos exactamente al esquema GeoJSON de Mongoose
          geolocalizacion: {
            type: "Point",
            coordinates: [lngNum, latNum], // IMPORTANTE: [longitud, latitud]
          },
          // Si en tu modelo usaste "procesadoEn", usemos el mismo nombre
          procesadoEn: new Date(), 
        },
      },
      {
        new: true, // Equivalente en Mongoose para devolver el doc actualizado
        runValidators: true, // Fuerzas a Mongoose a validar el update contra el esquema
      }
    )

    if (!updated) {
      return NextResponse.json(
        { ok: false, error: "No se encontró el elector especificado" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ok: true,
      data: updated,
    })
  } catch (error: any) {
    console.error("❌ Error PATCH territorio:", error)

    return NextResponse.json(
      { ok: false, error: error?.message || "Error actualizando elector" },
      { status: 500 }
    )
  }
}