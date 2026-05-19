import { NextRequest, NextResponse } from "next/server"

import { connectDB } from "@/lib/mongodb"

import User from "@/models/User"

import { getUserFromToken } from "@/lib/getUser"



export async function GET(req: NextRequest) {
  try {
    await connectDB()

    // ─── Obtener token ─────────────────────────────
    const token = req.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json(
        {
          ok: false,
          error: "No autorizado",
        },
        { status: 401 }
      )
    }

    // ─── Validar token ─────────────────────────────
    const decoded = getUserFromToken(token)

    if (!decoded) {
      return NextResponse.json(
        {
          ok: false,
          error: "Token inválido",
        },
        { status: 401 }
      )
    }

    // ─── Buscar usuario ────────────────────────────
    const user = await User.findById(decoded.id).select(
      "-password"
    )

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: "Usuario no encontrado",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ok: true,
      user,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        ok: false,
        error: "Error del servidor",
      },
      { status: 500 }
    )
  }
}