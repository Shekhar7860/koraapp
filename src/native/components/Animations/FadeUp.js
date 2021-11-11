import React, {Component} from 'react';
import {Animated} from 'react-native';

export class FadeUp extends Component {
  constructor(props) {
    super(props);
    this._visibility = new Animated.Value(this.props.visible ? 1 : 0);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    Animated.timing(this._visibility, {
      toValue: nextProps.visible ? 1 : 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }

  render() {
    const {visible, style, children, ...rest} = this.props;

    const containerStyle = {
      opacity: this._visibility.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 1, 1],
      }),
      top: this._visibility.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, 0],
      }),
    };

    const combinedStyle = [style, containerStyle];
    return (
      <Animated.View style={combinedStyle} {...rest}>
        {children}
      </Animated.View>
    );
  }
}
