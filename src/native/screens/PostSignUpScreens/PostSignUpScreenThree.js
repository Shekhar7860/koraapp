import React from 'react';
import { View, Text, StyleSheet, TextInput, SafeAreaView } from 'react-native';
import HeaderPostSignUp from './HeaderPostSignUp';
import globalStyle from './styles';
import { useTranslation, withTranslation } from 'react-i18next';
import Indicator from './Indicator';
import BottomText from './BottomText';
import { normalize } from '../../utils/helpers';
import { Icon } from '../../components/Icon/Icon.js';
import { ROUTE_NAMES } from '../../navigation/RouteNames';
import * as Constants from '../../components/KoraText';
import GrideStyleView from './GrideStyleView';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import UserAvatar from '../../components/Library/react-native-user-avatar/src';
import Attach from '../../components/Attachment.js';

import { BottomUpModal } from '../../components/BottomUpModal';
import ActionItemBottomSheet from '../../components/BottomUpModal/ActionItemBottomSheet';
//import FileUploadTask from '../../screens/FileUploader/FileUploadTask.js';
import ImageResizer from 'react-native-image-resizer';
import RNFetchBlob from 'rn-fetch-blob';
import { isAndroid, isIOS } from '../../utils/PlatformCheck';
import MultipartData from '../../screens/FileUploader/MultipartData'; //MultipartData';

const sheetIds = {
  CHANGE_COLOR: 'CHANGE_COLOR',
  CLICK_PICKTURE: 'CLICK_PICKTURE',
  SELECT_GALLERY: 'SELECT_GALLERY',
};

const sheetOptionsList = [
  {
    //don't change this id
    id: sheetIds.CHANGE_COLOR,
    text: 'Change colour',
    icon: 'Color-Picker',
  },
  {
    id: sheetIds.CLICK_PICKTURE,
    text: 'Click a picture',
    icon: 'kr-cam',
  },
  {
    id: sheetIds.SELECT_GALLERY,
    text: 'Select picture from Gallery',
    icon: 'Grid-View',
  },
];

import { signinValidate } from '../PreLoginScreens/SigninValidate';
import {
  createAccount,
  createTokenForAccount,
} from '../../../shared/redux/actions/pre-login.action';
import { connect } from 'react-redux';

class PostSignUpSelectionThree extends React.Component {
  //reminderModalRef = React.useRef();

  accountName = '';
  email = '';
  formData = null;
  constructor(props) {
    super(props);

    this.state = {
      accountName: '',
      email: '',
      color: 'blue',
    };
  }

  componentDidMount() {
    let { route } = this.props;
    this.accountName = route?.params?.accountName || '';
    this.email = route?.params?.email || '';
    this.setState({
      email: this.email,
      accountName: this.accountName,
      color: '#7027E5',
      currentIndicator: (route?.params?.currentIndicator + 1),
      totalIndicator: route?.params?.totalIndicator
    });
    //logo: {type: 'emoji', val: {category: 'symbols', unicode: '2665'}}
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.pwdLogin !== this.props.pwdLogin) {
      //{"errors":[{"msg":"INVALID_CREDENTIALS","code":40}]}
      if (this.props.pwdLogin?.errors) {
        let msg = this.props.pwdLogin?.errors[0].msg || null;
        if (msg) {
          alert(msg);
        }
      }
    }

