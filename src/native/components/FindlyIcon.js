import React from 'react';
import {normalize} from '../utils/helpers';
import {Icon} from './Icon/Icon';
import {View, StyleSheet} from 'react-native';
import {Text} from './KoraText';

export const FindlyIcon = (props = {}) => {
  let number = null;
  if (checkValueIsNumberOrNot(props?.number)) {
    number = props?.number;
  }

  if (number && number > 999) {
    number = '999+';
  }

  return (
    <View>
      <Icon
        name="findly"
        size={props?.size ? props.size : 34}
        color={'#0D6EFD'}
      />
      {number && (
        <View style={styles.number_view}>
          <Text style={styles.text}>{number}</Text>
        </View>
      )}
    </View>
  );
};

const checkValueIsNumberOrNot = (inputValue) => {
  if (isNaN(inputValue)) {
    return false;
  } else {
    if (inputValue <= 0) {
      return false;
    }
    return true;
  }
};

const styles = StyleSheet.create({
  number_view: {
    alignSelf: 'flex-end',
    // marginEnd: 5,
    // right: 20,
    bottom: 20,
    position: 'absolute',
    borderWidth: 0.5,
    borderColor: '#ffffff',
    minWidth: 5,
    minHeight: 5,
    //  width: 30,
    //  height: 20,
    borderRadius: 30 / 2,
    backgroundColor: '#DD3646',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    paddingEnd: 3,
    paddingStart: 3,
    color: 'white',
    fontWeight: '600',
    fontSize: normalize(10),
    fontFamily: 'Inter',
    fontStyle: 'normal',
  },
});
