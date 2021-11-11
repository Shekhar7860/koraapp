import React from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  Text,
  StyleSheet,
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { connect } from 'react-redux';
import Toast from 'react-native-simple-toast';
import { debounce } from 'lodash';
import ToggleSwitch from 'toggle-switch-react-native';
import { withTranslation, useTranslation } from 'react-i18next';
import * as Constants from '../../../components/KoraText';
import { Icon } from '../../../components/Icon/Icon';
import { Header } from '../../../navigation/TabStacks';
import {
  updateDiscussion,
  checkEmailAvailability,
} from '../../../../shared/redux/actions/discussions.action';
import { normalize } from '../../../utils/helpers';
import { CHECK_EMAIL_AVAILABILITY_SUCCESSFUL } from '../../../../shared/redux/constants/discussions.constants';
import { CHECK_EMAIL_AVAILABILITY_LOADER } from '../../../../shared/redux/constants/native.constants';
import { Loader } from '../../ChatsThreadScreen/ChatLoadingComponent';
class PostViaEmail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      edit: false,
      inputValue: '',
      aliasMail: '',
      toggleOn: this.props.route.params.board?.isEmailEnabled,
      board: {},
      friendlyAliasEmailId:''
    };
  }

  get board() {
    return this.props.route.params.board;
  }
  subscribeBoard=async()=>{
    try {
     // const workspace= await workSpaceCollection.find(wsId);
        this.boardObservable= this.board.observe();
        this.boardSubscription = this.boardObservable.subscribe((board) => {
          this.setState({board: board,   toggleOn: board?.isEmailEnabled,
          friendlyAliasEmailId:board?.emailId || board?.friendlyAliasEmailId || ''
        });
      });
  }
  catch(e)
  {
  }
  }

  componentWillUnmount() {
 
    if (this.boardSubscription && this.boardSubscription.unsubscribe) {
      this.boardSubscription.unsubscribe();
    }
  }
  componentDidMount() {
    this.setState({ board: this.board,
      friendlyAliasEmailId:this.board?.friendlyAliasEmailId || this.board.emailId });
    this.subscribeBoard();
  /*   this.board?.addListener &&
      this.board?.addListener((b) => {
        this.setState({
          toggleOn: b?.isEmailEnabled,
          board: b,
        });
      }); */
    const emailId =
      this.state.friendlyAliasEmailId|| '';

    this.setState({ inputValue: emailId?.split('@')[0] || '' });
    this.props.clearEmailAvailablityFlag();
  }

  postviaEmail(val) {
   // alert(val)
   this.setState({ toggleOn: val });
    this.setState({ edit: false });
    let _params = {
      wsId: this.state.board?.wsId,
      rId: this.state.board?._id,
    };
    let settings = this.state.board || {};

    let payload = {
      isEmailEnabled: val,
    };
    this.props.updateDiscussion(_params, payload, null, true);
  }

  updateEmailId() {
    let _params = {
      wsId: this.state.board?.wsId,
      rId: this.state.board?._id,
    };
    let payload = {
      friendlyAliasEmailId: (this.state.inputValue + '@' + this.domainId).toLocaleLowerCase(),
    };
    if (
      this.props.status !== 'available' ||
      this.props.checkingEmailAvailablity
    ) {
      return;
    }
   
    this.setState({friendlyAliasEmailId:payload?.friendlyAliasEmailId})
    this.props.updateDiscussion(_params, payload, true);
  }

  checkEmailAvailability = debounce((value) => {
    let mail = value + '@' + this.domainId;
    // this.setState({aliasMail: mail});
    let _params = {
      emailId: mail,
      rId: this.state.board?._id,
    };
    //this.validateEmail(value);
    this.props.checkEmailAvailability(_params);
  }, 500);
  // validateEmail=(val)=> {
  //     let mailformat = /^[_A-z0-9]*((-|\.)*[_A-z0-9])*$/;
  //     if(val.match(mailformat)) {
  //       this.setState({validEmail: true, emptyMail:false})
  //     } else {
  //        this.setState({validEmail: false, emptyMail:false})
  //     }
  // }

  get domainId() {
    try {
      return (
        this.state.board?.emailId?.split('@')[1] ||
        this.state.board?.friendlyAliasEmailId?.split('@')[1]
      );
    } catch (e) {
      return '';
    }
  }

  onChangeText = (value) => {
    this.setState({ inputValue: value }, () =>
      this.checkEmailAvailability(value),
    );
  };

  singleTickOnpress = () => {
    if (
      this.props.status === 'available' &&
      this.state.inputValue !== '' &&
      !this.props.checkingEmailAvailablity
    ) {
      this.updateEmailId();
      this.setState({ edit: false, inputValue: '' });
    }
  };

  editOnPress = () => {
    this.props.clearEmailAvailablityFlag();
    this.setState({ edit: true });
  };

  copyOnPress = () => {
    const emailId =
      this.state.friendlyAliasEmailId || this.state.board?.emailId;
    Clipboard.setString(emailId || '');
    Toast.showWithGravity('Copied', Toast.SHORT, Toast.BOTTOM);
  };

  onToggle = (val) => {
    this.postviaEmail(val);
  };

  render() {
    const { t } = this.props;
    const postviaEmail = this.state.toggleOn;
    const emailId =
      this.state.friendlyAliasEmailId;
    return (
      <View style={styles.rootContainer}>
        <Header
          title="Post via Email"
          goBack={true}
          navigation={this.props.navigation}
        />

        <View style={styles.a1}>
          <View style={styles.mainContainer}>
            <Text style={styles.postViaEmailTextStyle}>
              {t('Allow to post via email')}
            </Text>

            <View>
              <ToggleSwitch
                onColor="#0D6EFD"
                offColor="#FFFFFF"
                isOn={this.state.toggleOn}
                thumbOffStyle={styles.thumbOffStyle}
                trackOffStyle={styles.trackOffStyle}
                trackOnnStyle={styles.trackOnnStyle}
                onToggle={this.onToggle}
                size="small"
              />
            </View>
          </View>
          {postviaEmail && this.state.edit === false ? (
            <View style={styles.marginTop10}>
              <Text style={styles.postTextStyle}>
                {t(
                  'Allow people to post unstructured posts,templated post or not at all based on their team membership level',
                )}
              </Text>
              <View style={styles.emailIdContainer}>
                <Text numberOfLines={1} style={styles.emailIdTextStyle}>
                  {emailId}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.copyContainer}
                onPress={this.copyOnPress}>
                <Icon name={'Copy'} size={25} />
                <Text style={styles.emailAddressTextStyle}>
                  {t('Copy email address')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editMailAddress}
                onPress={this.editOnPress}>
                <Icon name={'edit'} size={25} />
                <Text style={styles.emailAddressTextStyle}>
                  {t('Edit email address')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : postviaEmail && this.state.edit === true ? (
            <View style={styles.marginTop10}>
              <Text style={styles.postTextStyle}>
                {t(
                  'Allow people to post unstructured posts,templated post or not at all based on their team membership level',
                )}
              </Text>
              <View style={styles.editMailContainer}>
                <View style={{ flexDirection: 'row', flex: 1, flexShrink: 1, paddingStart: 15 }}>
                  <TextInput
                    placeholder="something"
                    value={this.state.inputValue}
                    onChangeText={this.onChangeText}
                    style={styles.textInputStyle}
                  />
                  <Text
                    lineBreakMode={'middle'}
                    numberOfLines={1}
                    style={styles.textStyle}>
                    {'@' + this.domainId}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.padding20}
                  onPress={this.singleTickOnpress}>
                  <Icon
                    name={'SingleTick'}
                    color={
                      this.props.status === 'available' &&
                        !this.props.checkingEmailAvailablity
                        ? '#28A745'
                        : 'black'
                    }
                    size={18}
                  />
                </TouchableOpacity>
              </View>
              {this.renderApiCallStatus()}
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  renderApiCallStatus() {
    const { t } = this.props;
    const emailId = this.state.friendlyAliasEmailId || this.board.emailId;
    if (this.props.checkingEmailAvailablity === true) {
      return <Loader />;
    }
    return (
      <>
        {this.props.status === 'available' &&
          this.state.inputValue !== '' &&
          this.state.inputValue !== emailId ? (
          <View style={styles.statusContainer}>
            <Icon name={'Checked'} size={22} color={'#28A745'} />
            <Text style={styles.availableTextStyle}>
              {t('Email address available')}
            </Text>
          </View>
        ) : null}
        {this.props.status === 'unavailable' &&
          this.state.inputValue !== emailId ? (
          <View style={styles.statusContainer}>
            <Icon name={'kr-close'} size={22} color={'#dd3646'} />
            <Text style={[styles.availableTextStyle, { color: '#dd3646' }]}>
              {t('Email address not available')}
            </Text>
          </View>
        ) : null}
      </>
    );
  }
}

const styles = StyleSheet.create({
  a1: { flex: 1 },
  statusContainer: { flexDirection: 'row', padding: 15 },
  rootContainer: { backgroundColor: 'white', flex: 1 },
  copyContainer: {
    alignItems: 'center',
    paddingHorizontal: 15,
    flexDirection: 'row',
    borderBottomWidth: 1,
    height: 60,
    borderBottomColor: '#EFF0F1',


  },
  emailIdContainer: {
    height: 60,
    alignItems: 'center',
    paddingHorizontal: 15,

    // paddingStart: 20,
    flexDirection: 'row',
    borderTopColor: '#EFF0F1',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderBottomColor: '#EFF0F1',
    marginTop: 25,
  },
  thumbOffStyle: { backgroundColor: '#BDC1C6' },
  trackOffStyle: { borderWidth: 0.9, borderColor: '#BDC1C6' },
  trackOnnStyle: { borderWidth: 0.9, borderColor: '#BDC1C6' },
  marginTop10: { marginTop: 10, flex: 1, },
  padding20: {
    padding: 15,


  },
  editMailAddress: {
    alignItems: 'center',
    paddingHorizontal: 15,
    flexDirection: 'row',
    borderBottomWidth: 1,
    height: 60,
    borderBottomColor: '#EFF0F1',

  },
  editMailContainer: {
    height: 60,





    alignItems: 'center',
    flexDirection: 'row',
    borderTopColor: '#EFF0F1',
    borderBottomWidth: 1,
    borderTopWidth: 1,

    borderBottomColor: '#EFF0F1',
    marginTop: 25,
  },
  mainContainer: {
    flexDirection: 'row',
    marginTop: 20,

    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',

  },
  postViaEmailTextStyle: {
    color: '#202124',
    flex: 1,
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  postTextStyle: {
    color: '#9AA0A6',
    paddingHorizontal: 15,

    fontWeight: '400',
    fontSize: normalize(16),

    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  emailIdTextStyle: {
    color: '#3C4043',
    flex: 1,
    paddingHorizontal: 1,
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  emailAddressTextStyle: {
    color: '#202124',
    paddingStart: 15,
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  textInputStyle: {

    fontWeight: '400',
    fontSize: normalize(15),
    flexShrink: 1,
    paddingVertical: 0,

    fontStyle: 'normal',


    fontFamily: Constants.fontFamily,
  },
  textStyle: {
    fontSize: normalize(15),
    flexShrink: 1,
    color: '#3C4043',
    fontWeight: '400',

    minWidth: '25%',
    alignSelf: 'center',
    // fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  availableTextStyle: {
    color: '#28A745',
    marginStart: 10,
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
});

const mapStateToProps = (state, ownProps) => {
  const { discussion, native } = state;
  // const board = discussion.allDiscussions?.boards?.find(
  //   (board) => board.id === ownProps.route.params.board.id,
  // );

  return {
    // selectedBoard: board,
    status: discussion?.checkEmailAvailable?.status,
    checkingEmailAvailablity: native?.loaders[CHECK_EMAIL_AVAILABILITY_LOADER],
  };
};

//export default PostViaEmail;
export default connect(mapStateToProps, {
  updateDiscussion,
  checkEmailAvailability,
  clearEmailAvailablityFlag: () => {
    return {
      type: CHECK_EMAIL_AVAILABILITY_SUCCESSFUL,
      payload: { checkEmailAvailable: {} },
    };
  },
})(withTranslation()(PostViaEmail));
