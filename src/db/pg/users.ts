import { query } from './main.js'

export const getAllUsers = async () => {
  const result = await query(
    'SELECT id, name, email, access_group_id, user_type, created_at, updated_at, is_active, verified FROM app.users ORDER BY id'
  )
  return result.rows
}

export const getUserById = async (id: number) => {
  const result = await query(
    'SELECT id, name, email, access_group_id, user_type, created_at, updated_at, is_active, verified FROM app.users WHERE id = $1',
    [id]
  )
  return result.rows[0] || null
}

export const updateUser = async (
  id: number,
  data: { name?: string; email?: string; user_type?: string; is_active?: boolean; access_group_id?: number }
) => {
  const fields: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (data.name !== undefined) {
    fields.push(`name = $${paramIndex++}`)
    values.push(data.name)
  }
  if (data.email !== undefined) {
    fields.push(`email = $${paramIndex++}`)
    values.push(data.email)
  }
  if (data.user_type !== undefined) {
    fields.push(`user_type = $${paramIndex++}`)
    values.push(data.user_type)
  }
  if (data.is_active !== undefined) {
    fields.push(`is_active = $${paramIndex++}`)
    values.push(data.is_active)
  }
  if (data.access_group_id !== undefined) {
    fields.push(`access_group_id = $${paramIndex++}`)
    values.push(data.access_group_id)
  }

  if (fields.length === 0) return null

  values.push(id)
  const result = await query(
    `UPDATE app.users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING id, name, email, access_group_id, user_type, created_at, updated_at, is_active, verified`,
    values
  )
  return result.rows[0] || null
}
