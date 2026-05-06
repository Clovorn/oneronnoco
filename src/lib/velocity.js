import * as XLSX from 'xlsx'
import { supabase } from '@/lib/supabase'

export async function parseSpreadsheetFile(file) {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

  const headers = (rows[0] || []).map((h) => String(h || '').trim())
  const sampleRows = rows.slice(1, 4)

  return {
    workbook,
    sheetName,
    headers,
    sampleRows,
    rows,
  }
}

export async function requestVelocityMapping({ headers, sampleRows, distributorId, profileName }) {
  const { data, error } = await supabase.functions.invoke('velocity-parse', {
    body: { headers, sampleRows, distributorId, profileName },
  })

  if (error) throw error
  return data
}
