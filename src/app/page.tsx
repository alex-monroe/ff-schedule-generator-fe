'use client'

import { useState } from 'react'
import { scheduler } from 'ff-schedule-protos/dist/scheduler'
import { useAutoAnimate } from '@formkit/auto-animate/react'

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
    outOfDivisionPlayOnce: false,
    numWeeks: 13
  })
  const [selectedWeek, setSelectedWeek] = useState(0)

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
        setSelectedWeek(0)
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

  const [divisionsRef] = useAutoAnimate()
  const [teamsRef] = useAutoAnimate()
  const [scheduleRef] = useAutoAnimate()

  const downloadCSV = () => {
    if (!schedule?.matchups) return
    const rows = [
      ['Week', 'Team 1', 'Team 2'],
      ...schedule.matchups.flatMap((week, i) =>
        week.matchups?.map(m => [i + 1, m.team1?.name ?? '', m.team2?.name ?? '']) ?? []
      )
    ]

    const csvContent = rows
      .map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'schedule.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen flex items-start justify-center p-6 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <section className="w-full max-w-3xl bg-white/80 dark:bg-gray-950/40 backdrop-blur-xl rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 p-8 md:p-10">
        <h1 className="mb-8 text-center text-4xl font-semibold text-gray-900 dark:text-gray-100">
          Fantasy Football Schedule Generator
        </h1>

        <div className="mb-8">
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Divisions</label>
          <div className="space-y-2" ref={divisionsRef}>
            {divisions.map(div => (
              <div
                key={div.id}
                className="flex items-center rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/70"
              >
                <input
                  className="flex-grow rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
                  value={div.name ?? ''}
                  placeholder="Division name"
                  onChange={e => updateDivisionName(Number(div.id), e.target.value)}
                />
                <button
                  className="ml-2 text-sm text-red-500 transition-colors hover:text-red-700"
                  onClick={() => removeDivision(Number(div.id))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            className="mt-3 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
            onClick={addDivision}
          >
            Add Division
          </button>
        </div>

        <div className="mb-8 space-y-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Options</label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
              checked={options.inDivisionPlayTwice ?? false}
              onChange={e => setOptions({ ...options, inDivisionPlayTwice: e.target.checked })}
            />
            Play teams in division twice
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
              checked={options.outOfDivisionPlayOnce ?? false}
              onChange={e => setOptions({ ...options, outOfDivisionPlayOnce: e.target.checked })}
            />
            Play teams out of division once
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <span>Number of weeks</span>
            <input
              type="number"
              min={1}
              className="w-24 rounded-md border border-gray-300 bg-transparent px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:border-gray-600 dark:text-gray-100"
              value={options.numWeeks ?? 13}
              onChange={e => setOptions({ ...options, numWeeks: Number(e.target.value) })}
            />
          </label>
        </div>

        <div className="mb-8">
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Teams</label>
          <div className="space-y-2" ref={teamsRef}>
            {teams.map((team, idx) => (
              <div
                key={idx}
                className="flex items-center rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/70"
              >
                <input
                  className="flex-grow rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
                  value={team.name ?? ''}
                  placeholder="Team name"
                  onChange={e => updateTeam(idx, { name: e.target.value })}
                />
                <select
                  className="ml-2 rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
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
                  className="ml-2 text-sm text-red-500 transition-colors hover:text-red-700"
                  onClick={() => removeTeam(idx)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            className="mt-3 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
            onClick={addTeam}
          >
            Add Team
          </button>
        </div>

        <button
          className="rounded-xl bg-blue-600 px-6 py-2 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          onClick={generate}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Schedule'}
        </button>

        {error && <p className="text-red-600 mt-4">{error}</p>}

        {schedule && schedule.matchups && (
          <div className="mt-8">
            <div className="mb-4 flex flex-wrap gap-2">
              {schedule.matchups.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedWeek(i)}
                  className={`rounded-full px-3 py-1 text-sm transition-colors duration-200 ${
                    selectedWeek === i
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Week {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={downloadCSV}
              className="mb-4 rounded-lg bg-green-600 px-4 py-2 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-md"
            >
              Download CSV
            </button>
            <div className="space-y-2" ref={scheduleRef}>
              {schedule.matchups[selectedWeek]?.matchups?.map((m, j) => (
                <div
                  key={j}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3 shadow-sm dark:bg-gray-800"
                >
                  <span>{m.team1?.name}</span>
                  <span className="text-gray-500">vs</span>
                  <span>{m.team2?.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
