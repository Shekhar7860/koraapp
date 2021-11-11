import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import HeaderPostSignUp from './HeaderPostSignUp';
import globalStyle from './styles';
import {useTranslation, withTranslation} from 'react-i18next';
import Indicator from './Indicator';
import {normalize} from '../../utils/helpers';
import {connect} from 'react-redux';

import {ROUTE_NAMES} from '../../navigation/RouteNames';
import * as Constants from '../../components/KoraText';
import BottomText from './BottomText';
import GrideStyleView from './GrideStyleView';
import {profilePreference} from '../../../shared/redux/actions/pre-login.action';
import {TextInput, ScrollView} from 'react-native-gesture-handler';
import {Icon} from '../../components/Icon/Icon';
import {RoomAvatar} from '../../components/RoomAvatar';
import {signinValidate} from '../PreLoginScreens/SigninValidate';

import {
  browseAccount,
  joinAccount,
} from '../../../shared/redux/actions/pre-login.action';

class JoinAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchName: '',
      email: '',
      otherAccountViewMoreState: undefined,
      pendingInvitationsState: undefined,
      userAccounts: [],
      otherAccounts: [],
      session: '',
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.laMod !== this.props.laMod) {
      let userInfo = this.props.user;
      let authorization = this.props.authorization;
      let loginResponse = this.props.loginResponse;
      signinValidate(this.props, {userInfo, authorization, loginResponse});
    }
  }

  componentDidMount() {
    let {route} = this.props;
    let emailId = route?.params?.email || null;

    this.setState({
      email: emailId,
    });

    this.props.browseAccount((obj) => {
      console.log('obj  =========>:', JSON.stringify(obj));
      //{"status":true,"data":{"identity":"nandhu@sathishchalla.testinator.com","profilePref":{"specs":["Kore"]}}}
      if (obj?.data && obj?.data?.errors) {
        let msg = obj?.data?.errors[0].msg || null;
        if (msg) {
          alert(msg);
        }
        return;
      }
      this.setState({
        userAccounts: obj?.data?.userAccounts || [],
        otherAccounts: obj?.data?.otherAccounts || [],
        session: obj?.data?.session,
      });
    });
  }
  signUpPress = () => {
    this.buttonOnPress(ROUTE_NAMES.APP_LANDING_SCREEN);
  };
  loginPress = () => {
    this.buttonOnPress(ROUTE_NAMES.LOGIN_HOME);
  };

  buttonOnPress = (key) => {
    switch (key) {
      case ROUTE_NAMES.LOGIN_HOME:
        this.props.navigation.replace(ROUTE_NAMES.LOGIN, 
            {
                screen:ROUTE_NAMES.LOGIN_HOME
            })
     //   this.props.navigation.navigate(ROUTE_NAMES.LOGIN_HOME)
        break;
    case ROUTE_NAMES.APP_LANDING_SCREEN:
        this.props.navigation.replace(ROUTE_NAMES.LOGIN, 
            {
                screen:ROUTE_NAMES.APP_LANDING_SCREEN
            })
        break;

      default:
        break;
    }
  };
  renderSearchBar() {
    return (
      <View style={styles.inputViewStyle}>
        <Icon name="Contact_Search" color={'#BDC1C6'} size={normalize(16)} />
        <TextInput
          style={styles.textInputStyle}
          onChangeText={(searchName) => {
            this.setState({searchName});
          }}
          placeholder="Search"
          placeholderTextColor="#BDC1C6"
        />
      </View>
    );
  }
  onInviteesClick = ({index, item}) => {
    console.log('clicked ----->:', item);
    if (item?.accountId) {
      let paramsData = {
        accountId: item?.accountId,
        session: this.state.session,
        // emailId: this.email,
      };

      this.props.joinAccount(paramsData, (obj) => {
        console.log('obj  =========>:', JSON.stringify(obj));
        //{"status":true,"data":{"identity":"nandhu@sathishchalla.testinator.com","profilePref":{"specs":["Kore"]}}}
        if (obj?.data && obj?.data?.errors) {
          let msg = obj?.data?.errors[0].msg || null;
          if (msg) {
            alert(msg);
          }
          return;
        }
      });
    }
  };
  showPendingInvites = (item) => {
    // console.log('ITEM', item);
    let members = item?.item?.membersCount;
    if (item?.item?.membersCount > 1) {
      members = item?.item?.membersCount + ' MEMBERS';
    } else {
      members = item?.item?.membersCount + ' MEMBER';
    }
    return (
      <View style={styles.mainView}>
        <View style={styles.view1Style}>
          <View style={{ minWidth: 32 }}>
            <RoomAvatar boardIcon={item?.item.logo} size={32} />
          </View>
          <View style={styles.view2Style}>
            <View style={styles.flexStyle}>
              <Text style={styles.commonTextStyle}>{item.item.name}</Text>
              {item?.item?.membersCount > 0 ? (
                <Text style={styles.membersTextStyle}>{members}</Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={() => this.onInviteesClick(item)}>
              <Text style={styles.joinText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.view3Style}>
          <View style={{ minWidth: 32, marginEnd: 16 }} />
          <Icon name="email" color={'#9AA0A6'} size={normalize(12)} />
        </View>
      </View>
    );
  };

  showOtherAccounts = (item) => {
    console.log('ITEM', item);
    let members = item?.item?.membersCount;
    if (item?.item?.membersCount > 1) {
      members = item?.item?.membersCount + ' MEMBERS';
    } else {
      members = item?.item?.membersCount + ' MEMBER';
    }
    return (
      <View style={styles.mainView}>
      <View style={styles.accountsView}>
        <View style={{ minWidth: 32, }}>
          <RoomAvatar boardIcon={item?.item.logo} size={32} />
        </View>
        <View style={styles.view2Style}>
          <View style={styles.flexStyle}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.commonTextStyle}>{item.item.name}</Text>
              {item?.item?.type === 'private' ? (
                <View style={{ marginLeft: 10 }}>
                  <Icon
                    name={'LockFilled'}
                    size={normalize(16)}
                    color={'#DD3646'}
                  />
                </View>
              ) : null}
            </View>

            {item?.item?.membersCount > 0 ? (
              <Text style={styles.accountsMembers}>{members}</Text>
            ) : null}
          </View>
        </View>
        <TouchableOpacity onPress={() => this.onOtherAccountClick(item)}>
          <Text style={styles.joinText}>
            {item?.item?.type === 'private' ? 'Request access' : 'Join'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    );
  };
  emptyComponent=()=>{

    return(
      <View style={styles.mainView}>
        <Text>No Data</Text>
      </View>
    )
  }
  get checPendingInvCondition() {
    return (this.state.searchName.trim().length < 1 && this.state.pendingInvitationsState && this.state.userAccounts.length > 3);
  }
  get checPendingViewMoreVisible() {
    return (this.state.searchName.trim().length < 1 && this.state.userAccounts.length > 3);
  }
  get getPendindData() {
    if (this.state.searchName.trim().length > 0) {
      var filteredData = this.state.userAccounts?.filter((item) => {
        if (item !== null) {


          if (
            item?.name.toUpperCase().indexOf(this.state.searchName.trim().toUpperCase()) > -1
          )
            return item;
        }

      });
      return filteredData;
    }
    else {
      return this.state.userAccounts;
    }
  }

  pendingInvitations() {
    const {t} = this.props;
    return this.state.userAccounts.length > 0 ? (
      <View style={styles.margin1Style}>
        <Text style={styles.pendingText}>{t('pendingInvitations')}</Text>
        <FlatList
          style={styles.margin2Style}
          data={this.checPendingInvCondition ? this.state.userAccounts.slice(0, 3) : this.getPendindData}
          ListEmptyComponent={this.emptyComponent}
          renderItem={this.showPendingInvites}
        />
          {(this.checPendingViewMoreVisible) &&
          <TouchableOpacity style={styles.viewMore} onPress={() => this.setState({ pendingInvitationsState: !this.state.pendingInvitationsState })}>
            <Text style={styles.viewMoreText}>{this.state.pendingInvitationsState ? t('viewMoreText', { number: this.state.userAccounts?.length - 3 }) : 'View less'}</Text>
            <Icon name={this.state.pendingInvitationsState ? "DownArrow" : "UpArrow"} color={'#202124'} size={normalize(20)} />
          </TouchableOpacity>
        }
      </View>
    ) : null;
  }

  get checOtherCondition() {
    return (this.state.searchName.trim().length < 1 && this.state.otherAccountViewMoreState && this.state.otherAccounts.length > 3);
  }

  get checViewMoreVisible() {
    return (this.state.searchName.trim().length < 1 && this.state.otherAccounts.length > 3);
  }
  get getOtherAccountData() {
    if (this.state.searchName.trim().length > 0) {
      var filteredData = this.state.otherAccounts?.filter((item) => {
        if (item !== null) {


          if (
            item?.name.toUpperCase().indexOf(this.state.searchName.trim().toUpperCase()) > -1
          )
            return item;
        }

      });
      return filteredData;
    }
    else {
      return this.state.otherAccounts;
    }
  }
  otherAccounts() {
    const {t} = this.props;
    return this.state.otherAccounts.length > 0 ? (
      <View style={styles.margin1Style}>
        <Text style={styles.pendingText}>{t('otherAccounts')}</Text>
        <FlatList
          style={styles.margin2Style}
          data={this.checOtherCondition ? this.state.otherAccounts.slice(0, 3) : this.getOtherAccountData}
          ListEmptyComponent={this.emptyComponent}
          renderItem={this.showOtherAccounts}
        />
        {(this.checViewMoreVisible) &&
          <TouchableOpacity style={styles.viewMore} onPress={() => this.setState({ otherAccountViewMoreState: !this.state.otherAccountViewMoreState })}>
            <Text style={styles.viewMoreText}>{this.state.otherAccountViewMoreState ? t('viewMoreText', { number: this.state.otherAccounts.length - 3 }) : 'View less'}</Text>
            <Icon name={this.state.otherAccountViewMoreState ? "DownArrow" : "UpArrow"} color={'#202124'} size={normalize(20)} />
          </TouchableOpacity>
        }
      </View>
    ) : null;
  }

  newAccount() {
    const {t} = this.props;
    return (
      <View
        style={{
          marginVertical: 20,
          padding: 15,
          backgroundColor: '#FFFBEA',
          borderWidth: 1,
          borderColor: '#FFED96',
          borderRadius: 10,
          alignItems: 'center',
        }}>
        <Text style={styles.commonTextStyle}>{t('collaborateWithTeam')}</Text>
        <TouchableOpacity
          style={{
            marginTop: 15,
            paddingHorizontal: 20,
            paddingVertical:13,
            backgroundColor: '#FFDA2D',
            borderRadius: 4,
          }}>
          <Text style={{fontWeight: '500', fontSize: normalize(16)}}>
            {t('createAccount')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    const {t} = this.props;
    return (
      <SafeAreaView style={styles.root}>
        <ScrollView>
          <HeaderPostSignUp appName={false} nextButton={false} />
          <View style={globalStyle.globalInnerRootStyle}>
            <View style={styles.v1}>
              <View>
                <Indicator position={2}></Indicator>
              </View>

              <Text style={styles.nameStyle}>{t('findAndJoin')}</Text>
              <Text style={styles.welcomeStyle}>{t('chooseAccount')}</Text>
              {this.renderSearchBar()}
              {this.pendingInvitations()}
              {this.newAccount()}
              {this.otherAccounts()}
              <View style={styles.bottomView}>
                <BottomText
                  email={this.state.email}
                  signUpPress={this.signUpPress}
                  loginPress={this.loginPress}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  bottomView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    //position: 'absolute',
    bottom: 0,
    justifyContent: 'flex-start',
  },
  margin1Style: { marginVertical: 20 },
  margin2Style: { marginTop: 10 },
  flexStyle: { flex: 1 },
  backgroundAccount: {
    minHeight: 40,
    borderRadius: 4,
    marginEnd: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
    marginBottom: 10,
  },
  joinText: {
    fontWeight: '500',
    fontSize: normalize(14),
    color: '#0D6EFD',
  },
  membersTextStyle: {
    paddingVertical: 4,
    fontSize: normalize(12.5),
    fontWeight: '500',
    color: '#9AA0A6',
  },
  accountsMembers: {
    paddingTop: 7,
    fontSize: normalize(12.5),
    fontWeight: '500',
    color: '#9AA0A6',
  },
  viewMore: {
    padding: 10,

    flexDirection: 'row',
    alignItems: 'center',
  },
  viewMoreText: {
    fontWeight: '400',
    fontSize: normalize(14),
    marginRight: 7,

    textAlignVertical: 'center',

  },
  view3Style: { paddingTop: 2, flexDirection: 'row' },
  view2Style: {
    marginLeft: 16,
    flex: 1,
    flexDirection: 'row',

  },
  view1Style: {


    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  accountsView: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  mainView: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E4E5E7',
    borderRadius: 10,
    minHeight:60,
    justifyContent:'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: 7,
  },
  accountText: {
    color: '#5F6368',
    fontSize: normalize(16),
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: 0.3,
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
  },
  root: { flex: 1, backgroundColor: '#ffffff' },
  v1: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  pendingText: {
    fontWeight: '600',
    fontSize: normalize(16),
  },
  nameStyle: {
    //marginTop: 30,
    color: '#202124',
    lineHeight: 25,
    fontWeight: '500',
    fontSize: normalize(18),
    letterSpacing: 0.1,
    fontStyle: 'normal',
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
  },
  welcomeStyle: {
    marginTop: 10,
    color: '#5F6368',
    fontWeight: '400',
    fontSize: normalize(18),
    letterSpacing: 0.1,
    fontStyle: 'normal',
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
  },
  inputViewStyle: {
    flexDirection: 'row',
    marginTop: 15,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#BDC1C6',
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  textInputStyle: {
    marginLeft: 8,
    fontSize: normalize(14),
    fontWeight: '400',
    minHeight: 34,
    flex: 1,

  },
  commonTextStyle: {
    fontSize: normalize(14),
    fontWeight: '500',
    color: '#202124',
  },
});

const mapStateToProps = (state) => {
  let {auth} = state;
  return {
    user: auth.user,
    loginResponse: auth.loginResponse,
    authorization: auth.authorization,
    laMod: auth.laMod,
  };
};

export default connect(mapStateToProps, {
  browseAccount,
  joinAccount,
})(withTranslation()(JoinAccount));
