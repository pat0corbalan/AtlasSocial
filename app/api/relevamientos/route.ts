import { NextRequest, NextResponse } from "next/server"

import { connectDB } from "@/lib/mongodb"

import Relevamiento from "@/models/Relevamiento"

import { getUserFromToken } from "@/lib/getUser"


// ─────────────────────────────────────────────────────────────
// POST
// Crear relevamiento
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
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
    const user = getUserFromToken(token)

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: "Token inválido",
        },
        { status: 401 }
      )
    }

    // ─── Leer body ─────────────────────────────────
    const body = await req.json()

    // ─── Crear relevamiento ────────────────────────
    const nuevo = await Relevamiento.create({
      ...body,

      // dueño del relevamiento
      userId: user.id,
    })

    return NextResponse.json(
      {
        ok: true,
        data: nuevo,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        ok: false,
        error: "Error al guardar",
      },
      { status: 500 }
    )
  }
}



// ─────────────────────────────────────────────────────────────
// GET
// Obtener relevamientos
// ─────────────────────────────────────────────────────────────

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
    const user = getUserFromToken(token)

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: "Token inválido",
        },
        { status: 401 }
      )
    }

    let relevamientos

    // ─── ADMIN ve todos ────────────────────────────
    if (user.role === "admin") {
      relevamientos = await Relevamiento.find()
        .sort({
          createdAt: -1,
        })
        .populate("userId", "nombre email")
    }

    // ─── ENCUESTADOR solo los suyos ───────────────
    else {
      relevamientos = await Relevamiento.find({
        userId: user.id,
      })
        .sort({
          createdAt: -1,
        })
        .populate("userId", "nombre email")
    }

    return NextResponse.json({
      ok: true,
      data: relevamientos,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        ok: false,
        error: "Error al obtener datos",
      },
      { status: 500 }
    )
  }
}