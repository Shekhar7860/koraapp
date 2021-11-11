import React from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { connect } from 'react-redux';
import HeaderPreLogin from './HeaderPreLogin';
import { useTranslation, withTranslation } from 'react-i18next';

import { normalize } from '../../utils/helpers';

import * as Constants from '../../components/KoraText';
import BlueButton from './BlueButton';
import { ROUTE_NAMES } from '../../navigation/RouteNames';
import globalStyle from './styles';
import { PasswordLogin } from '../../../shared/redux/actions/pre-login.action';
import { signinValidate } from './SigninValidate';
import KoraKeyboardAvoidingView from '../../components/KoraKeyboardAvoidingView';
import ModalActivityindicator from 'react-native-modal-activityindicator';

class SignUpWithPassword extends React.Component {
  email = null;
  password = null;
  constructor(props) {
    super(props);
    this.state = {

      isAnimating: false,
    };
    this.inputRef = null;
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.inputRef) {
        this.inputRef.focus();
      }
    }, 100);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.pwdLogin !== this.props.pwdLogin) {
      //{"errors":[{"msg":"INVALID_CREDENTIALS","code":40}]}
      if (this.props.pwdLogin?.errors) {
        this.setState({ isAnimating: false });
        let msg = this.props.pwdLogin?.errors[0].msg || null;
        if (msg) {
          alert(msg);
        }
      }
    }

    if (prevProps.laMod !== this.props.laMod) {
      this.setState({ isAnimating: false });
      let userInfo = this.props.user;
      let authorization = this.props.authorization;
      let loginResponse = this.props.loginResponse;
      signinValidate(this.props, { userInfo, authorization, loginResponse });
    }
  }

  signUp = () => {
    this.buttonOnPress(ROUTE_NAMES.APP_LANDING_SCREEN);
  };
  forgotPassword = () => {
    this.buttonOnPress(ROUTE_NAMES.FORGOT_PASSWORD);
  };
  buttonOnPress = (id) => {
    switch (id) {
      case ROUTE_NAMES.APP_LANDING_SCREEN:
        this.props.navigation.navigate(ROUTE_NAMES.APP_LANDING_SCREEN);
        break;

      case ROUTE_NAMES.FORGOT_PASSWORD:
        this.props.navigation.navigate(ROUTE_NAMES.FORGOT_PASSWORD);
        break;

      case ROUTE_NAMES.SELECT_ACCOUNT_SCREEN:
        this.props.navigation.navigate(ROUTE_NAMES.SELECT_ACCOUNT_SCREEN);
        break;
      default:
        break;
    }
  };
  isEmail = (email) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim())) {
      return true;
    }
    return false;
  };
  loginButtonOnPress = () => {
    //admin@biru.com/Kore@123
    //birbal.kumar@biru.com/Kore@123

    //nandhu@sathishchalla.testinator.com   123456

    let statusObj = this.isValidDetails(this.email, this.password);
    if (!statusObj.isValid) {
      console.log(statusObj.msz);
      alert(statusObj.msz);
      return;
    }

    let payload = {
      password: this.password,
      client_id: '1',
      client_secret: '1',
      scope: 'friends',
      grant_type: 'password',
      username: this.email,
      // accountId: '<accountId>', // optional
    };
    this.setState({ isAnimating: true });
    this.props.PasswordLogin(payload);
  };
  isValidDetails = (email, pwd) => {
    const { t } = this.props;
    let staObj = {
      msz: '',
      isValid: false,
    };
    if (!email || !this.isEmail(email)) {
      staObj.msz = t('valid_email_msz');
      return staObj;
    }
    if (!pwd) {
      staObj.msz = t('valid_pwd_msz');
      return staObj;
    }
    if (email === '' || email.trim().length === 0) {
      staObj.msz = t('empty_email_msz');
      return staObj;
    }
    if (pwd === '') {
      staObj.msz = t('empty_pwd_msz');
      return staObj;
    }
    staObj.isValid = true;
    return staObj;
  };

  render() {
    const { t } = this.props;
    return (
      <SafeAreaView style={styles.root}>

        <KoraKeyboardAvoidingView style={styles.root}>

          <View style={styles.root}>
            <HeaderPreLogin
              appName={false}
              currentScreenName={t('loginEmailTitle')} />

            <View style={globalStyle.globalInnerRootStyle}>
              <View style={styles.v1}>
                <View style={styles.inputview}>
                  <TextInput
                    ref={(ref) => {
                      this.inputRef = ref;
                    }}
                    placeholder={t('emailPlaceHolder')}
                    autoCapitalize={'none'}
                    //value={'nandhu@sathishchalla.testinator.com'}
                    keyboardType="email-address"
                    placeholderTextColor="#BDC1C6"
                    underlineColorAndroid="transparent"
                    onChangeText={(text) => {
                      this.email = text;
                    }}
                    style={styles.username_input}></TextInput>
                </View>

                <View style={styles.inputview}>
                  <TextInput
                    placeholder={t('passwordPlaceHolder')}
                    secureTextEntry={true}
                    autoCapitalize={'none'}
                    //value={'123456'}
                    placeholderTextColor="#BDC1C6"
                    underlineColorAndroid="transparent"
                    onChangeText={(text) => {
                      this.password = text;
                    }}
                    style={styles.username_input}></TextInput>
                </View>

                <Text style={styles.forgot_text} onPress={this.forgotPassword}>
                  {t('forgotPasswordTitle')}
                </Text>

                <View style={styles.bottomView}>
                  <View style={styles.v2}>
                    <Text style={styles.login_text}>
                      {t('dontHaveAccount')}
                    </Text>
                    <Text style={styles.signUpLink} onPress={this.signUp}>
                      {t('signUp')}
                    </Text>
                  </View>

                  <BlueButton
                    id={ROUTE_NAMES.SELECT_ACCOUNT_SCREEN}
                    buttonOnPress={this.loginButtonOnPress}
                    name={t('loginButton')}
                  />
                </View>
              </View>
            </View>

          </View>



        </KoraKeyboardAvoidingView>
        <ModalActivityindicator
          visible={this.state.isAnimating}
          size="large"
          color="white"
        />
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  v1: { flex: 1 },
  v2: { flexDirection: 'row' },
  bottomView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
  },
  signUpLink: {
    marginStart: 2,
    fontSize: normalize(18),
    color: '#0D6EFD',
    fontWeight: '400',
    fontSize: normalize(14),

    fontStyle: 'normal',
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
  },
  forgot_text: {
    minHeight: 35,
    padding: 10,
    alignSelf: 'center',
    color: '#9AA0A6',
    fontWeight: '400',
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
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  inputview: {
    marginBottom: normalize(10),
  },
  username_input: {
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
});
//export default withTranslation()(SignUpWithPassword);

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
  PasswordLogin,
})(withTranslation()(SignUpWithPassword));
