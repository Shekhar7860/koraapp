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
  SafeAreaView,
} from 'react-native';
import { useTranslation, withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import API_URL from '../../../../env.constants';
import { normalize } from '../../utils/helpers';
import Svg from 'react-native-svg';
import * as Constants from '../../components/KoraText';
import StandardButton from './StandardButton';
import {
  userLogin,
  SSOLogin,
  PasswordLogin,
} from '../../../shared/redux/actions/pre-login.action';
import ModalActivityindicator from 'react-native-modal-activityindicator';

import HeaderPreLogin from './HeaderPreLogin';
import { ROUTE_NAMES } from '../../navigation/RouteNames';
import { GoogleSignin, statusCodes } from '@react-native-community/google-signin';
import { isAndroid } from '../../utils/PlatformCheck';
import * as LOGIN_CONSTANTS from '../../utils/login-constants';
import AccountManager from '../../../shared/utils/AccountManager';
import { configureKoraContainer } from '../../utils/file-utilities';
import { signinValidate } from './SigninValidate';
import globalStyle from './styles';
import { dataTrack } from '../../../helpers/mixpanel-helper';

class AppLandingScreen extends React.Component {



  constructor(props) {
    super(props);
    this.state = {
     
      isAnimating: false,
    };

  }
  componentDidMount() {
    GoogleSignin.configure({
      scopes: LOGIN_CONSTANTS.google_scopes,
      webClientId: LOGIN_CONSTANTS.Google_WebClientId,
      offlineAccess: true,
      forceConsentPrompt: true,
      accountName: '',
      iosClientId: LOGIN_CONSTANTS.Google_iOSClientId,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.laMod !== this.props.laMod) {
      let userInfo = this.props.user;
      let authorization = this.props.authorization;
      let loginResponse = this.props.loginResponse;
      dataTrack(true, loginResponse.userInfo, 'Successful Login');

      signinValidate(this.props, { userInfo, authorization, loginResponse });
      // if (user && authorization) {
      //   if (new Date() < new Date(authorization.expiresDate)) {
      //     console.log('AppLandingScreen Login succsss  :', user);
      //     signinValidate(this.props, {user, authorization});
      //     // AccountManager.prepareAccount(user, authorization);
      //     // configureKoraContainer(user?.id);
      //     // this.navigateToMain();
      //   }
      // }
    }
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
  signUp = () => {
    this.buttonOnPress(ROUTE_NAMES.APP_LANDING_SCREEN);
  };
  buttonOnPress = (id) => {
    switch (id) {
      case ROUTE_NAMES.APP_LANDING_SCREEN:
        this.props.navigation.navigate(ROUTE_NAMES.APP_LANDING_SCREEN);
        break;
      case ROUTE_NAMES.SIGN_UP_SSO:
        // this.props.navigation.navigate(ROUTE_NAMES.SIGN_UP_SSO);
        break;

      case ROUTE_NAMES.LOGIN_WITH_EMAIL:
        this.props.navigation.navigate(ROUTE_NAMES.LOGIN_WITH_EMAIL);
        break;

      case ROUTE_NAMES.WorkAssistSSOLogin:
        let url =
          API_URL.appServer +
          'api/1.1/sso/login?connection=' +
          LOGIN_CONSTANTS.SSO_365 +
          '&redirect_url=' +
          LOGIN_CONSTANTS.REDIRECT_URL +
          '&scope=' +
          encodeURI(LOGIN_CONSTANTS.azure_scopes);

        //navigate(ROUTE_NAMES.WorkAssistSSOLogin, {loadUrl: url});

        this.props.navigation.navigate(ROUTE_NAMES.WorkAssistSSOLogin, {
          loadUrl: url,
        });
        break;
      default:
        break;
    }
  };

  checkContactPermissions = () => {
    console.log('case _1');
    if (isAndroid) {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      ]).then((result) => {
        if (result['android.permission.READ_CONTACTS'] === 'granted') {
          console.log('case _2');
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
              { text: 'OK', onPress: () => Linking.openSettings() },
            ],
            { cancelable: false },
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
      console.log('userInfo   --->:', userInfo);
      //this.setState({userInfo: userInfo, loggedIn: true});

      this.props.SSOLogin({
        /*  id_token: userInfo.idToken,
         //auth_code: userInfo.serverAuthCode,
        // accountId: userInfo.user.id,
         emailId:userInfo?.user.email */
        auth_code: userInfo.serverAuthCode,
        provider: LOGIN_CONSTANTS.SSO_GOOGLE,
        //provider: LOGIN_CONSTANTS.SSO_GOOGLE,
      });
       this.setState({isAnimating: true});
    } catch (error) {
      console.log('GoogleSignin   --->:', error);
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

  render() {
    const { t } = this.props;
    return (
      <SafeAreaView style={styles.root}>
         
        <HeaderPreLogin appName={true}></HeaderPreLogin>
        <View style={globalStyle.globalInnerRootStyle}>
          <View>
            <Text style={styles.header_welcome}>{t('welcometext')}</Text>
            <Text style={styles.header_text}>{t('welcomeDesc')}</Text>
          </View>
          <View style={styles.buttons_view}>
          <StandardButton
              style={styles.buttonStyle}
              buttonOnPress={this.checkContactPermissions}
              imagePath={require('../../assets/login/google.png')}
              buttonName={t('signInWithGoogle')}
            />
            <StandardButton
              style={styles.buttonStyle}
              id={ROUTE_NAMES.WorkAssistSSOLogin}
              buttonOnPress={this.buttonOnPress}
              imagePath={require('../../assets/login/microsoft_icon.jpg')}
              buttonName={t('signInWithMicrosft')}
            />

            

            <StandardButton
              id={ROUTE_NAMES.SIGN_UP_SSO}
              buttonOnPress={this.buttonOnPress}
              style={styles.buttonStyle}
              imagePath={require('../../assets/login/sso_icon.png')}
              buttonName={t('signInWithSSO')}
            />
          </View>

          <View style={styles.orView}>
            <View style={styles.line_view}></View>
            <Text style={styles.orview}>{t('or')}</Text>
            <View style={styles.line_view}></View>
          </View>

          <View style={styles.v1}>
            <StandardButton
              id={ROUTE_NAMES.LOGIN_WITH_EMAIL}
              buttonOnPress={this.buttonOnPress}
              imagePath={require('../../assets/login/email_icon.png')}
              buttonName={t('signInWithEmail')}
            />
          </View>

          <View style={styles.v2}>
            <Text style={styles.login_text}>{t('dontHaveAccount')}</Text>
            <Text style={styles.loginLink} onPress={this.signUp}>
              {t('signUp')}
            </Text>
          </View>

          <View style={styles.termsView}>
            <View style={styles.v3}>
              <Text
                onPress={() => alert('Under Development')}
                style={styles.text_hyper}>
                {t('privacy_policy')}
              </Text>

              <Text
                onPress={() => alert('Under Development')}
                style={styles.text_hyper}>
                {t('terms_service')}
              </Text>
            </View>
          </View>
        </View>
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
  v3: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  v2: { flexDirection: 'row' },
  v1: { marginBottom: 20 },
  orView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsView: { flex: 1, justifyContent: 'flex-end' },
  root: { flex: 1 ,backgroundColor:'#FFFFFF'},
  buttonStyle: { marginVertical: 6 },
  loginLink: {
    marginStart: 2,
    fontSize: normalize(18),
    color: '#0D6EFD',
    fontWeight: '400',
    fontSize: normalize(14),
   
    fontStyle: 'normal',
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
  },
  text_hyper: {
    fontSize: normalize(18),
    color: '#9AA0A6',
    fontWeight: '400',
    fontSize: normalize(14),

    marginHorizontal: 10,
  
    fontStyle: 'normal',
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
  },
  login_text: {
    fontSize: normalize(18),
    color: '#9AA0A6',
    fontWeight: '400',
    fontSize: normalize(14),

    fontStyle: 'normal',
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
  },
  header_welcome: {
    fontSize: normalize(18),
    color: '#202124',
    fontWeight: '600',

    fontStyle: 'normal',
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
  },
  header_text: {
    fontSize: normalize(18),
    color: '#5F6368',
    fontWeight: '400',
    minHeight: 60,
    fontStyle: 'normal',
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
  },
  buttons_view: { marginTop: 20 },
  orview: {
    fontSize: normalize(14),
    color: '#BDC1C6',
    fontWeight: '400',
    paddingHorizontal: 10,
    textAlignVertical: 'center',
    minHeight: 30,
    marginVertical:40,
    justifyContent: 'center',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  line_view: { width: 20, backgroundColor: '#BDC1C6', height: 1 },
  action_button3: {
    marginVertical: normalize(8),
  },
});

const mapStateToProps = (state) => {
  let { auth } = state;
  return {
    loginResponse: auth.loginResponse,
    user: auth.user,
    authorization: auth.authorization,
    laMod: auth.laMod,
  };
};

export default connect(mapStateToProps, {
  userLogin,
  SSOLogin,
})(withTranslation()(AppLandingScreen));
