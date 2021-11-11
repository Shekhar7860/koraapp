import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import {Icon} from '../components/Icon/Icon.js';

class BackButton extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {onPress, viewStyle, color, appendStyles} = this.props;
    return (
      <TouchableOpacity
        onPress={() => onPress()}
        style={[
          viewStyle
            ? viewStyle
            : {
                padding: 18,
                paddingVertical: 13,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: 'grey',
              },
          {
            marginLeft: -10,
            paddingLeft: 10,
            paddingVertical: 9,
            marginVertical: -9,
          },
          appendStyles,
        ]}>
        <Icon color={color} name="kr-left_direction" size={25} />
      </TouchableOpacity>
    );
  }
}

BackButton.defaultProps = {
  onPress: () => {},
  viewStyle: null,
  appendStyles: {},
  defaultViewStyle: {
    padding: 18,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: 'grey',
    borderBottomWidth: 0.5,
    borderBottomColor: 'grey',
  },
  color: '#202124',
};

BackButton.propTypes = {
  onPress: PropTypes.func,
  viewStyle: PropTypes.object,
  color: PropTypes.string,
  appendStyles: PropTypes.object,
};

export default BackButton;
