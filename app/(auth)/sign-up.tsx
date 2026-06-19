import { useAuth, useSignUp } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { type Href, Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isLoading = fetchStatus === 'fetching';

  const onSignUpPress = async () => {
    const { error } = await signUp.password({
      emailAddress: email.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
    if (error) return;

    // Send email verification code
    await signUp.verifications.sendEmailCode();
  };

  const onVerifyPress = async () => {
    await signUp.verifications.verifyEmailCode({ code });

    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }
          const url = decorateUrl('/');
          router.replace(url as Href);
        },
      });
    } else {
      console.error('Sign-up attempt not complete:', signUp);
    }
  };

  // Already signed in — render nothing (layout redirect will handle it)
  if (signUp.status === 'complete' || isSignedIn) {
    return null;
  }

  // ── Email verification screen ─────────────────────────────────────────────
  if (
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0
  ) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 justify-center items-center bg-white px-6">
          <View className="w-14 h-14 rounded-2xl bg-blue-600 items-center justify-center mb-8">
            <Image
              source={require('../../assets/images/logo.png')}
              className="w-8 h-8"
              resizeMode="contain"
            />
          </View>

          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Verify your email
          </Text>
          <Text className="text-gray-500 text-sm text-center mb-8">
            We sent a 6-digit code to{'\n'}
            <Text className="font-semibold text-gray-700">{email}</Text>
          </Text>

          <View className="w-full mb-1">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Verification code
            </Text>
            <TextInput
              className="w-full border border-gray-200 rounded-2xl px-4 py-4 text-base text-gray-900 bg-gray-50 text-center tracking-widest"
              placeholder="000000"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
              maxLength={6}
            />
          </View>
          {errors.fields.code && (
            <Text className="text-red-500 text-xs self-start mb-2 ml-1">
              {errors.fields.code.message}
            </Text>
          )}

          <Pressable
            onPress={onVerifyPress}
            disabled={isLoading}
            className="w-full bg-blue-600 rounded-2xl py-4 items-center mt-5 active:opacity-80"
            style={{
              shadowColor: '#2563EB',
              shadowOpacity: 0.3,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold">Verify Email</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => signUp.verifications.sendEmailCode()}
            className="py-3 mt-2"
          >
            <Text className="text-blue-600 text-sm font-medium">Resend code</Text>
          </Pressable>

          <Pressable onPress={() => signUp.reset()} className="py-2">
            <Text className="text-gray-400 text-sm">Start over</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ── Main sign-up screen ───────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="bg-white"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-6 py-14">

          {/* Logo */}
          <View className="mb-8">
            <View className="w-14 h-14 rounded-2xl bg-blue-600 items-center justify-center mb-6">
              <Image
                source={require('../../assets/images/logo.png')}
                className="w-8 h-8"
                resizeMode="contain"
              />
            </View>
            <Text className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
              Create account
            </Text>
            <Text className="text-base text-gray-500">
              Find your dream home today
            </Text>
          </View>

          {/* Global error */}
          {errors?.global && (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <Text className="text-sm text-red-600">{errors.global[0].message}</Text>
            </View>
          )}

          {/* First + Last name row */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-700 mb-2">First name</Text>
              <TextInput
                className="border border-gray-200 rounded-2xl px-4 py-4 text-base text-gray-900 bg-gray-50"
                placeholder="John"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                returnKeyType="next"
                value={firstName}
                onChangeText={setFirstName}
              />
              {errors?.fields?.firstName && (
                <Text className="text-red-500 text-xs mt-1 ml-1">
                  {errors.fields.firstName.message}
                </Text>
              )}
            </View>

            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Last name</Text>
              <TextInput
                className="border border-gray-200 rounded-2xl px-4 py-4 text-base text-gray-900 bg-gray-50"
                placeholder="Doe"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                returnKeyType="next"
                value={lastName}
                onChangeText={setLastName}
              />
              {errors?.fields?.lastName && (
                <Text className="text-red-500 text-xs mt-1 ml-1">
                  {errors.fields.lastName.message}
                </Text>
              )}
            </View>
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Email address</Text>
            <TextInput
              className="border border-gray-200 rounded-2xl px-4 py-4 text-base text-gray-900 bg-gray-50"
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="next"
              value={email}
              onChangeText={setEmail}
            />
            {errors?.fields?.emailAddress && (
              <Text className="text-red-500 text-xs mt-1 ml-1">
                {errors.fields.emailAddress.message}
              </Text>
            )}
          </View>

          {/* Password */}
          <View className="mb-7">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Password</Text>
            <View className="relative">
              <TextInput
                className="border border-gray-200 rounded-2xl px-4 py-4 text-base text-gray-900 bg-gray-50 pr-12"
                placeholder="Create a password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={onSignUpPress}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-4"
                hitSlop={8}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color="#9CA3AF"
                />
              </Pressable>
            </View>
            {errors?.fields?.password && (
              <Text className="text-red-500 text-xs mt-1 ml-1">
                {errors.fields.password.message}
              </Text>
            )}
          </View>

          {/* Sign Up button */}
          <Pressable
            onPress={onSignUpPress}
            disabled={isLoading || !email || !password}
            className="bg-blue-600 rounded-2xl py-4 items-center active:opacity-80"
            style={{
              shadowColor: '#2563EB',
              shadowOpacity: 0.35,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              opacity: !email || !password ? 0.5 : 1,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold">Create Account</Text>
            )}
          </Pressable>

          {/* Sign In link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-sm text-gray-500">Already have an account? </Text>
            <Link href="/sign-in" asChild>
              <Pressable hitSlop={6}>
                <Text className="text-sm font-semibold text-blue-600">Sign in</Text>
              </Pressable>
            </Link>
          </View>

        </View>

        {/* Required for Clerk bot protection — must be in the render tree */}
        <View nativeID="clerk-captcha" />

      </ScrollView>
    </KeyboardAvoidingView>
  );
}