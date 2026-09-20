export const getInventory = async (token: string | null = "") => {
  const res = await fetch("/api/admin/inventory", {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  })

  if (!res.ok) throw new Error("Failed to fetch inventory")
  return await res.json()
}