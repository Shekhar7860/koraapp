import React, { useState } from 'react';
import CheckBox from '@react-native-community/checkbox';

export const KoraCheckBox = ({isChecked = false, onValueChange = () => {}}) => {
  const [checked, setChecked] = useState(isChecked);
  return (
    <CheckBox
      disabled={false}
      boxType="square"
      lineWidth={1.0}
      onCheckColor={'#ffffff'}
      onFillColor={'#0D6EFD'}
      size={10}
      style={{height: 20, width: 20}}
      value={checked}
      onValueChange={(isChecked1) => {
        onValueChange(isChecked1);
        setChecked(isChecked1)
      }}
    />
  );
};
