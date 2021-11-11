import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Modal,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Voice from '@react-native-community/voice';

import * as Constants from '../components/KoraText';
import {Icon} from '../components/Icon/Icon';
import {normalize} from '../utils/helpers';
import LinearGradient from 'react-native-linear-gradient';
import TouchableRipple from '../components/Library/react-native-touch-ripple';
import {isEqual} from 'lodash';
const dimension = Dimensions.get('window');

class SpeechToText extends React.Component {
  constructor(props) {
    super(props);
    this.rippleRef = null;
    this.state = {
      recognized: '',
      pitch: '',
      error: '',
      end: false,
      started: false,
      results: [],
      partialResults: [],
      isHidden: false,
      visible: false,
      selectedText : 'shanky chugh shanky chugh shanky chugh pooja chugh pooja chugh pooja chugh pooja chughpooja chughpooja chughpooja chughpooja chughpooja chughpooja chughpooja chughpooja chughpooja chughpooja chughpooja chughpooja chughpooja chughpooja chughpooja chughpooja chughpooja chughpooja chugh pooja chugh pooja chgh pooja chugh pooja chugh shekhar chugh shekhar chugh shekhar chugh shekhar chugh shekhar chugh testing the content testing testing testing testing testing testing from shekhar chugh sdfghjkl;asdfghjklzxcvbnmqwertyuiiiiiiiiiiiiiozxcvbnmzxcvbnmzxcvbnmqwertyuiopasdfghjklzxcvbnmqwertyuiop',
      animation: new Animated.Value(600),
    };
    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechRecognized = this.onSpeechRecognized;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechError = this.onSpeechError;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechPartialResults = this.onSpeechPartialResults;
    Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged;
  }
  // shouldComponentUpdate(prevProps) {
  //   return !isEqual(this.props, prevProps);
  // }

  showModal() {
    this._stopRecognizing();
    this.setState({visible: true});

    setTimeout(() => {
      this.setState({isHidden: true});
      setTimeout(() => {
        this._startRecognizing()
      }, 200);
    }, 500);

    // this.setState({isHidden: true});sssss
  }

  hideModal = () => {
    this._destroyRecognizer();
    this.setState({visible: false});
  };

