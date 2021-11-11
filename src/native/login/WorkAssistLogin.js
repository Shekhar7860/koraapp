import React from 'react';
import {
  StyleSheet,
  View,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableHighlight,
  Text,
  TextInput,
  PermissionsAndroid,
  Linking,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Svg from 'react-native-svg';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {GoogleSignin, statusCodes} from '@react-native-community/google-signin';
import ModalActivityindicator from 'react-native-modal-activityindicator';

import {bootstrap} from '../config/bootstrap';
import * as Constants from '../components/KoraText';
import {normalize} from '../utils/helpers';
import App_Name from '../assets/Work_Assist_logo.svg';
import {APP_NAME} from '../utils/AppConstants';
import GOOGLE_SIGN from '../assets/login/google_sign.svg';
import MICROSOFT_SIGN from '../assets/login/microsoft_signin.svg';
import {isAndroid} from '../utils/PlatformCheck';
import * as LOGIN_CONSTANTS from '../utils/login-constants';
import SSO_SIGN from '../assets/login/sso_signin.svg';
import {
  userLogin,
  SSOLogin,
  PasswordLogin,
} from '../../shared/redux/actions/login.action';
import {changeLang} from '../../shared/redux/actions/language.action';
import {configureKoraContainer} from '../utils/file-utilities';
import API_URL from '../../../env.constants';
import {KoraCheckBox} from '../screens/checkBox.js';
import {navigate} from '../navigation/NavigationService';
import {ROUTE_NAMES} from '../navigation/RouteNames';
import AccountManager from '../../shared/utils/AccountManager';

class WorkAssistLogin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      focus: false,
      selectedLang: 'en',
      checked: false,
      isAnimating: false,
    };
    this.inputRef = null;
    // const {i18n} = this.props;
    // i18n.changeLanguage(this.props.language.selectedLang);
  }

  checkContactPermissions = () => {
    if (isAndroid) {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      ]).then((result) => {
        if (result['android.permission.READ_CONTACTS'] === 'granted') {
          this._signIn();
        } else if (
          result['android.permission.READ_CONTACTS'] === 'never_ask_again'
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
          // Alert.alert(
          //   'alert',
          //   'Please Go into Settings -> Applications -> APP_NAME -> Permissions and Allow permissions to continue',
          // );
        }
      });
    } else {
      this._signIn();
    }
  };
  _signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      this.setState({userInfo: userInfo, loggedIn: true});

      this.props.SSOLogin({
        auth_code: userInfo.serverAuthCode,
        provider: LOGIN_CONSTANTS.SSO_GOOGLE,
      });
      this.setState({isAnimating: true});
    } catch (error) {
      this.setState({isAnimating: false});
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (f.e. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };

  signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      this.setState({user: null, loggedIn: false}); // Remember to remove the user from your app's state as well
    } catch (error) {
      console.log(error);
    }
  };

  componentWillUnmount() {
    this.keyboardDidHideListener.remove();
  }

  componentDidMount() {
    this.inputRef.setNativeProps({
      style: {
        fontFamily: 'Inter',
      },
    });
    GoogleSignin.configure({
      scopes: LOGIN_CONSTANTS.google_scopes,
      webClientId: LOGIN_CONSTANTS.Google_WebClientId,
      offlineAccess: true,
      forceConsentPrompt: true,
      accountName: '',
      iosClientId: LOGIN_CONSTANTS.Google_iOSClientId,
    });

    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this.keyboardDidHide,
    );
  }

  navigateToMain() {
    this.props.navigation.replace(ROUTE_NAMES.MAIN, {
      screen: 'Main',
      params: {
        screen: 'Main',
        params: {
          initSync: true,
        },
      },
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.laMod !== this.props.laMod) {
      let user = this.props.user;
      let authorization = this.props.authorization;
      if (user && authorization) {
        if (new Date() < new Date(authorization.expiresDate)) {
          AccountManager.prepareAccount(user, authorization);
          configureKoraContainer(user?.id);
          this.navigateToMain();
        }
      }
    }
  }

  isEmail = (email) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim())) {
      return true;
    }
    return false;
  };

  addLoginButton = () => {};

  setSelectedLang = (lang) => {
    this.props.changeLang(lang);
    this.setState({selectedLang: lang});
    const {i18n} = this.props;
    i18n.changeLanguage(lang);
  };

  keyboardDidHide = () => {
    // this.refs.inputRef.blur();
  };

  azureLogin = () => {
    let url =
      API_URL.appServer +
      'api/1.1/sso/login?connection=' +
      LOGIN_CONSTANTS.SSO_365 +
      '&redirect_url=' +
      LOGIN_CONSTANTS.REDIRECT_URL +
      '&scope=' +
      encodeURI(LOGIN_CONSTANTS.azure_scopes);

    navigate(ROUTE_NAMES.WorkAssistSSOLogin, {loadUrl: url});
  };

  ssoLogin = () => {
    // Alert.alert('','Under development...');
  };

  passwordLogin = () => {
    const email = this.state.email;
    if (email.trim().length === 0) {
      Alert.alert('Alert', 'Please enter a valid email address.');
    } else if (
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim())
    ) {
      const passwd = this.state.password;
      if (passwd.trim().length === 0) {
        Alert.alert('Alert', 'Please enter a valid password.');
      } else {
        const params = {
          password: passwd,
          client_id: '1',
          client_secret: '1',
          scope: 'friends',
          grant_type: 'password',
          username: email,
        };
        this.props.PasswordLogin(params);
      }
    } else {
      Alert.alert('Alert', 'You have entered an invalid email address!');
    }
  };
  render() {
    return (
      <React.Fragment>
        <ModalActivityindicator
          visible={this.state.isAnimating}
          size="large"
          color="white"
        />
        <ScrollView
          contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
          scrollEnabled={false}
          style={{flex: 1, backgroundColor: 'white'}}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'absolute' : null}
            style={[styles.container, {paddingHorizontal: normalize(30)}]}>
            <View
              style={[
                bootstrap.dFlex,
                bootstrap.flexColumn,
                {marginBottom: normalize(18)},
              ]}>
              <View style={styles.row_one}>
                {/* <Image
                source={require('../assets/Work_Assist_logo.svg')}
                style={{width: 25, height: 25}}
              />

              <Text style={styles.koraTextStyle}>WorkAssist</Text> */}
                <App_Name width={normalize(214)} height={normalize(24)} />
              </View>
              <View style={styles.row_one2}>
                <Text style={styles.desc_title}>
                  Your personal and team {'\n'} productivity is single click
                  away
                </Text>
              </View>
              <View style={styles.inputview}>
                <TextInput
                  placeholder="Username"
                  autoCapitalize={'none'}
                  value={this.state.email}
                  keyboardType="email-address"
                  placeholderTextColor="#BDC1C6"
                  underlineColorAndroid="transparent"
                  onChangeText={(text) => {
                    this.setState({email: text});
                  }}
                  style={styles.username_input}></TextInput>

                <TextInput
                  ref={(ref) => (this.inputRef = ref)}
                  placeholderTextColor="#BDC1C6"
                  placeholder="Password"
                  secureTextEntry={true}
                  autoCapitalize={'none'}
                  underlineColorAndroid="transparent"
                  onChangeText={(text) => {
                    this.setState({password: text});
                  }}
                  style={styles.password_input}></TextInput>
              </View>

              <View style={styles.action_view}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <KoraCheckBox
                    isChecked={this.state.checked}
                    onValueChange={(newValue) =>
                      this.setState({checked: newValue})
                    }></KoraCheckBox>

                  <Text style={styles.action_button_text}>Remember me</Text>
                </View>

                <TouchableOpacity style={styles.action_button2}>
                  <Text style={styles.action_button_text}>
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableHighlight
                underlayColor={'#817dff'}
                style={[styles.button, {backgroundColor: '#0D6EFD'}]}
                onPress={this.passwordLogin}>
                <Text style={styles.loginTextStyle}>Login</Text>
              </TouchableHighlight>

              <View>
                <TouchableOpacity
                  style={styles.action_button3}
                  onPress={this.checkContactPermissions}>
                  <Svg height="50" width="100%" viewBox="0 0 316 41">
                    <GOOGLE_SIGN />
                  </Svg>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.action_button3}
                  onPress={this.azureLogin}>
                  <Svg height="50" width="100%" viewBox="0 0 316 41">
                    <MICROSOFT_SIGN />
                  </Svg>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.action_button3}
                  onPress={this.ssoLogin}>
                  <Svg height="50" width="100%" viewBox="0 0 316 41">
                    <SSO_SIGN />
                  </Svg>
                </TouchableOpacity>
              </View>

              <View style={styles.basicMargin}>
                <Text style={styles.account_text}>
                  Don’t have an account?{' '}
                  <Text style={styles.signup_text}>Sign up</Text>
                </Text>
              </View>
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  checkbox: {
    alignSelf: 'center',
    marginRight: 2,
  },
  row_one: {
    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',
  },
  row_one2: {
    flexDirection: 'row',

    alignItems: 'center',

    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(12),
  },
  inputview: {
    marginTop: normalize(36),
    marginBottom: normalize(15),
  },
  action_button: {
    flexShrink: 1,
  },
  action_button2: {
    marginLeft: 10,
    padding: 5,
    flexShrink: 1,
  },

  action_button3: {
    marginVertical: normalize(5),
  },
  action_button_text: {
    color: '#5F6368',
    fontWeight: '400',

    fontSize: normalize(14),
    marginStart: 10,
    fontStyle: 'normal',

    textAlign: 'center',
    fontFamily: Constants.fontFamily,
  },

  action_view: {
    flexDirection: 'row',

    alignItems: 'center',
    flex: 1,

    justifyContent: 'space-between',
  },
  desc_title: {
    color: '#5F6368',
    fontWeight: '400',

    fontSize: normalize(14),
    fontStyle: 'normal',
    letterSpacing: normalize(0.2),
    textAlign: 'center',
    fontFamily: Constants.fontFamily,
  },

  button: {
    height: 50,
    borderRadius: 4,
    marginTop: 15,
    backgroundColor: '#ffffff',
    marginBottom: normalize(30),
    fontSize: normalize(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    height: '100%',
    justifyContent: 'center',
  },
  username_input: {
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    minHeight: 44,

    width: '100%',
    borderColor: '#BDC1C6',
    backgroundColor: 'white',
    borderWidth: 1,
    padding: 0,
    borderRadius: normalize(4),
    paddingHorizontal: normalize(10),
    fontFamily: Constants.fontFamily,
  },
  password_input: {
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    minHeight: 44,
    marginTop: normalize(20),
    paddingHorizontal: normalize(10),
    width: '100%',
    borderColor: '#BDC1C6',
    backgroundColor: 'white',
    borderRadius: normalize(4),
    borderWidth: 1,
    padding: 0,
    fontFamily: Constants.fontFamily,
  },
  basicMargin: {
    flexDirection: 'row',
    marginTop: 20,

    alignItems: 'center',
    justifyContent: 'center',
  },
  account_text: {
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    color: '#BDC1C6',
    fontFamily: Constants.fontFamily,
  },
  signup_text: {
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    color: '#0D6EFD',

    textDecorationLine: 'underline',
    fontFamily: Constants.fontFamily,
  },
  koraTextStyle: {
    color: '#292929',
    fontWeight: '400',
    fontSize: normalize(30),
    fontStyle: 'normal',
    marginStart: 5,
    fontFamily: Constants.fontFamily,
  },

  loginTextStyle: {
    color: '#ffffff',
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  otherTextStyle: {
    color: '#202124',
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',

    fontFamily: Constants.fontFamily,
  },
  image_style: {
    width: 20,
    height: 20,
    marginRight: 15,
  },
});

const mapStateToProps = (state) => {
  let {login, auth, language} = state;
  return {
    user: auth.user,
    authorization: auth.authorization,
    laMod: auth.laMod,
    language,
  };
};

export default connect(mapStateToProps, {
  userLogin,
  changeLang,
  SSOLogin,
  PasswordLogin,
})(withTranslation()(WorkAssistLogin));
