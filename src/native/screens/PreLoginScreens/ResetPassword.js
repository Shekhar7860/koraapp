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
import {useTranslation, withTranslation} from 'react-i18next';

import {normalize} from '../../utils/helpers';

import * as Constants from '../../components/KoraText';
import BlueButton from './BlueButton';
import globalStyle from './styles';
import {connect} from 'react-redux';

import {resetPassword} from '../../../shared/redux/actions/pre-login.action';
import KoraKeyboardAvoidingView   from '../../components/KoraKeyboardAvoidingView';

class ResetPassword extends React.Component {
  pwd = null;
  cnfPwd = null;

  constructor(props) {
    super(props);

    this.inputRef = null;
  }

  componentDidMount(){
    setTimeout(()=>{
      if(this.inputRef){
        this.inputRef.focus();
      }
    },100);
  }

  resetButtonOnPress = () => {
    let statusObj = this.isValidDetails(this.pwd, this.cnfPwd);
    if (!statusObj.isValid) {
      console.log(statusObj.msz);
      alert(statusObj.msz);
      return;
    }

    let payload = {
      newPassword: this.pwd,
    };

    this.props.resetPassword(payload, (obj) => {
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
        //TODO write a logic for navigate to success screen here
        console.log('Response  ---------> ', obj?.data[0]);
      }
    });
  };
  isEmail = (email) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim())) {
      return true;
    }
    return false;
  };
  isValidDetails = (pwd, cnfPwd) => {
    const {t} = this.props;
    let staObj = {
      msz: '',
      isValid: false,
    };
    if (!pwd) {
      staObj.msz = t('valid_pwd_msz');
      return staObj;
    }
    if (!cnfPwd) {
      staObj.msz = t('valid_cnfpwd_msz');
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
          currentScreenName={t('resetPasswordTitle')}></HeaderPreLogin>
        <View style={globalStyle.globalInnerRootStyle}>
          <View style={styles.v1}>
            <View style={styles.inputview}>
              <TextInput
              ref={(ref)=>{this.inputRef= ref}}
                placeholder={t('passwordPlaceHolder')}
                secureTextEntry={true}
                autoCapitalize={'none'}
                placeholderTextColor="#BDC1C6"
                underlineColorAndroid="transparent"
                onChangeText={(text) => {
                  this.pwd = text;
                }}
                style={styles.username_input}></TextInput>
            </View>

            <View style={styles.inputview}>
              <TextInput
                placeholder={t('confirmPassword')}
                secureTextEntry={true}
                autoCapitalize={'none'}
                placeholderTextColor="#BDC1C6"
                underlineColorAndroid="transparent"
                onChangeText={(text) => {
                  this.cnfPwd = text;
                }}
                style={styles.username_input}></TextInput>
            </View>
            <View style={styles.bottomView}>
              <TouchableOpacity
                style={styles.buttonStyle}
                onPress={this.goToBack}>
                <Text style={styles.textStyle}>{t('cancelButton')}</Text>
              </TouchableOpacity>
              <BlueButton
                buttonOnPress={this.resetButtonOnPress}
                name={t('Reset password')}
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
  buttonStyle: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#BDC1C6',
    width: '100%',
    backgroundColor: '#FFFFFF',
    minHeight: normalize(44),
    borderRadius: 4,
    justifyContent: 'center',
  },
  textStyle: {
    fontWeight: '500',

    fontStyle: 'normal',
    fontSize: normalize(16),
    color: '#202124',
    justifyContent: 'center',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  bottomView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
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
//export default (withTranslation()(ResetPassword));

export default connect(null, {
  resetPassword,
})(withTranslation()(ResetPassword));
