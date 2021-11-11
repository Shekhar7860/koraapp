import React from 'react';
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  TouchableHighlight
} from 'react-native';
import HeaderPostSignUp from './HeaderPostSignUp';
import globalStyle from './styles';
import BlueButton from '../PreLoginScreens/BlueButton';
import { useTranslation, withTranslation } from 'react-i18next';
import UserAvatar from '../../components/Library/react-native-user-avatar/src';
import { normalize } from '../../utils/helpers';
import * as Constants from '../../components/KoraText';
import ColorView from './ColorView';
import { ROUTE_NAMES } from '../../navigation/RouteNames';
import { goBack } from '../../navigation/NavigationService';
import KoraKeyboardAvoidingView from '../../components/KoraKeyboardAvoidingView';
import Indicator from './Indicator';
import BottomText from './BottomText';
import ContactSelection from '../../components/ContactSelection';
import ContactsTag from '../NewChatScreen/ContactsTag';
import { signinValidate } from '../PreLoginScreens/SigninValidate';
import { Icon } from '../../components/Icon/Icon';
import InvitieesList from './InvitieesList';
import { Avatar } from '../../components/Icon/Avatar';
import ModalActivityindicator from 'react-native-modal-activityindicator';

import {
  createAccount,
  createTokenForAccount,
} from '../../../shared/redux/actions/pre-login.action';
import { connect } from 'react-redux';

//import connect from 'react-redux';



export const SelectedUserTag = ({

  user,
  fullName,
  _handleDelete,

}) => {
  return (
    <TouchableHighlight
      key={user?.index}
      underlayColor="rgba(0,0,0,0.2)"
      style={[styles.customTag]}
      onPress={() => _handleDelete(user)}
    >
      <View style={styles.participantsView}>
        <Avatar

          color={'blue'}
          textSize={normalize(13)}

          name={fullName}
          type={'offline'}
          rad={normalize(26)}
        />
        <Text
          numberOfLines={1}
          style={{
            color: '#202124',
            flexShrink: 1,

            textAlignVertical: 'center',
            fontSize: normalize(14),
            paddingLeft: 8,
          }}>
          {fullName}
        </Text>
        <View style={{ width: 10 }} />
        <Icon name="cross" size={normalize(16)} color="#202124" />
      </View>
    </TouchableHighlight>
  );
};







class ContactInviteeScreen extends React.Component {

  state = {
    allowKoreUsers: true,
    showContactList: false,
    enableScrollViewScroll: true,
    attendees: [],
    guests: [],
    emailId: '',
    isAnimating: false,
    selectedUsers: [],
    emailTyping: '',
  };
  constructor(props) {
    super(props);

    this.input = React.createRef();
  }
  accountName = '';
  email = '';
  logo = null;

  signUpPress = () => {
    this.buttonOnPress(ROUTE_NAMES.APP_LANDING_SCREEN);
  };
  loginPress = () => {
    this.buttonOnPress(ROUTE_NAMES.LOGIN_HOME);
  };

  componentDidMount() {
    let { route } = this.props;
    this.accountName = route?.params?.accountName || '';
    this.email = route?.params?.email || '';
    this.logo = route?.params?.logo;
    this.setState({
      currentIndicator: (route?.params?.currentIndicator + 1),
      totalIndicator: route?.params?.totalIndicator
    });
    setTimeout(() => {
      if (this.refs?.input) {
        this.refs?.input.focus();
      }
    }, 100);
  }



  componentDidUpdate(prevProps, prevState) {
    if (prevProps.pwdLogin !== this.props.pwdLogin) {
      //{"errors":[{"msg":"INVALID_CREDENTIALS","code":40}]}
      if (this.props.pwdLogin?.errors) {
        this.setState({isAnimating: false});
        let msg = this.props.pwdLogin?.errors[0].msg || null;
        if (msg) {
          alert(msg);
        }
      }
    }

    if (prevProps.laMod !== this.props.laMod) {
      let userInfo = this.props.user;
      let authorization = this.props.authorization;
      let loginResponse = this.props.loginResponse;
      this.setState({isAnimating: false});
      // signinValidate(this.props, { userInfo, authorization, loginResponse });
      if (userInfo && loginResponse && authorization) {
        this.props.navigation.replace(ROUTE_NAMES.WELCOME_SCREEN);
      }
    }
  }

