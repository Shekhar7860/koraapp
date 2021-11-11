import PropTypes from 'prop-types';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import dayjs from 'dayjs';

import Color from './Color';
import {TIME_FORMAT} from './Constant';
import {StylePropType} from './utils';
import {normalize} from '../../native/utils/helpers';
const containerStyle = {
  marginLeft: 10,
  marginRight: 10,
  marginBottom: 5,
};

const textStyle = {
  fontSize: normalize(10),
  backgroundColor: 'transparent',
  textAlign: 'right',
};

const styles = {
  left: StyleSheet.create({
    container: {
      ...containerStyle,
    },
    text: {
      color: Color.timeTextColor,
      ...textStyle,
    },
  }),
  center: StyleSheet.create({
    container: {
      ...containerStyle,
    },
    text: {
      color: Color.timeTextColor,
      ...textStyle,
    },
  }),
  right: StyleSheet.create({
    container: {
      ...containerStyle,
    },
    text: {
      color: Color.white,
      ...textStyle,
    },
  }),
};

export default class Time extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      position,
      containerStyle,
      currentMessage,
      timeFormat,
      timeTextStyle,
    } = this.props;

    if (!!currentMessage) {
      return (
        <View
          style={[
            styles[position].container,
            containerStyle && containerStyle[position],
          ]}>
          <Text
            style={[
              styles[position].text,
              timeTextStyle && timeTextStyle[position],
            ]}>
            {dayjs(currentMessage.createdAt)
              .locale(this.context.getLocale())
              .format(timeFormat)}
          </Text>
        </View>
      );
    }
    return null;
  }
}

Time.contextTypes = {
  getLocale: PropTypes.func,
};

Time.defaultProps = {
  position: 'left',
  currentMessage: {
    createdAt: null,
  },
  containerStyle: {},
  timeFormat: TIME_FORMAT,
  timeTextStyle: {},
};

Time.propTypes = {
  position: PropTypes.oneOf(['left', 'right', 'center']),
  currentMessage: PropTypes.object,
  containerStyle: PropTypes.shape({
    left: StylePropType,
    right: StylePropType,
  }),
  timeFormat: PropTypes.string,
  timeTextStyle: PropTypes.shape({
    left: StylePropType,
    right: StylePropType,
  }),
};
