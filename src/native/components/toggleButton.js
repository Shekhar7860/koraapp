import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import ToggleSwitch from 'toggle-switch-react-native';
import {normalize} from '../utils/helpers';
import * as Constants from './KoraText';

const ToggleButton = ({
  onChange = () => {
    console.log('DEFINE ON TOGGLE');
  },
  isToggleOn = false,
  label = '',
  labelStyle = {},
}) => {
  let extraProps = {};
  extraProps = {labelStyle: labelStyle};

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 50,
        paddingStart: 20,
        paddingEnd: 20,
        alignContent: 'center',
      }}>
      <Text style={styles.textStyle}>{label}</Text>
      <View>
        <ToggleSwitch
          isOn={isToggleOn}
          onColor="#0D6EFD"
          offColor="#FFFFFF"
          thumbOffStyle={{backgroundColor: '#BDC1C6'}}
          trackOffStyle={{borderWidth: 0.9, borderColor: '#BDC1C6'}}
          trackOnnStyle={{borderWidth: 0.9, borderColor: '#BDC1C6'}}
          {...extraProps}
          size="small"
          //disabled={true}
          onToggle={(isToggleOn) => {
            onChange(isToggleOn);
          }}></ToggleSwitch>
      </View>
    </View>
  );
};

export const KoraToggleSwitch = ({isToggleOn = false, onChange = () => {}}) => {
  return (
    <ToggleSwitch
      isOn={isToggleOn}
      onColor="#0D6EFD"
      offColor="#FFFFFF"
      thumbOffStyle={{backgroundColor: '#BDC1C6'}}
      trackOffStyle={{borderWidth: 0.9, borderColor: '#BDC1C6'}}
      trackOnnStyle={{borderWidth: 0.9, borderColor: '#BDC1C6'}}
      size="small"
      onToggle={(isToggleOn) => {
        onChange(isToggleOn);
      }}></ToggleSwitch>
  );
};

const styles = StyleSheet.create({
  textStyle: {
    flex: 9,
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
});

export default ToggleButton;
