// import React from 'react';
// import {
//   Image,
//   StyleSheet,
//   View,
//   Alert,
//   Keyboard,
//   KeyboardAvoidingView,
//   Platform,
//   TouchableHighlight,
//   Text,
// } from 'react-native';
// import {TextInput} from 'react-native-paper';
// import {connect} from 'react-redux';
// import {withTranslation} from 'react-i18next';
// import {ScrollView} from 'react-native';
// import {StackActions} from '@react-navigation/native';
// import {GoogleSignin, statusCodes} from '@react-native-community/google-signin';

// import {userLogin, SSOLogin} from '../../shared/redux/actions/login.action';
// import {changeLang} from '../../shared/redux/actions/language.action';
// import {configureKoraContainer} from '../utils/file-utilities';
// import {bootstrap} from '../config/bootstrap';
// import * as Constants from '../components/KoraText';
// import {normalize} from '../utils/helpers';

// class Login extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       email: '',
//       focus: false,
//       selectedLang: 'en',
//     };
//     const {i18n} = this.props;
//     i18n.changeLanguage(this.props.language.selectedLang);
//   }

//   _signIn = async () => {
//     try {
//       await GoogleSignin.hasPlayServices();
//       const userInfo = await GoogleSignin.signIn();
//       this.setState({userInfo: userInfo, loggedIn: true});

