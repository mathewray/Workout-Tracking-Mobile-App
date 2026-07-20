import AsyncStorage from '@react-native-async-storage/async-storage'

export type StoredWorkout = {
  date: string // YYYY-MM-DD
  split: string
  exercises: {
    name: string
    sets: { reps: number; weight: number }[]
  }[]
}

const KEY = 'WORKOUT_HISTORY'

export async function saveWorkout(workout: StoredWorkout) {
  const existing = await getWorkouts()
  const updated = [...existing, workout]
  await AsyncStorage.setItem(KEY, JSON.stringify(updated))
}

export async function getWorkouts(): Promise<StoredWorkout[]> {
  const raw = await AsyncStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : []
}

// The user's routine of choice — restored on every launch so the
// app opens ready to start that workout.
const SPLIT_KEY = 'PREFERRED_SPLIT'

export async function savePreferredSplit(name: string) {
  await AsyncStorage.setItem(SPLIT_KEY, name)
}

export async function getPreferredSplit(): Promise<string | null> {
  return AsyncStorage.getItem(SPLIT_KEY)
}

export async function clearPreferredSplit() {
  await AsyncStorage.removeItem(SPLIT_KEY)
}