  startAnimation = () => {
    Animated.timing(this.state.animation, {
      toValue: 270,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  onSpeechStart = (e) => {
    console.log('onSpeechStart: ', e);
    this.setState({
      started: true,
      end: false,
    });
  };

  onSpeechRecognized = (e) => {
    console.log('onSpeechRecognized: ', e);
    this.setState({
      recognized: '√',
    });
  };

  onSpeechEnd = (e = null) => {
    console.log('onSpeechEnd: ', e);
    this._stopRecognizing();
    this.setState({
      end: true, //!e.error,
    });
  };

  onSpeechError = (e) => {
    console.log('onSpeechError: ', e);
    this.setState({
      error: JSON.stringify(e.error),
      // end: false,
    });
  };

  onSpeechResults = (e) => {
    // console.log('onSpeechResults: ', e);
    this.scrollViewRef?.scrollToEnd({animated: true});
    this.setState({
      results: e.value,
    });
  };

  onSpeechPartialResults = (e) => {
    if (e && e.value && e.value[0] && e.value[0] !== '') {
      console.log('onSpeechPartialResults: ', e);
      this.setState({
        partialResults: e.value,
      });
    }
  };

  onSpeechVolumeChanged = (e) => {
    if (this.rippleRef && e.value >= 2) {
      this.rippleRef?.onPress();
      console.log('onSpeechVolumeChanged: ', e);
      this.setState({
        pitch: e.value,
      });
    }
  };

  _startRecognizing = async () => {
    this.setState({
      recognized: '',
      pitch: '',
      error: '',
      started: false,
      results: [],
      partialResults: [],
      end: false,
    });

    try {
      await Voice.start('en-US');
    } catch (e) {
      console.log(e);
    }
  };

  _stopRecognizing = async () => {
    try {
      await Voice.stop();
      this.scrollViewRef?.scrollToEnd({animated: true});
    } catch (e) {
      console.log(e);
    }
  };

  _cancelRecognizing = async () => {
    try {
      await Voice.cancel();
    } catch (e) {
      console.log(e);
    }
  };

  _destroyRecognizer = async () => {
    try {
      await Voice.destroy();
    } catch (e) {
      console.log(e);
    }
    this.setState({
      recognized: '',
      pitch: '',
      error: '',
      started: false,
      results: [],
      partialResults: [],
      end: false,
    });
  };

  cancel = () => {
    if (this.state.isHidden) {
      return (
        <TouchableOpacity
          onPress={() => {
            this.hideModal();
          }}
          style={styles.canStyle1}>
          <View style={styles.canStyle2}>
            <Icon name={'Close'} size={24} color={'white'} />
          </View>
        </TouchableOpacity>
      );
    }
  };

  go = () => {
    if (this.state.isHidden) {
      return (
        <TouchableOpacity
          style={styles.goStyle1}
          onPress={() => {
            if (this.state.partialResults) {
              // console.log('Text ------>:', this.state.partialResults);
              if (this.props.callback) {
                this.hideModal();
                this.props.callback(this.state.partialResults);
              }
            }
          }}>
          <View style={styles.goStyle2}>
            <Text style={styles.goTextStyle}>Go</Text>
          </View>
        </TouchableOpacity>
      );
    }
  };

  buttonBefore = () => {
    return (
      <TouchableOpacity
        style={styles.beforeStyle1}
        onPressOut={this._startRecognizing}
        onPress={() => {
          this.setState({isHidden: true});
        }}>
        <Image
          source={require('../assets/tabs/findly.png')}
          style={styles.beforeStyle2}
        />
      </TouchableOpacity>
    );
  };

  buttonAfter = () => {
    if (this.state.isHidden) {
      return (
        <TouchableOpacity
          style={styles.afterStyle1}
          onPress={() => {
            this.hideModal();
            setTimeout(() => {
              this.showModal();
            }, 100);
            // this.setState({isHidden: true});
          }}>
          <Image
            source={require('../assets/tabs/findly.png')}
            style={styles.afterStyle2}
          />
        </TouchableOpacity>
      );
    }
  };

  displayText = () => {
    if (this.scrollViewRef && !this.state.end) {
      this.scrollViewRef.scrollToEnd({animated: true});
    }
    const index = 12;
    return (
      <Text
        key={`result-${index}`}
        style={[styles.resultTextStyle, {flexDirection: 'column-reverse'}]}>
        {this.state.selectedText}
      </Text>
    );

    // return this.state.partialResults.map((result, index) => {
    //   return (
    //     <Text
    //       key={`result-${index}`}
    //       style={[styles.resultTextStyle, {flexDirection: 'column-reverse'}]}>
    //       {result.trim()}
    //     </Text>
    //   );
    // });
  };

  renderModalContent() {
    return (
      <LinearGradient
        start={{x: 0.25, y: 0.5}}
        end={{x: 0.75, y: 0.5}}
        locations={[0, 0.3]}
        colors={['rgba(255, 255, 255, 0.0)', 'rgba(255, 255, 255, 1)']}
        useAngle={true}
        angle={180}
        style={styles.sttContainer}>
        {this.state.end ? (
          <View style={styles.sttContainer1}>
            {this.cancel()}
            {this.buttonAfter()}
            {this.go()}
          </View>
        ) : (
          <View style={styles.sttContainer2}>
            <TouchableRipple
              ref={(ref) => {
                this.rippleRef = ref;
              }}
              rippleSequential={false}
              rippleCentered={true}
              rippleSize={150}
              rippleDuration={2500}
              style={styles.iconContainer1}
              // rippleColor="#E7F1FF"
              rippleColor="#C9DBF5" //"#DAE9FF"//"#E7F1FF"
              rippleOpacity={1}
              rippleContainerBorderRadius={100}
              onPressOut={this._startRecognizing}
              onPress={() => {
                this.setState({isHidden: true});
              }}></TouchableRipple>

            <View style={styles.iconContainer2}>
              <TouchableOpacity
                style={styles.iconStyle}
                onPressOut={this._startRecognizing}
                onPress={() => {
                  Voice.isRecognizing().then((isRecognizing)=>{

                    if(isRecognizing){
                      this.onSpeechEnd();
                    }else{
                      this.setState({isHidden: true});
                    }
                  });
                  
                  
                }}>
                <Image
                  source={require('../assets/tabs/findly.png')}
                  style={styles.iconContainer3}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View style={{flex : 1}}>
        <ScrollView
          ref={(ref) => {
            this.scrollViewRef = ref;
          }}
          onContentSizeChange={() =>
            this.scrollViewRef.scrollToEnd({animated: true})
          }
          showsVerticalScrollIndicator={true}
          horizontal={false}
          keyboardShouldPersistTaps="handled">
        {this.displayText()}
        </ScrollView>
        </View>
      </LinearGradient>
    );
  }

  render() {
    const {props} = this;
    return (
      <SafeAreaView>
        <Modal
          visible={this.state.visible}
          transparent={props.transparent}
          onRequestClose={props.dismiss}
          animationType={props.animationType}>
          <View style={styles.container}>
            <TouchableWithoutFeedback onPress={this.hideModal}>
              <View style={styles.modalOverlay}></View>
            </TouchableWithoutFeedback>
            {this.renderModalContent()}
          </View>
        </Modal>
      </SafeAreaView>
    );
  }
}

SpeechToText.propTypes = {
  // children: PropTypes.node.isRequired,
  visible: PropTypes.bool.isRequired,
  // dismiss: PropTypes.func.isRequired,
  transparent: PropTypes.bool,
  animationType: PropTypes.string,
};

SpeechToText.defaultProps = {
  animationType: 'fade',
  transparent: true,
  visible: false,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
  sttContainer: {
    flexDirection: 'column-reverse',
    alignItems: 'stretch',
    width: '100%',
    //minHeight:325,
    // maxHeight:800,
    // backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flex :1, //350, //dimension.height / 3,
    maxHeight : 400
  },
  sttContainer1: {
    width: '100%',
    height: 132,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  sttContainer2: {
    width: '100%',
    height: 132,
    //flex: 1.2,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginBottom: 10,
    marginTop: 20,
    //backgroundColor: 'red',
    // flex: 2,
    //height: 100,
    //alignItems: 'flex-end',
    //justifyContent: 'flex-end',
  },
  iconContainer: {
    flex: 1,
    // backgroundColor: 'white',
    // alignItems: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer1: {
    flex: 1,
    // backgroundColor: 'white',
    // alignItems: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  iconContainer2: {
    flexDirection: 'row',
    position: 'absolute',
  },
  iconContainer3: {width: 46, height: 46},
  iconContainer4: {flexDirection: 'column-reverse'},
  iconStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    //position: 'relative',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    margin: '5%',
    backgroundColor: 'white',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  textStyle: {
    alignSelf: 'center',
    color: '#9AA0A6',
    fontWeight: '400',
    fontStyle: 'normal',
    fontSize: normalize(20),
    fontFamily: Constants.fontFamily,
    textAlign: 'center',
  },
  resultTextStyle: {
    color: '#202124',
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontSize: normalize(20),
    fontFamily: Constants.fontFamily,
    textAlign: 'center',
    // justifyContent: 'flex-end',
    //textAlignVertical:'bottom',
    marginStart: '10%',
    marginEnd: '10%',
  },
  canStyle1: {alignItems: 'center'},
  canStyle2: {
    backgroundColor: '#DD3646',
    height: 52,
    width: 52,
    borderRadius: 30,
    marginEnd: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goStyle1: {alignItems: 'center'},
  goStyle2: {
    backgroundColor: '#28A745',
    height: 52,
    width: 52,
    borderRadius: 30,
    marginStart: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beforeStyle1: {alignItems: 'center'},
  beforeStyle2: {width: 52, height: 52, marginLeft: 21, marginRight: 21},
  afterStyle1: {alignItems: 'center'},
  afterStyle2: {height: 52, width: 52, marginLeft: 21, marginRight: 21},
});

export default SpeechToText;
