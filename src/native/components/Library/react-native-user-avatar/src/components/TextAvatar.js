import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import * as Constants from '../../../../KoraText';
import {normalize} from '../../../../../utils/helpers';

const TextAvatar = ({
  name = '',
  size,
  textColor,
  height,
  width,
  textStyle,
  displayFullText = false,
  twoLettersText = null,
}) => {
  const textContainerStyle = {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    //marginTop: -(size / 20),
    height: height,
    width: width,
  };

  let displayText = '';
  try {
    if (twoLettersText) {
      displayText = twoLettersText;
    } else {
      displayText = name && name[0] ? name[0] : '';
    }
  } catch (e) {
    console.log('Error', e);
  }

  if (displayFullText) {
    displayText = name;
  }
  return (
    <View style={textContainerStyle}>
      <Text
        style={[
          {...styles.displayTextStyle, color: textColor},
          textStyle,
          {textTransform: 'capitalize'},
        ]}
        adjustsFontSizeToFit={true}>
        {displayText}
      </Text>
    </View>
  );
};

TextAvatar.propTypes = {
  name: PropTypes.string,
  size: PropTypes.number,
  textColor: PropTypes.string,
};

const styles = StyleSheet.create({
  displayTextStyle: {
    fontWeight: '600',
    fontSize: normalize(12),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
});
export default TextAvatar;
