import { NextResponse } from "next/server"

export async function POST() {
  try {
    const response = NextResponse.json({
      ok: true,
      message: "Sesión cerrada",
    })

    // ─── Eliminar cookie ───────────────────────────
    response.cookies.set({
      name: "token",
      value: "",
      httpOnly: false,
      expires: new Date(0),
      path: "/",
    })

    return response
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Error al cerrar sesión",
      },
      { status: 500 }
    )
  }
}