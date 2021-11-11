import React from 'react';
import {View, StyleSheet, Text, SafeAreaView} from 'react-native';

import HeaderPreLogin from './HeaderPreLogin';

import * as Constants from '../../components/KoraText';
import {normalize} from '../../utils/helpers';
import {useTranslation, withTranslation} from 'react-i18next';
import AccountsListView from './AccountsListView';
import globalStyle from './styles';
import {ROUTE_NAMES} from '../../navigation/RouteNames';

import {connect} from 'react-redux';
import {createTokenForAccount} from '../../../shared/redux/actions/pre-login.action';
import {signinValidate} from './SigninValidate';

class AccountSelectionScreen extends React.Component {
  data = [
    {
      name: 'Product',
      count: 15,
      color: 'green',
    },
    {
      name: 'Product Manager Product Manager ABC',
      count: 15,
      color: 'pink',
    },
    {
      name: 'Herms',
      count: 15,
      color: 'red',
    },
    {
      name: 'Product',
      count: 15,
      color: 'blue',
    },
  ];

  state = {
    userAccounts: [],
    session: '',
  };

  componentDidMount() {
    //  let userInfo = this.props.user;
    //  let authorization = this.props.authorization;
    let loginResponse = this.props.loginResponse;
    if (loginResponse && loginResponse.userAccounts) {
      this.setState({
        userAccounts: loginResponse.userAccounts,
        session: loginResponse.session,
      });
    }
    console.log(
      'AccountSelectionScreen loginResponse ===============> :',
      loginResponse,
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.laMod !== this.props.laMod) {
      let userInfo = this.props.user;
      let authorization = this.props.authorization;
      let loginResponse = this.props.loginResponse;
      signinValidate(this.props, {userInfo, authorization, loginResponse});
    }
  }

  itemPress = (item) => {
    console.log('item clicked  ----------->: ', item);
    //  alert(item.name);

    let paramsData = {
      accountId: item?.accountId,
      session: this.state.session,
      emailId: item?.accountName,
    };
    //{"status":true,"data":{"success":true,"accountId":"ac-8b025a24-97eb-50df-aff0-61f07f2cffa2"}}
    this.props.createTokenForAccount(paramsData);
    // this.props.navigation.navigate(ROUTE_NAMES.POST_SIGN_UP_HOME, {
    //   screen: ROUTE_NAMES.POST_SIGN_UP_HOME,
    // });
  };
  render() {
    const {t} = this.props;
    return (
      <SafeAreaView style={styles.root}>
        <HeaderPreLogin
          appName={false}
          currentScreenName={t('selectAccount')}></HeaderPreLogin>
        <View style={globalStyle.globalInnerRootStyle}>
          <Text style={styles.desc_text}>{t('selectAccountDesc')}</Text>
          <AccountsListView
            data={this.state.userAccounts}
            onItemClick={this.itemPress}
          />
        </View>
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  root: {flex: 1,backgroundColor:'#FFFFFF'},
  desc_text: {
    color: '#5F6368',
    fontWeight: '400',
    fontSize: normalize(18),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    textAlignVertical: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginBottom: 40,
  },
});
//export default withTranslation()(AccountSelectionScreen);

const mapStateToProps = (state) => {
  let {login, auth, language} = state;
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
  createTokenForAccount,
})(withTranslation()(AccountSelectionScreen));

/*

{
  "userAccounts": [
    {
      "id": "ac-8b025a24-97eb-50df-aff0-61f07f2cffa2",
      "accountId": "ac-8b025a24-97eb-50df-aff0-61f07f2cffa2",
      "accountName": "test1@sathishchalla.testinator.com",
      "name": "Design Ninja",
      "owner": {
        "id": "u-f0a7a089-076f-5685-b480-33eb72bd635a",
        "_id": "u-f0a7a089-076f-5685-b480-33eb72bd635a",
        "fN": "test",
        "lN": "test1",
        "color": "#7027E5",
        "icon": "no-avatar"
      },
      "type": "private",
      "logo": {
        "type": "emoji",
        "val": {
          "category": "symbols",
          "unicode": "2665"
        }
      },
      "idp": "",
      "membersCount": 1
    },
    {
      "id": "ac-b17ec57a-0f9d-52ae-9509-043eb903af1f",
      "accountId": "ac-b17ec57a-0f9d-52ae-9509-043eb903af1f",
      "accountName": "test1@sathishchalla.testinator.com",
      "name": "Design Ninja",
      "owner": {
        "id": "u-94be604e-d934-5134-ac6a-9ee804ce68bf",
        "_id": "u-94be604e-d934-5134-ac6a-9ee804ce68bf",
        "fN": "test",
        "lN": "test1",
        "color": "#F4C900",
        "icon": "no-avatar"
      },
      "type": "private",
      "logo": {
        "type": "emoji",
        "val": {
          "category": "symbols",
          "unicode": "2665"
        }
      },
      "idp": "",
      "membersCount": 1
    }
  ],
  "otherAccounts": [],
  "profilePref": {
    "specs": [
      "Product Development Team"
    ]
  },
  "session": "e42c03fcd965729a6a84",
  "isCaptuteUserPref": true
}

*/
