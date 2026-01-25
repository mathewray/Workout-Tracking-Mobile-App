import {
  View,
  Text,
  TextInput,
  Pressable,
  SafeAreaView,
  ScrollView,
} from 'react-native'
import { useState, useMemo } from 'react'



/* ---------- Design System ---------- */
const COLORS = {
  bg: '#07070A',
  card: '#111114',
  primary: '#22C55E',
  accent: '#38BDF8',
  danger: '#EF4444',
  text: '#F8FAFC',
  muted: '#9CA3AF',
  border: '#1F2937',
}

/* ---------- Exercise Library ---------- */
const EXERCISES = {
  chest: [
    'Bench Press',
    'Incline Bench',
    'Decline Bench',
    'Chest Fly',
    'Cable Fly',
    'Push Ups',
    'Dips',
  ],
  back: [
    'Deadlift',
    'Pull Up',
    'Lat Pulldown',
    'Seated Row',
    'Barbell Row',
    'T-Bar Row',
    'Face Pull',
  ],
  shoulders: [
    'Overhead Press',
    'Dumbbell Shoulder Press',
    'Lateral Raise',
    'Front Raise',
    'Rear Delt Fly',
  ],
  arms: [
    'Bicep Curl',
    'Hammer Curl',
    'Preacher Curl',
    'Tricep Extension',
    'Skull Crushers',
    'Cable Pushdown',
  ],
  legs: [
    'Squat',
    'Front Squat',
    'Leg Press',
    'Leg Curl',
    'Leg Extension',
    'Romanian Deadlift',
    'Calf Raise',
  ],
  core: [
    'Plank',
    'Hanging Leg Raise',
    'Cable Crunch',
    'Russian Twist',
  ],
}


/* ---------- Correct Splits ---------- */
const SPLITS = [
  {
    name: 'Full Body',
    muscles: ['chest', 'back', 'shoulders', 'arms', 'legs', 'core'],
  },
  {
    name: 'Upper / Lower',
    muscles: ['chest', 'back', 'shoulders', 'arms', 'legs'],
  },
  {
    name: 'Push / Pull / Legs',
    muscles: ['chest', 'shoulders', 'arms', 'back', 'legs'],
  },
  {
    name: 'Body Part Split',
    muscles: ['chest', 'back', 'shoulders', 'arms', 'legs'],
  },
  {
    name: 'Arnold Split',
    muscles: ['chest', 'back', 'shoulders', 'arms', 'legs', 'core'],
  },
  {
    name: 'Lift-Based',
    muscles: ['chest', 'back', 'legs'],
  },
]

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
  exercises: ExerciseEntry[]
}

/* ---------- Button ---------- */
const PrimaryButton = ({
  title,
  onPress,
  variant = 'primary',
}: {
  title: string
  onPress: () => void
  variant?: 'primary' | 'danger'
}) => {
  const bg =
    variant === 'danger' ? COLORS.danger : COLORS.primary

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: bg,
        paddingVertical: 18,
        borderRadius: 20,
        marginTop: 16,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Text
        style={{
          color: '#000',
          textAlign: 'center',
          fontWeight: '900',
          fontSize: 18,
        }}
      >
        {title}
      </Text>
    </Pressable>
  )
}

