import React, {Component} from 'react';
import Video from 'react-native-video';
import {
  TouchableWithoutFeedback,
  TouchableHighlight,
  ImageBackground,
  PanResponder,
  StyleSheet,
  Animated,
  SafeAreaView,
  Easing,
  Image,
  View,
  Text,
} from 'react-native';
import padStart from 'lodash/padStart';
import {stubFalse} from 'lodash';

export default class NewVideoPlayer extends Component {
  player = React.createRef();
  state = {
    playerPaused: true,
  };
  constructor(props) {
    super(props);
  }

  setPausedState = (isPaused) => {
    // this.player.paused = isPaused;
    // if (this.state.playerPaused === isPaused) {
    //   return;
    // }

    this.setState({
      playerPaused: isPaused,
    });
    console.log('setPausedState  ------------>>', this.state.playerPaused);
  };
  getPlayerState = () => {
    const state = this.player?.paused;
    // console.log('getPlayerState  ------------>>', state);
    return state;
  };

  getPlayerRef = () => {
    return this.player;
  };

  seekTo(time = 0) {
    this.player?.seek(time);
    // this.setState(state);
  }

  render() {
    console.log(
      '-----------> NewVideoPlayer render <-------------:',
      this.state.playerPaused,
    );
    return (
      <Video
        ref={(ref) => {
          this.player = ref;
        }}
        controls={true}
        resizeMode="contain"
        // volume={this.state.volume}
        paused={this.state.playerPaused}
        //disableFocus={this.state.playerPaused}
        // filterEnable={!this.state.playerPaused}
        //  hideShutterView={!this.state.playerPaused}
        // automaticallyWaitsToMinimizeStalling={!this.state.playerPaused}
        preventsDisplaySleepDuringVideoPlayback={!this.state.playerPaused}
        muted={false}
        thumbnail={this.props.thumbnail}
        //navigator={this.props.navigation}
        playInBackground={false}
        playWhenInactive={false}
        tapAnywhereToPause={true}
        useTextureView={true}
        // controlsTimeout={true}
        fullScreenOnLongPress={true}
        // rate={this.state.rate}
        // onLoadStart={this.events.onLoadStart}
        //onProgress={this.events.onProgress}
        onError={this.props.onError}
        onLoad={this.props.onLoad}
        onEnd={this.props.onEnd}
        // onSeek={this.events.onSeek}
        style={styles.player}
        source={this.props.source}
      />
    );
  }
}
const styles = StyleSheet.create({
  player: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});
