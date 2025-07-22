'use client'

import { useState } from 'react'
import { scheduler } from 'ff-schedule-protos/dist/scheduler'

export default function Home() {
  const [divisionsText, setDivisionsText] = useState('1,Division 1\n2,Division 2')
  const [teamsText, setTeamsText] = useState('Team A,1\nTeam B,1\nTeam C,2\nTeam D,2')
  const [schedule, setSchedule] = useState<scheduler.IScheduleResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const divisions: scheduler.IDivision[] = divisionsText.split('\n').map(line => {
        const [id, name] = line.split(',')
        return { id: Number(id), name: name.trim() }
      })
      const teams: scheduler.ITeam[] = teamsText.split('\n').map(line => {
        const [name, div] = line.split(',')
        return { name: name.trim(), divisionId: Number(div) }
      })

      const res = await fetch('/api/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ league: teams, divisions })
      })

      if (res.ok) {
        const data: scheduler.IScheduleResponse = await res.json()
        setSchedule(data)
      } else {
        console.error('failed to generate schedule')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Fantasy Football Schedule Generator</h1>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Divisions (id,name)</label>
        <textarea
          className="w-full border p-2"
          rows={2}
          value={divisionsText}
          onChange={e => setDivisionsText(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Teams (name,division id)</label>
        <textarea
          className="w-full border p-2"
          rows={4}
          value={teamsText}
          onChange={e => setTeamsText(e.target.value)}
        />
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={generate}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Schedule'}
      </button>

      {schedule && schedule.matchups && (
        <div className="mt-6 space-y-4">
          {schedule.matchups.map((week, i) => (
            <div key={i}>
              <h2 className="font-semibold">Week {i + 1}</h2>
              <ul className="list-disc list-inside">
                {week.matchups?.map((m, j) => (
                  <li key={j}>{m.team1?.name} vs {m.team2?.name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
