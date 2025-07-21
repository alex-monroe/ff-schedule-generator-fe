import { NextResponse } from 'next/server'
import { scheduler } from 'ff-schedule-protos/dist/scheduler'

export async function POST(req: Request) {
  const body = (await req.json()) as scheduler.IScheduleRequest
  const api = process.env.API_URL || 'https://ff-scheduler-466320.uw.r.appspot.com'

  const res = await fetch(`${api}/generate_schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
