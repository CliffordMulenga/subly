import { Link } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'

const SignUp = () => {
  return (
    <View>
      <Text>SignUp</Text>

      <Link href={"/(auth)/sign-in"} className='underline text-blue-600'>Sign In</Link>
    </View>
  )
}

export default SignUp