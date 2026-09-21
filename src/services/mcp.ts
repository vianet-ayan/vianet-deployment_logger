import { z } from 'zod'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { query } from '../db/pg/main.js'

function isSelectOnly(sql: string): boolean {
  const normalized = sql.trim().toLowerCase()
  return (
    normalized.startsWith('select') &&
    !normalized.includes('insert') &&
    !normalized.includes('update') &&
    !normalized.includes('delete') &&
    !normalized.includes('drop') &&
    !normalized.includes('alter') &&
    !normalized.includes('create') &&
    !normalized.includes('truncate')
  )
}

export interface ToolResult {
  content: { type: 'text'; text: string }[]
  isError?: boolean
}

export async function executeQueryDatabase(sql: string): Promise<ToolResult> {
  if (!isSelectOnly(sql)) {
    return { content: [{ type: 'text', text: 'Error: Only SELECT queries are allowed' }], isError: true }
  }
  try {
    const result = await query(sql)
    return { content: [{ type: 'text', text: JSON.stringify(result.rows, null, 2) }] }
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${(error as Error).message}` }], isError: true }
  }
}

export async function executeGetTableSchema(table: string): Promise<ToolResult> {
  try {
    const result = await query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_schema || '.' || table_name = $1
       ORDER BY ordinal_position`,
      [table]
    )
    return { content: [{ type: 'text', text: JSON.stringify(result.rows, null, 2) }] }
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${(error as Error).message}` }], isError: true }
  }
}

export async function executeGetDaybookSummary(from: string, to: string): Promise<ToolResult> {
  try {
    const result = await query(
      `SELECT voucher_type, COUNT(*) as count, SUM(ABS(amount::numeric)) as total_amount
       FROM app.vouchers v
       JOIN app.voucher_ledger_entries ve ON v.id = ve.voucher_id
       WHERE v.date >= $1 AND v.date <= $2
       GROUP BY voucher_type
       ORDER BY total_amount DESC`,
      [from, to]
    )
    return { content: [{ type: 'text', text: JSON.stringify(result.rows, null, 2) }] }
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${(error as Error).message}` }], isError: true }
  }
}

export const TOOL_DEFINITIONS = [
  { name: 'query_database', description: 'Execute a read-only SQL query on the database and return results' },
  { name: 'get_table_schema', description: 'Get the schema/columns of a database table' },
  { name: 'get_daybook_summary', description: 'Get a summary of daybook entries for a date range' },
]

export async function executeTool(name: string, input: Record<string, unknown>): Promise<ToolResult> {
  switch (name) {
    case 'query_database':
      return executeQueryDatabase(input.sql as string)
    case 'get_table_schema':
      return executeGetTableSchema(input.table as string)
    case 'get_daybook_summary':
      return executeGetDaybookSummary(input.from as string, input.to as string)
    default:
      return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true }
  }
}

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: 'vianet-admin',
    version: '1.0.0',
  })

  server.registerTool(
    'query_database',
    {
      description: 'Execute a read-only SQL query on the database and return results',
      inputSchema: { sql: z.string().describe('The SQL query to execute (SELECT only)') },
    },
    async ({ sql }) => executeQueryDatabase(sql)
  )

  server.registerTool(
    'get_table_schema',
    {
      description: 'Get the schema/columns of a database table',
      inputSchema: { table: z.string().describe('Table name (e.g. app.ledger, app.vouchers)') },
    },
    async ({ table }) => executeGetTableSchema(table)
  )

  server.registerTool(
    'get_daybook_summary',
    {
      description: 'Get a summary of daybook entries for a date range',
      inputSchema: {
        from: z.string().describe('Start date (YYYY-MM-DD)'),
        to: z.string().describe('End date (YYYY-MM-DD)'),
      },
    },
    async ({ from, to }) => executeGetDaybookSummary(from, to)
  )

  return server
}
