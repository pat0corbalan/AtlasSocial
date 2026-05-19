require("dotenv").config()

const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const UserSchema = new mongoose.Schema({
  nombre: String,
  email: String,
  password: String,
  role: String,
})

const User = mongoose.model("User", UserSchema)

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)

    console.log("Mongo conectado")

    const password = await bcrypt.hash("123456", 10)

    await User.create({
      nombre: "Administrador",
      email: "admin@test.com",
      password,
      role: "admin",
    })

    console.log("ADMIN CREADO")

    process.exit()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

run()