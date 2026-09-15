import { query } from '../main.js'

export const getSalesThisMonth = async () => {
  const result = await query(`
    SELECT
      COALESCE(SUM(bill_amt), 0) AS total_sales,
      COUNT(*) AS total_orders
    FROM app.sales_records
    WHERE DATE_TRUNC('month', sales_date) = DATE_TRUNC('month', CURRENT_DATE)
  `)
  return result.rows[0]
}