    if (prevProps.laMod !== this.props.laMod) {
      let userInfo = this.props.user;
      let authorization = this.props.authorization;
      let loginResponse = this.props.loginResponse;
      signinValidate(this.props, { userInfo, authorization, loginResponse });
    }
  }

  getAvatarName(productName) {
    let name = productName?.toUpperCase().split(' ') || '';
    if (name.length === 1) {
      name = `${name[0].charAt(0)}`;
    } else if (name.length > 1) {
      name = `${name[0].charAt(0)}${name[1].charAt(0)}`;
    } else {
      name = '';
    }
    return name;
  }

  doneButtonPress = () => {
    this.props.navigation.navigate(ROUTE_NAMES.CONTACT_INVITEE_SCREEN, {
      accountName: this.accountName,
      email: this.email,
      logo: {
        type: 'emoji',
        val: {
          category: 'people',
          unicode: '1f642',
        },
      },
      currentIndicator: this.state.currentIndicator,
      totalIndicator: this.state.totalIndicator,
      // logo: this.formData
      //   ? this.formData.toString()
      //   : {color: this.state.color},
    });
  };

  doneButtonPress_old = () => {
    //alert('Done clicked');
    this.logo = this.formData
      ? this.formData.toString()
      : { type: 'emoji', val: { category: 'symbols', unicode: '2665' } };
    let loginResponse = this.props.loginResponse;
    let payload = {
      accountName: this.accountName,
      logo: this.logo,
      type: 'private',
      emailId: this.email,
      invitees: [],
    };

    let params = {
      payload: payload,
      session: loginResponse?.session,
    };

    console.log('payload ---->:', payload);
    //this.props.createAccount(payload);

    this.props.createAccount(params, (obj) => {
      console.log('obj  =========>:', JSON.stringify(obj));
      //{"status":true,"data":{"identity":"nandhu@sathishchalla.testinator.com","profilePref":{"specs":["Kore"]}}}
      if (obj?.data && obj?.data?.errors) {
        let msg = obj?.data?.errors[0].msg || null;
        if (msg) {
          alert(msg);
        }
        return;
      }
      let payloadData = {
        accountId: obj.data?.accountId,
      };
      let paramsData = {
        accountId: obj.data?.accountId,
        session: loginResponse?.session,
        emailId: this.email,
      };
      //{"status":true,"data":{"success":true,"accountId":"ac-8b025a24-97eb-50df-aff0-61f07f2cffa2"}}
      this.props.createTokenForAccount(paramsData);
      //this.nextButtonPress(obj?.data?.identity);
    });
  };
  // nextButtonPress = () => {
  //     alert('next click')
  //     //this.props.navigation.navigate(ROUTE_NAMES.CONTACT_INVITEE_SCREEN);
  //     this.props.navigation.navigate(ROUTE_NAMES.CONTACT_INVITEE_SCREEN,{
  //         accountName : this.accountName,
  //         email: this.email,
  //         logo: {type: 'emoji', val: {category: 'symbols', unicode: '2665'}}
  //     });
  // }
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

  updateDataColor = (color) => {
    console.log('Selected data', color);
    this.setState({ color: color });
  };
  optionSelected = (id) => {
    if (id === sheetIds.CHANGE_COLOR) {
      this.props.navigation.navigate(ROUTE_NAMES.COLOR_SELECTION_SCREEN, {
        updateDataColor: this.updateDataColor.bind(this),
        accountName: this.state.accountName,
        color: this.state.color,
        email: this.state.email,
      });
    } else if (id === sheetIds.CLICK_PICKTURE) {
      this.onCameraClick(7);
    } else {
      this.onCameraClick(10);
    }
    this.closeSheet();
  };
  renderSheet() {
    return (
      <BottomUpModal
        ref={(reminderModalRef) => (this.reminderModalRef = reminderModalRef)}
        height={480}>
        <View style={styles.bottomUpModal4} />
        <ActionItemBottomSheet title={'Account picture'} itemType={'header'} />
        <View
          style={{
            height: 1,
            backgroundColor: '#EFF0F1',
          }}></View>
        {sheetOptionsList.map((option) => (
          <ActionItemBottomSheet
            title={option.text}
            iconName={option.icon}
            id={option.id}
            optionSelected={this.optionSelected}></ActionItemBottomSheet>
        ))}
      </BottomUpModal>
    );
  }

  closeSheet() {
    this.reminderModalRef.closeBottomDrawer();
  }
  openSheet = () => {
    this.reminderModalRef.open();
  };
  onCameraClick = (key) => {
    this.refs.attachments.handleItemClick({ key: key });
  };

  async getImageFormData(uri, width, height, fileName) {
    ImageResizer.createResizedImage(
      uri,
      width,
      height,
      'JPEG',
      100,
      0,
      null,
      false,
      { mode: 'cover', onlyScaleDown: false },
    )
      .then((response) => {
        //this.getThumbnailChunk(response.path, response.size);
        let path = response.path;
        let size = response.size;
        console.log(
          'ImageResizer.createResizedImag response ----->:',
          response,
        );
        // let self = this;
        RNFetchBlob.fs
          .readStream(
            (isIOS ? '' : 'file://') + path.replace('file://', ''),
            'base64',
            size,
          )
          .then((ifstream) => {
            ifstream.open();

            ifstream.onData((streemData) => {
              console.log('streemData  ----->:', streemData);
              // this.formData = new MultipartData();
              // this.formData.append('totalChunks', totChunks);
              //this.formData.append('messageToken', _self.fileInfo.fileToken);
              // let fileType = fileName?.split('.').pop().toLowerCase();
              // this.formData.append('fileExtension', fileType);
              // this.formData.append('filename', fileName);
              // this.formData.append('fileContext', 'icon');
              // this.formData.append('', {
              //   data: chunk,
              //   fileName: fileName,
              //   mimeType: 'image/png',
              // });
              // console.log('formData  ----->:', this.formData.toString());
            });

            ifstream.onError((e) => {
              console.log('Error : ', e);
            });

            ifstream.onEnd(() => { });
          });
      })
      .catch((err) => {
        console.log('ImageResizer error :', err);
      });
  }

  render() {
    const { t } = this.props;

    return (
      <SafeAreaView style={styles.root}>
        {this.renderSheet()}

        <HeaderPostSignUp
          appName={false}
          done={this.doneButtonPress}
          nextButton={true}
          text={'Next'}
        />

        <View style={globalStyle.globalInnerRootStyle}>
          <View style={styles.v1}>
            <View>
              <Indicator position={this.state.currentIndicator} totalIndicator={this.state.totalIndicator}></Indicator>
            </View>
            <Text style={styles.nameStyle}>{t('giveYoutAccount')}</Text>
            <Text style={styles.welcomeStyle}>{t('giveYoutAccountDesc')}</Text>

            <View style={styles.viewAvatar}>
              <TouchableOpacity onPress={this.openSheet}>
                <UserAvatar
                  color={this.state.color}
                  name={this.state.accountName}
                  size={normalize(120)}
                  borderRadius={100}
                  textStyle={styles.avatarText}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.bottomView}>
              <BottomText
                email={this.state.email}
                signUpPress={this.signUpPress}
                loginPress={this.loginPress}
              />
            </View>

            <View>
              <Attach
                ref="attachments"
                cameraAction={(images) => {
                  console.log(
                    '-------------------------->',
                    JSON.stringify(images),
                  );
                  //  this.handleCameraActionFromAttachment(images);
                  let path = images[0].path;
                  let fileName = images[0].filename;
                  let width = 320;
                  let height = 240;
                  this.getImageFormData(path, width, height, fileName);
                }}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  viewAvatar: { width: '100%', alignItems: 'center', marginTop: 30 },
  gridStyle: { marginVertical: 10 },
  avatarText: {
    color: '#FFFFFF',
    padding: 0,
    alignSelf: 'center',
    textAlign: 'center',
    fontWeight: '200',
    fontSize: normalize(60),
    fontStyle: 'normal',
    textAlignVertical: 'center',
    alignSelf: 'center',

    fontFamily: Constants.fontFamily,
  },

  root: { flex: 1 },
  bottomView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    position: 'absolute',
    bottom: 0,
    justifyContent: 'flex-start',
  },
  v1: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  bottomUpModal4: { padding: 10 },
  nameStyle: {
    marginTop: 30,
    color: '#202124',
    fontWeight: '600',
    fontSize: normalize(18),

    fontStyle: 'normal',
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
  },

  welcomeStyle: {
    marginTop: 10,
    color: '#5F6368',
    fontWeight: '400',
    fontSize: normalize(18),

    fontStyle: 'normal',
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
  },
});

//export default (withTranslation()(PostSignUpSelectionThree));

const mapStateToProps = (state) => {
  let { login, auth, language } = state;
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
  createAccount,
  createTokenForAccount,
})(withTranslation()(PostSignUpSelectionThree));
