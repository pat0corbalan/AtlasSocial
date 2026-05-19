export async function logout() {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
    })

    // limpiar localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    // redireccionar
    window.location.href = "/login"
  } catch (error) {
    console.error(error)
  }
}