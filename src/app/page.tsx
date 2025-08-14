'use client'

import { useState } from 'react'
import { scheduler } from 'ff-schedule-protos/dist/scheduler'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { motion, AnimatePresence } from 'framer-motion'

interface Team extends scheduler.ITeam {
  color: string
}

const TEAM_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#a855f7',
  '#ec4899',
  '#14b8a6',
  '#f43f5e',
  '#6366f1'
]

export default function Home() {
  const initialDivisions: scheduler.IDivision[] = [
    { id: 1, name: 'AFC' },
    { id: 2, name: 'NFC' }
  ]
  const DEFAULT_TEAMS_PER_DIVISION = 5
  const initialTeams: Team[] = initialDivisions.flatMap((div, divIndex) =>
    Array.from({ length: DEFAULT_TEAMS_PER_DIVISION }, (_, i) => ({
      name: `Team ${divIndex * DEFAULT_TEAMS_PER_DIVISION + i + 1}`,
      divisionId: div.id,
      color: TEAM_COLORS[(divIndex * DEFAULT_TEAMS_PER_DIVISION + i) % TEAM_COLORS.length]
    }))
  )

  const [divisions, setDivisions] = useState<scheduler.IDivision[]>(initialDivisions)
  const [teams, setTeams] = useState<Team[]>(initialTeams)
  const [schedule, setSchedule] = useState<scheduler.IScheduleResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [options, setOptions] = useState<scheduler.IOptions>({
    inDivisionPlayTwice: true,
    outOfDivisionPlayOnce: true,
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

  const addTeam = (divisionId: number) => {
    setTeams([
      ...teams,
      { name: '', divisionId, color: TEAM_COLORS[teams.length % TEAM_COLORS.length] }
    ])
  }

  const updateTeam = (index: number, data: Partial<Team>) => {
    setTeams(teams.map((t, i) => (i === index ? { ...t, ...data } : t)))
  }

  const removeTeam = (index: number) => {
    setTeams(teams.filter((_, i) => i !== index))
  }

  const generate = async () => {
    setLoading(true)
    setError(null)
    setSchedule(null)
    try {
      const league = teams.map(({ name, divisionId }) => ({ name, divisionId }))
      const res = await fetch('/api/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ league, divisions, options })
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

  const getTeamColor = (name?: string) =>
    teams.find(t => t.name === name)?.color ?? '#000'

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 sm:p-6 lg:p-8 font-sans">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            className="lg:col-span-2"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Schedule Generator
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Create a fantasy football schedule in seconds.
              </p>
            </motion.div>

            <Card icon="👥" title="Divisions & Teams">
              <div className="space-y-6" ref={divisionsRef}>
                {divisions.map(div => (
                  <div key={div.id}>
                    <div className="flex items-center gap-2">
                      <input
                        className="input flex-grow"
                        value={div.name ?? ''}
                        placeholder="Division name"
                        onChange={e => updateDivisionName(Number(div.id), e.target.value)}
                      />
                      <button
                        className="btn-icon-danger"
                        onClick={() => removeDivision(Number(div.id))}
                        aria-label="Remove division"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="ml-4 mt-2 space-y-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4" ref={teamsRef}>
                      {teams
                        .map((team, i) => ({ team, originalIndex: i }))
                        .filter(({ team }) => team.divisionId === div.id)
                        .map(({ team, originalIndex }) => (
                          <div key={originalIndex} className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: team.color }}
                            />
                            <input
                              className="input flex-grow"
                              value={team.name ?? ''}
                              placeholder="Team name"
                              onChange={e => updateTeam(originalIndex, { name: e.target.value })}
                            />
                            <button
                              className="btn-icon-danger"
                              onClick={() => removeTeam(originalIndex)}
                              aria-label="Remove team"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                         <button
                            className="btn-text"
                            onClick={() => addTeam(Number(div.id))}
                          >
                            ➕ Add Team
                          </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="btn-secondary mt-4"
                onClick={addDivision}
              >
                ➕ Add Division
              </button>
            </Card>

            <Card icon="⚙️" title="Options">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={options.inDivisionPlayTwice ?? false}
                    onChange={e => setOptions({ ...options, inDivisionPlayTwice: e.target.checked })}
                  />
                  Play teams in division twice
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={options.outOfDivisionPlayOnce ?? false}
                    onChange={e => setOptions({ ...options, outOfDivisionPlayOnce: e.target.checked })}
                  />
                  Play teams out of division once
                </label>
                <div className="flex items-center gap-2">
                  <label htmlFor="num-weeks" className="text-sm font-medium">Number of weeks</label>
                  <input
                    type="number"
                    id="num-weeks"
                    min={1}
                    className="input w-24"
                    value={options.numWeeks ?? 13}
                    onChange={e => setOptions({ ...options, numWeeks: Number(e.target.value) })}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          <div className="lg:col-span-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
            >
              <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-lg p-6 sticky top-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Ready to Go?
                </h2>
                <button
                  className="btn-primary w-full"
                  onClick={generate}
                  disabled={loading}
                >
                  {loading ? 'Generating...' : 'Generate Schedule'}
                  {!loading && '➡️'}
                </button>
                {error && <p className="text-red-500 dark:text-red-400 mt-4 text-sm">{error}</p>}
              </div>
            </motion.div>

            <AnimatePresence>
              {schedule && schedule.matchups && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <Card icon="📅" title="Schedule">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {schedule.matchups.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedWeek(i)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            selectedWeek === i
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                          }`}
                        >
                          Week {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={downloadCSV}
                      className="btn-secondary w-full"
                    >
                      📥 Download CSV
                    </button>
                  </Card>

                  <div className="space-y-3">
                     {schedule.matchups[selectedWeek]?.matchups?.map((m, j) => (
                        <motion.div
                          key={j}
                          className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800/50 shadow"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0, transition: { delay: j * 0.05 } }}
                        >
                          <span className="flex items-center gap-2 font-semibold">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getTeamColor(m.team1?.name) }}
                            />
                            {m.team1?.name}
                          </span>
                          <span className="text-gray-400 dark:text-gray-500 text-sm">vs</span>
                          <span className="flex items-center gap-2 font-semibold">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getTeamColor(m.team2?.name) }}
                            />
                            {m.team2?.name}
                          </span>
                        </motion.div>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="flex flex-col items-center space-y-4 bg-white/10 p-8 rounded-2xl"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ ease: "linear", duration: 2, repeat: Infinity }}
                className="text-6xl"
              >
                🏈
              </motion.div>
              <p className="text-white text-lg font-semibold">Huddling up the schedule...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}


interface CardProps {
  icon: string
  title: string
  children: React.ReactNode
}

const Card: React.FC<CardProps> = ({ icon, title, children }) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
        <span className="text-lg">{icon}</span>
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
    </div>
    {children}
  </motion.div>
)
