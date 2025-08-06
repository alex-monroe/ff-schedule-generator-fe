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
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8 rounded-xl bg-white/70 p-8 shadow-xl backdrop-blur-lg">
        <h1 className="mb-4 text-center text-3xl font-bold">Fantasy Football Schedule Generator</h1>

        <div>
          <label className="mb-2 block font-semibold">Divisions</label>
          {divisions.map(div => (
            <div key={div.id} className="fade-in mb-2 flex items-center gap-2">
              <input
                className="flex-grow rounded-md border border-gray-300 p-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                value={div.name ?? ''}
                placeholder="Division name"
                onChange={e => updateDivisionName(Number(div.id), e.target.value)}
              />
              <button
                className="text-red-600 transition-colors hover:text-red-800"
                onClick={() => removeDivision(Number(div.id))}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            className="mt-2 text-blue-600 transition-colors hover:text-blue-800"
            onClick={addDivision}
          >
            Add Division
          </button>
        </div>

        <div>
          <label className="mb-2 block font-semibold">Options</label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={options.inDivisionPlayTwice ?? false}
              onChange={e => setOptions({ ...options, inDivisionPlayTwice: e.target.checked })}
            />
            <span>Play teams in division twice</span>
          </label>
          <label className="mt-2 flex items-center space-x-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={options.outOfDivisionPlayOnce ?? false}
              onChange={e => setOptions({ ...options, outOfDivisionPlayOnce: e.target.checked })}
            />
            <span>Play teams out of division once</span>
          </label>
        </div>

        <div>
          <label className="mb-2 block font-semibold">Teams</label>
          {teams.map((team, idx) => (
            <div key={idx} className="fade-in mb-2 flex items-center gap-2">
              <input
                className="flex-grow rounded-md border border-gray-300 p-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                value={team.name ?? ''}
                placeholder="Team name"
                onChange={e => updateTeam(idx, { name: e.target.value })}
              />
              <select
                className="rounded-md border border-gray-300 p-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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
                className="text-red-600 transition-colors hover:text-red-800"
                onClick={() => removeTeam(idx)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            className="mt-2 text-blue-600 transition-colors hover:text-blue-800"
            onClick={addTeam}
          >
            Add Team
          </button>
        </div>

        <button
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          onClick={generate}
          disabled={loading}
        >
          {loading ? <span className="animate-pulse">Generating...</span> : 'Generate Schedule'}
        </button>

        {error && <p className="fade-in text-red-600">{error}</p>}

        {schedule && schedule.matchups && (
          <div className="space-y-4">
            {schedule.matchups.map((week, i) => (
              <div key={i} className="fade-in rounded-lg bg-gray-50 p-4">
                <h2 className="mb-2 font-semibold">Week {i + 1}</h2>
                <ul className="list-disc list-inside space-y-1">
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
