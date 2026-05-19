import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export function getUserFromToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    return decoded as {
      id: string
      email: string
      role: "admin" | "encuestador"
    }
  } catch (error) {
    return null
  }
}