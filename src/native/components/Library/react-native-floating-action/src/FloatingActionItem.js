import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, Image, View, Animated, Text} from 'react-native';
import * as Constants from './../../../KoraText.js';
import {getTouchableComponent} from './utils/touchable';
import {normalize} from '../../../../utils/helpers';
class FloatingActionItem extends Component {
  constructor(props) {
    super(props);
    this.animation = new Animated.Value(0);
  }

  componentDidUpdate(prevProps) {
    const {active, animated} = this.props;

    if (prevProps.active !== active && animated) {
      Animated.spring(this.animation, {
        toValue: active ? 1 : 0,
        useNativeDriver: false,
      }).start();
    }
  }

  get distanceToHorizontalEdge() {
    const {distanceToEdge} = this.props;
    return typeof distanceToEdge === 'number'
      ? distanceToEdge
      : distanceToEdge.horizontal;
  }

  get distanceToVerticalEdge() {
    const {distanceToEdge} = this.props;
    return typeof distanceToEdge === 'number'
      ? distanceToEdge
      : distanceToEdge.vertical;
  }

  handleOnPress = () => {
    const {name, onPress} = this.props;

    onPress(name);
  };

  renderText() {
    const {
      // @deprecated in favor of textElevation
      text,
      position,
      textBackground,
      textColor,
      textStyle,
      textProps,
      textContainerStyle,
    } = this.props;

    if (text) {
      return (
        <View
          key="text"
          style={[
            styles.textContainer,
            styles[`${position}TextContainer`],
            {
              backgroundColor: '#0000000',
            },
            textContainerStyle,
          ]}>
          <Text
            numberOfLines={1}
            lineBreakMode={'clip'}
            style={styles.textStyle}>
            {text}
          </Text>
        </View>
      );
    }

    return null;
  }

  renderButton() {
    const {buttonSize, icon, color, tintColor} = this.props;

    let iconStyle;

    if (icon && icon.uri) {
      iconStyle = styles.iconLogo;
    } else {
      iconStyle = styles.icon;
    }

    const propStyles = {
      tintColor: tintColor,
      backgroundColor: '#EFF0F1',
      width: buttonSize - 5,
      height: buttonSize - 10,
      borderRadius: 64,
    };

    return (
      <View key="button" style={[styles.button, propStyles]}>
        {React.isValidElement(icon) ? (
          icon
        ) : (
          <Image style={[iconStyle, {tintColor: tintColor}]} source={icon} />
        )}
      </View>
    );
  }

  render() {
    const {
      position,
      paddingTopBottom,
      render,
      margin,
      name,
      animated,
      style
    } = this.props;

    const Touchable = getTouchableComponent(false);

    let animatedActionContainerStyle;

    if (animated) {
      animatedActionContainerStyle = {
        marginBottom: this.animation.interpolate({
          inputRange: [0, 1],
          outputRange: [5, 10],
        }),
      };
    } else {
      animatedActionContainerStyle = {marginBottom: 10};
    }

    const components = [];
    const distanceToEdgeActionContainer = {};

    if (position === 'left') {
      if (render) {
        components.push(render({key: name}));
      } else {
        components.push(this.renderButton());
        components.push(this.renderText());
      }
      distanceToEdgeActionContainer.paddingLeft =
        this.distanceToHorizontalEdge + margin;
    } else if (position === 'right') {
      if (render) {
        components.push(render({key: name}));
      } else {
        components.push(this.renderText());
        components.push(this.renderButton());
      }
      distanceToEdgeActionContainer.paddingRight =
        this.distanceToHorizontalEdge + margin;
    } else if (render) {
      components.push(render({key: name}));
    } else {
      components.push(this.renderButton());
    }

    return (
      <Touchable
        activeOpacity={0.4}
        style={styles.container}
        onPress={this.handleOnPress}>
        <Animated.View
          style={[
            styles.actionContainer,
            style,
            animatedActionContainerStyle,
            10,
            {
              paddingTop: paddingTopBottom,
              paddingBottom: paddingTopBottom,
            },
          ]}>
          {components}
        </Animated.View>
      </Touchable>
    );
  }
}

FloatingActionItem.propTypes = {
  tintColor: PropTypes.string,
  color: PropTypes.string,
  icon: PropTypes.any,
  name: PropTypes.string.isRequired,
  buttonSize: PropTypes.number,
  textContainerStyle: PropTypes.object,
  text: PropTypes.string,
  textStyle: PropTypes.object,
  textProps: PropTypes.object,
  textBackground: PropTypes.string,
  textColor: PropTypes.string,
  // not modified by user
  position: PropTypes.oneOf(['left', 'right', 'center']),
  active: PropTypes.bool,
  distanceToEdge: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      vertical: PropTypes.number,
      horizontal: PropTypes.number,
    }),
  ]),
  paddingTopBottom: PropTypes.number, // modified by parent property "actionsPaddingTopBottom"
  onPress: PropTypes.func,
  render: PropTypes.func,
  margin: PropTypes.number,
  animated: PropTypes.bool,
};

FloatingActionItem.defaultProps = {
  tintColor: '#fff',
  color: '#1253bc',
  distanceToEdge: 30,
  buttonSize: 40,
  textColor: '#444444',
  textBackground: '#ffffff',
  margin: 8,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingRight: 18,
    paddingBottom: 15,
  },
  actionContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 5,
    backgroundColor: '#FFFFFF',
    height: 42,
    borderRadius: 100,
  },
  textContainer: {
    paddingLeft: 3,
    borderRadius: 4,
    height: 52,
    alignContent: 'center',
    justifyContent: 'center',
    paddingRight: 10,
  },
  leftTextContainer: {
    marginLeft: 14,
  },
  rightTextContainer: {
    marginRight: 0,
  },
  text: {
    fontSize: normalize(14),
    lineHeight: 20,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLogo: {
    resizeMode: 'cover',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  icon: {
    resizeMode: 'contain',
    width: 20,
    height: 20,
  },
  textStyle: {
    color: '#ffffff',
    fontWeight: '400',
    fontSize: normalize(18),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    lineHeight: 22,
  },
});

export default FloatingActionItem;
