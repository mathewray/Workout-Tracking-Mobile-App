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
