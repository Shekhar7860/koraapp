import React, {Component} from 'react';
import {withTranslation} from 'react-i18next';
import {connect} from 'react-redux';
import {StyleSheet, TouchableOpacity, View, Alert, Image} from 'react-native';
import {StackActions} from '@react-navigation/native';
import uuid from 'react-native-uuid';
import DeviceInfo from 'react-native-device-info';
import {Q} from '@nozbe/watermelondb';

import {Icon} from '../components/Icon/Icon.js';
import {Text} from '../components/KoraText';
import {getTimeline, normalize} from '../utils/helpers';
import {Avatar} from '../components/Icon/Avatar';
import * as UsersDao from '../../dao/UsersDao';
import {KoraToggleSwitch} from '../components/toggleButton';
import {SvgIcon} from '../components/Icon/SvgIcon.js';
import * as ProfileDao from '../../dao/ProfileDao';
import {
  updateDNDProfile,
  updateProfileIcon,
  refreshImage,
} from '../../shared/redux/actions/auth.action';
import {Header} from '../navigation/TabStacks';
import {ScrollView} from 'react-native-gesture-handler';
import {APP_NAME} from '../utils/AppConstants';
import Attach from '../components/Attachment.js';
import Camera from '../components/CameraModal.js';
import {store} from '../../shared/redux/store';
import userAuth from '../../shared/utils/userAuth.js';
import FileUploadTask from './FileUploader/FileUploadTask.js';
import * as MessagesDao from '../../dao/MessagesDao.js';
import {Loader} from './ChatsThreadScreen/ChatLoadingComponent';
import {ActivityIndicator} from 'react-native-paper';
import AccountManager from '../../shared/utils/AccountManager.js';
import database from '../../native/realm';
import * as Entity from '../../native/realm/dbconstants';
import {ROUTE_NAMES} from '../../native/navigation/RouteNames';
import {getCurrentScreenName, navigate} from '../navigation/NavigationService';
import {BottomUpModal} from '../components/BottomUpModal';

import {unsubscribeForPushNotifications} from '../../shared/redux/actions/home.action';
import { dataTrack } from '../../helpers/mixpanel-helper.js';
const options = [
  {text: '30 Mins'},
  {text: '1 Hour'},
  {text: '24 Hours'},
  {text: 'Always on'},
];

class ProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.permissionLevel = React.createRef();
    this.init();
    this.state = {
      nPrefs: [],
      isDND: false,
      DNDTimer: '',
      endsAt: '',
      profile: null,
      appLoading: false,
      updateProfile: '',
      isLoding: false,
    };
    let userId = UsersDao.getUserId();
    this.subscribeProfile(userId);
  }

  subscribeProfile = async (userId) => {
    try {
      if (this.profileSubscription && this.profileSubscription.unsubscribe) {
        this.profileSubscription.unsubscribe();
      }
      const db = database.active;

      const profile = await db.collections.get(Entity.Profiles).find(userId);

      const observable = profile.observe();
      this.profileSubscription = observable.subscribe((data) => {
        this.validate(data);
      });
    } catch (e) {
      console.log('error in subscribeWorkspace', e);
    }
  };

  componentWillUnmount() {
    if (this.profileSubscription && this.profileSubscription.unsubscribe) {
      this.profileSubscription.unsubscribe();
    }
  }

  init = async () => {
    let account = AccountManager.getCurrentAccount();
    let user = account.getUser();
    let userId = user?.id;
    let record = null;
    try {
      const db = database.active;
      const profilesCollection = db.collections.get(Entity.Profiles);
      const [profile] = await profilesCollection
        .query(Q.where('id', Q.eq(userId)))
        .fetch();
      record = profile;
      this.validate(profile);
    } catch (e) {
      console.log(e);
    }
  };

  // componentDidUpdate(prevState) {
  //   let self = this;
  //   if (prevState.profile !== this.state.profile) {
  //     this.validate(this.state.profile);
  //   }
  // }

  validate(profile) {
    const diffTime = profile?.nPrefs?.dndTill - new Date().getTime();
    if (profile?.nPrefs?.dndTill) {
      let dnd = '';

      if (
        profile?.nPrefs?.dndTill !== -1 &&
        (profile?.nPrefs?.dndTill === 0 || diffTime < 30000)
      ) {
        //off
        this.setState({
          isDND: false,
          profile: profile,
          endsAt: null,
        });
      } else {
        if (profile?.nPrefs?.dndTill === -1) {
          dnd = 'Always on';
        }
        this.setState({
          DNDTimer: dnd,
          endsAt: getTimeline(new Date(profile?.nPrefs?.dndTill), 'post'),
          isDND: true,
          profile: profile,
        });
      }
    } else {
      this.setState({
        isDND: false,
        profile: profile,
        endsAt: null,
      });
    }

    this.setState({
      isLoding: false,
    });
  }

  componentDidMount() {
    ProfileDao.getProfile(UsersDao.getUserId())
      .then((profile) => {
        self.validate(profile);
      })
      .catch(() => {});
  }

  getDNDTime(date, time) {
    let minutes = this.getMinutes(time);
    let DNDTime = new Date(date.getTime() + minutes * 60000);
    return DNDTime.getTime();
  }

  addMinutes(date, time) {
    let minutes = this.getMinutes(time);
    let DNDTime = new Date(date.getTime() + minutes * 60000);
    if (time === '24 Hours') {
      this.setState({endsAt: getTimeline(DNDTime, 'post')});
    } else {
      this.setState({endsAt: getTimeline(DNDTime, 'time')});
    }
  }

  getMinutes(value) {
    switch (value) {
      case '30 Mins':
        return 30;
        break;
      case '1 Hour':
        return 60;
        break;
      case '24 Hours':
        return 1440;
        break;
      default:
        return 0;
    }
  }
  renderAvailable() {
    const {t} = this.props;
    return (
      <View style={[styles.frame12, {alignItems: 'center'}]}>
        <SvgIcon name="Online" />
        <Text style={{...styles.text1, marginLeft: 14}}>{t('Available')}</Text>
      </View>
    );
  }

  renderToggleMode(isDND) {
    this.setState({isLoding: true});
    if (!isDND) {
      let payload = {
        nPrefs: {dndTill: isDND ? -1 : new Date().getTime()},
      };
      this.props.updateDNDProfile(this.state.profile?.id, payload);
    } else {
      this.modifyDND(options[3]);
      //this.setState({isLoding: true});
      // this.setState({isDND: isDND, DNDTimer: options[3].text});
      // setTimeout(() => {}, 1000);
    }
  }

  toggleDNDMode() {
    const {t} = this.props;
    return (
      <TouchableOpacity
        disabled={this.state.isLoding}
        style={styles.frame2}
        onPress={
          this.state.isLoding
            ? null
            : () => {
                if (!this.state.isLoding) {
                  this.renderToggleMode(!this.state.isDND);
                }
              }
        }>
        <Icon name="DarkMode" size={normalize(24)} color="#202124" />
        <Text style={styles.text1}>{t('Do Not Disturb')}</Text>
        {this.state.isLoding && (
          <ActivityIndicator
            style={{
              marginStart: 10,
            }}
            size={12}
          />
        )}
        <View style={styles.toggleView}>
          <View style={styles.flexDirectionStyle}>
            <KoraToggleSwitch
              isToggleOn={this.state.isDND}
              onChange={(isDND) => {
                if (!this.state.isLoding) {
                  this.renderToggleMode(isDND);
                }
              }}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  renderDNDOptions() {
    const {t} = this.props;
    let {isDND, DNDTimer, endsAt} = this.state;
    return (
      <View>
        {endsAt ? (
          <Text style={styles.timeText}>
            {DNDTimer === 'Always on'
              ? 'Always on'
              : t('Turns off at {{context}}', {context: endsAt})}
          </Text>
        ) : null}
        <View style={styles.frame5}>
          {options.map((item, index) => {
            let isSelected = DNDTimer === item.text;
            return (
              <TouchableOpacity
                key={index}
                style={styles.optionsView}
                onPress={() => {
                  this.modifyDND(item);
                }}>
                <Text style={styles.optionText}>{item.text}</Text>
                <View style={styles.optionText1}>
                  {isSelected ? (
                    <SvgIcon name="Selected" />
                  ) : (
                    <SvgIcon name="Unselected" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        {/* <View style={styles.frame3}>
          <Text style={styles.preference}>{t('Preferences')}</Text>
        </View> */}
      </View>
    );
  }

  modifyDND = (item) => {
    this.setState({DNDTimer: item.text});
    const date = new Date();
    this.addMinutes(date, item.text);
    let payload = {
      nPrefs: {
        dndTill:
          item.text === 'Always on' ? -1 : this.getDNDTime(date, item.text),
      },
    };
    this.props.updateDNDProfile(this.state.profile?.id, payload);
  };
  broseAccounts = () => {
    this.props.navigation.navigate(ROUTE_NAMES.POST_SIGN_UP_HOME, {
      screen: ROUTE_NAMES.BROWSE_ACCOUNT,
      params: {
        screen: ROUTE_NAMES.BROWSE_ACCOUNT,
        // email: response?.loginResponse?.emailId,
      },
    });
  };
  showlogoutModal() {
    return (
      <BottomUpModal
        ref={(y) => {
          this.logoutModal = y;
        }}
        height={250}>
        <View style={styles.flexDirectionStyle}>
          <View style={styles.view1Style}>
            <Text style={styles.logoutTextStyle}>
              {'Are you sure you want to logout?'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              this.logoutModal.closeBottomDrawer();
              this.logout();
            }}
            style={{paddingHorizontal: 15}}>
            <View style={styles.view2Style}>
              <Text style={styles.logoutTitle}>{'Yes'}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.logoutModal.closeBottomDrawer();
            }}
            style={{paddingHorizontal: 15}}>
            <View style={styles.view3Style}>
              <Text style={{...styles.cancelText, color: '#202124'}}>
                {'Cancel'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </BottomUpModal>
    );
  }

  logout = () => {
    try {

      dataTrack(
        true,
        UsersDao.getUser(),
        'Successful Logout',
      );

      this.props.unsubscribeForPushNotifications();
      UsersDao.deleteAll().then(() => {
        setTimeout(() => {
          this.props.navigation.dispatch(StackActions.replace('Login'));
        }, 0);
      });
    } catch (error) {
      console.log(error);
    }
  };

  onCameraClick = () => {
    this.refs.attachments.handleItemClick({key: 1});
  };

  async handleCameraActionFromAttachment(images) {
    if (images?.length === 0 || images?.length > 1) {
      return;
    }

    let self = this;
    let image = images[0];
    this.props.refreshImage(true);
    this.setState({appLoading: true});
    this.imageUpload(image)
      .then((response) => {
        ProfileDao.updateIconProfile(
          UsersDao.getUserId(),
          response?.fileId?.length > 0 ? 'profile.png' : 'no-avatar',
        );
        setTimeout(() => {
          this.props.refreshImage(false);
          let profile = ProfileDao.getProfile(UsersDao.getUserId());
          if (!profile?.id || !profile?.fN || !profile?.lN) {
            profile = this.state.profile;
          }
          this.setState({
            updateProfile: new Date().getTime(),
            appLoading: false,
            profile: profile,
          });
        }, 1000);
      })
      .catch((error) => {
        console.error('error :', error);
        this.setState({
          appLoading: false,
        });
      });
  }

  imageUpload = (image) => {
    return new Promise((resolve, reject) => {
      let userId = UsersDao.getUserId();
      let userAccessToken = UsersDao.getAccessToken();
      let tokenType = UsersDao.getTokenType();

      var file = {
        fileCopyUri: image.path,
        name: image.filename,
        size: image.size,
        type: image?.type ? image?.type : image?.mime,
        uri: image.path,
        path: image.path,
      };

      if (file?.name == null) {
        let path = file?.fileCopyUri;
        file.name = path.substring(path.lastIndexOf('/') + 1);
      }

      let componentId = file?.componentId || userAuth.generateId(6);
      let componentThumbnails = [
        {
          width: 320,
          height: 240,
          size: 'smaller',
          url: file?.thumbnailURL,
        },
      ];
      let component = {
        componentId: componentId,
        componentType: 'image',
        componentFileId: file.fileId,
        componentSize: file.size + '',
        componentData: {filename: file?.name},
        componentThumbnails: componentThumbnails,
        fileMeta: {
          id: uuid.v4(),
          fileName: file?.name,
          fileSize: file?.size,
          fileType: file?.type,
          fileCopyUri: file?.fileCopyUri,
          filePath: file?.path,
          uri: file?.uri,
        },
      };

      MessagesDao.upsertNewComponent(component)
        .then((nComponent) => {
          let uploadTask = new FileUploadTask({
            onSuccess: (response) => {
              resolve(response);
            },
            onProgress: () => {},
            onFailure: (error) => {
              reject(error);
            },
            userId: userId,
            accessToken: userAccessToken,
            tokenType: tokenType,
            component: nComponent,
            fileContext: 'profile',
          });
          uploadTask.sendComponent();
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  removePhotoAction = () => {
    let payload = {
      icon: 'no-avatar',
    };
    this.setState({
      appLoading: true,
    });
    store.dispatch(
      updateProfileIcon(UsersDao.getUserId(), payload, (type, respon) => {
        if (type === 'success') {
          let profile = ProfileDao.getProfile(UsersDao.getUserId());
          if (!profile?.id || !profile?.fN || !profile?.lN) {
            profile = this.state.profile;
          }
          this.setState({
            updateProfile: new Date().getTime(),
            appLoading: false,
            profile: profile,
          });
        } else {
          this.setState({
            appLoading: false,
          });
        }
      }),
    );
  };

  navigateToManageAcount = () => {
    navigate(ROUTE_NAMES.MANAGE_ACCOUNTS_SCREEN);
  };
  render() {
    const {t} = this.props;
    const user = this.state.profile;

    if (!user) {
      return (
        <View style={styles.main1}>
          <Loader />
        </View>
      );
    }

    const name = user.fN + ' ' + user.lN;
    return (
      <>
        <Header {...this.props} title={'Profile & Settings'} />
        {this.showlogoutModal()}
        <ScrollView style={styles.main}>
          {/* <View style={styles.headerView}>
          <Text style={styles.headerText}>{t('Profile & Settings')}</Text>
        </View> */}
          <View style={styles.frame1}>
            <TouchableOpacity onPress={this.onCameraClick}>
              <View style={styles.main2}>
                <Avatar
                  profileIcon={user.icon}
                  updateProfile={this.state.updateProfile}
                  userId={user.id}
                  rad={56}
                  name={name}
                  type={'offline'}
                  color={user.color}
                />

                <View style={styles.camerastyle}>
                  <Icon name="edit" size={normalize(12)} color="white" />
                </View>

                {this.state.appLoading && (
                  <View style={styles.camerastyle1}>
                    <Loader />
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.userNameStyle}>
              <Text style={styles.userName}>{name}</Text>
              <Text style={styles.jobRole}>{user.designation}</Text>
              <TouchableOpacity onPress={this.navigateToManageAcount}>
                <Text style={styles.viewProfile}>Manage Account</Text>
              </TouchableOpacity>
            </View>
          </View>
          {this.renderAvailable()}
          <View
            style={
              this.state.isDND
                ? {backgroundColor: '#EFF0F1', paddingVertical: 15}
                : {
                    paddingVertical: 12,
                  }
            }>
            {this.toggleDNDMode()}
            {this.state.isDND ? this.renderDNDOptions() : null}
          </View>

          {/* <TouchableOpacity style={styles.frame4}>
          <Icon name="settings" size={normalize(24)} color="#202124" />
          <Text style={styles.text1}>{t('Settings')}</Text>
        </TouchableOpacity> */}

          {/* <TouchableOpacity style={styles.frame4} onPress={this.broseAccounts}>
            <Text style={styles.text1}>{t('browse_accounts')}</Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={styles.frame4}
            onPress={() => this.logoutModal.openBottomDrawer()}>
            <SvgIcon name="Logout" />
            <Text style={styles.text1}>{t('Log out')}</Text>
          </TouchableOpacity>
          <View
            style={[
              styles.frame4,
              {justifyContent: 'center', flexDirection: 'column'},
            ]}>
            <View style={styles.dnd1}>
              <Image
                source={require('../assets/WorkAssist.png')}
                style={styles.workAssistLogoStyle1}
              />
              <Text style={styles.workAssistLogoStyle2}>{APP_NAME}</Text>
            </View>
            <Text style={styles.version}>
              {DeviceInfo.getReadableVersion()}
            </Text>
            <Camera ref="camera" />
            <Attach
              ref="attachments"
              fromProfile={true}
              profile={this.state.profile}
              removePhotoAction={() => {
                this.removePhotoAction();
              }}
              cameraAction={(images) => {
                this.handleCameraActionFromAttachment(images);
              }}
            />
          </View>
        </ScrollView>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  const {auth} = state;
  return {
    image_refresh_mode: auth.image_refresh_mode,
  };
};

export default connect(mapStateToProps, {
  updateDNDProfile,
  updateProfileIcon,
  refreshImage,
  unsubscribeForPushNotifications,
})(withTranslation()(ProfileScreen));

const styles = StyleSheet.create({
  camerastyle: {
    position: 'absolute',
    bottom: -5,
    right: -10,
    backgroundColor: 'grey',
    borderWidth: 1,
    borderColor: 'white',
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    padding: normalize(5),
  },
  camerastyle1: {position: 'absolute'},
  main: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  userNameStyle: {marginTop: 10, justifyContent: 'center'},
  main1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  viewProfile: {
    justifyContent: 'center',
    color: '#0D6EFD',
    paddingHorizontal: 5,
    fontSize: normalize(14),
    alignSelf: 'center',
    marginTop: 5,
    fontWeight : '300'
  },
  main2: {justifyContent: 'center', alignItems: 'center'},
  headerView: {
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E5E7',
  },
  headerText: {fontSize: normalize(16), color: '#202124'},
  frame1: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  frame12: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  frame2: {
    marginBottom: 7.5,
    flexDirection: 'row',
    paddingLeft: 20,
  },
  userName: {
    fontSize: normalize(20),
    color: '#202124',
    alignSelf: 'center',
    lineHeight: 28,
  },
  jobRole: {
    fontSize: normalize(14),
    color: '#5F6368',
    lineHeight: 20,
    alignSelf: 'center',
  },
  availableView: {
    width: 22,
    height: 22,
    borderRadius: 22 / 2,
    backgroundColor: '#28A745',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text1: {
    fontSize: normalize(16),
    color: '#202124',
    marginLeft: 12,
    fontWeight: '400',
  },
  toggleView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginEnd: 23,
  },
  preference: {
    color: '#5F6368',
    fontSize: normalize(16),
    fontWeight: '500',
    //textDecorationLine: 'underline',
  },
  optionText: {
    color: '#5F6368',
    fontWeight: '500',
    fontSize: normalize(16),
    padding: 12.25,
    paddingLeft: 20,
    flex: 1,
  },
  optionText1: {marginEnd: 5},
  optionsView: {
    backgroundColor: '#ffffff',
    margin: 3,
    borderColor: '#E4E5E7',
    borderWidth: 1,
    borderRadius: 100,
    alignItems: 'center',
    flexDirection: 'row',
  },
  frame3: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  timeText: {
    color: '#9AA0A6',
    fontSize: normalize(14),
    fontWeight: '400',
    marginLeft: 58,
  },
  frame4: {
    paddingHorizontal: 21.3,
    flexDirection: 'row',
    paddingVertical: 15,
    marginVertical: 2,
    alignItems: 'center',
  },
  dnd1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  frame5: {marginVertical: 23, marginHorizontal: 20.25},
  version: {
    fontSize: normalize(14),
    color: '#5F6368',
    lineHeight: 20,
  },
  workAssistLogoStyle1: {
    width: 22,
    height: 22,
    marginRight: 8,
  },
  workAssistLogoStyle2: {
    fontWeight: '700',
    fontSize: normalize(18),
  },
  cancelText: {
    color: '#DD3646',
    fontWeight: '400',
    fontSize: normalize(16),
    marginVertical: 12,
    marginHorizontal: 30,
  },
  logoutTextStyle: {
    color: '#202124',
    flexShrink: 1,
    fontSize: normalize(16),
    fontWeight: '400',
  },
  logoutTitle: {
    fontWeight: '400',
    fontSize: normalize(16),
    color: '#ffffff',
    marginVertical: 15,
    marginHorizontal: 30,
  },
  flexDirectionStyle: {flexDirection: 'column'},
  view1Style: {
    marginHorizontal: 20,
    marginVertical: 30,
    flexDirection: 'row',
  },
  view2Style: {
    borderRadius: 4,
    backgroundColor: '#DD3646',
    alignItems: 'center',
  },
  view3Style: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'grey',
    alignItems: 'center',
    marginTop: 16,
  },
});
