import {ROUTE_NAMES} from '../../navigation/RouteNames';
import AccountManager from '../../../shared/utils/AccountManager';
import {configureKoraContainer} from '../../utils/file-utilities';

import {store} from '../../../shared/redux/store';

import {createTokenForAccount} from '../../../shared/redux/actions/pre-login.action';

export function signinValidate(props, response) {
  if (!response) {
    return;
  }
  console.log('signinValidate  response  ------> :', response);
  // console.log('response?.userInfo  ------> :', response?.userInfo);
  // console.log('response?.authorization  ------> :', response?.authorization);

  function navigateToMain() {
    AccountManager.prepareAccount(response?.userInfo, response?.authorization);
    configureKoraContainer(response?.userInfo?.id);

    props.navigation.replace(ROUTE_NAMES.MAIN, {
      screen: 'Main',
      params: {
        screen: 'Main',
        params: {
          initSync: true,
        },
      },
    });
  }
  if (response?.userInfo && response?.authorization) {
    if (new Date() < new Date(response?.authorization.expiresDate)) {
     navigateToMain();
     //console.log('----------------> Navigate to Main screen <--------------');
    }
  } else {
    // console.log(
    //   'response?.loginResponse?.userAccounts  ------> :',
    //   response?.loginResponse?.userAccounts,
    // );
    if (
      response?.loginResponse?.userAccounts &&
      response?.loginResponse?.userAccounts?.length > 0
    ) {
      // callMultipleAccountScreen(
      //   response?.loginResponse?.userAccounts[0].accountId,
      //   response?.loginResponse?.session,
      // );
       props.navigation.navigate(ROUTE_NAMES.SELECT_ACCOUNT_SCREEN);
    } else if (
      response?.loginResponse?.session &&
      response?.loginResponse?.userAccounts &&
      response?.loginResponse?.userAccounts?.length === 0
    ) 
    {

      /*
 this.props.navigation.navigate(ROUTE_NAMES.POST_SIGN_UP_SELECTION_TWO, {
            email: identity,
        });
      */

      if(response?.loginResponse?.isCaptuteUserPref){
        props.navigation.replace(ROUTE_NAMES.POST_SIGN_UP_HOME, {
          screen: ROUTE_NAMES.POST_SIGN_UP_SELECTION_TWO,
          params: {
            initial: true,
            screen: ROUTE_NAMES.POST_SIGN_UP_SELECTION_TWO,
            email: response?.loginResponse?.emailId,
            currentIndicator:0,
            totalIndicator:3,
          },
        });
      }else{
        props.navigation.replace(ROUTE_NAMES.POST_SIGN_UP_HOME, {
          screen: ROUTE_NAMES.POST_SIGN_UP_HOME,
          params: {
            screen: ROUTE_NAMES.POST_SIGN_UP_HOME,
            params: {
              emailId: response?.loginResponse?.emailId,
            },
          },
        });
      }

     

      // if(response?.loginResponse?.isCaptuteUserPref){

      //   props.navigation.navigate(ROUTE_NAMES.POST_SIGN_UP_HOME, {
      //     screen: ROUTE_NAMES.POST_SIGN_UP_HOME,
      //   });

      // }

    //   this.props.navigation.navigate(ROUTE_NAMES.POST_SIGN_UP_SELECTION_TWO, {
    //     email: identity,
    // });
      // if(response?.loginResponse?.isCaptuteUserPref){
      //   props.navigation.navigate(ROUTE_NAMES.POST_SIGN_UP_HOME, {
      //     screen: ROUTE_NAMES.POST_SIGN_UP_HOME,
      //   });

      // }else{
      //   props.navigation.navigate(ROUTE_NAMES.POST_SIGN_UP_HOME, {
      //     screen: ROUTE_NAMES.POST_SIGN_UP_HOME,
      //   });
      // }
     
    }
  }
}

function callMultipleAccountScreen(accountId, session) {
  let paramsData = {
    accountId: accountId,
    session: session,
  };
  store.dispatch(createTokenForAccount(paramsData));
}
