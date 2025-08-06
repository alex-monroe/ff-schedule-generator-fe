'use client'

import { useState } from 'react'
import { scheduler } from 'ff-schedule-protos/dist/scheduler'

export default function Home() {
  const [divisions, setDivisions] = useState<scheduler.IDivision[]>([
    { id: 1, name: 'Division 1' },
    { id: 2, name: 'Division 2' }
  ])
  const [teams, setTeams] = useState<scheduler.ITeam[]>([
    { name: 'Team 1', divisionId: 1 },
    { name: 'Team 2', divisionId: 1 },
    { name: 'Team 3', divisionId: 1 },
    { name: 'Team 4', divisionId: 1 },
    { name: 'Team 5', divisionId: 1 },
    { name: 'Team 6', divisionId: 2 },
    { name: 'Team 7', divisionId: 2 },
    { name: 'Team 8', divisionId: 2 },
    { name: 'Team 9', divisionId: 2 },
    { name: 'Team 10', divisionId: 2 }
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
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl shadow-xl p-8 space-y-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-center">Fantasy Football Schedule Generator</h1>

        <section className="space-y-2">
          <label className="block font-semibold">Divisions</label>
          {divisions.map(div => (
            <div key={div.id} className="flex items-center gap-2">
              <input
                className="border rounded-md p-2 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={div.name ?? ''}
                placeholder="Division name"
                onChange={e => updateDivisionName(Number(div.id), e.target.value)}
              />
              <button
                className="text-red-500 hover:text-red-700 transition-colors"
                onClick={() => removeDivision(Number(div.id))}
              >
                Remove
              </button>
            </div>
          ))}
          <button className="text-blue-600 hover:text-blue-800 transition-colors" onClick={addDivision}>
            Add Division
          </button>
        </section>

        <section className="space-y-2">
          <label className="block font-semibold">Options</label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              checked={options.inDivisionPlayTwice ?? false}
              onChange={e => setOptions({ ...options, inDivisionPlayTwice: e.target.checked })}
            />
            Play teams in division twice
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              checked={options.outOfDivisionPlayOnce ?? false}
              onChange={e => setOptions({ ...options, outOfDivisionPlayOnce: e.target.checked })}
            />
            Play teams out of division once
          </label>
        </section>

        <section className="space-y-2">
          <label className="block font-semibold">Teams</label>
          {teams.map((team, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                className="border rounded-md p-2 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={team.name ?? ''}
                placeholder="Team name"
                onChange={e => updateTeam(idx, { name: e.target.value })}
              />
              <select
                className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={Number(team.divisionId)}
                onChange={e => updateTeam(idx, { divisionId: Number(e.target.value) })}
              >
                {divisions.map(div => (
                  <option key={div.id} value={div.id}>
                    {div.name || `Division ${div.id}`}
                  </option>
                ))}
              </select>
              <button
                className="text-red-500 hover:text-red-700 transition-colors"
                onClick={() => removeTeam(idx)}
              >
                Remove
              </button>
            </div>
          ))}
          <button className="text-blue-600 hover:text-blue-800 transition-colors" onClick={addTeam}>
            Add Team
          </button>
        </section>

        <div className="pt-4">
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white px-4 py-2 rounded-md shadow-md disabled:opacity-50"
            onClick={generate}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Schedule'}
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-center animate-fade-in">{error}</p>
        )}

        {schedule && schedule.matchups && (
          <div className="mt-6 space-y-4 animate-fade-in">
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
      </div>
    </main>
  )
}
