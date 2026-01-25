import {
  View,
  Text,
  Pressable,
  SafeAreaView,
  ScrollView,
} from 'react-native'
import { useMemo, useState } from 'react'

/* ---------- Design System ---------- */
const COLORS = {
  bg: '#07070A',
  card: '#111114',
  primary: '#22C55E',
  accent: '#38BDF8',
  text: '#F8FAFC',
  muted: '#9CA3AF',
  border: '#1F2937',
}

/* ---------- TEMP HISTORY (replace w/ AsyncStorage later) ---------- */
const HISTORY = [
  { date: '2025-01-02', split: 'Push' },
  { date: '2025-01-04', split: 'Pull' },
  { date: '2025-01-06', split: 'Legs' },
  { date: '2025-01-09', split: 'Push' },
]

/* ---------- Split Rotation ---------- */
const SPLIT_ROTATION = ['Push', 'Pull', 'Legs']

/* ---------- Date Helpers ---------- */
const today = new Date()

const getMonthMatrix = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const matrix: (number | null)[] = []

  const startWeekday = (firstDay.getDay() + 6) % 7 // Mon start
  for (let i = 0; i < startWeekday; i++) matrix.push(null)

  for (let d = 1; d <= lastDay.getDate(); d++) matrix.push(d)

  return matrix
}

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const year = today.getFullYear()
  const month = today.getMonth()

  const monthMatrix = getMonthMatrix(year, month)
  const monthName = today.toLocaleString('default', { month: 'long' })

  /* ---------- Next Workout ---------- */
  const nextWorkout = useMemo(() => {
    if (HISTORY.length === 0) return 'Push'
    const last = HISTORY[HISTORY.length - 1].split
    const idx = SPLIT_ROTATION.indexOf(last)
    return SPLIT_ROTATION[(idx + 1) % SPLIT_ROTATION.length]
  }, [])

  const workoutsForSelectedDate = HISTORY.filter(
    w => w.date === selectedDate
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        {/* Header */}
        <View style={{ marginBottom: 28 }}>
          <Text
            style={{
              color: COLORS.text,
              fontSize: 32,
              fontWeight: '900',
            }}
          >
            Calendar
          </Text>
          <Text style={{ color: COLORS.muted }}>
            Track consistency over time
          </Text>
        </View>

        {/* Next Workout Hero */}
        <View
          style={{
            backgroundColor: COLORS.card,
            borderRadius: 28,
            padding: 24,
            marginBottom: 28,
            borderWidth: 1,
            borderColor: COLORS.border,
            shadowColor: COLORS.primary,
            shadowOpacity: 0.25,
            shadowRadius: 30,
            elevation: 12,
          }}
        >
          <Text
            style={{
              color: COLORS.muted,
              fontSize: 12,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            Next Workout
          </Text>
          <Text
            style={{
              color: COLORS.primary,
              fontSize: 34,
              fontWeight: '900',
              marginTop: 6,
            }}
          >
            {nextWorkout}
          </Text>
        </View>

        {/* Month Header */}
        <Text
          style={{
            color: COLORS.text,
            fontSize: 22,
            fontWeight: '800',
            marginBottom: 12,
          }}
        >
          {monthName} {year}
        </Text>

        {/* Weekday Labels */}
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => (
            <Text
              key={d}
              style={{
                flex: 1,
                textAlign: 'center',
                color: COLORS.muted,
                fontSize: 12,
              }}
            >
              {d}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: 24,
          }}
        >
          {monthMatrix.map((day, idx) => {
            if (!day)
              return (
                <View
                  key={idx}
                  style={{ width: '14.28%', height: 48 }}
                />
              )

            const dateStr = `${year}-${String(month + 1).padStart(
              2,
              '0'
            )}-${String(day).padStart(2, '0')}`

            const hasWorkout = HISTORY.some(
              w => w.date === dateStr
            )

            const selected = selectedDate === dateStr

            return (
              <Pressable
                key={idx}
                onPress={() => setSelectedDate(dateStr)}
                style={{
                  width: '14.28%',
                  height: 48,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 10,
                  backgroundColor: selected
                    ? COLORS.primary
                    : 'transparent',
                }}
              >
                <Text
                  style={{
                    color: selected ? '#000' : COLORS.text,
                    fontWeight: '700',
                  }}
                >
                  {day}
                </Text>

                {hasWorkout && !selected && (
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: COLORS.primary,
                      marginTop: 4,
                    }}
                  />
                )}
              </Pressable>
            )
          })}
        </View>

        {/* Selected Day Workouts */}
        {selectedDate && (
          <>
            <Text
              style={{
                color: COLORS.text,
                fontSize: 18,
                fontWeight: '800',
                marginBottom: 12,
              }}
            >
              Workouts on {selectedDate}
            </Text>

            {workoutsForSelectedDate.length === 0 ? (
              <Text style={{ color: COLORS.muted }}>
                No workouts logged.
              </Text>
            ) : (
              workoutsForSelectedDate.map((w, idx) => (
                <View
                  key={idx}
                  style={{
                    backgroundColor: COLORS.card,
                    padding: 16,
                    borderRadius: 16,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.accent,
                      fontWeight: '800',
                    }}
                  >
                    {w.split}
                  </Text>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
