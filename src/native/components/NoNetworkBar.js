import React, {Component} from 'react';
import {
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {withTranslation} from 'react-i18next';
import NetworkHeaderValues, {normalize} from '../utils/helpers';
class OfflineBar extends Component {

  animationConstants = {
    DURATION: 800,
    TO_VALUE: 4,
    INPUT_RANGE: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4],
    OUTPUT_RANGE: [0, -15, 0, 15, 0, -15, 0, 15, 0],
  };

  state = {
    isConnected: true,
    componentHeight: 0,
  };

  constructor() {
    super();
    this.animation = new Animated.Value(0);
  }

  componentDidMount() {
    NetInfo.addEventListener((state) => {
      const {isConnected} = state;
      this.setNetworkStatus(isConnected);
    });
  }

  _onLayoutEvent = (event) => {
    this.setState({componentHeight: event.nativeEvent.layout.height});
    let commonData = NetworkHeaderValues.getInstance();
    commonData.setNetworkHeight(event.nativeEvent.layout.height);
    // console.log('no network bar', commonData.getNetworkHeight());
    // setNoNetworkHeight(event.nativeEvent.layout.height);
  }

  setNetworkStatus = (status) => {
    this.setState({isConnected: status});
    if (status) {
      this.triggerAnimation();
    }
  };

  triggerAnimation = () => {
    this.animation.setValue(0);
    Animated.timing(this.animation, {
      duration: this.animationConstants.DURATION,
      toValue: this.animationConstants.TO_VALUE,
      useNativeDriver: true,
      ease: Easing.bounce,
    }).start();
  };

  render() {
    const {t} = this.props;
    const interpolated = this.animation.interpolate({
      inputRange: this.animationConstants.INPUT_RANGE,
      outputRange: this.animationConstants.OUTPUT_RANGE,
    });
    const animationStyle = {
      transform: [{translateX: interpolated}],
    };
    const {isConnected} = this.state;

    return !isConnected ? (
      <SafeAreaView onLayout={this._onLayoutEvent} style={styles.container}>
        <StatusBar backgroundColor={'#930F1F'} />
        <Animated.Text style={[styles.offlineText, animationStyle]}>
          {t('ERRORS.OFFLINE')}
        </Animated.Text>
      </SafeAreaView>
    ) : null;
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#930F1F',
    paddingTop: 16,
  },
  offlineText: {
    color: 'white',
    padding: 8,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: normalize(14),
  },
});


 export default withTranslation()(OfflineBar);