  doneButtonPress = () => {
    //alert('Done clicked');
    let flag = true;
    let emailsList = [];
    if (this.state.selectedUsers && this.state.selectedUsers.length > 0) {
      this.state.selectedUsers.map((item) => {
        emailsList.push(item?.email)
      })
    }

    let loginResponse = this.props.loginResponse;
    let payload = {
      accountName: this.accountName,
      logo: this.logo,
      type: 'public',
      emailId: this.email,
      invitees: emailsList,
    };
    // console.log('----------->',payload)
    /*   if (flag) {
         console.log('payload  -------------->:', payload);
        this.props.navigation.navigate(ROUTE_NAMES.WELCOME_SCREEN);
         return;
       }   */

    let params = {
      payload: payload,
      session: loginResponse?.session,
    };

    console.log('payload ---->:', payload);
    //this.props.createAccount(payload);
    this.setState({isAnimating: true});
    this.props.createAccount(params, (obj) => {
      console.log('obj  =========>:', JSON.stringify(obj));
      //{"status":true,"data":{"identity":"nandhu@sathishchalla.testinator.com","profilePref":{"specs":["Kore"]}}}
      if (obj?.data && obj?.data?.errors) {
        let msg = obj?.data?.errors[0].msg || null;
        if (msg) {
          this.setState({isAnimating: false});
          alert(msg);
        }
        return;
      }
      /*   let payloadData = {
          accountId: obj.data?.accountId,
        }; */
      let paramsData = {
        accountId: obj.data?.accountId,
        session: loginResponse?.session,
        emailId: this.email,
      };
      //{"status":true,"data":{"success":true,"accountId":"ac-8b025a24-97eb-50df-aff0-61f07f2cffa2"}}
      this.props.createTokenForAccount(paramsData);
      //this.nextButtonPress(obj?.data?.identity);
    });
  };

  addAttendees(guestsList) {
    let guests = [],
      attendees = [];
    guestsList.map((item) => {
      let payloadFormat = { emailId: item.emailId, optional: false };
      let userDetail, name;
      if (item.source === 'profile') {
        userDetail = item;
        name = userDetail?.emailId;
      } else {
        userDetail = ContactsDao.getContactFromEmailID(item.emailId);
        name = userDetail?.fN + ' ' + userDetail?.lN;
      }
      let members = {
        emailId: userDetail?.emailId,
        name: name,
        status: item?.status,
        id: userDetail?._id,
        profileIcon: userDetail?.icon,
        color: userDetail?.color,
      };
      let index = this.state.guests.findIndex(
        (t) => t.emailId === item.emailId,
      );
      console.log('Index', index);
      if (index === -1) {
        guests = guests.concat([members]);
        attendees = attendees.concat([payloadFormat]);
      }
    });

    //console.log('Contact', JSON.stringify(payloadFormat));

    this.setState({
      attendees: this.state.attendees.concat([...attendees]),
      guests: this.state.guests.concat([...guests]),
    });
  }

