//  @flow

import * as React from 'react';
import {
  TouchableOpacity,
  Modal,
  View,
  ViewPropTypes as RNViewPropTypes,
  I18nManager,
} from 'react-native';
import PropTypes from 'prop-types';

import Triangle from './Triangle';
import {ScreenWidth, ScreenHeight, isIOS} from './helpers';
import getTooltipCoordinate from './getTooltipCoordinate';

const ViewPropTypes = RNViewPropTypes || View.propTypes;

type State = {
  isVisible: boolean,
  yOffset: number,
  xOffset: number,
  elementWidth: number,
  elementHeight: number,
};

type Props = {
  withPointer: boolean,
  popover: React.Element,
  height: number | string,
  width: number | string,
  containerStyle: any,
  pointerColor: string,
  pointerStyle: {},
  onClose: () => void,
  onOpen: () => void,
  withOverlay: boolean,
  overlayColor: string,
  backgroundColor: string,
  highlightColor: string,
  toggleWrapperProps: {},
  actionType: 'press' | 'longPress' | 'none',
};

class Tooltip extends React.Component {
  state = {
    isVisible: false,
    yOffset: 0,
    xOffset: 0,
    elementWidth: 0,
    elementHeight: 0,
  };

  renderedElement;
  timeout;

  toggleTooltip = () => {
    const {onClose} = this.props;
    this.getElementPosition();
    this.setState((prevState) => {
      if (prevState.isVisible && !isIOS) {
        onClose && onClose();
      }

      return {isVisible: !prevState.isVisible};
    });
  };

  setTooltipState(isVisibleToolTip) {
    const {onClose} = this.props;
    this.getElementPosition();
    this.setState((prevState) => {
      if (prevState.isVisible && !isIOS) {
        onClose && onClose();
      }

      return {isVisible: isVisibleToolTip};
    });
  }

  wrapWithAction = (actionType, children) => {
    switch (actionType) {
      case 'press':
        return (
          <TouchableOpacity
            onPress={this.toggleTooltip}
            activeOpacity={1}
            {...this.props.toggleWrapperProps}>
            {children}
          </TouchableOpacity>
        );
      case 'longPress':
        return (
          <TouchableOpacity
            onLongPress={this.toggleTooltip}
            activeOpacity={1}
            {...this.props.toggleWrapperProps}>
            {children}
          </TouchableOpacity>
        );
      default:
        return children;
    }
  };

  getTooltipStyle = () => {
    const {yOffset, xOffset, elementHeight, elementWidth} = this.state;
    const {
      height,
      backgroundColor,
      width,
      withPointer,
      containerStyle,
    } = this.props;

    const {x, y} = getTooltipCoordinate(
      xOffset,
      yOffset,
      elementWidth,
      elementHeight,
      ScreenWidth,
      ScreenHeight,
      width,
      height,
      withPointer,
    );

    return {
      position: 'absolute',
      left: I18nManager.isRTL ? null : x,
      right: I18nManager.isRTL ? x : null,
      top: y - 30,

      width,
      height,

      backgroundColor,
      // default styles
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,

      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      borderBottomLeftRadius: 10,
      padding: 10,

      ...containerStyle,
    };
  };

  renderPointer = (tooltipY) => {
    const {yOffset, xOffset, elementHeight, elementWidth} = this.state;
    const {backgroundColor, pointerColor, pointerStyle} = this.props;
    const pastMiddleLine = yOffset > tooltipY;

    return (
      <View
        style={{
          position: 'absolute',
          top: pastMiddleLine ? yOffset - 13 : yOffset + elementHeight - 2,
          left: I18nManager.isRTL ? null : xOffset + elementWidth / 2 - 7.5,
          right: I18nManager.isRTL ? xOffset + elementWidth / 2 - 7.5 : null,
        }}>
        <Triangle
          style={{
            borderBottomColor: pointerColor || backgroundColor,
            ...pointerStyle,
          }}
          isDown={pastMiddleLine}
        />
      </View>
    );
  };
  renderContent = (withTooltip) => {
    const {popover, withPointer, highlightColor, actionType} = this.props;

    if (!withTooltip)
      return this.wrapWithAction(actionType, this.props.children);

    const {yOffset, xOffset, elementWidth, elementHeight} = this.state;
    const tooltipStyle = this.getTooltipStyle();
    return (
      <View>
        {/*   <View
          style={{
            position: 'absolute',
            top: yOffset,
            left: I18nManager.isRTL ? null : xOffset,
            right: I18nManager.isRTL ? xOffset : null,
            backgroundColor: highlightColor,
            overflow: 'visible',
            width: elementWidth,
            height: elementHeight,
          }}
        >
          {this.props.children}
        </View>
        {withPointer && this.renderPointer(tooltipStyle.top)} */}
        <View style={tooltipStyle}>{popover}</View>
      </View>
    );
  };

  componentDidMount() {
    // wait to compute onLayout values.
    this.timeout = setTimeout(this.getElementPosition, 500);
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  getElementPosition = () => {
    this.renderedElement &&
      this.renderedElement.measureInWindow(
        (pageOffsetX, pageOffsetY, width, height) => {
          this.setState({
            xOffset: pageOffsetX,
            yOffset: pageOffsetY,
            elementWidth: width,
            elementHeight: height,
          });
        },
      );
  };

  render() {
    const {isVisible} = this.state;
    const {onClose, withOverlay, onOpen, overlayColor} = this.props;

    return (
      <View collapsable={false} ref={(e) => (this.renderedElement = e)}>
        {this.renderContent(false)}
        <Modal
          animationType="fade"
          visible={isVisible}
          transparent
          onDismiss={onClose}
          onShow={onOpen}
          onRequestClose={onClose}>
          <TouchableOpacity
            style={styles.container(withOverlay, overlayColor)}
            onPress={this.toggleTooltip}
            activeOpacity={1}>
            {this.renderContent(true)}
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }
}

Tooltip.propTypes = {
  children: PropTypes.element,
  withPointer: PropTypes.bool,
  popover: PropTypes.element,
  height: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  containerStyle: ViewPropTypes.style,
  pointerColor: PropTypes.string,
  pointerStyle: PropTypes.object,
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
  withOverlay: PropTypes.bool,
  toggleWrapperProps: PropTypes.object,
  overlayColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  highlightColor: PropTypes.string,
  actionType: PropTypes.oneOf(['press', 'longPress', 'none']),
};

Tooltip.defaultProps = {
  toggleWrapperProps: {},
  withOverlay: true,
  highlightColor: 'transparent',
  withPointer: true,
  actionType: 'press',
  height: 40,

  width: 150,
  containerStyle: {},
  pointerStyle: {},
  backgroundColor: '#617080',
  onClose: () => {},
  onOpen: () => {},
};

const styles = {
  container: (withOverlay, overlayColor) => ({
    backgroundColor: withOverlay
      ? overlayColor
        ? overlayColor
        : 'rgba(250, 250, 250, 0.0)'
      : 'transparent',
    flex: 1,
  }),
};

export default Tooltip;
