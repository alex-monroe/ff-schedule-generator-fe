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
    <main className="min-h-screen w-full bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4 py-8 flex items-start justify-center text-gray-900 dark:text-gray-100">
      <section className="w-full max-w-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-gray-200 dark:ring-gray-700 p-8">
        <h1 className="text-3xl md:text-4xl font-semibold mb-8 text-center tracking-tight">
          Fantasy Football Schedule Generator
        </h1>

        <div className="mb-8">
          <label className="block font-semibold mb-2">Divisions</label>
          <div className="space-y-2" ref={divisionsRef}>
            {divisions.map(div => (
              <div
                key={div.id}
                className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <input
                  className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 flex-grow bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors"
                  value={div.name ?? ''}
                  placeholder="Division name"
                  onChange={e => updateDivisionName(Number(div.id), e.target.value)}
                />
                <button
                  className="ml-2 px-2 py-1 rounded-md text-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
                  onClick={() => removeDivision(Number(div.id))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            onClick={addDivision}
          >
            Add Division
          </button>
        </div>

        <div className="mb-8 space-y-3">
          <label className="block font-semibold">Options</label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={options.inDivisionPlayTwice ?? false}
              onChange={e => setOptions({ ...options, inDivisionPlayTwice: e.target.checked })}
            />
            Play teams in division twice
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={options.outOfDivisionPlayOnce ?? false}
              onChange={e => setOptions({ ...options, outOfDivisionPlayOnce: e.target.checked })}
            />
            Play teams out of division once
          </label>
          <label className="flex items-center">
            <span className="mr-2">Number of weeks</span>
            <input
              type="number"
              min={1}
              className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 w-24 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors"
              value={options.numWeeks ?? 13}
              onChange={e => setOptions({ ...options, numWeeks: Number(e.target.value) })}
            />
          </label>
        </div>

        <div className="mb-8">
          <label className="block font-semibold mb-2">Teams</label>
          <div className="space-y-2" ref={teamsRef}>
            {teams.map((team, idx) => (
              <div
                key={idx}
                className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <input
                  className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 flex-grow bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors"
                  value={team.name ?? ''}
                  placeholder="Team name"
                  onChange={e => updateTeam(idx, { name: e.target.value })}
                />
                <select
                  className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 ml-2 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors"
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
                  className="ml-2 px-2 py-1 rounded-md text-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
                  onClick={() => removeTeam(idx)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            onClick={addTeam}
          >
            Add Team
          </button>
        </div>

        <button
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={generate}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Schedule'}
        </button>

        {error && <p className="text-red-500 font-medium mt-4">{error}</p>}

        {schedule && schedule.matchups && (
          <div className="mt-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {schedule.matchups.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedWeek(i)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    selectedWeek === i
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                  }`}
                >
                  Week {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={downloadCSV}
              className="mb-4 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-all duration-200"
            >
              Download CSV
            </button>
            <div className="space-y-2" ref={scheduleRef}>
              {schedule.matchups[selectedWeek]?.matchups?.map((m, j) => (
                <div
                  key={j}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700"
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
