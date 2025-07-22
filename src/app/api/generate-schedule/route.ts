import { NextResponse } from 'next/server'
import { scheduler } from 'ff-schedule-protos/dist/scheduler'

export async function POST(req: Request) {
  const body = (await req.json()) as scheduler.IScheduleRequest
  const api = process.env.API_URL
  if (!api) {
    return NextResponse.json({ error: 'API_URL not configured' }, { status: 500 })
  }

  try {
    const res = await fetch(`${api}/generate-schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    let data: unknown = null
    try {
      data = await res.json()
    } catch {
      // ignore json parse errors
    }

    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Failed to reach schedule service' }, { status: 500 })
  }
}
