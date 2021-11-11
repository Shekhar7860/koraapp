import React from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';

import HeaderPreLogin from './HeaderPreLogin';
import {connect} from 'react-redux';

import {useTranslation, withTranslation} from 'react-i18next';
import {normalize} from '../../utils/helpers';

import * as Constants from '../../components/KoraText';
import BlueButton from './BlueButton';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
import globalStyle from './styles';
import KoraKeyboardAvoidingView   from '../../components/KoraKeyboardAvoidingView'

import {forgotPassword} from '../../../shared/redux/actions/pre-login.action';

class ForgotPassword extends React.Component {
  email = null;
  constructor(props) {
    super(props);
  }
  componentDidMount(){
    setTimeout(()=>{
      if(this.inputRef){
        this.inputRef.focus();
      }
    },100);
  }
  login = () => {
    this.buttonOnPress(ROUTE_NAMES.LOGIN_HOME);
  };
  buttonOnPress = (id) => {
    switch (id) {
      case ROUTE_NAMES.LOGIN_HOME:
        this.props.navigation.navigate(ROUTE_NAMES.LOGIN_HOME);
        break;

      case ROUTE_NAMES.FORGOT_PASSWORD_SENT_SCREEN:
        //navigating to forgot password sent screen
        this.props.navigation.navigate(ROUTE_NAMES.FORGOT_PASSWORD_SENT_SCREEN);
        break;

      default:
        break;
    }
  };

  isValidDetails = (email) => {
    const {t} = this.props;
    let staObj = {
      msz: '',
      isValid: false,
    };
    if (!email || !this.isEmail(email)) {
      staObj.msz = t('valid_email_msz');
      return staObj;
    }

    if (email === '' || email.trim().length === 0) {
      staObj.msz = t('empty_email_msz');
      return staObj;
    }

    staObj.isValid = true;
    return staObj;
  };
  isEmail = (email) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim())) {
      return true;
    }
    return false;
  };

  sendButtonOnPress = () => {
    //admin@biru.com/Kore@123
    //birbal.kumar@biru.com/Kore@123

    let statusObj = this.isValidDetails(this.email);
    if (!statusObj.isValid) {
      console.log(statusObj.msz);
      alert(statusObj.msz);
      return;
    }

    let payload = {
      emailId: this.email,
    };
    // this.props.ResetPassword(payload, );

    this.props.forgotPassword(payload, (obj) => {
      console.log('obj  =========>:', JSON.stringify(obj));
      if (obj?.data && obj?.data?.errors) {
        let msg = obj?.data?.errors[0].msg || null;
        if (msg) {
          alert(msg);
        }
        return;
      }
      // {"status":true,"data":["SUCCESS"]}

      if (obj?.status && obj?.data && obj?.data[0] === 'SUCCESS') {
        this.props.navigation.navigate(ROUTE_NAMES.FORGOT_PASSWORD_SENT_SCREEN);
      }
    });
  };

  render() {
    const {t} = this.props;
    return (
      <SafeAreaView style={styles.root}>
      <KoraKeyboardAvoidingView style={styles.root}>
         <View style={styles.root}> 
        <HeaderPreLogin
          appName={false}
          currentScreenName={t('forgotPasswordTitle')}></HeaderPreLogin>

        <View style={globalStyle.globalInnerRootStyle}>
          <View style={styles.v1}>
            <View style={styles.bottomView}>
              <Text style={styles.signUpLink} onPress={this.login}>
                {t('backToLogin')}
              </Text>

              <View style={styles.inputview}>
                <TextInput
                 ref={(ref)=>{this.inputRef= ref}}
                  placeholder={t('emailPlaceHolder')}
                  autoCapitalize={'none'}
                  keyboardType="email-address"
                  placeholderTextColor="#BDC1C6"
                  underlineColorAndroid="transparent"
                  onChangeText={(text) => {
                    this.email = text;
                  }}
                  style={styles.username_input}></TextInput>
              </View>
              <BlueButton
                id={ROUTE_NAMES.FORGOT_PASSWORD_SENT_SCREEN}
                buttonOnPress={this.sendButtonOnPress}
                name={t('sendResetLink')}
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
  v1: {flex: 1},
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

  root: {flex: 1,backgroundColor:'#FFFFFF'},
  inputview: {
    width: '100%',
    marginTop: 20,
  },
  username_input: {
    fontSize: normalize(16),
    fontStyle: 'normal',
    minHeight: 44,
    backgroundColor: '#EFF0F1',
    width: '100%',
    borderColor: '#EFF0F1',

    borderWidth: 1,
    padding: 0,
    borderRadius: normalize(4),
    paddingHorizontal: normalize(10),
    fontFamily: Constants.fontFamily,
  },
});
//export default (withTranslation()(ForgotPassword));

const mapStateToProps = (state) => {
  let {login, auth, language} = state;
  return {
    user: auth.user,
    pwdLogin: login.passwordLoginUser,
    // authorization: auth.authorization,
    // laMod: auth.laMod,
    // language,
  };
};

export default connect(mapStateToProps, {
  forgotPassword,
})(withTranslation()(ForgotPassword));
