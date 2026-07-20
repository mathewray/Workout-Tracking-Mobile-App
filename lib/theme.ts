// Design system for the Gymbro redesign.
// Palette is a locked hex set sampled from the reference shots —
// warm accents on near-black, no violet/indigo anywhere.

export const COLORS = {
  bg: '#0B0B0E',
  card: '#151519',
  cardAlt: '#1C1C22',
  border: '#26262E',
  text: '#F4F2EE',
  muted: '#8A8A93',
  faint: '#55555E',

  peach: '#F0A868',
  pink: '#F2A0B5',
  teal: '#4FD1C5',
  green: '#5FD68A',
  gold: '#E8C468',
  blue: '#4D9FFF',
  blueDeep: '#2F6BFF',
  slate: '#7E93B8',
}

export const FONTS = {
  display: 'SpaceGrotesk_700Bold',
  displayMed: 'SpaceGrotesk_500Medium',
  body: 'Manrope_400Regular',
  bodySemi: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_800ExtraBold',
}

// One accent per split, mirroring the reference app's
// per-workout color coding.
export const SPLIT_ACCENTS: Record<string, string> = {
  'Full Body': COLORS.peach,
  'Upper / Lower': COLORS.teal,
  'Push / Pull / Legs': COLORS.green,
  'Body Part Split': COLORS.pink,
  'Arnold Split': COLORS.gold,
  'Lift-Based': COLORS.blue,
}

export const accentFor = (split: string | null | undefined) =>
  (split && SPLIT_ACCENTS[split]) || COLORS.peach
