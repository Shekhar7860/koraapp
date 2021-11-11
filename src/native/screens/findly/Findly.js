import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  TouchableHighlight,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  Alert
} from 'react-native';
// import NetInfo from '@react-native-community/netinfo';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';

import {Text} from '../../components/KoraText';
import {getHelpThunderbolt} from '../../../shared/redux/actions/home.action';

import {Icon} from '../../components/Icon/Icon.js';
import {BottomUpModal} from '../../components/BottomUpModal';
import Chats from './Chats';
import EventEmitter from 'events';
import HelpOptions from './HelpOptions';
import {EMITTER_TYPES, TemplateType} from './views/TemplateType';
import * as UsersDao from '../../../dao/UsersDao';
import {ROUTE_NAMES} from '../../navigation/RouteNames';

import {setSpeachToText} from '../../../shared/redux/actions/findly_notifications.action';

const windowHeight = Dimensions.get('window').height;

class Findly extends React.Component {
  Suggestions = [];
  unsubscribeNetWork = null;
  navigation = null;
  buttons = [];
  selectedTasks = [];
  tids = [];

  constructor(props) {
    super(props);
    this._emitter = new EventEmitter();
    this.keyboardWillShowListener = null;
    this.keyboardWillHideListener = null;
  }

  state = {
    show: true,
    myInput: '',
    messages: [],
    helpObj: null,
    refrehUI: false,
    helpResourceObj: null,
    isShowBottomView: false,
    showKeyboard: false,
    speechToText: '',
  };

