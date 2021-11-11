import React from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Keyboard,
} from 'react-native';

import {connect} from 'react-redux';
import {CommonActions} from '@react-navigation/native';
import HeaderPreLogin from './HeaderPreLogin';
import {useTranslation, withTranslation} from 'react-i18next';

import {normalize} from '../../utils/helpers';
import {NavigationActions} from 'react-navigation';
import * as Constants from '../../components/KoraText';
import BlueButton from './BlueButton';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
import globalStyle from './styles';
import {signup} from '../../../shared/redux/actions/pre-login.action';
import KoraKeyboardAvoidingView from '../../components/KoraKeyboardAvoidingView';
import {
  getCurrentScreenName,
  navigateAndReset,
} from '../../navigation/NavigationService';
class SignUpWithPassword extends React.Component {
  email = null;
  fullname = null;
  password = null;
  cnfPwd = null;

  constructor(props) {
    super(props);

    this.inputRef = null;
  }

  componentDidMount() {
    let {route} = this.props;
    // this.props.route.params.boardType,
    this.email = route?.params?.emailId || null;
    console.log('SignUpWithPassword emailId : ', this.email);

    setTimeout(() => {
      if (this.inputRef) {
        this.inputRef.focus();
      }
    }, 100);
  }

  loginAction = () => {
    this.buttonOnPress(ROUTE_NAMES.LOGIN_HOME);
  };
  signupEmail = () => {
    let statusObj = this.isValidDetails(
      this.fullname,
      this.email,
      this.password,
      this.cnfPwd,
    );
    if (!statusObj.isValid) {
      console.log(statusObj.msz);
      alert(statusObj.msz);
      return;
    }

    console.log(this.fullname, this.email, this.password, this.cnfPwd);
    let names = this.fullname.split(' ');
    let payload = {
      firstName: names[0],
      lastName: names[1],
      password: this.password,
      emailId: this.email,
    };
    this.props.signup(payload, (obj) => {
      console.log('obj  =========>:', JSON.stringify(obj));
      if (obj?.data && obj?.data?.errors) {
        let msg = obj?.data?.errors[0].msg || null;
        if (msg) {
          alert(msg);
        }
        return;
      }
      //{"status":true,"data":["SUCCESS"]}
      this.props.navigation.navigate(ROUTE_NAMES.SIGN_UP_EMAIL_VERIFICATION, {
        emailId: this.email,
      });
      // if (obj?.status && obj?.data && obj?.data[0] === 'SUCCESS') {
      //   Alert.alert(
      //     'Alert',
      //     'A verification link was sent to' +
      //     this.email +
      //     ',Please click  it to verify your email.',
      //     [
      //       {
      //         text: 'OK',
      //         onPress: () => {

      //             this.props.navigation.goBack();
      //             this.props.navigation.goBack();
      //             this.props.navigation.goBack();

      //           this.props.navigation.navigate(ROUTE_NAMES.LOGIN_WITH_EMAIL);
      //         },
      //       },
      //     ],
      //     { cancelable: false },
      //   );
      //   // this.props.navigation.navigate(ROUTE_NAMES.SIGN_UP_EMAIL_VERIFICATION, {
      //   //   emailId: this.email,
      //   // });
      // }
    });
  };
  buttonOnPress = (id) => {
    switch (id) {
      case ROUTE_NAMES.SIGN_UP_EMAIL_VERIFICATION:
        // console.log(' this.email :', this.email);
        this.signupEmail();

        break;
      case ROUTE_NAMES.LOGIN_HOME:
        this.props.navigation.navigate(ROUTE_NAMES.LOGIN_HOME);
        break;
    }
  };
  isEmail = (email) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim())) {
      return true;
    }
    return false;
  };
  isValidDetails = (name, email, pwd, cnfPwd) => {
    const {t} = this.props;
    let staObj = {
      msz: '',
      isValid: false,
    };
    if (!name) {
      staObj.msz = t('valid_name_msz');
      return staObj;
    }

    if (name.trim().length === 0) {
      staObj.msz = t('empty_name_msz');
      return staObj;
    }
    let names = name.split(' ');
    if (names.length <= 1) {
      staObj.msz = t('fullname_valid_msz');
      return staObj;
    }
    if (!email || !this.isEmail(email)) {
      staObj.msz = t('valid_email_msz');
      return staObj;
    }
    if (!pwd) {
      staObj.msz = t('valid_pwd_msz');
      return staObj;
    }
    if (!cnfPwd) {
      staObj.msz = t('valid_cnfpwd_msz');
      return staObj;
    }
    if (email === '' || email.trim().length === 0) {
      staObj.msz = t('empty_email_msz');
      return staObj;
    }
    if (pwd === '' || pwd.trim().length === 0) {
      staObj.msz = t('empty_pwd_msz');
      return staObj;
    }
    if (cnfPwd === '' || cnfPwd.trim().length === 0) {
      staObj.msz = t('empty_cnfpwd_msz');
      return staObj;
    }

    if (pwd !== cnfPwd) {
      staObj.msz = t('pwd_cnfpwd_msz');
      return staObj;
    }

    staObj.isValid = true;
    return staObj;
  };
  render() {
    const {t} = this.props;
    return (
      <SafeAreaView style={styles.root}>
        <KoraKeyboardAvoidingView style={styles.root}>
          <View style={styles.root}>
            <HeaderPreLogin
              appName={false}
              currentScreenName={t('youKnowDrill')}></HeaderPreLogin>

            <View style={globalStyle.globalInnerRootStyle}>
              <View style={styles.v1}>
                <View style={styles.inputview}>
                  <TextInput
                    ref={(ref) => {
                      this.inputRef = ref;
                    }}
                    placeholder={t('fullNamePlaceHolder')}
                    autoCapitalize={'none'}
                    placeholderTextColor="#BDC1C6"
                    underlineColorAndroid="transparent"
                    onChangeText={(text) => {
                      this.fullname = text;
                    }}
                    style={styles.username_input}></TextInput>
                </View>

                <View style={styles.inputview}>
                  <TextInput
                    placeholder={t('passwordPlaceHolder')}
                    secureTextEntry={true}
                    //textContentType={'password'}
                    onSubmitEditing={() => {
                      Keyboard.dismiss();
                    }}
                    blurOnSubmit={false}
                    autoCapitalize={'none'}
                    placeholderTextColor="#BDC1C6"
                    underlineColorAndroid="transparent"
                    onChangeText={(text) => {
                      this.password = text;
                    }}
                    style={styles.username_input}></TextInput>
                </View>

                <View style={styles.inputview}>
                  <TextInput
                    placeholder={t('confirmPassword')}
                    secureTextEntry={true}
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      Keyboard.dismiss();
                    }}
                    //textContentType={'password'}
                    autoCapitalize={'none'}
                    placeholderTextColor="#BDC1C6"
                    underlineColorAndroid="transparent"
                    onChangeText={(text) => {
                      this.cnfPwd = text;
                    }}
                    style={styles.username_input}></TextInput>
                </View>
                <View style={styles.bottomView}>
                  <View style={styles.v2}>
                    <Text style={styles.login_text}>
                      {t('alreadyHaveAnAccount')}
                    </Text>
                    <Text style={styles.loginLink} onPress={this.loginAction}>
                      {t('loginButton')}
                    </Text>
                  </View>

                  <BlueButton
                    id={ROUTE_NAMES.SIGN_UP_EMAIL_VERIFICATION}
                    name={t('signUp')}
                    buttonOnPress={this.buttonOnPress}
                  />
                </View>
              </View>
            </View>
          </View>
        </KoraKeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  v2: {flexDirection: 'row'},
  v1: {flex: 1},
  bottomView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
  },
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
  login_text: {
    color: '#9AA0A6',
    fontWeight: '400',
    fontSize: normalize(14),

    fontStyle: 'normal',
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
  },
  root: {flex: 1,backgroundColor:'#FFFFFF'},
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

export default connect(null, {
  signup,
})(withTranslation()(SignUpWithPassword));
