import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableHighlight,
  StatusBar,
  TextInput,
} from 'react-native';
import Slider from 'rn-range-slider';

const SliderScreen = ({minValue, maxValue, getRangeValue = () => {}}) => {
  const [rangeDisabled] = useState(false);
  const [floatingLabel] = useState(false);

  const renderThumb = () => {
    return <View style={styles.thumb} />;
  };
  const renderRail = () => {
    return <View style={styles.rail} />;
  };
  const renderRailSelected = () => {
    return <View style={styles.railSelected} />;
  };
  const renderLabel = (label) => {
    return (
      <View style={styles.label}>
        <Text style={styles.labelText}>{label}</Text>
      </View>
    );
  };
  const renderNotch = () => {
    return <View style={styles.notch} />;
  };
  const handleValueChange = useCallback((low, high) => {
    // setLow(low);
    // setHigh(high);
    getRangeValue(low, high);
  }, []);

  return (
    <View style={styles.mainViewStyle}>
      <Slider
        //style={styles.slider}
        min={minValue}
        max={maxValue}
        step={2}
        disableRange={rangeDisabled}
        floatingLabel={floatingLabel}
        renderThumb={renderThumb}
        renderRail={renderRail}
        renderRailSelected={renderRailSelected}
        renderLabel={renderLabel}
        renderNotch={renderNotch}
        onValueChanged={handleValueChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainViewStyle: {
    marginTop: 3,
    marginBottom: 10,
  },
  slider: {},
  root: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#4499ff',
    borderRadius: 4,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#7f7f7f',
    backgroundColor: '#ffffff',
  },
  rail: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#7f7f7f',
  },
  notch: {
    width: 8,
    height: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#4499ff',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 8,
  },
  railSelected: {
    height: 4,
    backgroundColor: '#4499ff',
    borderRadius: 2,
  },
  label: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#4499ff',
    borderRadius: 4,
  },
  labelText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default SliderScreen;
