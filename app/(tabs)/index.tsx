import {
  View,
  Text,
  TextInput,
  Pressable,
  SafeAreaView,
  ScrollView,
} from 'react-native'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'

import {
  saveWorkout,
  getWorkouts,
  savePreferredSplit,
  getPreferredSplit,
  clearPreferredSplit,
  StoredWorkout,
} from '@/lib/storage'
import { lastPerformance, suggestNext } from '@/lib/recommend'
import { COLORS, FONTS, accentFor } from '@/lib/theme'

/* ---------- Exercise Library ---------- */
const EXERCISES = {
  chest: [
    'Bench Press',
    'Incline Bench',
    'Decline Bench',
    'Dumbbell Press',
    'Machine Chest Press',
    'Chest Fly',
    'Cable Fly',
    'Pec Deck',
    'Push Ups',
    'Dips',
  ],
  back: [
    'Deadlift',
    'Pull Up',
    'Chin Up',
    'Lat Pulldown',
    'Seated Row',
    'Cable Row',
    'Barbell Row',
    'Dumbbell Row',
    'T-Bar Row',
    'Face Pull',
    'Shrugs',
    'Back Extension',
  ],
  shoulders: [
    'Overhead Press',
    'Dumbbell Shoulder Press',
    'Arnold Press',
    'Machine Shoulder Press',
    'Lateral Raise',
    'Cable Lateral Raise',
    'Front Raise',
    'Rear Delt Fly',
    'Upright Row',
  ],
  arms: [
    'Bicep Curl',
    'Hammer Curl',
    'Preacher Curl',
    'EZ Bar Curl',
    'Cable Curl',
    'Concentration Curl',
    'Tricep Extension',
    'Overhead Tricep Extension',
    'Skull Crushers',
    'Cable Pushdown',
    'Close-Grip Bench',
    'Wrist Curl',
  ],
  legs: [
    'Squat',
    'Front Squat',
    'Hack Squat',
    'Goblet Squat',
    'Bulgarian Split Squat',
    'Leg Press',
    'Walking Lunge',
    'Leg Curl',
    'Leg Extension',
    'Romanian Deadlift',
    'Sumo Deadlift',
    'Calf Raise',
    'Seated Calf Raise',
  ],
  glutes: [
    'Hip Thrust',
    'Glute Bridge',
    'Cable Kickback',
    'Hip Abduction',
    'Good Morning',
  ],
  core: [
    'Plank',
    'Side Plank',
    'Crunches',
    'Sit Ups',
    'Hanging Leg Raise',
    'Cable Crunch',
    'Russian Twist',
    'Ab Wheel Rollout',
    'Dead Bug',
    'Mountain Climbers',
  ],
}

/* ---------- Splits — the popular routines ---------- */
const SPLITS = [
  {
    name: 'Full Body',
    muscles: ['chest', 'back', 'shoulders', 'arms', 'legs', 'core'],
  },
  {
    name: 'Upper / Lower',
    muscles: ['chest', 'back', 'shoulders', 'arms', 'legs', 'glutes'],
  },
  {
    name: 'Push / Pull / Legs',
    muscles: ['chest', 'shoulders', 'arms', 'back', 'legs', 'glutes'],
  },
  {
    name: 'Bro Split',
    muscles: ['chest', 'back', 'shoulders', 'arms', 'legs'],
  },
  {
    name: 'Arnold Split',
    muscles: ['chest', 'back', 'shoulders', 'arms', 'legs', 'core'],
  },
  {
    name: 'PHUL',
    muscles: ['chest', 'back', 'shoulders', 'arms', 'legs', 'glutes'],
  },
  {
    name: 'PHAT',
    muscles: ['chest', 'back', 'shoulders', 'arms', 'legs', 'glutes'],
  },
  {
    name: '5×5 Strength',
    muscles: ['chest', 'back', 'shoulders', 'legs'],
  },
]

type Split = (typeof SPLITS)[number]

