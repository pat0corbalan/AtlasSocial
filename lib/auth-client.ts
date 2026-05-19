export async function getCurrentUser() {
  const response = await fetch("/api/auth/me")

  const data = await response.json()

  return data
}