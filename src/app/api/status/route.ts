import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'VEDA',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })
}