  componentDidMount() {
    const {navigation, route} = this.props;

    // let text = route.params?.speechToText || '';
    // console.log('From Findly this.props.route ---------->> :', this.props.route);
    // console.log('From Findly speachToText---------->> :', this.props.speachToText);
    let stt = this.props.speachToText;
    //{"speechToText": "103"}
    if(stt?.speechToText){
      setTimeout(()=>{
        if (this._emitter) {
          this._emitter.emit(EMITTER_TYPES.SPEECH_TO_TEXT,stt?.speechToText);
        }
      },1000);
    }

  
   

   this.props.setSpeachToText(null);
    this.props.getHelpThunderbolt();

    // Subscribe
    // this.unsubscribeNetWork = NetInfo.addEventListener(() => {});
    this.navigation = navigation;
    this.setKoraHeader();
    this.keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      this.keyboardWillShow,
    );
    this.keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      this.keyboardWillHide,
    );
  }

  keyboardWillHide = () => {
    this.setState({showKeyboard: false});
  };

  keyboardWillShow = () => {
    this.setState({showKeyboard: true});
  };

  setMultiSelectHeader(message) {
    if (!this.navigation) {
      return;
    }
    const navigation = this.navigation;
    navigation.setOptions({
      title: '',
      titleColor: 'red',

      headerLeft: () => (
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            style={{padding: 5}}
            onPress={() => {
              this.changeHeaderMode(0);
            }}>
            <View style={{flex: 1, justifyContent: 'center', marginStart: 10}}>
              <Icon name={'Close'} size={24} color="white" />
            </View>
          </TouchableOpacity>

          <View style={{flexDirection: 'row'}}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                marginStart: 10,
                backgroundColor: '#00000',
              }}>
              <Text
                style={{
                  fontStyle: 'normal',
                  fontWeight: 'normal',
                  fontSize: 18,
                  flexWrap: 'wrap',
                  color: 'white',
                  fontFamily: 'Inter',
                }}>
                {message}
              </Text>
            </View>
          </View>
        </View>
      ),

      headerRight: () => <View style={{flexDirection: 'row'}}></View>,

      headerStyle: {
        backgroundColor: '#FF5A6A',
      },
      color: 'red',
      headerTintColor: 'black',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerTitleAlign: 'left',
    });
  }

  setKoraHeader() {
    if (!this.navigation) {
      return;
    }
    const navigation = this.navigation;
    navigation.setOptions({
      title: '',
      titleColor: 'red',

      headerLeft: () => (
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            style={{paddingHorizontal: 5}}
            onPress={() => {
              navigation.goBack();
            }}>
            <View style={{flex: 1, justifyContent: 'center', marginStart: 10}}>
              <Icon name={'Close'} size={24} color="black" />
            </View>
          </TouchableOpacity>

          {/* <View style={{ flex: 1, justifyContent: 'center', marginStart: 10 }}>
            <Icon name={'findly'} size={30} color="black" />
          </View> */}
          <View style={{flexDirection: 'row'}}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                marginStart: 10,
                backgroundColor: '#00000',
              }}>
              <Text
                style={{
                  fontStyle: 'normal',
                  fontWeight: 'bold',
                  fontSize: 18,
                  flexWrap: 'wrap',
                  color: '#202124',
                  fontFamily: 'Inter',
                }}>
                Kora
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                marginStart: 0,
                backgroundColor: '#00000',
              }}>
              <Text
                style={{
                  fontStyle: 'normal',
                  fontWeight: 'normal',
                  fontSize: 18,

                  flexWrap: 'wrap',
                  color: '#202124',
                  fontFamily: 'Inter',
                }}>
                .ai
              </Text>
            </View>
          </View>
        </View>
      ),

      headerRight: () => (
        <View style={{flexDirection: 'row',alignItems:'center'}}>
          <TouchableOpacity
            style={{padding: 5}}
            onPress={() => {
              //this.props.navigation.navigate(ROUTE_NAMES.INPUT_URL, {});
              // this.props.navigation.navigate(ROUTE_NAMES.INPUT_URL, {});
              this.props.navigation.navigate(ROUTE_NAMES.KORA_NOTIFICATIONS, {
                callGoBack: () => {
                  this.props.navigation.goBack();
                },
              });
            }}>
            <View style={{marginEnd: 10,}}>
              <Icon name={'notification'} size={18} color="black" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={{padding: 5}}
            onPress={() => {
              this.refs.messageOptions.openBottomDrawer();
            }}>
            <View style={{marginEnd: 10}}>
              <Icon name={'options'} size={24} color="black" />
            </View>
          </TouchableOpacity>
        </View>
      ),

      headerStyle: {
        backgroundColor: 'white',
      },
      color: 'red',
      headerTintColor: 'black',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerTitleAlign: 'left',
    });
  }

  componentDidUpdate(prevProps) {
    this.Suggestions = [];
    if (prevProps.thunderBoltResp !== this.props.thunderBoltResp) {
      let thunderBoltResp = this.props.thunderBoltResp;
      let helpObj = thunderBoltResp?.thunderbolt?.help;

      if (
        thunderBoltResp &&
        thunderBoltResp.thunderboltRecents &&
        thunderBoltResp.thunderboltRecents.utterances.length
      ) {
        this.Suggestions = thunderBoltResp.thunderboltRecents.utterances;
      }

      if (!this.state.helpObj) {
        this.setState({
          helpObj: helpObj,
        });
      }
    }
  }

  Suggestion = () => {
    return Suggestions.map((element) => {
      return (
        <Text
          style={{
            fontWeight: '400',
            fontSize: 16,
            marginTop: 0.024 * windowHeight,
            color: '#202124',
            textAlign: 'center',
            width: 315,
          }}>
          {element.name}
        </Text>
      );
    });
  };

  Show = () => {
    if (this.state.messages == '') {
      return (
        <View style={{alignItems: 'center', marginTop: 0.053 * windowHeight}}>
          <Image
            source={require('../../assets/tabs/findly.png')}
            style={{height: 0.114 * windowHeight, width: 0.114 * windowHeight}}
          />
          <Text
            style={{
              fontWeight: '700',
              marginTop: 14,
              fontSize: 16,
              color: '#202124',
            }}>
            Hi, {UsersDao.getUserName()}
          </Text>
          <Text
            style={{
              marginTop: 20,
              fontWeight: '300',
              fontSize: 24,
              color: '#202124',
            }}>
            How can I help you today!
          </Text>
          <Text
            style={{
              marginTop: 0.05 * windowHeight,
              fontWeight: '600',
              fontSize: 12,
              color: '#9AA0A6',
            }}>
            TRY ASKING...
          </Text>
          <View style={{maxHeight: 0.3 * windowHeight}}>
            <ScrollView>{this.Suggestion()}</ScrollView>
          </View>
          <TouchableOpacity style={{}} onPress={() => {}}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '400',
                color: '#0D6EFD',
                marginTop: 20,
              }}>
              More
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
  };
  Messages = () => {
    if (this.state.messages != '') {
      return (
        <View style={{height: 40, maxWidth: 200, backgroundColor: '#85B7FE'}}>
          {this.state.messages.map((item) => (
            <Text
              style={{
                marginBottom: 10,
                padding: 10,

                borderWidth: 1,
                borderColor: '#85B7FE',
                borderRadius: 15,
              }}>
              {item}
            </Text>
          ))}
        </View>
      );
    }
  };
  onChangeInput = (e) => {
    this.setState({
      myInput: e,
    });
  };
  sendAction = () => {
    this.setState((prevState) => {
      return {
        myInput: '',
        messages: [...prevState.messages, prevState.myInput],
      };
    });
  };

  renderOptions() {
    let options = [
      {
        id: 'find',
        text: 'Find',
        icon: 'Contact_Search',
      },
      {
        id: 'start_over',
        text: 'Start Over',
        icon: 'Messages',
      },
      {
        id: 'preference',
        text: 'Preference',
        icon: 'Reply',
      },
      {
        id: 'help',
        text: 'Help',
        icon: 'Help',
      },
    ];

    setTimeout(() => {
      if (!this.state.refrehUI || !this.state.helpObj) {
        this.setState({
          refrehUI: true,
        });
      }
    }, 1000);

    const optionSelected = (id) => {
      if (id === 'help') {
        setTimeout(() => {
          // this.deleteMessage(focusedMessage.messageId, focusedMessage.isSender);
          if (this.refs.helpOptions) {
            this.refs.helpOptions.openHelp();
          }
        }, 1000);
      }
      this.refs.messageOptions.closeBottomDrawer();
    };

    const ModalOption = ({id, text, icon}) => {
      return (
        <TouchableHighlight
          onPress={() => {
            optionSelected(id);
          }}
          style={{
            marginHorizontal: 4,
            margin: 4,
            padding: 15,
            paddingVertical: 10,
            borderRadius: 5,
          }}
          underlayColor="rgba(0,0,0,0.05)">
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{paddingRight: 23}}>
              <Icon size={21} name={icon} />
            </View>
            <Text
              style={{
                fontSize: 16,
                color: '#202124',
                fontFamily: 'inter',
                fontStyle: 'normal',
                fontWeight: '500',
              }}>
              {text}
            </Text>
          </View>
        </TouchableHighlight>
      );
    };
    return (
      <SafeAreaView>
        <BottomUpModal ref="messageOptions" height={230}>
          {/* <View style={{height: 20}}></View> */}
          <View
            style={{
              padding: 6,
            }}></View>
          {options.map((option) => (
            <ModalOption {...option} key={option.id} />
          ))}
        </BottomUpModal>
      </SafeAreaView>
    );
  }

  renderHelpOptions() {
    return (
      <SafeAreaView>
        <HelpOptions
          ref="helpOptions"
          helpObj={this.state.helpObj}
          helpUtterencesSet={(uttrence) => {
            if (this._emitter) {
              this._emitter.emit(EMITTER_TYPES.HELP_UTTRENCES, uttrence);
            }
          }}
        />
      </SafeAreaView>
    );
  }

  componentWillUnmount() {
    // if (this.unsubscribeNetWork) {
    //   this.unsubscribeNetWork();
    // }
    if (this.keyboardWillShowListener) {
      this.keyboardWillShowListener.remove();
    }
    if (this.keyboardWillHideListener) {
      this.keyboardWillHideListener.remove();
    }
  }

  setQuickReplies = (quickReplies) => {
    console.log('quickReplies ---> ', quickReplies);
  };

  changeHeaderMode = (
    mode,
    message = '',
    buttons = [],
    selectedTasks = [],
    tids = [],
  ) => {
    switch (mode) {
      case 0:
        this.setKoraHeader();
        this.setState({
          isShowBottomView: false,
        });
        if (this._emitter) {
          this._emitter.emit(EMITTER_TYPES.RESET_ALL);
        }
        break;
      case 1:
        this.buttons = buttons;
        this.selectedTasks = selectedTasks;
        this.tids = tids;
        this.setMultiSelectHeader(message);
        this.setState({
          isShowBottomView: true,
        });
        break;
    }
  };

  renderBottomButtons = () => {
    return (
      <View style={styles.bottomButtons}>
        {this.buttons &&
          this.buttons.map((button) => {
            return (
              <TouchableOpacity
                style={{
                  marginLeft: 12,
                  marginBottom: 3,
                  marginTop: 3,
                  justifyContent: 'flex-start',
                  flexDirection: 'row',
                  backgroundColor: '#FF5A6A',
                  borderRadius: 5,
                }}
                onPress={() => {
                  let payload = {
                    button: button,
                    taskList: this.selectedTasks,
                    template_type: TemplateType.TASK_LIST_FULL_PREVIEW,
                    tids: this.tids,
                  };

                  if (this._emitter) {
                    this._emitter.emit(
                      EMITTER_TYPES.TASK_FULL_PREVIEW_EMITOR,
                      payload,
                      TemplateType.TASK_LIST_FULL_PREVIEW,
                    );
                  }
                  this.changeHeaderMode(0);
                }}>
                <Text
                  style={{
                    fontStyle: 'normal',
                    fontWeight: '300',
                    fontSize: 14,

                    marginBottom: 3,
                    marginTop: 5,
                    flexWrap: 'wrap',
                    marginLeft: 0,
                    padding: 7,

                    color: 'white',
                    fontFamily: 'Inter',
                  }}>
                  {button.title}
                </Text>
              </TouchableOpacity>
            );
          })}
      </View>
    );
  };

  render() {
    let botQuickReplies = (quickReplies) => this.setQuickReplies(quickReplies);
    let headerMode = (mode, message, buttons, selectedTasks, tids) =>
      this.changeHeaderMode(mode, message, buttons, selectedTasks, tids);
    this.props = {
      ...this.props,
      botQuickReplies,
      headerMode,
    };
    return (
      <SafeAreaView
        style={{flex: 1, flexDirection: 'column', backgroundColor: 'white'}}>
        {this.renderOptions()}
        {this.renderHelpOptions()}
        <View style={{backgroundColor : '#FFFBEA', height : 40, justifyContent : 'center'}}><Text style={{textAlign : 'center', fontSize : 15}}>Click to view conversation History</Text></View>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.emptyWidth}/>
            <Image source={require('../../assets/Attachment_Icons/image.png')}></Image>
            <View style={styles.emptyWidth}/>
            <View style={styles.column}><Text>Good Morning, </Text>
            <Text>Shanamuga</Text>
            <Text>Buckle up, its a hectic</Text>
            <Text>meeting Day</Text></View>
            
            </View>
            
        </View>
        <View style={{...styles.card, padding : 10}}>
          <Text>Try Asking</Text>
          <View style={styles.backgroundBlue}><Text>Call Surya</Text></View>
          <View style={styles.backgroundBlue2}><Text>Kora Go To Compact Node</Text></View>
          <View style={styles.backgroundBlue3}><Text>Create New WorkSpace And Add Prasanna</Text></View>
        </View>
        <View style={{...styles.card, padding : 10}}>
          <View style={styles.row}>
            <View style={styles.column}><Text>Daily Goal</Text>
            <Text>9/10</Text>
            <Text>Edit Your Goal</Text>
            </View>
            <View style={styles.emptyWidth}/>
            <Image source={require('../../assets/Attachment_Icons/Bitmap.png')}></Image>
            </View>
        </View>
        <Chats
          {...this.props}
          emitter={this._emitter}
          speechToText={this.state.speechToText}
        />
        {this.state.isShowBottomView && this.renderBottomButtons()}
        {!this.state.showKeyboard ? (
          <SafeAreaView />
        ) : (
          <View style={{height: 12}} />
        )}
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  bottomButtons: {
    height: 60,
    width: '100%',
    backgroundColor: 'white',
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  card : {
    marginTop : 15,
    height : 110,
    width : '90%',
    borderWidth : 1,
    backgroundColor : '#ffffff',
    alignSelf : 'center',
    borderRadius : 5,
    borderColor : 'white',shadowColor: 'black',
    shadowOpacity: 0.26,
    shadowOffset: { width: 0, height: 2},
    shadowRadius: 10,
    elevation: 3,
  },
  backgroundBlue : {
    marginTop : 5,
  backgroundColor : '#E7F1FF',
  width : 100,
  height : 20,
  borderRadius : 10,
  alignItems : 'center'
  },
  backgroundBlue2 : {
    marginTop : 5,
  backgroundColor : '#E7F1FF',
  width : 150,
  height : 20,
  borderRadius : 10,
  alignItems : 'center'
  },
  backgroundBlue3 : {
    marginTop : 5,
  backgroundColor : '#E7F1FF',
  width : 150,
  height : 20,
  borderRadius : 10,
  alignItems : 'center'
  },
  row : {
    flexDirection : 'row',
  },
  emptyWidth : {
    width : '5%'
  },
  column : {
    flexDirection : 'column',
    marginTop : 5
  }
});
const mapStateToProps = (state) => {
  const {home,findlyNotifications} = state;
  return {
    thunderBoltResp: home.thunderBoltResp,
    speachToText : findlyNotifications.findly_textToSpeach
  };
};

export default connect(mapStateToProps, {
  getHelpThunderbolt,
  setSpeachToText,
})(withTranslation()(Findly));
