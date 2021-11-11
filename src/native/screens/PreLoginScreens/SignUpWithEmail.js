import React from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

import HeaderPreLogin from './HeaderPreLogin';
import {connect} from 'react-redux';

import {normalize} from '../../utils/helpers';

import * as Constants from '../../components/KoraText';
import BlueButton from './BlueButton';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
import {useTranslation, withTranslation} from 'react-i18next';
import globalStyle from './styles';
import KoraKeyboardAvoidingView   from '../../components/KoraKeyboardAvoidingView';

class SignUpWithEmail extends React.Component {
  email = null;
  
  constructor(props) {
    super(props);

  }
  loginAction = () => {
    this.buttonOnPress(ROUTE_NAMES.LOGIN_HOME);
  };
  componentDidMount(){
    setTimeout(()=>{
      if(this.inputRef){
        this.inputRef.focus();
      }
    },100);
  }

  buttonOnPress = (id) => {
    switch (id) {
      case ROUTE_NAMES.SIGN_UP_PASSWORD:
        let statusObj = this.isValidDetails(this.email);
        if (!statusObj.isValid) {
          console.log(statusObj.msz);
          alert(statusObj.msz);
          return;
        }
        console.log('Valid email id :', this.email);
        this.props.navigation.navigate(ROUTE_NAMES.SIGN_UP_PASSWORD, {
          emailId: this.email,
        });
        break;
      case ROUTE_NAMES.LOGIN_HOME:
        this.props.navigation.navigate(ROUTE_NAMES.LOGIN_HOME);
        break;
    }
  };
  render() {
    const {t} = this.props;
    return (
      <SafeAreaView style={styles.root}>
      <KoraKeyboardAvoidingView style={styles.root}>
      <View style={styles.root}> 
        <HeaderPreLogin
          appName={false}
          currentScreenName={t('signUpWithEmail')}></HeaderPreLogin>

        <View style={globalStyle.globalInnerRootStyle}>
          <View style={styles.v1}>
            <View style={styles.inputview}>          
              <TextInput
               ref={(ref)=>{this.inputRef= ref}}
                placeholder={t('emailPlaceHolder')}
                autoCapitalize={'none'}
                //value={this.state.email}
                keyboardType="email-address"
                placeholderTextColor="#BDC1C6"
                underlineColorAndroid="transparent"
                onChangeText={(text) => {
                  this.email = text;
                }}
                style={styles.username_input}></TextInput>
                
            </View>
            
            <View style={styles.bottomView}>
              <View style={styles.v2}>
                <Text style={styles.login_text}>{t('doYouHaveAccount')}</Text>
                <Text style={styles.loginLink} onPress={this.loginAction}>
                  {t('loginButton')}
                </Text>
              </View>
             
              <BlueButton
                id={ROUTE_NAMES.SIGN_UP_PASSWORD}
                name={t('continueButton')}
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

  isEmail = (email) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim())) {
      return true;
    }
    return false;
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
}
const styles = StyleSheet.create({
  v1: {flex: 1},
  v2: {flexDirection: 'row'},
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
    marginBottom: normalize(20),
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
  // userLogin,
})(withTranslation()(SignUpWithEmail));
