import "@/global.css";
import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text } from "react-native";

import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <Text className="text-xl font-bold color-success" >
        Welcome to Nativewind!
      </Text>

     <Link href={"/onboarding"} className="mt-4 bg-primary text-white p-4 rounded-2xl">Go to Onboarding</Link>
     <Link href={"/(auth)/sign-in"} className="mt-4 bg-primary text-white p-4 rounded-2xl">Sign In</Link>
     <Link href={"/(auth)/sign-up"} className="mt-4 bg-primary text-white p-4 rounded-2xl">Sign Up</Link>
     <Link href={"/subscriptions/spotify"} className="mt-4 bg-primary text-white p-4 rounded-2xl">Spotify Sub</Link>
     <Link href={{
      pathname:"/subscriptions/[id]",
      params:{id:"claude"}
     }} className="mt-4 bg-primary text-white p-4 rounded-2xl">Claude</Link>
    </SafeAreaView>
  );
}