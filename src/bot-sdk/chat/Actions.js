import PropTypes from 'prop-types';
import React, {ReactNode} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Color from './Color';
import {StylePropType} from './utils';
import {normalize} from '../../native/utils/helpers';

export default class Actions extends React.Component {
  constructor(props) {
    super(props);
  }

  onActionsPress = () => {};
  onActionsLongPress = () => {};

  renderIcon() {
    if (this.props.icon) {
      return this.props.icon();
    }
    return (
      <View style={{...styles.wrapper, ...this.props.wrapperStyle}}>
        <Text style={{...styles.iconText, ...this.props.iconTextStyle}}>+</Text>
      </View>
    );
  }

  render() {
    return (
      <TouchableOpacity
        style={{...styles.container, ...this.props.containerStyle}}
        onLongPress= {this.props.onLongPressActionButton || this.onActionsLongPress}
        onPress={this.props.onPressActionButton || this.onActionsPress}
        >
        {this.renderIcon()}
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: Color.defaultColor,
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: Color.defaultColor,
    fontWeight: 'bold',
    fontSize: normalize(16),
    backgroundColor: Color.backgroundTransparent,
    textAlign: 'center',
  },
});

Actions.defaultProps = {
  options: {},
  optionTintColor: Color.optionTintColor,
  icon: null,
  containerStyle: {},
  iconTextStyle: {},
  wrapperStyle: {},
};

Actions.propTypes = {
  onSend: PropTypes.func,
  options: PropTypes.object,
  optionTintColor: PropTypes.string,
  icon: PropTypes.func,
  onPressActionButton: PropTypes.func,
  wrapperStyle: StylePropType,
  containerStyle: StylePropType,
};

Actions.contextTypes = {
  actionSheet: PropTypes.func,
};
