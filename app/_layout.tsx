import { DarkTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import {
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk'
import {
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope'
import 'react-native-reanimated'

export const unstable_settings = {
  anchor: '(tabs)',
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_800ExtraBold,
  })

  if (!fontsLoaded) return null

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  )
}
