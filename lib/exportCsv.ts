import { Platform } from 'react-native'

import { StoredWorkout } from './storage'

// Full history as one flat spreadsheet-friendly table.
export function toCsv(history: StoredWorkout[]): string {
  const rows = ['date,split,exercise,set,weight_lbs,reps']
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date))

  for (const w of sorted) {
    for (const ex of w.exercises) {
      ex.sets.forEach((set, idx) => {
        const split = w.split.includes(',') ? `"${w.split}"` : w.split
        const name = ex.name.includes(',') ? `"${ex.name}"` : ex.name
        rows.push(
          `${w.date},${split},${name},${idx + 1},${set.weight},${set.reps}`
        )
      })
    }
  }
  return rows.join('\n')
}

// Regenerates the complete record every time, so the exported file
// always contains everything logged to date.
export async function exportCsv(history: StoredWorkout[]): Promise<void> {
  const csv = toCsv(history)
  const filename = 'gymbro-workouts.csv'

  if (Platform.OS === 'web') {
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    return
  }

  const FileSystem = await import('expo-file-system/legacy')
  const Sharing = await import('expo-sharing')

  const uri = FileSystem.cacheDirectory + filename
  await FileSystem.writeAsStringAsync(uri, csv)
  await Sharing.shareAsync(uri, {
    mimeType: 'text/csv',
    dialogTitle: 'Export workout log',
  })
}