  buttonOnPress = (key) => {
    switch (key) {
      case ROUTE_NAMES.LOGIN_HOME:
        this.props.navigation.replace(ROUTE_NAMES.LOGIN,
          {
            screen: ROUTE_NAMES.LOGIN_HOME
          })
        //   this.props.navigation.navigate(ROUTE_NAMES.LOGIN_HOME)
        break;
      case ROUTE_NAMES.APP_LANDING_SCREEN:
        this.props.navigation.replace(ROUTE_NAMES.LOGIN,
          {
            screen: ROUTE_NAMES.APP_LANDING_SCREEN
          })
        break;

      default:
        break;
    }
  };
  validate = (text) => {

    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(text?.trim()) === false) {


      return false;
    }
    else {





      let length = this.state.selectedUsers?.length || 0;
      let object = { email: text, index: length };
      this.state.selectedUsers.push(object);
      setTimeout(() => {
        this.setState(
          { emailTyping: '' },
          () => {
            this.refs.input?.clear()
          }
          ,
        );
      }, 100);

      // this.setState({emailTyping:""})
    }

  }
  handleKeyDown = (e) => {
    if (e.nativeEvent.key == "done" || e.nativeEvent.key == " ") {
      //dismissKeyboard();

      this.validate(this.state.emailTyping)
    }
  }
  _handleDelete = (user) => {


    let contactData = this.state.selectedUsers;
    contactData = contactData.filter(
      (contact) => contact.index !== user.index,
    );
    this.setState({ selectedUsers: contactData });

  };
  renderSelectedParticipants() {
    let contactData = this.state.selectedUsers;
    return contactData?.map((user) => {


      return (
        <SelectedUserTag

          user={user}
          fullName={user?.email}
          _handleDelete={this._handleDelete}
        />

      );
    });
  }
  setFocusOnInput = () => {
    this.refs.input.focus();
  };
  render() {

    const { t } = this.props;
    let { allowKoreUsers, showContactList, guests } = this.state;
    return (
      <SafeAreaView style={styles.root}>
        <KoraKeyboardAvoidingView style={styles.root}>
          <ScrollView>
            <HeaderPostSignUp
              appName={false}
              done={this.doneButtonPress}
              nextButton={true}
              text={this.state.selectedUsers.length > 0 ? 'Invite' : 'Done'}
            />

            <View style={globalStyle.globalInnerRootStyle}>
              <View style={styles.v1}>
                <View>
                  <Indicator position={this.state.currentIndicator} totalIndicator={this.state.totalIndicator}></Indicator>

                </View>
                <Text style={styles.nameStyle}>{t('startInviting')}</Text>
                <Text style={styles.welcomeStyle}>{t('addThemLater')}</Text>
                <View style={{ margin: 10 }} />
                <TouchableOpacity
                  onPress={() => this.setState({ allowKoreUsers: !allowKoreUsers })}
                  style={styles.c1}>
                  <View style={styles.checkboxStyle}>
                    {allowKoreUsers ? (
                      <View style={styles.selectedUI}>
                        <Icon
                          name={'SingleTick'}
                          size={normalize(13)}
                          color={'#fff'}
                          style={styles.checkboxTickImg}
                        />
                      </View>
                    ) : (
                      <View style={styles.uncheckedCheckbox} />
                    )}
                  </View>
                  <Text style={styles.allowUserStyle}>{t('allowKoreUsers')}</Text>
                </TouchableOpacity>

                <View style={[styles.inputViewStyle, { paddingTop: this.state.selectedUsers.length > 0 ? 10 : 0 }]}>
                  <TouchableOpacity
                    onPress={() => {
                      this.setFocusOnInput();
                    }}
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',


                    }}>
                    {this.renderSelectedParticipants()}
                  </TouchableOpacity>
                  <TextInput
                    style={styles.textInputStyle}
                    onChangeText={(text) => {
                      this.setState({ emailTyping: text })
                      if (text && text.trim().length > 0 && text.slice(-1) === ' ') {

                        this.validate(text)
                      }
                    }}
                    value={this.state.emailTyping || ''}
                    returnKeyType="done"
                    autoCapitalize='none'
                    onSubmitEditing={({ nativeEvent }) => this.validate(nativeEvent.text)}
                    ref="input"
                    autoCorrect={false}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key == "done") {
                        this.validate(this.state.emailTyping)
                      }
                    }}
                    placeholder="Email Address"
                    placeholderTextColor="#BDC1C6"
                  />
                </View>
                {showContactList ? (
                  <View style={{}}>
                    <InvitieesList
                      addAttendees={(contact) => this.addAttendees(contact)}
                      enableScrollViewScroll={this.state.enableScrollViewScroll}
                      onStartShouldSetResponderCapture={(value) => {
                        this.setState({ enableScrollViewScroll: value });
                      }}
                      tagsSelected={guests}
                      searchName={this.state.emailId || ''}
                      setSuggesstionListVisibility={() => {
                        // nameInput.current?.clear();
                        this.setState({
                          showContactList: false,
                          emailId: '',
                        });
                      }}
                    />
                  </View>
                ) : null}
                <View style={styles.bottomView}>
                  <BottomText
                    email={this.email}
                    signUpPress={this.signUpPress}
                    loginPress={this.loginPress}
                  />
                </View>
              </View>
            </View>

          </ScrollView>
        </KoraKeyboardAvoidingView>
        <ModalActivityindicator
          visible={this.state.isAnimating}
          size="large"
          color="white"
        >
        </ModalActivityindicator>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  c1: {
    paddingVertical: 10,
    flexDirection: 'row',
    width: '95%',
  },
  participantsView: {
    flexDirection: 'row',
    alignItems: 'center',

  },
  v1: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  bottomView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: 20,
    bottom: 0,
    justifyContent: 'flex-start',
  },
  nameStyle: {
    marginTop: 30,
    color: '#202124',
    fontWeight: '600',
    fontSize: normalize(18),

    fontStyle: 'normal',
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
  },
  welcomeStyle: {
    marginTop: 10,
    color: '#5F6368',
    fontWeight: '400',
    fontSize: normalize(18),

    fontStyle: 'normal',
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
  },
  customTag: {
    justifyContent: 'center',
    height: 31,
    marginVertical: 2,
    padding: 5,
    backgroundColor: '#E4E5E7',
    borderRadius: 100,



    flexShrink: 1,

    //borderColor: '#85B7FE',
    //borderWidth: 1,
  },
  inputViewStyle: {

    marginTop: 15,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#0D6EFD',//'#BDC1C6',

    paddingLeft: 9,
  },
  textInputStyle: {
    fontSize: normalize(16),
    fontWeight: '400',
    minHeight: 40,
  },
  allowUserStyle: {
    color: '#202124',
    fontWeight: '400',
    fontSize: normalize(14),
    paddingLeft: 8,
  },
  viewAvatar: { width: '100%', alignItems: 'center', marginTop: 50 },

  avatarText: {
    color: '#FFFFFF',
    padding: 0,
    alignSelf: 'center',
    textAlign: 'center',
    fontWeight: '200',
    fontSize: normalize(60),
    fontStyle: 'normal',
    textAlignVertical: 'center',
    alignSelf: 'center',
    fontFamily: Constants.fontFamily,
  },
  checkboxStyle: {
    height: 18,
    width: 18,
    top: 3,
  },
  selectedUI: {
    borderRadius: 2,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D6EFD',
  },
  uncheckedCheckbox: {
    borderRadius: 2,
    flex: 1,
    backgroundColor: '#fff',
    borderColor: '#BDC1C6',
    borderWidth: 1,
  },
  checkboxTickImg: {
    width: '85%',
    height: '85%',
    tintColor: '#ffffff',
    resizeMode: 'contain',
  },
  root: { flex: 1, backgroundColor: '#FFFFFF' },
});

//export default (withTranslation()(ContactInviteeScreen));

const mapStateToProps = (state) => {
  let { login, auth, language } = state;
  return {
    user: auth.user,
    loginResponse: auth.loginResponse,
    pwdLogin: login.passwordLoginUser,
    authorization: auth.authorization,
    laMod: auth.laMod,
    // language,
  };
};
export default connect(mapStateToProps, {
  createAccount,
  createTokenForAccount,
})(withTranslation()(ContactInviteeScreen));

//   export default connect(mapStateToProps, {
//     //PasswordLogin,
//   })(withTranslation()(ContactInviteeScreen));
