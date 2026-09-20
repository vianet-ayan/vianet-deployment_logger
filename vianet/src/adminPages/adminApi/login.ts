export async function login(email: string, password: string) {
  const result = await fetch('/api/admin/auth/jwt', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
  return result.json()
}
