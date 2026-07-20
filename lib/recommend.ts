import { StoredWorkout } from './storage'

export type LastPerformance = {
  date: string
  weight: number
  reps: number
}

export type Suggestion = {
  weight: number
  reason: string
}

// Most recent session containing this exercise, reduced to its top set
// (heaviest weight; most reps as tiebreak).
export function lastPerformance(
  history: StoredWorkout[],
  exercise: string
): LastPerformance | null {
  const sessions = history
    .filter(w => w.exercises.some(e => e.name === exercise))
    .sort((a, b) => b.date.localeCompare(a.date))

  const latest = sessions[0]
  if (!latest) return null

  const sets = latest.exercises.find(e => e.name === exercise)!.sets
  if (sets.length === 0) return null

  const top = [...sets].sort(
    (a, b) => b.weight - a.weight || b.reps - a.reps
  )[0]

  return { date: latest.date, weight: top.weight, reps: top.reps }
}

// Double progression: earn extra weight by first earning reps.
export function suggestNext(last: LastPerformance): Suggestion {
  if (last.reps >= 8) {
    return {
      weight: last.weight + 5,
      reason: 'You hit 8+ reps — time to add weight',
    }
  }
  if (last.reps >= 5) {
    return {
      weight: last.weight,
      reason: 'Same weight — build up to 8 reps first',
    }
  }
  return {
    weight: Math.max(last.weight - 5, 5),
    reason: 'Under 5 reps last time — back off and rebuild',
  }
}
