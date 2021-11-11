import React from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  BackHandler,
} from 'react-native';

import HeaderPreLogin from './HeaderPreLogin';
import {useTranslation, withTranslation} from 'react-i18next';

import {normalize} from '../../utils/helpers';

import * as Constants from '../../components/KoraText';
import BlueButton from './BlueButton';
import EMAIL_ICON from '../../assets/login/signup_email_icon.svg';
import globalStyle from './styles';
import {connect} from 'react-redux';
import {resendVerificationLink} from '../../../shared/redux/actions/pre-login.action';

import {openInbox} from 'react-native-email-link';
import {ROUTE_NAMES} from '../../navigation/RouteNames';

class SignUpEmailVerification extends React.Component {
  state = {
    email: '',
  };
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let {route} = this.props;
    // this.props.route.params.boardType,
    let id = route?.params?.emailId || null;
    //console.log('SignUpEmailVerification emailId_1 : ', id);
    this.setState({
      email: id,
    });
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.backAction,
    );
    // console.log('SignUpEmailVerification emailId_2 : ', this.state.email);
  }

  componentWillUnmount() {
    this.backHandler?.remove();
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

  sendVeficationLink = () => {
    let statusObj = this.isValidDetails(this.state.email);

    if (!statusObj.isValid) {
      console.log(statusObj.msz);
      alert(statusObj.msz);
      return;
    }

    let payload = {emailId: this.state.email};

    // console.log('payload ----------->> :', payload);

    this.props.resendVerificationLink(payload, (obj) => {
      // console.log('obj  =========>:', JSON.stringify(obj));
      if (obj?.data && obj?.data?.errors) {
        let msg = obj?.data?.errors[0].msg || null;
        if (msg) {
          alert(msg);
        }
        return;
      }
      // {"status":true}  ["SUCCESS"]
      const {t} = this.props;
      if (obj?.status && obj?.data && obj?.data[0] === 'SUCCESS') {
        let msz = t('success_to_resend_verify_link') + ' ' + this.state.email;
        alert(msz);
      }
    });
  };

  buttonOnPress = () => {
    openInbox();
  };

  backAction = () => {
    this.props?.navigation?.goBack();
    this.props?.navigation?.goBack();
    this.props?.navigation?.goBack();
    this.props?.navigation?.goBack();

    this.props?.navigation?.navigate(ROUTE_NAMES.LOGIN_WITH_EMAIL);
  };

  render() {
    const {t} = this.props;
    return (
      <SafeAreaView style={styles.root}>
        <HeaderPreLogin
          backAction={this.backAction}
          appName={false}
          currentScreenName={t('almostDoneTitle')}></HeaderPreLogin>
        <View style={globalStyle.globalInnerRootStyle}>
          <View style={styles.innerRoot}>
            <View style={styles.viewImage}>
              <View style={styles.v1}>
                <EMAIL_ICON />
              </View>

              <Text style={styles.verficationText}>
                A verification link was sent to {this.state.email}. Please click
                it to verify your email.
              </Text>
              <Text style={styles.verficationText2}>
                Link is valid for 48 hours. Check your spam folder if you don't
                see the email.
              </Text>
            </View>

            <View style={styles.bottomView}>
              <Text style={styles.resendLink} onPress={this.sendVeficationLink}>
                {t('resendEmail')}
              </Text>
              <BlueButton
                buttonOnPress={this.buttonOnPress}
                name={t('openEmail')}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  v1: {marginStart: 50,marginBottom:40},
  imageStyle: {width: 100, height: 100},
  viewImage: {alignItems: 'center',},
  innerRoot: {flex: 1, alignItems: 'center'},
  bottomView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resendLink: {
    marginStart: 2,
    fontSize: normalize(18),
    color: '#9AA0A6',
    fontWeight: '400',
    fontSize: normalize(14),
    marginBottom:20,
    fontStyle: 'normal',
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
  },
  verficationText: {
    marginTop: 20,
    color: '#202124',
    fontWeight: '400',
    fontSize: normalize(16),
    marginHorizontal:20,
    textAlign: 'center',
    fontStyle: 'normal',
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
  },
  verficationText2: {
    marginTop: 10,
    color: '#9AA0A6',
    marginHorizontal:20,
    fontWeight: '400',
    fontSize: normalize(16),
    
    textAlign: 'center',
    fontStyle: 'normal',
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
  },
  root: {flex: 1,backgroundColor:'#FFFFFF'},
});
//export default withTranslation()(SignUpEmailVerification);

export default connect(null, {
  resendVerificationLink,
})(withTranslation()(SignUpEmailVerification));
