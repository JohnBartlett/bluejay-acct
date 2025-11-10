import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const DISPLAY_CONFIG_PATH = join(process.cwd(), 'config', 'invoice-display.json')
const PRINT_CONFIG_PATH = join(process.cwd(), 'config', 'invoice-print.json')

/**
 * GET /api/invoice-config
 * Loads invoice configuration (display or print) from JSON file
 * Query params: type ('display' | 'print', default: 'display')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'display' // 'display' or 'print'

    const configPath = type === 'print' ? PRINT_CONFIG_PATH : DISPLAY_CONFIG_PATH
    const config = JSON.parse(readFileSync(configPath, 'utf-8'))

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error reading invoice config:', error)
    return NextResponse.json(
      { error: 'Failed to read invoice configuration' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/invoice-config
 * Saves invoice configuration (display or print) to JSON file
 * Query params: type ('display' | 'print', default: 'display')
 * Body: InvoiceConfig object
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'display' // 'display' or 'print'

    const body = await request.json()
    const configPath = type === 'print' ? PRINT_CONFIG_PATH : DISPLAY_CONFIG_PATH

    // Validate the configuration structure
    if (!body.colors || !body.layout || !body.typography) {
      return NextResponse.json(
        { error: 'Invalid configuration structure' },
        { status: 400 }
      )
    }

    // Write the updated configuration
    writeFileSync(configPath, JSON.stringify(body, null, 2), 'utf-8')

    return NextResponse.json({ success: true, config: body })
  } catch (error) {
    console.error('Error saving invoice config:', error)
    return NextResponse.json(
      { error: 'Failed to save invoice configuration' },
      { status: 500 }
    )
  }
}

