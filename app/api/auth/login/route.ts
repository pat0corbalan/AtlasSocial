import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

import { createToken } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    await connectDB()

    const { email, password } = await req.json()

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    )

    if (!validPassword) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      )
    }

    const token = createToken(user)

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.log(error)

    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    )
  }
}