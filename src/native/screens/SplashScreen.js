import React, {Component} from 'react';
import {StyleSheet, SafeAreaView, StatusBar} from 'react-native';
import {StackActions} from '@react-navigation/native';
import RNBootSplash from 'react-native-bootsplash';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';

import {ROUTE_NAMES} from '../navigation/RouteNames';
import * as Constants from '../components/KoraText';
import {normalize} from '../utils/helpers';
import SPLASH_NEW from '../assets/splash_new.svg';
import {getAccount} from '../../shared/redux/actions/auth.action';
import AccountManager from '../../shared/utils/AccountManager';
import {configureKoraContainer} from '../utils/file-utilities';
import * as UsersDao from '../../dao/UsersDao';

class SplashScreen extends Component {
  timer = [];
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      authorization: null,
    };
  }

  componentDidMount() {
    RNBootSplash.hide({fade: true});
    // this.props.getAccount();
    setTimeout(() => {
      UsersDao.getUserAndAuthInfo().then((userAndauth) => {
        if (userAndauth) {
          console.log('Updating state',userAndauth);
          this.setState({
            user: userAndauth.user,
            authorization: userAndauth.authorization,
          });
        }
      });
    }, 1000); 
    
  }

  componentDidUpdate(prevProps, prevState) {
    // if (prevProps.laMod?.getTime() !== this.props.laMod?.getTime()) {
      console.log('called component did update ',prevState.user);
      console.log('Current state ',this.state.user);
      this.timer.push(setTimeout(() => this.onAnimationFinish(), 5));
    if (prevState.user !== this.state.user) {
      console.log('Updating screen');
      
      let user = this.state.user;
      let authorization = this.state.authorization;
      if (user && authorization) {
        AccountManager.prepareAccount(user, authorization);
        configureKoraContainer(user?.id);
      }
    }
    // }
  }

  componentWillUnmount() {
    this.timer.map(clearTimeout);
  }

  onAnimationFinish = () => {
    let authorization = this.state.authorization;
    if (authorization?.accessToken) {
      setTimeout(
        () =>
          this.props.navigation.replace(ROUTE_NAMES.MAIN, {
            screen: 'Main',
            params: {
              screen: 'Main',
              params: {
                initSync: false,
                notifcustomData: this.props?.route?.params?.customData || null,
              },
            },
          }),
        10,
      );
    } else {
      this.props.navigation.dispatch(
        StackActions.replace(ROUTE_NAMES.APP_LANDING_SCREEN),
      );
    }
  };

  render() {
    return (
      <SafeAreaView style={splashStyle.container}>
        {/* <StatusBar backgroundColor="#EFF0F1" barStyle="light-content" /> */}
        <SPLASH_NEW />
      </SafeAreaView>
    );
  }
}

const splashStyle = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    color: '#ffffff',
    fontSize: normalize(68),
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
});

const mapStateToProps = (state) => {
  let {auth, language} = state;
  return {
    // user: auth?.user,
    // authorization: auth?.authorization,
    // laMod: auth?.laMod,
    language,
  };
};
export default connect(mapStateToProps, {
  // getAccount,
})(withTranslation()(SplashScreen));
