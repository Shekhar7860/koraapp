import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  PermissionsAndroid,
  Alert,
  Linking,
} from 'react-native';
import PropTypes from 'prop-types';
import {Slider} from 'react-native-elements';
import * as Constants from '../KoraText';
import {Text} from '../KoraText';
import {normalize} from '../../utils/helpers';
import {Icon} from '../Icon/Icon';
import {downloadAtatchment} from '../../../shared/redux/actions/message-preview.action';
import {connect} from 'react-redux';
import {Platform} from 'react-native';
import {APP_NAME} from '../../utils/AppConstants';
import {Loader} from '../../screens/ChatsThreadScreen/ChatLoadingComponent';
import {ActivityIndicator} from 'react-native';
import Play from '../../assets/files/play.svg';
import Pause from '../../assets/files/pause.svg';
import {emptyObject} from '../../../shared/redux/constants/common.constants';
import {colors} from '../../theme/colors';

const pause_icon = <Pause width={18} height={18} type={'pause'} />;
const play_icon = <Play width={18} height={18} type={'play'} />;
class AudioCompnent extends Component {
  mediaUrl = null;
  constructor(props) {
    super(props);
    this.state = {
      btnState: this.props.btnState,
      progress: 0,
      currentTime: 0,
      duration: 0,
    };
  }

  componentWillUnmount() {
    this.mediaUrl = null;
    this.state = {
      btnState: 'default',
      progress: 0,
      currentTime: 0,
      duration: 0,
    };
  }

