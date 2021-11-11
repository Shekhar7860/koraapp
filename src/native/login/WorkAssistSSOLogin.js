import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {normalize} from '../utils/helpers';
import {WebView} from 'react-native-webview';
import {Icon} from '../components/Icon/Icon';
import {REDIRECT_URL, azure_scopes, SSO_365} from '../utils/login-constants';
import {SSOLogin} from '../../shared/redux/actions/login.action';
import {StackActions} from '@react-navigation/native';
import {configureKoraContainer} from '../utils/file-utilities';
import {connect} from 'react-redux';
import {navigate, goBack} from '../navigation/NavigationService';
import {ROUTE_NAMES} from '../navigation/RouteNames';
import {Loader} from '../screens/ChatsThreadScreen/ChatLoadingComponent';
class WorkAssistSSOLogin extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      helpToggle: false,
    };
  }
  componentDidMount() {
    // Linking.getInitialURL().then((ev) => {
    //   if (ev) {
    //     console.log('login sso', ev.url);

    //     // this._handleOpenURL(ev);
    //   }
    // }).catch(err => {
    //     console.warn('An error occurred', err);
    // });
    Linking.addEventListener('url', this._handleOpenURL);

    // Linking.addEventListener('url', this._handleOpenURL);
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this._handleOpenURL);
  }

  _handleOpenURL = (event) => {
    // D
    let idTokenAndEmail = event.url.substring(
      event.url.indexOf(REDIRECT_URL) + REDIRECT_URL.length + 1,
    );

    let array=idTokenAndEmail.split('&')
    let token = array[0];
    let emailId = array[1].split('=')[1];
    // let token = idTokenAndEmail.split('&')[0];
    //  let email = idTokenAndEmail.split('&')[1];
    // console.log('login sso token', this);

    // console.log('_handleOpenURL   --->:', event);
    // console.log('idTokenAndEmail   --->:', idTokenAndEmail);
    // console.log('token   --->:', token);
    this.props.SSOLogin({
      id_token: token.split('=')[1],
      provider: SSO_365,
      scope: azure_scopes,
      emailId:emailId,
    });
  };

  toggleState = () => {
    this.setState({helpToggle: !this.state.helpToggle});
  };
  goToBack = () => {
    goBack();
  };

  _onLoad = (e) => {
    console.log('on load', e);
    if (e && e.url && e.url.startsWith(REDIRECT_URL)) {
      let idTokenAndEmail = e.url.substring(
        e.url.indexOf(REDIRECT_URL) + REDIRECT_URL.length + 1,
      );
      let token = idTokenAndEmail.split('&')[0];
      // let email = idTokenAndEmail.split('&')[1];
      this.props.SSOLogin({
        id_token: token.split('=')[1],
        provider: SSO_365,
        scope: azure_scopes,
      });
      // console.log('He He ',idTokenAndEmail,token,email);
      return false;
    }

    return true;
  };

  _onError = (e) => {
    console.log('error in ios', e);
  };

  _onMessage = (e) => {
    console.log('error in ios', e);
  };
  _httoError = (e) => {
    console.log('error in ios', e);
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
    if (prevProps.ssoLogin !== this.props.SSOLogin) {
      if (this.props.ssoLogin && this.props.ssoLogin.authorization) {
        console.log('props for sso', this.props.ssoLogin);

        if (
          new Date() < new Date(this.props.ssoLogin.authorization.expiresDate)
        ) {
          // console.log('Hey',this.props.ssoLogin);
          configureKoraContainer(this.props.userInfo?.userId);
          this.navigateToMain();
        } else {
          // this.props.history.push('/login');
        }
      }
    }
  }
  render() {
    const {loadUrl} = this.props.route.params;
    console.log('loadUrl', loadUrl);
    return (
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.title_view}>
          <View style={{flexDirection: 'column', flex: 1, paddingVertical: 5}}>
            <Text style={styles.title_text}>Company Login</Text>
          </View>
          <TouchableOpacity onPress={this.toggleState}>
            <Icon name="Help" size={22} />
          </TouchableOpacity>
        </View>

        <View style={{flex: 1}}>
          {this.state.helpToggle && (
            <View style={styles.help_view}>
              <Text style={styles.help_text}>
                has integrated the company standard authentication mechanism
                with Kore.ai. The credentials required would be the same that
                you login with at your company for email.
              </Text>
            </View>
          )}
          <WebView
            source={{uri: loadUrl}}
            startInLoadingState={true}
            onNavigationStateChange={this._onLoad}
            renderLoading={() => <Loader />}
            onError={this._onError}
            onMessage={this._onMessage}
            onHttpError={this._httoError}
            onLoadingError={this._onError}
            onContentProcessDidTerminate={this._onError}
            incognito={true}
            renderError={(error) => console.log(error)}></WebView>
        </View>

        <TouchableOpacity style={styles.cancel_view} onPress={this.goToBack}>
          <Text style={styles.cancel_text}>Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  help_view: {
    zIndex: 2,
    backgroundColor: '#10002de9',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  checkbox: {
    alignSelf: 'center',
    marginRight: 2,
  },
  help_text: {
    flexDirection: 'column',
    padding: 10,
    color: 'white',
    fontSize: normalize(12),
    lineHeight: 20,
  },
  title_text: {textAlign: 'center', fontSize: normalize(18)},
  sub_text: {textAlign: 'center', fontSize: normalize(16)},
  title_view: {
    paddingEnd: 10,
    minHeight: normalize(54),
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: 'grey',
    backgroundColor: 'white',
  },
  cancel_text: {textAlign: 'center', width: '100%', fontSize: 16},
  cancel_view: {
    height: normalize(50),
    backgroundColor: '#E0E0E0',

    flexDirection: 'row',
    alignItems: 'center',
  },
  flexContainer: {
    flex: 1,
    alignContent: 'center',
  },
});
const mapStateToProps = (state) => {
  let {login} = state;
  return {
    ssoLogin: login.currentUser,
  };
};
export default connect(mapStateToProps, {
  // redux actions will be added here for this component.
  SSOLogin,
})(WorkAssistSSOLogin);
