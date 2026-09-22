import { query } from '../main.js'

export const getAdminAccount = async (email: string) => {
    const result = await query(`SELECT 
  name, email, password, user_type
FROM app.users
WHERE user_type = 'admin' AND email = $1`, [email])
    return result.rows[0] || null
}