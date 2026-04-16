import {
  extractClerkErrorMessage,
  isValidEmail,
  normalizeEmail,
  validatePassword,
} from "@/lib/auth";
import { useSignUp } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useMemo, useState } from "react";
import {
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

function cls(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean; code?: boolean }>(
    {},
  );

  const isBusy = fetchStatus === "fetching";

  const emailError = useMemo(() => {
    if (!touched.email) return null;
    if (!emailAddress.trim()) return "Email is required.";
    if (!isValidEmail(emailAddress)) return "Enter a valid email address.";
    return null;
  }, [emailAddress, touched.email]);

  const passwordError = useMemo(() => {
    if (!touched.password) return null;
    return validatePassword(password);
  }, [password, touched.password]);

  const codeError = useMemo(() => {
    if (!touched.code) return null;
    if (!code.trim()) return "Verification code is required.";
    if (code.trim().length < 4) return "Enter the code from your email.";
    return null;
  }, [code, touched.code]);

  const finishSignUp = async () => {
    if (!signUp) return;

    await signUp.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) return;
        const url = decorateUrl("/");
        if (typeof window !== "undefined" && url.startsWith("http")) {
          window.location.href = url;
        } else {
          router.replace(url as Href);
        }
      },
    });
  };

  const handleCreateAccount = async () => {
    setTouched({ email: true, password: true });
    setFormError(null);

    if (!signUp) return;
    if (emailError || passwordError) return;

    const { error } = await signUp.password({
      emailAddress: normalizeEmail(emailAddress),
      password,
    });

    if (error) {
      setFormError(extractClerkErrorMessage(error) ?? "We couldn’t create your account. Try again.");
      return;
    }

    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    setTouched((prev) => ({ ...prev, code: true }));
    setFormError(null);

    if (!signUp) return;
    if (codeError) return;

    await signUp.verifications.verifyEmailCode({ code: code.trim() });

    if (signUp.status === "complete") {
      await finishSignUp();
      return;
    }

    setFormError("That code didn’t work. Check your email and try again.");
  };

  if (!signUp) {
    return null;
  }

  const isVerifyStep =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields?.includes("email_address") &&
    (signUp.missingFields?.length ?? 0) === 0;

  if (isVerifyStep) {
    return (
      <SafeAreaView className="auth-safe-area">
        <KeyboardAvoidingView
          className="auth-screen"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView className="auth-scroll" keyboardShouldPersistTaps="handled">
            <View className="auth-content">
              <View className="auth-brand-block">
                <View className="auth-logo-wrap">
                  <View className="auth-logo-mark">
                    <Text className="auth-logo-mark-text">R</Text>
                  </View>
                  <View>
                    <Text className="auth-wordmark">Recurrly</Text>
                    <Text className="auth-wordmark-sub">Smart billing</Text>
                  </View>
                </View>

                <Text className="auth-title">Verify your email</Text>
                <Text className="auth-subtitle">
                  Enter the code we sent to finish creating your account.
                </Text>
              </View>

              <View className="auth-card">
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Verification code</Text>
                    <TextInput
                      value={code}
                      onChangeText={setCode}
                      placeholder="Enter the code"
                      placeholderTextColor="#6b7280"
                      keyboardType="numeric"
                      textContentType="oneTimeCode"
                      autoCapitalize="none"
                      className={cls("auth-input", !!codeError && "auth-input-error")}
                      onBlur={() => setTouched((prev) => ({ ...prev, code: true }))}
                      editable={!isBusy}
                    />
                    {!!codeError && <Text className="auth-error">{codeError}</Text>}
                  </View>

                  {(formError || errors?.fields?.code?.message) && (
                    <Text className="auth-error">
                      {formError ?? errors.fields.code.message}
                    </Text>
                  )}

                  <Pressable
                    className={cls("auth-button", isBusy && "auth-button-disabled")}
                    onPress={handleVerify}
                    disabled={isBusy}
                  >
                    <Text className="auth-button-text">Verify</Text>
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => signUp.verifications.sendEmailCode()}
                    disabled={isBusy}
                  >
                    <Text className="auth-secondary-button-text">Send a new code</Text>
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => {
                      signUp.reset();
                      setCode("");
                      setFormError(null);
                      setTouched({});
                    }}
                    disabled={isBusy}
                  >
                    <Text className="auth-secondary-button-text">Start over</Text>
                  </Pressable>
                </View>
              </View>

              <View className="auth-link-row">
                <Text className="auth-link-copy">Already have an account?</Text>
                <Link href={"/(auth)/sign-in" as Href} asChild>
                  <Pressable>
                    <Text className="auth-link">Sign in</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="auth-screen"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView className="auth-scroll" keyboardShouldPersistTaps="handled">
          <View className="auth-content">
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">R</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Recurrly</Text>
                  <Text className="auth-wordmark-sub">Smart billing</Text>
                </View>
              </View>

              <Text className="auth-title">Create your account</Text>
              <Text className="auth-subtitle">
                Set up your login to keep subscriptions organized in one place.
              </Text>
            </View>

            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    placeholder="Enter your email"
                    placeholderTextColor="#6b7280"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    textContentType="emailAddress"
                    className={cls("auth-input", !!emailError && "auth-input-error")}
                    onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                    editable={!isBusy}
                    returnKeyType="next"
                  />
                  {!!emailError && <Text className="auth-error">{emailError}</Text>}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <View className="relative">
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Create a password"
                      placeholderTextColor="#6b7280"
                      secureTextEntry={!showPassword}
                      textContentType="newPassword"
                      className={cls(
                        "auth-input pr-16",
                        !!passwordError && "auth-input-error",
                      )}
                      onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                      editable={!isBusy}
                      returnKeyType="done"
                      onSubmitEditing={handleCreateAccount}
                    />
                    <Pressable
                      className="absolute right-4 top-4"
                      onPress={() => setShowPassword((current) => !current)}
                      hitSlop={10}
                    >
                      <Text className="text-sm font-sans-semibold text-accent">
                        {showPassword ? "Hide" : "Show"}
                      </Text>
                    </Pressable>
                  </View>
                  {!!passwordError && <Text className="auth-error">{passwordError}</Text>}
                  <Text className="auth-helper">Use at least 8 characters.</Text>
                </View>

                {(formError ||
                  errors?.fields?.emailAddress?.message ||
                  errors?.fields?.password?.message) && (
                  <Text className="auth-error">
                    {formError ??
                      errors?.fields?.emailAddress?.message ??
                      errors?.fields?.password?.message}
                  </Text>
                )}

                <Pressable
                  className={cls(
                    "auth-button",
                    (isBusy || !!emailError || !!passwordError) && "auth-button-disabled",
                  )}
                  onPress={handleCreateAccount}
                  disabled={isBusy || !!emailError || !!passwordError}
                >
                  <Text className="auth-button-text">Create account</Text>
                </Pressable>
              </View>

              <View className="auth-link-row">
                <Text className="auth-link-copy">Already have an account?</Text>
                <Link href={"/(auth)/sign-in" as Href} asChild>
                  <Pressable>
                    <Text className="auth-link">Sign in</Text>
                  </Pressable>
                </Link>
              </View>
            </View>

            <View className="auth-divider-row">
              <View className="auth-divider-line" />
              <Text className="auth-divider-text">Secure & private</Text>
              <View className="auth-divider-line" />
            </View>

            <Text className="auth-helper text-center">
              We never share your email. It’s only used for account access and important updates.
            </Text>

            {/* Required for sign-up flows when bot protection is enabled */}
            <View nativeID="clerk-captcha" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
