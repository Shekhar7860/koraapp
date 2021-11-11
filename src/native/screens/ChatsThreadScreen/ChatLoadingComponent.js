import React from 'react';
import {ActivityIndicator} from 'react-native';

export const Loader = (props) => {
  return (
    <ActivityIndicator
      animating={true}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 80,
      }}
      size={props.size || 'large'}
      color="#517BD2"
    />
  );
};
