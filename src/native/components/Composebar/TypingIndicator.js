import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';

import Dot from 'react-native-typing-animation/src/Dot/index';
import styles from 'react-native-typing-animation/src/Dot/styles';

class TypingIndicator extends React.Component {
  timer = null;
  constructor(props) {
    super(props);

    const {dotAmplitude, dotSpeed, dotY} = props;
    this.state = {
      currentAnimationTime: 0,
      isStart: false,
    };

    this._animation = () => {
      this.setState((prevState) => ({
        y1: dotY + dotAmplitude * Math.sin(prevState.currentAnimationTime),
        y2: dotY + dotAmplitude * Math.sin(prevState.currentAnimationTime - 1),
        y3: dotY + dotAmplitude * Math.sin(prevState.currentAnimationTime - 2),
        currentAnimationTime: prevState.currentAnimationTime + dotSpeed,
      }));
      //  this.timer = setInterval(this._animation, 5);
      this.frameAnimationRequest = requestAnimationFrame(this._animation);
    };
    //this.frameAnimationRequest = requestAnimationFrame(this._animation);
  }

  start = () => {
    if (!this.state.isStart) {
      // this.timer = setInterval(this._animation, 5);
      cancelAnimationFrame(this.frameAnimationRequest);
      this.frameAnimationRequest = requestAnimationFrame(this._animation);
      // setTimeout(
      this.setState({
        isStart: true,
      });
      //, 1000);
    }
  };
  stop = () => {
    if (this.state.isStart) {
      cancelAnimationFrame(this.frameAnimationRequest);
      // if (this.timer)
      //     clearInterval(this.timer);
      this.setState({
        isStart: false,
      });
    }
  };

  componentWillUnmount() {
    if (this.timer) clearInterval(this.timer);
    // cancelAnimationFrame(this.frameAnimationRequest);
  }

  render() {
    const {dotStyles, style, dotColor, dotMargin, dotRadius, dotX} = this.props;

    return (
      <View>
        {this.state.isStart && (
          <View style={[styles.container, style]}>
            <Dot
              x={dotX - dotRadius - dotMargin}
              y={this.state.y1}
              radius={dotRadius}
              style={dotStyles}
              dotColor={dotColor}
            />
            <Dot
              x={dotX}
              y={this.state.y2}
              radius={dotRadius}
              style={dotStyles}
              dotColor={dotColor}
            />
            <Dot
              x={dotX + dotRadius + dotMargin}
              y={this.state.y3}
              radius={dotRadius}
              style={dotStyles}
              dotColor={dotColor}
            />
          </View>
        )}
      </View>
    );
  }
}

TypingIndicator.defaultProps = {
  style: {},
  dotStyles: {},
  dotColor: 'black',
  dotMargin: 3,
  dotAmplitude: 3,
  dotSpeed: 0.15,
  dotRadius: 2.5,
  dotY: 6,
  dotX: 12,
};

TypingIndicator.propTypes = {
  style: PropTypes.object,
  dotStyles: PropTypes.object,
  dotColor: PropTypes.string,
  dotMargin: PropTypes.number,
  dotAmplitude: PropTypes.number,
  dotSpeed: PropTypes.number,
  dotRadius: PropTypes.number,
  dotY: PropTypes.number,
  dotX: PropTypes.number,
};

export default TypingIndicator;
