import React, {Component} from 'react';
import {
  View,
  ScrollView,
  Animated,
  StyleSheet,
  ViewProperties,
  TouchableOpacity,
  Text,
} from 'react-native';
import {Icon} from '../Icon/Icon';
import Feather from 'react-native-vector-icons/Feather';
import {normalize} from '../../utils/helpers';
import * as Constants from '../../components/KoraText';

class SegmentControl extends Component {
  state = {
    scrollX: new Animated.Value(0),
    containerWidth: 0,
  };

  render() {
    const {segments = [], color = '#4549D1'} = this.props;
    // const numberOfSegments = segments.length;
    // const {containerWidth} = this.state;

    // const activeMargin = this.state.scrollX.interpolate({
    //   inputRange: [0, (numberOfSegments - 1) * containerWidth],
    //   outputRange: [
    //     0,
    //     ((numberOfSegments - 1) * containerWidth) / numberOfSegments,
    //   ],
    // });

    return <View style={{marginBottom: 110}}>{segments[0].view()}</View>;
  }

  renderSegment = (numberOfSegments, title, index, image) => {
    const input = Array.from(
      {length: numberOfSegments},
      (value, key) => key,
    ).map((key) => key * this.state.containerWidth);

    const output = Array.from(
      {length: numberOfSegments},
      (value, key) => key,
    ).map((key) => (key === index ? 'black' : '#828282'));

    if (output.length < 2) {
      return <View key={index} />;
    }

    const color = this.state.scrollX.interpolate({
      inputRange: input,
      outputRange: output,
      extrapolate: 'clamp',
    });

    return (
      // <TouchableOpacity
      //   style={styles.headerItem}
      //   onPress={() => {
      //     this.scrollView.scrollTo({
      //       x: index * this.state.containerWidth,
      //       y: 0,
      //       animated: true
      //     });
      //   }}
      //   key={index}
      // >
      <TouchableOpacity
        onPress={() => {
          this.scrollView.scrollTo({
            x: index * this.state.containerWidth,
            y: 0,
            animated: true,
          });
        }}
        style={styles.headerItem}
        underlayColor="rgba(0,0,0,0.05)">
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={{paddingRight: 10}}>
            <Icon name={image} size={18} color="#202124" />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>
      </TouchableOpacity>

      // {/*
      //   <Animated.Text style={[styles.title, { color }]}>{title}</Animated.Text>
      // </TouchableOpacity> */}
    );
  };

  handleOnScroll = (x) => {
    const mover = Animated.event([
      {nativeEvent: {contentOffset: {x: this.state.scrollX}}},
    ]);
    mover(x);
  };
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 6,
    shadowColor: 'black',
    shadowOffset: {height: 4, width: 0},
    shadowOpacity: 0.1,
    elevation: 3,
  },
  separatorStyle: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  container: {
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  headerItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontWeight: '400',
    flexDirection: 'row',
    fontSize: normalize(14),
    textAlign: 'center',
    fontFamily: Constants.fontFamily,
  },
  animatedSeparator: {
    height: 2,
  },
});

export default SegmentControl;
