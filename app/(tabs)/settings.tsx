import { useClerk, useUser } from "@clerk/expo";
import * as ImagePicker from "expo-image-picker";
import { styled } from "nativewind";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function Settings() {
  const { user } = useUser();
  const { signOut } = useClerk();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const email = useMemo(() => user?.primaryEmailAddress?.emailAddress ?? null, [user]);

  useEffect(() => {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
  }, [user?.firstName, user?.lastName]);

  const isDirty = useMemo(() => {
    return (
      firstName.trim() !== (user?.firstName ?? "") || lastName.trim() !== (user?.lastName ?? "")
    );
  }, [firstName, lastName, user?.firstName, user?.lastName]);

  const avatarSource = useMemo(() => {
    if (user?.imageUrl) return { uri: user.imageUrl };
    return null;
  }, [user?.imageUrl]);

  const handlePickAvatar = async () => {
    if (!user) return;
    setError(null);
    setSuccess(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Allow photo access to update your profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    try {
      setIsUpdatingPhoto(true);
      const assetUri = result.assets[0].uri;
      const blob = await (await fetch(assetUri)).blob();
      await user.setProfileImage({ file: blob });
      setSuccess("Profile photo updated.");
    } catch {
      setError("Couldn’t update your profile photo. Try again.");
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setError(null);
    setSuccess(null);

    const nextFirstName = firstName.trim();
    const nextLastName = lastName.trim();

    if (!nextFirstName && !nextLastName) {
      setError("Add at least a first name or last name.");
      return;
    }

    try {
      setIsSaving(true);
      await user.update({
        ...(nextFirstName !== (user.firstName ?? "") ? { firstName: nextFirstName } : {}),
        ...(nextLastName !== (user.lastName ?? "") ? { lastName: nextLastName } : {}),
      });
      setSuccess("Profile updated.");
    } catch {
      setError("Couldn’t save your changes. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="bg-background flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView className="flex-1" contentContainerClassName="px-5 pb-10 pt-6">
          <Text className="text-2xl font-sans-bold text-primary">Settings</Text>
          <Text className="mt-2 text-sm font-sans-medium text-muted-foreground">
            Keep your profile up to date so your account is easy to recognize.
          </Text>

          <View className="auth-card">
            <Text className="text-lg font-sans-bold text-primary">Profile</Text>

            

            <View className="mt-5 flex-row items-center justify-between gap-4">
              <View className="flex-row items-center gap-4">
                <View className="size-16 overflow-hidden rounded-full border border-border bg-muted">
                  {avatarSource ? (
                    <Image source={avatarSource} className="size-16" />
                  ) : (
                    <View className="size-16 items-center justify-center">
                      <Text className="text-base font-sans-bold text-muted-foreground">?</Text>
                    </View>
                  )}
                </View>

                <View className="min-w-0 flex-1">
                  <Text className="text-sm font-sans-semibold text-muted-foreground">Email</Text>
                  <Text className="mt-1 text-base font-sans-bold text-primary" numberOfLines={1}>
                    {email ?? user?.id ?? "—"}
                  </Text>
                </View>
              </View>

              
            </View>

            <Pressable
                className={`auth-secondary-button mt-4 px-4 ${isUpdatingPhoto ? "auth-button-disabled" : ""}`}
                onPress={handlePickAvatar}
                disabled={isUpdatingPhoto}
              >
                <Text 
                className="auth-secondary-button-text"
                >
                  {isUpdatingPhoto ? "Updating…" : "Change photo"}
                </Text>
              </Pressable>

            <View className="mt-6 gap-4">
              <View className="auth-field">
                <Text className="auth-label">First name</Text>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Enter your first name"
                  placeholderTextColor="#6b7280"
                  className="auth-input"
                  editable={!isSaving}
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Last name</Text>
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Enter your last name"
                  placeholderTextColor="#6b7280"
                  className="auth-input"
                  editable={!isSaving}
                />
              </View>

              {!!error && <Text className="auth-error">{error}</Text>}
              {!!success && <Text className="text-xs font-sans-medium text-success">{success}</Text>}

              <Pressable
                className={`auth-button ${!isDirty || isSaving ? "auth-button-disabled" : ""}`}
                onPress={handleSave}
                disabled={!isDirty || isSaving}
              >
                <Text className="auth-button-text">{isSaving ? "Saving…" : "Save changes"}</Text>
              </Pressable>
            </View>
          </View>

          <View className="mt-6 rounded-3xl border border-border bg-card p-5">
            <Text className="text-lg font-sans-bold text-primary">Security</Text>
            <Text className="mt-2 text-sm font-sans-medium text-muted-foreground">
              Sign out on this device anytime.
            </Text>

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
          </View>

          <Text className="mt-6 text-center text-sm font-sans-medium text-muted-foreground">
            Your data stays private and is used only to keep your subscriptions organized.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