  componentDidMount() {
    this.mediaUrl = this.props?.path || null;
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if (prevProps.download !== this.props.download) {
  //     const url = this.props.download?.mediaUrl;
  //     if (url) {
  //       this.prepareAudio(url);pr
  //     }
  //   }
  // }

  millisToMinutesAndSeconds(millis) {
    if (!millis || millis < 0) {
      millis = 0;
    }
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return (
      (minutes < 10 ? '0' : '') +
      minutes +
      ':' +
      (seconds < 10 ? '0' : '') +
      seconds
    );
  }

  prepareAudio = (mediaUrl) => {
    if (!this.props.playPauseClick) {
      return;
    }
    // this.props.download?.mediaUrl
    this.props.playPauseClick(
      mediaUrl,
      (
        btnStatus = 'Play',
        isPlaying = false,
        progress = 0,
        currentTime = 0,
        duration = 0,
      ) => {
        if (btnStatus === 'default') {
          this.setState({
            progress: progress,
            currentTime: currentTime,
            duration: duration,
          });
        } else {
          this.setState({
            btnState: btnStatus,
            progress: progress,
            currentTime: currentTime,
            duration: duration,
          });
        }

        // console.log('progress --------->> :: ', progress);
      },
    );
  };

  getPlayPauseIcon = (btnState) => {
    if (btnState.toLowerCase() === 'pause') {
      return pause_icon;
    }
    return play_icon;
  };

  audio_only() {
    return (
      <View style={styles.main_container}>
        <View
          style={[
            [
              styles.player,
              {
                backgroundColor: this.props?.isSelfComponent
                  ? colors.blueLight
                  : colors.grey,
              },
            ],
          ]}>
          <>
            <View
              style={[
                styles.sub_container,
                this.props.fromChatMedia
                  ? {paddingHorizontal: 10}
                  : emptyObject,
              ]}>
              <View style={styles.play_pause_container}>
                {this.state.btnState === 'loading' ? (
                  <ActivityIndicator
                    animating={true}
                    style={styles.activityIndicator1}
                    size="small"
                    color="#517BD2"
                  />
                ) : (
                  <TouchableOpacity
                    style={styles.play_pause_container1}
                    onPress={() => {
                      //const url = this.props.download?.mediaUrl;
                      if (this.mediaUrl) {
                        this.prepareAudio(this.mediaUrl);
                      } else {
                        this.onPrepare();
                      }
                    }}>
                    <View>{this.getPlayPauseIcon(this.state.btnState)}</View>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.time_text}>
                {this.millisToMinutesAndSeconds(this.state.currentTime || 0)}
              </Text>
              <View style={styles.slider_container}>
                <Slider
                  allowTouchTrack={
                    this.state.btnState === 'Pause' ? true : false
                  }
                  step={0.001}
                  disabled={this.state.btnState === 'Pause' ? false : true}
                  onSlidingComplete={(value) => {
                    this.setState({
                      progress: value,
                    });
                  }}
                  onValueChange={(percentage) => {
                    if (this.props.sliderSeek) {
                      // playerCallback
                      this.props.sliderSeek(percentage);
                    }
                    // if (this.props.playerCallback) {
                    //   this.props.playerCallback(percentage);
                    //   //this.props.sliderSeek(percentage);
                    // }
                  }}
                  value={this.state.progress || 0}
                  animationType="timing"
                  // trackStyle={{color: 'red'}}
                  style={styles.slider_style}
                  minimumValue={0}
                  maximumValue={1}
                  minimumTrackTintColor="#202124"
                  maximumTrackTintColor="#9AA0A6"
                  thumbTintColor="#202124"
                  thumbStyle={{
                    width: 15,
                    height: 15,
                    backgroundColor: '#202124',
                  }}
                  thumbTouchSize={{
                    width: 10,
                    height: 20,
                  }}
                />
              </View>
              <Text style={styles.time_text}>
                {this.getDuration()}
                {/* {this.millisToMinutesAndSeconds(
                  this.getDuration()
                )} */}
              </Text>
            </View>
          </>
        </View>
      </View>
    );
  }

  getDuration = () => {
    if (
      this.props.duration &&
      //!isNaN(this.props.duration) &&
      this.props.duration !== ''
    ) {
      return this.props.duration;
    }
    return this.millisToMinutesAndSeconds(this.state.duration || 0);
    //this.props.duration || this.state.duration || 0
  };

  checkPermissions(item) {
    switch (Platform.OS) {
      case 'android':
        PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]).then((result) => {
          if (
            result['android.permission.READ_EXTERNAL_STORAGE'] &&
            result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
          ) {
            this.openMediaView(item);
          } else if (
            result['android.permission.READ_EXTERNAL_STORAGE'] ||
            result['android.permission.WRITE_EXTERNAL_STORAGE'] ===
              'never_ask_again'
          ) {
            Alert.alert(
              'Alert',
              'Please Go into Settings -> Applications -> ' +
                APP_NAME +
                ' -> Permissions and Allow permissions to continue',
              [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {text: 'OK', onPress: () => Linking.openSettings()},
              ],
              {cancelable: false},
            );
          }
        });
        break;
      case 'ios':
        this.openMediaView(item);
        break;
      default:
        break;
    }
  }

  openMediaView = (item) => {
    let _params = null;
    if (this.props?.postId) {
      _params = {
        messageId: this.props?.postId,
        componentFileId: item?.componentFileId,
      };
    } else if (item) {
      _params = {
        messageId: item?.messageId,
        componentFileId: item?.componentFileId,
      };
    }
    if (_params == null) {
      return;
    }
    this.props.downloadAtatchment(_params, (data) => {
      this.mediaUrl = data?.mediaUrl;
      if (this.mediaUrl) {
        this.prepareAudio(this.mediaUrl);
      }
    });
  };

  onPrepare = () => {
    const {item} = this.props;
    //console.log('onPrepare ------------>>: ', item);
    // const {state} = item;

    this.setState({
      btnState: 'loading',
    });

    //if (!(state && state === 'recalled')) {
    this.checkPermissions(item);
    // }
  };

  render() {
    return (
      <View style={[styles.frame1, {borderRadius: this.props.borderRadius}]}>
        <View style={styles.components1}>
          <View
            style={[styles.frame2, {borderRadius: this.props.borderRadius}]}>
            {this.audio_only()}
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  sub_container: {
    flexDirection: 'row',
  },
  main_container: {justifyContent: 'center', height: 46},
  frame1: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  frame2: {
    overflow: 'hidden',
    borderColor: '#BDC1C6',
    // borderWidth: 1,
  },
  componentTextStyle: {
    color: '#9AA0A6',
    fontWeight: '400',
    fontSize: normalize(12),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  audioOrVideo: {
    overflow: 'hidden',
    width: '100%',
    margin: 1,
    height: '100%',
    position: 'absolute',
    justifyContent: 'flex-end',
    padding: 11,
  },
  imageStyle: {
    //width: '100%',
    //overflow: 'hidden',
    backgroundColor: 'red',
    //borderTopLeftRadius: 10,
    // borderLeftColor: '#BDC1C6',
    aspectRatio: 1,
    //height: null,
  },
  audioStyle: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    padding: 11,
    backgroundColor: '#85B7FE',
  },
  player: {
    //  justifyContent: 'center',
    // position: 'absolute',
    // paddingTop: 10,
    //width: '100%',
    //height: '100%',
    backgroundColor: '#EFF0F1',
  },
  multiStyle: {
    backgroundColor: 'black',
    width: '100%',
    height: '100%',
    opacity: 0.7,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
  },
  components1: {
    width: '100%',
    overflow: 'hidden',
  },
  slider: {
    flex: 1,
  },
  play_pause_container: {
    width: 25,
    height: '100%',
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  play_pause_container1: {
    width: 25,
    height: 40,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    // marginEnd: 5,
  },
  activityIndicator1: {
    flex: 1,
    alignItems: 'center',
    height: 60,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  slider_container: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    //marginTop: 23,
    // height: 60,
  },
  time_text: {
    color: '#202124',
    justifyContent: 'center',
    alignContent: 'center',
    fontSize: normalize(12),
    alignSelf: 'center',
    justifyContent: 'center',

    fontFamily: 'Inter',
    fontStyle: 'normal',
    fontWeight: '500',
    //  letterSpacing: '0.03',
    textAlign: 'right',
  },
  slider_style: {
    marginEnd: 10,
    marginStart: 10,
    height: '100%',
    // backgroundColor: 'red',
  },
});

AudioCompnent.defaultProps = {
  sliderMax: 100,
  sliderMin: 0,
  sliderValue: 10,
  btnState: 'Play',
  currentTime: 0,
  download: null,
  duration: '',
};

AudioCompnent.propTypes = {
  sliderMax: PropTypes.number,
  sliderMin: PropTypes.number,
  sliderValue: PropTypes.number,
  currentTime: PropTypes.number,
  download: PropTypes.object,
  duration: PropTypes.string,

  btnState: PropTypes.oneOf(['Play', 'Pause', 'loading']),
};

const mapStateToProps = (state) => {
  // const {preview} = state;
  return {
    //  download: preview.downloadAttachment,
  };
};
export default connect(mapStateToProps, {
  downloadAtatchment,
})(AudioCompnent);

//export default AudioCompnent;