/* ---------- Screen ---------- */
export default function Index() {
  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [selectedSplit, setSelectedSplit] = useState<any>(null)
  const [selectedExercise, setSelectedExercise] =
    useState<string | null>(null)

  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')

  /* ---------- Exercise Recommendations ---------- */
  const recommendedExercises = useMemo(() => {
    if (!selectedSplit) return []
    const list: string[] = []

    selectedSplit.muscles.forEach((muscle: keyof typeof EXERCISES) => {
      list.push(...EXERCISES[muscle])
    })

    return Array.from(new Set(list))
  }, [selectedSplit])

  const startWorkout = () => {
    setSession({
      active: true,
      split: selectedSplit?.name ?? null,
      exercises: [],
    })
  }

  const endWorkout = () => {
    setSession(null)
    setSelectedSplit(null)
    setSelectedExercise(null)
  }

  /* ---------- CORE LOGIC: ADD SET ---------- */
  const addSet = () => {
    if (!session || !selectedExercise || !reps || !weight)
      return

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

    // Save + clear inputs
    setSession({ ...session, exercises })
    setReps('')
    setWeight('')
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 160 }}>
        {/* Header */}
        <Text style={{ color: COLORS.text, fontSize: 36, fontWeight: '900' }}>
          Gymbro
        </Text>
        <Text style={{ color: COLORS.muted, marginBottom: 24 }}>
          Smart splits. Smart tracking.
        </Text>

        {/* Card with Backlight */}
        <View
          style={{
            backgroundColor: COLORS.card,
            borderRadius: 28,
            padding: 24,
            borderWidth: 1,
            borderColor: COLORS.border,
            shadowColor: COLORS.primary,
            shadowOpacity: 0.25,
            shadowRadius: 30,
            elevation: 12,
          }}
        >
          {!session ? (
            <>
              <Text style={{ color: COLORS.muted, marginBottom: 12 }}>
                Select Split
              </Text>

              {SPLITS.map(split => (
                <Pressable
                  key={split.name}
                  onPress={() => setSelectedSplit(split)}
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    marginBottom: 10,
                    backgroundColor:
                      selectedSplit?.name === split.name
                        ? COLORS.primary
                        : COLORS.card,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                >
                  <Text
                    style={{
                      color:
                        selectedSplit?.name === split.name
                          ? '#000'
                          : COLORS.text,
                      fontWeight: '800',
                    }}
                  >
                    {split.name}
                  </Text>
                </Pressable>
              ))}

              <PrimaryButton title="Start Workout" onPress={startWorkout} />
            </>
          ) : (
            <>
              {/* Exercise Selection */}
              <Text style={{ color: COLORS.accent, marginBottom: 10 }}>
                {session.split}
              </Text>

              <ScrollView horizontal style={{ marginBottom: 16 }}>
                {recommendedExercises.map(ex => (
                  <Pressable
                    key={ex}
                    onPress={() => setSelectedExercise(ex)}
                    style={{
                      padding: 12,
                      marginRight: 10,
                      borderRadius: 16,
                      backgroundColor:
                        selectedExercise === ex
                          ? COLORS.primary
                          : COLORS.card,
                      borderWidth: 1,
                      borderColor: COLORS.border,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          selectedExercise === ex
                            ? '#000'
                            : COLORS.text,
                        fontWeight: '700',
                      }}
                    >
                      {ex}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Inputs */}
              <TextInput
                placeholder="Reps"
                keyboardType="number-pad"
                value={reps}
                onChangeText={setReps}
                style={{
                  backgroundColor: '#FFF',
                  padding: 16,
                  borderRadius: 14,
                  marginBottom: 10,
                }}
              />

              <TextInput
                placeholder="Weight (lbs)"
                keyboardType="number-pad"
                value={weight}
                onChangeText={setWeight}
                style={{
                  backgroundColor: '#FFF',
                  padding: 16,
                  borderRadius: 14,
                  marginBottom: 12,
                }}
              />

              <PrimaryButton title="Add Set" onPress={addSet} />

              {/* Logged Sets */}
              <View style={{ marginTop: 24 }}>
                {session.exercises.map(ex => (
                  <View key={ex.name} style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        color: COLORS.accent,
                        fontWeight: '800',
                        marginBottom: 6,
                      }}
                    >
                      {ex.name}
                    </Text>

                    {ex.sets.map((set, idx) => (
                      <Text key={idx} style={{ color: COLORS.text }}>
                        Set {idx + 1}: {set.reps} reps @ {set.weight} lbs
                      </Text>
                    ))}
                  </View>
                ))}
              </View>

              <PrimaryButton
                title="End Workout"
                onPress={endWorkout}
                variant="danger"
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
