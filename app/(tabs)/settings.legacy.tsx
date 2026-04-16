import { useClerk, useUser } from "@clerk/expo";
import { styled } from "nativewind";
import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function Settings() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const email = useMemo(() => user?.primaryEmailAddress?.emailAddress ?? null, [user]);

  return (
    <SafeAreaView className="bg-background flex-1 p-5">
      <Text className="text-2xl font-sans-bold text-primary">Account</Text>

      <View className="mt-6 rounded-3xl border border-border bg-card p-5">
        <Text className="text-sm font-sans-semibold text-muted-foreground">Signed in as</Text>
        <Text className="mt-1 text-lg font-sans-bold text-primary" numberOfLines={1}>
          {email ?? user?.id ?? "—"}
        </Text>
      </View>

      <Pressable
        className={`sub-cancel ${isSigningOut ? "sub-cancel-disabled" : ""}`}
        disabled={isSigningOut}
        onPress={async () => {
          try {
            setIsSigningOut(true);
            await signOut();
          } finally {
            setIsSigningOut(false);
          }
        }}
      >
        <Text className="sub-cancel-text">{isSigningOut ? "Signing out…" : "Sign out"}</Text>
      </Pressable>

      <Text className="mt-5 text-center text-sm font-sans-medium text-muted-foreground">
        Your data stays private and is used only to keep your subscriptions organized.
      </Text>
    </SafeAreaView>
  );
}
