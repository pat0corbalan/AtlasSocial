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

    // 🔥 IMPORTANTE: ahora se hace await de params
    const { id } = await context.params

    const updated = await ElectorModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          calle: body.calle,
          barrio: body.barrio,
          visitado: true,
          geolocalizacion: {
            lat: Number(body.lat),
            lng: Number(body.lng),
          },
          fechaVisita: new Date(),
        },
      },
      {
        returnDocument: "after",
      }
    )

    return NextResponse.json({
      ok: true,
      data: updated,
    })
  } catch (error) {
    console.error("Error PATCH territorio:", error)

    return NextResponse.json(
      { ok: false, error: "Error actualizando elector" },
      { status: 500 }
    )
  }
}