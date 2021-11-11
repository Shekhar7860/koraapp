import React from 'react';
import {KeyboardAvoidingView, StatusBar} from 'react-native';
import {useHeaderHeight} from '@react-navigation/stack';
import {isIOS} from '../utils/PlatformCheck';
import NetworkHeaderValues from '../utils/helpers';

export default function KoraKeyboardAvoidingView({
  children,
  style,
  ...extraProps
}) {
  const headerHeight = useHeaderHeight();
  const networkHeight = NetworkHeaderValues.getInstance();
  console.log(
    'keyboard height',
    headerHeight,
    StatusBar.currentHeight,
    networkHeight.getNetworkHeight(),
  );
  return (
    <KeyboardAvoidingView
      style={style}
      behavior={isIOS ? 'padding' : null}
      keyboardVerticalOffset={
        headerHeight +
        StatusBar.currentHeight +
        networkHeight.getNetworkHeight()
      }
      {...extraProps}>
      {children}
    </KeyboardAvoidingView>
  );
}
