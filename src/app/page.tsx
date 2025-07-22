'use client'

import { useState } from 'react'
import { scheduler } from 'ff-schedule-protos/dist/scheduler'

export default function Home() {
  const [divisions, setDivisions] = useState<scheduler.IDivision[]>([
    { id: 1, name: 'Division 1' },
    { id: 2, name: 'Division 2' }
  ])
  const [teams, setTeams] = useState<scheduler.ITeam[]>([
    { name: 'Team A', divisionId: 1 },
    { name: 'Team B', divisionId: 1 },
    { name: 'Team C', divisionId: 2 },
    { name: 'Team D', divisionId: 2 }
  ])
  const [schedule, setSchedule] = useState<scheduler.IScheduleResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [options, setOptions] = useState<scheduler.IOptions>({
    inDivisionPlayTwice: false,
    outOfDivisionPlayOnce: false
  })

  const addDivision = () => {
    const nextId = divisions.length ? Math.max(...divisions.map(d => Number(d.id))) + 1 : 1
    setDivisions([...divisions, { id: nextId, name: '' }])
  }

  const updateDivisionName = (id: number, name: string) => {
    setDivisions(divisions.map(d => (d.id === id ? { ...d, name } : d)))
  }

  const removeDivision = (id: number) => {
    setDivisions(divisions.filter(d => d.id !== id))
    setTeams(teams.filter(t => t.divisionId !== id))
  }

  const addTeam = () => {
    const firstDiv = divisions[0]?.id ?? 1
    setTeams([...teams, { name: '', divisionId: firstDiv }])
  }

  const updateTeam = (index: number, data: Partial<scheduler.ITeam>) => {
    setTeams(teams.map((t, i) => (i === index ? { ...t, ...data } : t)))
  }

  const removeTeam = (index: number) => {
    setTeams(teams.filter((_, i) => i !== index))
  }

  const generate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ league: teams, divisions, options })
      })

      if (res.ok) {
        const data: scheduler.IScheduleResponse = await res.json()
        setSchedule(data)
      } else {
        const err = await res.json().catch(() => null)
        setError(err?.error ?? 'Failed to generate schedule')
      }
    } catch {
      setError('Failed to generate schedule')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Fantasy Football Schedule Generator</h1>
      <div className="mb-6">
        <label className="block font-semibold mb-2">Divisions</label>
        {divisions.map(div => (
          <div key={div.id} className="flex items-center mb-2">
            <input
              className="border p-1 flex-grow"
              value={div.name ?? ''}
              placeholder="Division name"
              onChange={e => updateDivisionName(Number(div.id), e.target.value)}
            />
            <button className="ml-2 text-red-600" onClick={() => removeDivision(Number(div.id))}>
              Remove
            </button>
          </div>
        ))}
        <button className="mt-2 text-blue-600" onClick={addDivision}>
          Add Division
        </button>
      </div>

      <div className="mb-6">
        <label className="block font-semibold mb-2">Options</label>
        <label className="block">
          <input
            type="checkbox"
            className="mr-2"
            checked={options.inDivisionPlayTwice ?? false}
            onChange={e => setOptions({ ...options, inDivisionPlayTwice: e.target.checked })}
          />
          Play teams in division twice
        </label>
        <label className="block mt-2">
          <input
            type="checkbox"
            className="mr-2"
            checked={options.outOfDivisionPlayOnce ?? false}
            onChange={e => setOptions({ ...options, outOfDivisionPlayOnce: e.target.checked })}
          />
          Play teams out of division once
        </label>
      </div>

      <div className="mb-6">
        <label className="block font-semibold mb-2">Teams</label>
        {teams.map((team, idx) => (
          <div key={idx} className="flex items-center mb-2">
            <input
              className="border p-1 flex-grow"
              value={team.name ?? ''}
              placeholder="Team name"
              onChange={e => updateTeam(idx, { name: e.target.value })}
            />
            <select
              className="border p-1 ml-2"
              value={Number(team.divisionId)}
              onChange={e => updateTeam(idx, { divisionId: Number(e.target.value) })}
            >
              {divisions.map(div => (
                <option key={div.id} value={div.id}>
                  {div.name || `Division ${div.id}`}
                </option>
              ))}
            </select>
            <button className="ml-2 text-red-600" onClick={() => removeTeam(idx)}>
              Remove
            </button>
          </div>
        ))}
        <button className="mt-2 text-blue-600" onClick={addTeam}>
          Add Team
        </button>
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={generate}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Schedule'}
      </button>

      {error && (
        <p className="text-red-600 mt-4">{error}</p>
      )}

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
