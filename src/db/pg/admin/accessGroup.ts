import { query } from '../main.js'

export const getAllAccessGroups = async () => {
    const result = await query(`SELECT * FROM app.access_groups`)
    return result.rows
}