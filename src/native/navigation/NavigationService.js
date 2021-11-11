import * as React from 'react';
import {CommonActions} from '@react-navigation/native';
export const isReadyRef = React.createRef();
export const navigationRef = React.createRef();

export function navigate(name, params = {}) {
  // console.log('Navigating to ::', name);
  if (!isReadyRef.current) {
    console.warn('Navigation is not ready');
  }
  isReadyRef.current && navigationRef?.current?.navigate(name, params);
}

export function getCurrentScreenName() {
  return getCurrentScreenData()?.name;
}

export function getCurrentScreenData() {
  return navigationRef?.current?.getCurrentRoute();
}

export function navigateAndReset(name, params) {
  navigationRef.current?.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [
        {
          name,
          params,
        },
      ],
    }),
  );
}

export function goBack() {
  navigationRef.current?.goBack();
}
export function isGoBack() {
  let canGoBack = navigationRef.current?.canGoBack();

  return canGoBack;
}
