import '@/global.css';
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

function getClerkPublishableKey(): string {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file");
  }
  return publishableKey;
}

export default function RootLayout() {
  const publishableKey = getClerkPublishableKey();

  const [fontsLoaded] = useFonts({
    'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf'),
    'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf')
  })

  useEffect(() =>{
    if(fontsLoaded){
      SplashScreen.hideAsync();
    }
  },[fontsLoaded]);

  if(!fontsLoaded) return null;
  
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }} />
    </ClerkProvider>
  );
}