//       this.props.SSOLogin({
//         auth_code: userInfo.serverAuthCode,
//         provider: 'google',
//       });
//     } catch (error) {
//       if (error.code === statusCodes.SIGN_IN_CANCELLED) {
//         // user cancelled the login flow
//       } else if (error.code === statusCodes.IN_PROGRESS) {
//         // operation (f.e. sign in) is in progress already
//       } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
//         // play services not available or outdated
//       } else {
//         // some other error happened
//       }
//     }
//   };
//   signOut = async () => {
//     try {
//       await GoogleSignin.revokeAccess();
//       await GoogleSignin.signOut();
//       this.setState({user: null, loggedIn: false}); // Remember to remove the user from your app's state as well
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   componentWillUnmount() {
//     this.keyboardDidHideListener.remove();
//   }

//   componentDidMount() {
//     GoogleSignin.configure({
//       scopes: [
//         'profile',
//         'https://www.googleapis.com/auth/gmail.readonly',
//         'https://www.googleapis.com/auth/drive',
//         'https://www.googleapis.com/auth/drive.file',
//         'https://www.googleapis.com/auth/contacts.readonly',
//         'https://www.googleapis.com/auth/admin.directory.user.readonly',
//         'https://www.googleapis.com/auth/calendar',
//       ],
//       webClientId:
//         '217038053421-pmned8uaqae90525baauqc92iccpmnr2.apps.googleusercontent.com',
//       offlineAccess: true,
//       forceConsentPrompt: true,
//       accountName: '',
//       iosClientId:
//         '217038053421-bgaskjbu4cj5mkhno2b0b5tdq0mpba1i.apps.googleusercontent.com',
//     });

//     this.keyboardDidHideListener = Keyboard.addListener(
//       'keyboardDidHide',
//       this.keyboardDidHide,
//     );
//   }

//   componentDidUpdate(prevProps, prevState) {
//     if (this.props.language.selectedLang !== prevProps.language.selectedLang) {
//       const {i18n} = this.props;
//       i18n.changeLanguage(this.props.language.selectedLang);
//     }
//     if (this.props.user != null && prevProps.user !== this.props.user) {
//       const result = this.props.user;
//       if (result.status === 'signupNotAllowed') {
//         Alert.alert(
//           'Please contact your enterprise admin to sign-up and use WorkAssist.',
//         );
//       } else if (result.status === 'unknown') {
//         Alert.alert('Contact support@kora.ai to sign-in');
//       } else if (
//         (!result.hasOwnProperty('idp') || result.idp.indexOf('ews') !== -1) &&
//         result.status !== 'inactive'
//       ) {
//         // console.log(result);
//         let checkIdData = result;
//         checkIdData.emaiId = this.state.emailId.trim();
//         this.setState({checkIdData});
//       } else if (
//         result.status === 'inactive' &&
//         (!result.hasOwnProperty('idp') || result.idp.indexOf('ews') !== -1)
//       ) {
//         // console.log(result);
//         //this.router.navigate(["emailverification"], { queryParams });
//       } else {
//         if (
//           (result.status !== 'inactive') &
//           (result.idp.indexOf('google') !== -1)
//         ) {
//           // console.log(result);
//           this._signIn();
//         }
//         // this.showSignInUserBtn(result, this.state.emailId);
//         // this.openLoginUrl(result, this.state.emailId);
//       }
//     }
//     console.log('Step ');
//     if (this.props.ssoLogin && this.props.ssoLogin.authorization) {
//       console.log('Step 1');
//       if (
//         new Date() < new Date(this.props.ssoLogin.authorization.expiresDate)
//       ) {
//         console.log('Step 2');
//         configureKoraContainer(this.props.userInfo?.userId);
//         this.props.navigation.dispatch(StackActions.replace('Main'));
//       } else {
//         // this.props.history.push('/login');
//       }
//     }
//   }

//   isEmail = (email) => {
//     if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim())) {
//       return true;
//     }
//     return false;
//   };

//   addLoginButton = () => {
//     const email = this.state.email;
//     if (email.trim().length === 0) {
//       Alert.alert('Alert', 'Please enter a valid email address.');
//     } else if (
//       /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim())
//     ) {
//       this.props.userLogin(this.state.email);
//     } else {
//       Alert.alert('Alert', 'You have entered an invalid email address!');
//     }
//   };

//   setSelectedLang = (lang) => {
//     this.props.changeLang(lang);
//     this.setState({selectedLang: lang});
//     const {i18n} = this.props;
//     i18n.changeLanguage(lang);
//   };

//   keyboardDidHide = () => {
//     this.refs.inputRef.blur();
//   };

//   render() {
//     const {t} = this.props;
//     return (
//       <ScrollView scrollEnabled={false}>
//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'position' : null}
//           style={[
//             styles.container,
//             {padding: 20, paddingTop: 50},
//             bootstrap.dFlex,
//             bootstrap.flexColumn,
//             bootstrap.justifyContentSpaceBetween,
//           ]}>
//           <View>
//             <Image source={require('../assets/login-image.png')} />
//           </View>
//           <View
//             style={[
//               bootstrap.dFlex,
//               bootstrap.flexColumn,
//               {paddingBottom: 10},
//             ]}>
//             <View style={styles.basicMargin}>
//               <Text style={styles.loginTitleTextStyle}>
//                 Login To <Text style={styles.koraTextStyle}>WorkAssist</Text>
//               </Text>
//             </View>
//             <View style={styles.basicMargin}>
//               <Text style={styles.onlyTextStyle}>
//                 Only for{' '}
//                 <Image
//                   source={require('../assets/login/google.png')}
//                   style={{width: 16, height: 16}}
//                 />{' '}
//                 Google and{' '}
//                 <Image
//                   source={require('../assets/login/windows.png')}
//                   style={{width: 16, height: 16}}
//                 />{' '}
//                 Office
//               </Text>
//             </View>
//             <TextInput
//               label="Email"
//               value={this.state.email}
//               style={styles.input}
//               keyboardType="email-address"
//               onFocus={() => {
//                 this.setState({focus: true});
//               }}
//               ref="inputRef"
//               onBlur={() => {
//                 this.setState({focus: false});
//               }}
//               onChangeText={(text) => {
//                 this.setState({email: text});
//               }}
//               autoCapitalize={'none'}
//             />
//             {!this.state.focus ? (
//               <View style={{paddingBottom: 30}}>
//                 <View style={styles.input}>
//                   <TouchableHighlight
//                     underlayColor={'#817dff'}
//                     style={[
//                       styles.button,
//                       this.isEmail(this.state.email) <= 0
//                         ? {backgroundColor: 'grey'}
//                         : {},
//                     ]}
//                     disabled={
//                       this.isEmail(this.state.email) <= 0 ? true : false
//                     }
//                     onPress={this.addLoginButton}>
//                     <Text style={styles.loginTextStyle}>
//                       {t('login.submit-button')}
//                     </Text>
//                   </TouchableHighlight>
//                 </View>
//                 <View style={styles.input}>
//                   <Text style={styles.textStyle}>
//                     By clicking Next, I agree to the{' '}
//                     <Text style={styles.policyTextStyle}>Terms of Service</Text>{' '}
//                     and{' '}
//                     <Text style={styles.policyTextStyle}>Privacy Policy</Text>
//                   </Text>
//                 </View>
//               </View>
//             ) : null}
//           </View>
//         </KeyboardAvoidingView>
//       </ScrollView>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   button: {
//     height: 50,
//     borderRadius: 5,
//     backgroundColor: '#4741FA',
//     color: '#ffffff',
//     fontSize: normalize(14),
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   container: {
//     flex: 1,
//   },
//   input: {
//     marginBottom: 11,
//     marginTop: 11,
//     fontWeight: '400',
//     fontSize: normalize(16),
//     fontStyle: 'normal',
//     fontFamily: Constants.fontFamily,
//   },
//   basicMargin: {
//     paddingBottom: 11,
//     paddingTop: 11,
//   },
//   loginTitleTextStyle: {
//     fontWeight: '400',
//     fontSize: normalize(40),
//     fontStyle: 'normal',
//     fontFamily: Constants.fontFamily,
//   },
//   koraTextStyle: {
//     color: '#4741FA',
//     fontWeight: '400',
//     fontSize: normalize(40),
//     fontStyle: 'normal',
//     fontFamily: Constants.fontFamily,
//   },
//   onlyTextStyle: {
//     fontWeight: '400',
//     fontSize: normalize(16),
//     fontStyle: 'normal',
//     fontFamily: Constants.fontFamily,
//   },
//   loginTextStyle: {
//     color: '#ffffff',
//     fontWeight: '400',
//     fontSize: normalize(18),
//     fontStyle: 'normal',
//     fontFamily: Constants.fontFamily,
//   },
//   textStyle: {
//     textAlign: 'center',
//     fontWeight: '400',
//     fontSize: normalize(14),
//     fontStyle: 'normal',
//     fontFamily: Constants.fontFamily,
//   },
//   policyTextStyle: {
//     color: '#4741FA',
//     fontWeight: 'bold',
//     fontSize: normalize(14),
//     fontStyle: 'normal',
//     fontFamily: Constants.fontFamily,
//   },
// });

// const mapStateToProps = (state) => {
//   let {login, language} = state;
//   return {
//     user: login.user,
//     ssoLogin: login.currentUser,
//     language,
//     pwdLogin: login.passwordLoginUser,
//     resetPwd: login.resetPwd,
//   };
// };
// export default connect(mapStateToProps, {
//   // redux actions will be added here for this component.
//   userLogin,
//   changeLang,
//   SSOLogin,
// })(withTranslation()(Login));
