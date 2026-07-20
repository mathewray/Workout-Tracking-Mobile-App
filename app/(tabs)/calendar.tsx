import {
  View,
  Text,
  Pressable,
  SafeAreaView,
  ScrollView,
} from 'react-native'
import { useCallback, useMemo, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { getWorkouts, StoredWorkout } from '@/lib/storage'
import { COLORS, FONTS, accentFor } from '@/lib/theme'

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
  const [workouts, setWorkouts] = useState<StoredWorkout[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  useFocusEffect(
    useCallback(() => {
      getWorkouts().then(setWorkouts)
    }, [])
  )

  const monthMatrix = getMonthMatrix(year, month)
  const monthName = new Date(year, month, 1).toLocaleString('default', {
    month: 'long',
  })

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear(y => y - 1)
    } else {
      setMonth(m => m - 1)
    }
  }

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear(y => y + 1)
    } else {
      setMonth(m => m + 1)
    }
  }

  const lastWorkout = useMemo(() => {
    if (workouts.length === 0) return null
    return [...workouts].sort((a, b) => a.date.localeCompare(b.date))[
      workouts.length - 1
    ]
  }, [workouts])

  const workoutsForSelectedDate = workouts.filter(
    w => w.date === selectedDate
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              color: COLORS.text,
              fontFamily: FONTS.display,
              fontSize: 30,
            }}
          >
            Calendar
          </Text>
          <Text
            style={{
              color: COLORS.muted,
              fontFamily: FONTS.bodySemi,
              fontSize: 13,
              marginTop: 4,
            }}
          >
            Track consistency over time
          </Text>
        </View>

        {/* Last workout hero */}
        <View
          style={{
            backgroundColor: COLORS.card,
            borderRadius: 24,
            padding: 22,
            marginBottom: 28,
            borderWidth: 1,
            borderColor: COLORS.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text
              style={{
                color: COLORS.faint,
                fontFamily: FONTS.bodySemi,
                fontSize: 10,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              {lastWorkout ? 'Last workout' : 'Get started'}
            </Text>
            <Text
              style={{
                color: lastWorkout
                  ? accentFor(lastWorkout.split)
                  : COLORS.text,
                fontFamily: FONTS.display,
                fontSize: 24,
                marginTop: 6,
              }}
            >
              {lastWorkout ? lastWorkout.split : 'No workouts yet'}
            </Text>
            <Text
              style={{
                color: COLORS.muted,
                fontFamily: FONTS.bodySemi,
                fontSize: 12,
                marginTop: 4,
              }}
            >
              {lastWorkout
                ? `${lastWorkout.date} · ${workouts.length} workout${
                    workouts.length === 1 ? '' : 's'
                  } logged`
                : 'Log your first session on the Workout tab.'}
            </Text>
          </View>
          <Ionicons
            name={lastWorkout ? 'flame' : 'barbell'}
            size={26}
            color={
              lastWorkout ? accentFor(lastWorkout.split) : COLORS.faint
            }
          />
        </View>

        {/* Month header + navigation */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <Pressable onPress={prevMonth} hitSlop={12}>
            <Ionicons
              name="chevron-back"
              size={20}
              color={COLORS.muted}
            />
          </Pressable>

          <Text
            style={{
              color: COLORS.text,
              fontFamily: FONTS.display,
              fontSize: 19,
            }}
          >
            {monthName} {year}
          </Text>

          <Pressable onPress={nextMonth} hitSlop={12}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.muted}
            />
          </Pressable>
        </View>

        {/* Weekday labels */}
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, idx) => (
            <Text
              key={idx}
              style={{
                flex: 1,
                textAlign: 'center',
                color: COLORS.faint,
                fontFamily: FONTS.bodySemi,
                fontSize: 11,
              }}
            >
              {d}
            </Text>
          ))}
        </View>

        {/* Calendar grid */}
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

            const dayWorkouts = workouts.filter(
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
                  borderRadius: 12,
                  backgroundColor: selected
                    ? COLORS.cardAlt
                    : 'transparent',
                  borderWidth: selected ? 1 : 0,
                  borderColor: COLORS.border,
                }}
              >
                <Text
                  style={{
                    color: selected ? COLORS.text : COLORS.muted,
                    fontFamily: FONTS.bodyBold,
                    fontSize: 14,
                  }}
                >
                  {day}
                </Text>

                <View style={{ flexDirection: 'row', marginTop: 4 }}>
                  {dayWorkouts.slice(0, 3).map((w, i) => (
                    <View
                      key={i}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 3,
                        marginHorizontal: 1,
                        backgroundColor: accentFor(w.split),
                      }}
                    />
                  ))}
                </View>
              </Pressable>
            )
          })}
        </View>

        {/* Selected day workouts */}
        {selectedDate && (
          <>
            <Text
              style={{
                color: COLORS.text,
                fontFamily: FONTS.display,
                fontSize: 17,
                marginBottom: 12,
              }}
            >
              {selectedDate}
            </Text>

            {workoutsForSelectedDate.length === 0 ? (
              <Text
                style={{
                  color: COLORS.faint,
                  fontFamily: FONTS.bodySemi,
                  fontSize: 13,
                }}
              >
                No workouts logged.
              </Text>
            ) : (
              workoutsForSelectedDate.map((w, idx) => {
                const a = accentFor(w.split)
                return (
                  <View
                    key={idx}
                    style={{
                      backgroundColor: COLORS.card,
                      padding: 18,
                      borderRadius: 20,
                      marginBottom: 10,
                      borderWidth: 1,
                      borderColor: COLORS.border,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 10,
                      }}
                    >
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: a,
                          marginRight: 8,
                        }}
                      />
                      <Text
                        style={{
                          color: a,
                          fontFamily: FONTS.display,
                          fontSize: 16,
                        }}
                      >
                        {w.split}
                      </Text>
                    </View>

                    {w.exercises.map(ex => (
                      <View key={ex.name} style={{ marginBottom: 8 }}>
                        <Text
                          style={{
                            color: COLORS.text,
                            fontFamily: FONTS.bodyBold,
                            fontSize: 13,
                          }}
                        >
                          {ex.name}
                        </Text>
                        {ex.sets.map((set, sIdx) => (
                          <Text
                            key={sIdx}
                            style={{
                              color: COLORS.muted,
                              fontFamily: FONTS.bodySemi,
                              fontSize: 12,
                              marginTop: 2,
                            }}
                          >
                            Set {sIdx + 1} · {set.weight} lbs ×{' '}
                            {set.reps}
                          </Text>
                        ))}
                      </View>
                    ))}
                  </View>
                )
              })
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
