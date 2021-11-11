import React from 'react';
import {TextInput as NativeTextInput} from 'react-native';

export const fontFamily = 'Inter';

export const TextInput = (props) => {
  return (
    <NativeTextInput {...props} style={{...props.style, fontFamily: fontFamily}}>
      {props.children}
    </NativeTextInput>
  );
};
