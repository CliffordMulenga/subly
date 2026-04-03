import { Link } from 'expo-router'
import React from 'react'
import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const SignIn = () => {
  return (
    <SafeAreaView className='flex-1 bg-background p-4'>
      <Text>SignIn</Text>

      <Link href={"/(auth)/sign-up"}>Create Account</Link>
    </SafeAreaView>
  )
}

export default SignIn