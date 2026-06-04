import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

// GET: Obtener todos los usuarios
export async function GET() {
  try {
    await connectDB()

    // Traemos todos los usuarios pero excluimos el password por seguridad
    const usuarios = await User.find({}).select("-password")

    return NextResponse.json(usuarios, { status: 200 })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Error al obtener los usuarios" },
      { status: 500 }
    )
  }
}

// POST: Crear un nuevo usuario
export async function POST(req: Request) {
  try {
    await connectDB()

    const { nombre, email, password, role } = await req.json()

    // Validación básica de campos obligatorios
    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe en la base de datos
    const existeUsuario = await User.findOne({ email })
    if (existeUsuario) {
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado" },
        { status: 400 }
      )
    }

    // Hashear la contraseña idéntico a tu script de inicialización
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear el usuario en MongoDB
    const nuevoUsuario = await User.create({
      nombre,
      email,
      password: hashedPassword,
      role: role || "encuestador",
    })

    return NextResponse.json(
      {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        role: nuevoUsuario.role,
      },
      { status: 201 }
    )
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Error al crear el usuario" },
      { status: 500 }
    )
  }
}