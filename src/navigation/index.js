import React from 'react'
import { NavigationContainer } from '@react-navigation/native'

import InitializingNavigator from './InitializingNavigator'
import AuthenticatedNavigator from './AuthenticatedNavigator'
import OnboardingNavigator from './OnboardingNavigator'

import { useSelector } from 'react-redux'
import { selectAuthState } from 'src/redux/authSlice'

import GLOBALS from 'src/Globals'

const Screens = () => {
  const authState = useSelector(selectAuthState)

  console.log('Current Auth State: ', authState)

  return (
    <NavigationContainer>
      {authState === GLOBALS.AUTH_STATE.INITIALIZING && (
        <InitializingNavigator />
      )}
      {authState === GLOBALS.AUTH_STATE.ONBOARDING && <OnboardingNavigator />}

      {authState === GLOBALS.AUTH_STATE.AUTHENTICATED && (
        <AuthenticatedNavigator />
      )}
    </NavigationContainer>
  )
}

export default Screens
