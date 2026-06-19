import { useSignIn } from '@clerk/expo';
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

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isLoading = fetchStatus === 'fetching';

  const navigateAfterSignIn = async () => {
    await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          console.log(session?.currentTask);
          return;
        }
        const url = decorateUrl('/');
        if (url.startsWith('http')) {
          // web fallback — won't normally hit in native
          return;
        }
        router.replace(url as Href);
      },
    });
  };

  const onSignInPress = async () => {
    const { error } = await signIn.password({
      emailAddress: email.trim(),
      password,
    });
    if (error) return;

    if (signIn.status === 'complete') {
      await navigateAfterSignIn();
    } else if (signIn.status === 'needs_second_factor') {
      // MFA required — screen will switch via status check below
    } else if (signIn.status === 'needs_client_trust') {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === 'email_code',
      );
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    } else {
      console.error('Sign-in attempt not complete:', signIn);
    }
  };

  const onVerifyPress = async () => {
    await signIn.mfa.verifyEmailCode({ code });
    if (signIn.status === 'complete') {
      await navigateAfterSignIn();
    } else {
      console.error('Sign-in attempt not complete:', signIn);
    }
  };

  // ── MFA / verification screen ─────────────────────────────────────────────
  if (signIn.status === 'needs_client_trust' || signIn.status === 'needs_second_factor') {
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
            Check your email
          </Text>
          <Text className="text-gray-500 text-sm text-center mb-8">
            We sent a verification code to{'\n'}
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
            <Text className="text-red-500 text-xs self-start mb-4 ml-1">
              {errors.fields.code.message}
            </Text>
          )}

          <Pressable
            onPress={onVerifyPress}
            disabled={isLoading}
            className="w-full bg-blue-600 rounded-2xl py-4 items-center mt-4 active:opacity-80"
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
              <Text className="text-white text-base font-semibold">Verify</Text>
            )}
          </Pressable>

          <Pressable onPress={() => signIn.mfa.sendEmailCode()} className="py-3 mt-2">
            <Text className="text-blue-600 text-sm font-medium">Resend code</Text>
          </Pressable>

          <Pressable onPress={() => signIn.reset()} className="py-2">
            <Text className="text-gray-400 text-sm">Start over</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ── Main sign-in screen ───────────────────────────────────────────────────
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
              Welcome back
            </Text>
            <Text className="text-base text-gray-500">
              Sign in to find your dream home
            </Text>
          </View>

          {/* Global error — errors.global is an object, not an array */}
          {errors.global && (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <Text className="text-sm text-red-600">{errors.global[0].message}</Text>
            </View>
          )}

          {/* Email */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Email address
            </Text>
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
            {errors.fields.identifier && (
              <Text className="text-red-500 text-xs mt-1 ml-1">
                {errors.fields.identifier.message}
              </Text>
            )}
          </View>

          {/* Password */}
          <View className="mb-2">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Password
            </Text>
            <View className="relative">
              <TextInput
                className="border border-gray-200 rounded-2xl px-4 py-4 text-base text-gray-900 bg-gray-50 pr-12"
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                autoComplete="current-password"
                returnKeyType="done"
                onSubmitEditing={onSignInPress}
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
            {errors.fields.password && (
              <Text className="text-red-500 text-xs mt-1 ml-1">
                {errors.fields.password.message}
              </Text>
            )}
          </View>

          {/* Forgot password */}
          <View className="items-end mb-7 mt-1">
            <Pressable onPress={() => router.push('/forgot-password' as any)} hitSlop={8}>
              <Text className="text-sm font-medium text-blue-600">
                Forgot password?
              </Text>
            </Pressable>
          </View>

          {/* Sign In button */}
          <Pressable
            onPress={onSignInPress}
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
              <Text className="text-white text-base font-semibold">Sign In</Text>
            )}
          </Pressable>

          {/* Sign Up link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-sm text-gray-500">Don't have an account? </Text>
            <Link href="/sign-up" asChild>
              <Pressable hitSlop={6}>
                <Text className="text-sm font-semibold text-blue-600">Sign up</Text>
              </Pressable>
            </Link>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}