import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export function createToken(user: any) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  )
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET)
}