/* ---------- Types ---------- */
type SetEntry = {
  reps: number
  weight: number
}

type ExerciseEntry = {
  name: string
  sets: SetEntry[]
}

type WorkoutSession = {
  active: boolean
  split: string | null
  startedAt: number
  exercises: ExerciseEntry[]
}

/* ---------- Date Helpers ---------- */
const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d.getDate()).padStart(2, '0')}`

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const currentWeek = () => {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  return DAY_LABELS.map((label, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return { label, day: d.getDate(), date: toDateStr(d) }
  })
}

const formatElapsed = (ms: number) => {
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/* ---------- Screen ---------- */
export default function Index() {
  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [selectedSplit, setSelectedSplit] = useState<Split | null>(null)
  const [selectedExercise, setSelectedExercise] =
    useState<string | null>(null)

  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [justSaved, setJustSaved] = useState(false)
  const [history, setHistory] = useState<StoredWorkout[]>([])
  const [now, setNow] = useState(Date.now())

  useFocusEffect(
    useCallback(() => {
      getWorkouts().then(setHistory)
    }, [])
  )

  // Restore the user's routine of choice once on launch, so the app
  // opens with their split selected and the Start button ready.
  useEffect(() => {
    getPreferredSplit().then(name => {
      if (!name) return
      const split = SPLITS.find(s => s.name === name)
      if (split) setSelectedSplit(current => current ?? split)
    })
  }, [])

  const chooseSplit = (split: Split, alreadySelected: boolean) => {
    if (alreadySelected) {
      setSelectedSplit(null)
      clearPreferredSplit()
    } else {
      setSelectedSplit(split)
      savePreferredSplit(split.name)
    }
  }

  // Live session clock, like the reference's 00:00 header timer.
  useEffect(() => {
    if (!session) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [session])

  const week = useMemo(currentWeek, [])
  const today = toDateStr(new Date())

  const lastSessionBySplit = useMemo(() => {
    const map: Record<string, StoredWorkout> = {}
    for (const w of history) {
      if (!map[w.split] || w.date > map[w.split].date) map[w.split] = w
    }
    return map
  }, [history])

  const recommendedExercises = useMemo(() => {
    const split = SPLITS.find(s => s.name === session?.split)
    if (!split) return []
    const list: string[] = []
    split.muscles.forEach(muscle => {
      list.push(...EXERCISES[muscle as keyof typeof EXERCISES])
    })
    return Array.from(new Set(list))
  }, [session?.split])

  const startWorkout = () => {
    if (!selectedSplit) return
    setJustSaved(false)
    setSession({
      active: true,
      split: selectedSplit.name,
      startedAt: Date.now(),
      exercises: [],
    })
  }

  const endWorkout = async () => {
    if (session && session.exercises.length > 0) {
      await saveWorkout({
        date: today,
        split: session.split ?? 'Workout',
        exercises: session.exercises,
      })
      setJustSaved(true)
      getWorkouts().then(setHistory)
    }
    setSession(null)
    setSelectedExercise(null)
    // Fall back to the remembered routine so the next session is
    // one tap away.
    const name = await getPreferredSplit()
    setSelectedSplit(SPLITS.find(s => s.name === name) ?? null)
  }

  const addSet = () => {
    if (!session || !selectedExercise || !reps || !weight) return

    const exercises = [...session.exercises]
    let exercise = exercises.find(e => e.name === selectedExercise)

    if (!exercise) {
      exercise = { name: selectedExercise, sets: [] }
      exercises.push(exercise)
    }

    exercise.sets.push({
      reps: Number(reps),
      weight: Number(weight),
    })

    setSession({ ...session, exercises })
    setReps('')
    setWeight('')
  }

  const accent = accentFor(session?.split ?? selectedSplit?.name)

  const recommendation = useMemo(() => {
    if (!selectedExercise) return null
    const last = lastPerformance(history, selectedExercise)
    if (!last) return null
    return { last, next: suggestNext(last) }
  }, [history, selectedExercise])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
        {!session ? (
          <>
            {/* Greeting */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24,
              }}
            >
              <Text style={{ fontSize: 30 }}>
                <Text
                  style={{
                    color: COLORS.text,
                    fontFamily: FONTS.display,
                  }}
                >
                  Hey,{' '}
                </Text>
                <Text
                  style={{
                    color: COLORS.faint,
                    fontFamily: FONTS.display,
                  }}
                >
                  Ray
                </Text>
              </Text>
              <Ionicons name="barbell" size={22} color={COLORS.faint} />
            </View>

            {/* Week strip */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 28,
              }}
            >
              {week.map(d => {
                const isToday = d.date === today
                const trained = history.some(w => w.date === d.date)
                return (
                  <View
                    key={d.date}
                    style={{
                      alignItems: 'center',
                      paddingVertical: 10,
                      paddingHorizontal: 8,
                      borderRadius: 14,
                      backgroundColor: isToday
                        ? COLORS.cardAlt
                        : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        color: isToday ? COLORS.text : COLORS.muted,
                        fontFamily: FONTS.bodyBold,
                        fontSize: 15,
                      }}
                    >
                      {d.day}
                    </Text>
                    <Text
                      style={{
                        color: isToday ? COLORS.peach : COLORS.faint,
                        fontFamily: FONTS.bodySemi,
                        fontSize: 9,
                        letterSpacing: 1,
                        marginTop: 3,
                      }}
                    >
                      {d.label}
                    </Text>
                    <View
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        marginTop: 4,
                        backgroundColor: trained
                          ? COLORS.green
                          : 'transparent',
                      }}
                    />
                  </View>
                )
              })}
            </View>

            {/* Saved toast */}
            {justSaved && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: COLORS.card,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  padding: 14,
                  marginBottom: 16,
                }}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={COLORS.green}
                />
                <Text
                  style={{
                    color: COLORS.text,
                    fontFamily: FONTS.bodySemi,
                    marginLeft: 8,
                  }}
                >
                  Workout saved — see the calendar.
                </Text>
              </View>
            )}

            {/* Training-day hero */}
            <LinearGradient
              colors={
                selectedSplit
                  ? [accent, COLORS.pink]
                  : ['#232630', '#1A1C24']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 24,
                padding: 22,
                marginBottom: 32,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text
                  style={{
                    color: selectedSplit ? '#141414' : COLORS.text,
                    fontFamily: FONTS.display,
                    fontSize: 20,
                  }}
                >
                  {selectedSplit ? 'Training day' : 'No split selected'}
                </Text>
                <Text
                  style={{
                    color: selectedSplit ? '#141414' : COLORS.muted,
                    fontFamily: FONTS.bodySemi,
                    fontSize: 13,
                    marginTop: 4,
                    opacity: selectedSplit ? 0.75 : 1,
                  }}
                >
                  {selectedSplit
                    ? selectedSplit.name
                    : 'Pick a split below to plan today'}
                </Text>
              </View>

              {selectedSplit && (
                <Pressable
                  onPress={startWorkout}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#141414',
                    paddingVertical: 12,
                    paddingHorizontal: 18,
                    borderRadius: 999,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  })}
                >
                  <Ionicons name="play" size={13} color={COLORS.text} />
                  <Text
                    style={{
                      color: COLORS.text,
                      fontFamily: FONTS.bodyBold,
                      fontSize: 14,
                      marginLeft: 6,
                    }}
                  >
                    Start
                  </Text>
                </Pressable>
              )}
            </LinearGradient>

            {/* Splits — staggered two-column grid */}
            <Text
              style={{
                color: COLORS.text,
                fontFamily: FONTS.display,
                fontSize: 21,
                marginBottom: 16,
              }}
            >
              Splits
            </Text>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}
            >
              {SPLITS.map((split, idx) => {
                const a = accentFor(split.name)
                const selected = selectedSplit?.name === split.name
                const last = lastSessionBySplit[split.name]
                return (
                  <Pressable
                    key={split.name}
                    onPress={() => chooseSplit(split, selected)}
                    style={{
                      width: '47.5%',
                      backgroundColor: COLORS.card,
                      borderRadius: 20,
                      padding: 16,
                      marginBottom: 14,
                      marginTop: idx % 2 === 1 ? 22 : 0,
                      borderWidth: 1.5,
                      borderColor: selected ? a : COLORS.border,
                    }}
                  >
                    <Text
                      style={{
                        color: a,
                        fontFamily: FONTS.display,
                        fontSize: 16,
                      }}
                    >
                      {split.name}
                    </Text>
                    <Text
                      style={{
                        color: COLORS.faint,
                        fontFamily: FONTS.bodySemi,
                        fontSize: 11,
                        marginTop: 6,
                        textTransform: 'capitalize',
                      }}
                    >
                      {split.muscles.join(' · ')}
                    </Text>
                    <Text
                      style={{
                        color: COLORS.muted,
                        fontFamily: FONTS.bodySemi,
                        fontSize: 11,
                        marginTop: 10,
                      }}
                    >
                      {last
                        ? `Last session  ${last.date.slice(5)}`
                        : 'Not trained yet'}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </>
        ) : (
          <>
            {/* Session header: split name + live timer */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  color: accent,
                  fontFamily: FONTS.display,
                  fontSize: 22,
                  flex: 1,
                  paddingRight: 12,
                }}
              >
                {session.split}
              </Text>
              <View
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={COLORS.muted}
                />
                <Text
                  style={{
                    color: COLORS.text,
                    fontFamily: FONTS.display,
                    fontSize: 20,
                    marginLeft: 6,
                  }}
                >
                  {formatElapsed(now - session.startedAt)}
                </Text>
              </View>
            </View>

            {/* Exercise chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 20 }}
            >
              {recommendedExercises.map(ex => {
                const selected = selectedExercise === ex
                return (
                  <Pressable
                    key={ex}
                    onPress={() => setSelectedExercise(ex)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      marginRight: 8,
                      borderRadius: 999,
                      backgroundColor: selected ? accent : COLORS.card,
                      borderWidth: 1,
                      borderColor: selected ? accent : COLORS.border,
                    }}
                  >
                    <Text
                      style={{
                        color: selected ? '#141414' : COLORS.text,
                        fontFamily: FONTS.bodySemi,
                        fontSize: 13,
                      }}
                    >
                      {ex}
                    </Text>
                  </Pressable>
                )
              })}
            </ScrollView>

            {/* Coach suggestion from last time this exercise was done */}
            {recommendation && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: COLORS.card,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  padding: 14,
                  marginBottom: 14,
                }}
              >
                <Ionicons
                  name="trending-up"
                  size={18}
                  color={accent}
                  style={{ marginRight: 10 }}
                />
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text
                    style={{
                      color: COLORS.text,
                      fontFamily: FONTS.bodyBold,
                      fontSize: 13,
                    }}
                  >
                    Last time: {recommendation.last.weight} lbs ×{' '}
                    {recommendation.last.reps}
                  </Text>
                  <Text
                    style={{
                      color: COLORS.muted,
                      fontFamily: FONTS.bodySemi,
                      fontSize: 11,
                      marginTop: 2,
                    }}
                  >
                    {recommendation.next.reason}
                  </Text>
                </View>
                <Pressable
                  onPress={() =>
                    setWeight(String(recommendation.next.weight))
                  }
                  style={({ pressed }) => ({
                    backgroundColor: accent,
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 999,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text
                    style={{
                      color: '#141414',
                      fontFamily: FONTS.bodyBold,
                      fontSize: 13,
                    }}
                  >
                    {recommendation.next.weight} lbs
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Inputs — asymmetric pair, weight leads */}
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <TextInput
                placeholder="Weight (lbs)"
                placeholderTextColor={COLORS.faint}
                keyboardType="number-pad"
                value={weight}
                onChangeText={setWeight}
                style={{
                  flex: 1.4,
                  backgroundColor: COLORS.cardAlt,
                  color: COLORS.text,
                  fontFamily: FONTS.bodySemi,
                  padding: 16,
                  borderRadius: 16,
                  marginRight: 10,
                }}
              />
              <TextInput
                placeholder="Reps"
                placeholderTextColor={COLORS.faint}
                keyboardType="number-pad"
                value={reps}
                onChangeText={setReps}
                style={{
                  flex: 1,
                  backgroundColor: COLORS.cardAlt,
                  color: COLORS.text,
                  fontFamily: FONTS.bodySemi,
                  padding: 16,
                  borderRadius: 16,
                }}
              />
            </View>

            <Pressable
              onPress={addSet}
              style={({ pressed }) => ({
                alignSelf: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.cardAlt,
                borderWidth: 1,
                borderColor: COLORS.border,
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 999,
                marginBottom: 24,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Ionicons name="add" size={16} color={COLORS.text} />
              <Text
                style={{
                  color: COLORS.text,
                  fontFamily: FONTS.bodyBold,
                  fontSize: 13,
                  marginLeft: 4,
                }}
              >
                Add set
              </Text>
            </Pressable>

            {/* Logged sets — reference-style table */}
            {session.exercises.map(ex => (
              <View key={ex.name} style={{ marginBottom: 18 }}>
                <Text
                  style={{
                    color: COLORS.text,
                    fontFamily: FONTS.display,
                    fontSize: 15,
                    marginBottom: 8,
                  }}
                >
                  {ex.name}
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    paddingHorizontal: 4,
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      width: 44,
                      color: COLORS.faint,
                      fontFamily: FONTS.bodySemi,
                      fontSize: 11,
                    }}
                  >
                    Set
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      color: COLORS.faint,
                      fontFamily: FONTS.bodySemi,
                      fontSize: 11,
                    }}
                  >
                    Weight
                  </Text>
                  <Text
                    style={{
                      width: 60,
                      color: COLORS.faint,
                      fontFamily: FONTS.bodySemi,
                      fontSize: 11,
                      textAlign: 'right',
                    }}
                  >
                    Reps
                  </Text>
                </View>

                {ex.sets.map((set, idx) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: COLORS.card,
                      borderRadius: 14,
                      paddingVertical: 12,
                      paddingHorizontal: 4,
                      marginBottom: 6,
                    }}
                  >
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        marginLeft: 6,
                        marginRight: 10,
                        backgroundColor: COLORS.cardAlt,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color: accent,
                          fontFamily: FONTS.bodyBold,
                          fontSize: 12,
                        }}
                      >
                        {idx + 1}
                      </Text>
                    </View>
                    <Text
                      style={{
                        flex: 1,
                        color: COLORS.text,
                        fontFamily: FONTS.bodySemi,
                        fontSize: 14,
                      }}
                    >
                      {set.weight} lbs
                    </Text>
                    <Text
                      style={{
                        width: 60,
                        color: COLORS.text,
                        fontFamily: FONTS.bodySemi,
                        fontSize: 14,
                        textAlign: 'right',
                        paddingRight: 6,
                      }}
                    >
                      {set.reps}
                    </Text>
                  </View>
                ))}
              </View>
            ))}

            {/* Finish CTA */}
            <Pressable
              onPress={endWorkout}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.98 : 1 }],
                marginTop: 12,
              })}
            >
              <LinearGradient
                colors={[COLORS.blueDeep, COLORS.blue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 18,
                  borderRadius: 999,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontFamily: FONTS.bodyBold,
                    fontSize: 16,
                  }}
                >
                  Finish workout
                </Text>
              </LinearGradient>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
