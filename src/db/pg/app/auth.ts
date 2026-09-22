import { query } from '../main.js'

export const getAppAccount = async (email: string) => {
  const result = await query(
    `SELECT name, email, password, user_type, access_group_id, is_active, verified
FROM app.users
WHERE email = $1`,
    [email]
  )
  return result.rows[0] || null
}
