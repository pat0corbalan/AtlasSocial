import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Relevamiento from "@/models/Relevamiento"
import { getUserFromToken } from "@/lib/getUser"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params

    const token = req.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "No autorizado" },
        { status: 401 }
      )
    }

    const user = getUserFromToken(token)

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Token inválido" },
        { status: 401 }
      )
    }

    const relevamiento = await Relevamiento.findById(id)

    if (!relevamiento) {
      return NextResponse.json(
        { ok: false, error: "No existe" },
        { status: 404 }
      )
    }

    const isOwner = relevamiento.userId.toString() === user.id
    const isAdmin = user.role === "admin"

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { ok: false, error: "Sin permisos" },
        { status: 403 }
      )
    }

    await Relevamiento.findByIdAndDelete(id)

    return NextResponse.json({
      ok: true,
      message: "Eliminado",
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { ok: false, error: "Error al eliminar" },
      { status: 500 }
    )
  }
}