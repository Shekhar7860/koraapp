import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  Linking,
  Image,
  SafeAreaView,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import {useTranslation, withTranslation} from 'react-i18next';
import {connect} from 'react-redux';
import {signinValidate} from './SigninValidate';
import API_URL from '../../../../env.constants';
import {normalize} from '../../utils/helpers';
import Svg from 'react-native-svg';
import * as Constants from '../../components/KoraText';
import StandardButton from './StandardButton';
import {userLogin, SSOLogin} from '../../../shared/redux/actions/login.action';
import * as LOGIN_CONSTANTS from '../../utils/login-constants';
import HeaderPreLogin from './HeaderPreLogin';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
import globalStyle from './styles';
import {GoogleSignin, statusCodes} from '@react-native-community/google-signin';
import {isAndroid} from '../../utils/PlatformCheck';
import ModalActivityindicator from 'react-native-modal-activityindicator';

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
  loginHyperLink = () => {
    this.buttonOnPress(ROUTE_NAMES.LOGIN_HOME);
  };
  buttonOnPress = (key) => {
    switch (key) {
      case ROUTE_NAMES.SIGN_UP_WITH_EMAIL:
        this.props.navigation.navigate(ROUTE_NAMES.SIGN_UP_WITH_EMAIL);
        break;

      case ROUTE_NAMES.LOGIN_HOME:
        this.props.navigation.navigate(ROUTE_NAMES.LOGIN_HOME);
        break;
      case ROUTE_NAMES.SIGN_UP_SSO:
        this.props.navigation.navigate(ROUTE_NAMES.SIGN_UP_SSO);
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
    }
  };
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
      let userInfo = this.props.user;
      let authorization = this.props.authorization;
      let loginResponse = this.props.loginResponse;
      this.setState({isAnimating: false});
      signinValidate(this.props, {userInfo, authorization, loginResponse});
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
  pressTermsServices = () => {
    alert('Under Development');

    //    this.props.navigation.navigate(ROUTE_NAMES.POST_SIGN_UP_HOME, {
    //     screen: ROUTE_NAMES.POST_SIGN_UP_HOME,
    //   });
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
  render() {
    const {t} = this.props;
    return (
      <>
        <SafeAreaView style={styles.root}>
          <HeaderPreLogin appName={true}></HeaderPreLogin>

          <View style={globalStyle.globalInnerRootStyle}>
            <View>
              <Text style={styles.header_text}>{t('app_header')}</Text>
            </View>
            <View style={styles.buttons_view}>
              <StandardButton
                buttonOnPress={this.checkContactPermissions}
                style={styles.buttonStyle}
                imagePath={require('../../assets/login/google.png')}
                buttonName={t('signUpWithGoogle')}
              />
              <StandardButton
                id={ROUTE_NAMES.WorkAssistSSOLogin}
                buttonOnPress={this.buttonOnPress}
                style={styles.buttonStyle}
                imagePath={require('../../assets/login/microsoft_icon.jpg')}
                buttonName={t('signUpWithMicrosft')}
              />

              <StandardButton
                style={styles.buttonStyle}
                imagePath={require('../../assets/login/sso_icon.png')}
                buttonName={t('signUpWithSSO')}
              />
            </View>

            <View style={styles.r3}>
              <View style={styles.line_view}></View>
              <Text style={styles.orview}>{t('or')}</Text>
              <View style={styles.line_view}></View>
            </View>

            <View style={styles.r2}>
              <StandardButton
                id={ROUTE_NAMES.SIGN_UP_WITH_EMAIL}
                buttonOnPress={this.buttonOnPress}
                imagePath={require('../../assets/login/email_icon.png')}
                buttonName={t('signUpWithEmail')}
              />
            </View>

            <View style={styles.r1}>
              <Text style={styles.login_text}>
                Do you already have account?{' '}
              </Text>
              <Text style={styles.loginLink} onPress={this.loginHyperLink}>
                Login
              </Text>
            </View>

            <View style={styles.termsView}>
              <Text style={styles.login_text}>{t('agreement_text')}</Text>
              <View style={{flexDirection: 'row'}}>
                <Text
                  onPress={() => alert('Under Development')}
                  style={styles.text_hyper}>
                  {t('privacy_policy')}
                </Text>
                <Text style={styles.login_text}> and </Text>
                <Text
                  onPress={this.pressTermsServices}
                  style={styles.text_hyper}>
                  {t('terms_service')}
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
        <ModalActivityindicator
          visible={this.state.isAnimating}
          size="large"
          color="white"
        />
      </>
    );
  }
}
const styles = StyleSheet.create({
  r3: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 30,
    marginVertical: 40,
  },
  r2: {marginVertical: 0},
  r1: {flexDirection: 'row', marginVertical: 20},
  termsView: {flex: 1, justifyContent: 'flex-end'},
  root: {flex: 1, backgroundColor: '#FFFFFF'},
  buttonStyle: {marginVertical: 6},
  loginLink: {
    marginStart: 2,

    color: '#0D6EFD',
    fontWeight: '400',
    fontSize: normalize(14),

    fontStyle: 'normal',
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
  },
  text_hyper: {
    color: '#9AA0A6',
    fontWeight: '600',
    fontSize: normalize(14),
    fontStyle: 'normal',
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
  },
  login_text: {
    color: '#9AA0A6',
    fontWeight: '400',
    fontSize: normalize(14),

    fontStyle: 'normal',
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
  },
  header_text: {
    fontSize: normalize(18),
    color: '#202124',
    fontWeight: '600',
    fontStyle: 'normal',
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
  },
  buttons_view: {marginTop: 40},
  orview: {
    fontSize: normalize(14),
    color: '#BDC1C6',
    fontWeight: '400',
    paddingHorizontal: 3,
    textAlignVertical: 'center',
    minHeight: 30,

    justifyContent: 'center',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  line_view: {width: 20, backgroundColor: '#BDC1C6', height: 1},
  action_button3: {
    marginVertical: normalize(8),
  },
});

const mapStateToProps = (state) => {
  let {auth} = state;
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
