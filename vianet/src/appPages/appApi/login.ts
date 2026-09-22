export async function appLogin(email: string, password: string) {
  const result = await fetch('/api/app/auth/jwt', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
  return result.json()
}
