import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  StatusBar,
  View,
  Alert,
  StyleSheet,
  Platform,
  Dimensions,
  AppState,
} from 'react-native';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {FloatingAction} from '../../native/components/Library/react-native-floating-action/src';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import NotificationService from '../notifications/NotificationService';
import {setShareExtensionData} from '../../shared/redux/actions/native.action';
import {BottomUpModal} from './../components/BottomUpModal/index';
import ShareComponentView from '../screens/Share/shareSheetKora';
import NewThreadShareComponentView from '../screens/Share/shareNewThread';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import ModalActivityIndicator from 'react-native-modal-activityindicator';
import AppUpdateComponent from './AppUpdateComponent';
import {
  MessagesStack,
  HomeStack,
  WorkspacesStack,
  MeetingsStack,
  KnowledgeStack,
  ProfileStack,
} from './TabStacks';
import {MainTabBar} from './MainTabbar';
import Notification from '../notifications/Notification';
import {getKoraProfile} from '../../shared/redux/actions/auth.action';
import // userLogStatus,
// getTimestamp,
'../../shared/redux/actions/userLog.action';
import TabScreen from '../screens/TabScreen';
import {Icon} from '../components/Icon/Icon';
import {
  getAppPermissions,
  getJWTToken,
  presenceStart,
  setDeviceToken,
  subscribeForPushNotifications,
  pushNotifData,
  getHelpThunderbolt,
} from '../../shared/redux/actions/home.action';
import {
  startInitialSync,
  startLaterSync,
} from '../../shared/redux/actions/syncwithserver.action';
const {height} = Dimensions.get('window');
import WebsocketService from '../../shared/socket/socket.service';
import {
  getCurrentScreenName,
  getCurrentScreenData,
  navigate,
} from '../navigation/NavigationService';
import {ROUTE_NAMES} from './RouteNames';
import {normalize} from '../utils/helpers';
import botClient from '../utils/kora.botclient';
import * as UsersDao from '../../dao/UsersDao';
import {
  WorkspaceOptionsModal,
  workspaceOptionsModalRef,
} from '../components/WorkspaceOptionsModal';
import {INITIAL_SYNC} from '../../shared/redux/constants/native.constants';
import {
  EmojiDetailsModal,
  emojiDetailsModalRef,
} from '../components/EmojiDetails';
import {
  emptyArray,
  emptyObject,
} from '../../shared/redux/constants/common.constants';
import {
  ConfirmationModal,
  confirmationModalRef,
} from '../components/ConfirmationModal';
import NetInfo from '@react-native-community/netinfo';
import {isIOS} from '../utils/PlatformCheck';
import LiveActionNotification from '../notifications/LiveActionNotification';
import {BottomUpModalShare} from '../components/BottomUpModal/BottomUpModalShare';

import {StackActions} from '@react-navigation/native';
import AccountManager from '../../shared/utils/AccountManager';

const Tab = createBottomTabNavigator();
function navigationOptions(name) {
  return {
    title: name,
    headerTitleStyle: {
      fontStyle: 'bold',
    },
    tabBar: {
      visible: true,
    },
  };
}

// const AppStatusBar = ({backgroundColor, ...props}) => (
//   <View style={[styles.statusBar, {backgroundColor}]}>
//     <StatusBar translucent backgroundColor={backgroundColor} {...props} />
//   </View>
// );

const meetings = [
  {
    text: 'Schedule a meeting',
    icon: <Icon name={'Day_View'} size={20} color={'#202124'} />,
    name: 'bt_newMeeting',
    color: '#202124',
    position: 1,
  },
  {
    text: 'Create a task',
    icon: <Icon name={'Task'} size={20} color={'#202124'} />,
    name: 'bt_newTask',
    color: '#202124',
    position: 2,
  },
  // {
  //   text: 'Add a reminder',
  //   icon: <Icon name={'history'} size={20} color={'#202124'} />,
  //   name: 'bt_newReminder',
  //   color: '#202124',
  //   position: 3,
  // },
];

const actions = [
  {
    text: 'Chat', //'Conversation',
    icon: <Icon name={'Messages'} size={normalize(22)} color={'#202124'} />,
    name: 'bt_newchat',
    color: '#202124',
    position: 1,
    textStyle: {fontSize: normalize(18)},
  },
  {
    text: 'Room',
    icon: (
      <Icon name={'Discussion_Icon'} size={normalize(22)} color={'#202124'} />
    ),
    name: 'bt_newDiscussion',
    color: '#202124',
    position: 2,
    textStyle: {fontSize: normalize(18)},
  },
];

const newWorkspaceOption = {
  text: 'Workspace',
  icon: <Icon name={'Workspaces'} size={normalize(22)} color={'#202124'} />,
  name: 'new_workspace',
  color: '#202124',
  position: 3,
  textStyle: {fontSize: normalize(18)},
};

const sizeConstants = {
  bottomTabBar: 58,
  paddingToTab: 18,
};

class Main extends React.Component {
  initSync = false;
  isConnecting = false;
  notifcustomData = null;
  bottomSheetOpen = false;
  constructor(props) {
    super(props);
    if (this.props?.route?.params) {
      this.initSync = this.props?.route?.params?.initSync;
    }
    // console.log('Dude 0',this.props);
    this.state = {
      shareData: null,
      initialSync: false,
      appState: AppState.currentState,
    };

    this.bottomSheetShare = React.createRef();
    this.bottomSheetShareNewThread = React.createRef();

    this.notificationService = new NotificationService(
      this.onRegister.bind(this),
      this.onNotification.bind(this),
    );
    this.fabRef = React.createRef({});
    this._unsubscribeConn;
  }

  componentDidMount(prevProps) {
    this.props.getAppPermissions();
    this.props.getKoraProfile();
    this.props.getHelpThunderbolt();

    if (this.initSync) {
      this.props.startInitialSync();
    } else {
      let params = {
        shouldSendUpdate: true,
      };
      this.props.startLaterSync(params);
    }

    if (prevProps?.permissions !== this.props?.permissions) {
      this.props.getJWTToken();
    }

    if (prevProps?.jwt !== this.props?.jwt) {
      botClient.initializeBotClient(
        this.props.jwt,
        this.props?.permissions?.applicationControl,
        this.props.timeStamp,
      );
    }

    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.forceUpdate();
      this.checkIsFromPushNotification();
      // this.checkAndUpdateDiscussionsFlag();
    });
    this.openFileShare();
  }

  openFileShare = () => {
    ReceiveSharingIntent.getReceivedFiles(
      (files) => {
        try {
          /*   let tempFiles = [];
          tempFiles.push(files); */
          console.log('recieving file', files);
          if (isIOS) {
            // if (this.props.shareExtDataIos.length !== 0) {
            // if (files.filePath !== this.props.shareExtDataIos.filePath) {
            if (!this.bottomSheetOpen) {
              this.bottomSheetOpen = true;
              this.props.setShareExtensionData(files);
              this.bottomSheetShare.current?.openBottomDrawer();
              //console.log('files sharing', files);
            }
            // }
            // } else {
            //   // console.log('open drawer');
            //   this.bottomSheetShare.current?.openBottomDrawer();
            // }
          } else {
            if (!this.bottomSheetOpen) {
              console.log('From Android share files: ', files);
              this.props.setShareExtensionData(files);
              this.bottomSheetShare.current?.openBottomDrawer();
            }
          }
        } finally {
          ReceiveSharingIntent.clearReceivedFiles();
          console.log('clearing received intent', '------------------');
        }
        //[{ filePath: null, text: null, weblink: null, mimeType: null, contentUri: null, fileName: null, extension: null }]
      },
      (error) => {
        console.log(error, 'share ext error');
      },
    );
  };
  componentWillUnmount() {
    this._unsubscribe();
    //this._unsubscribe_didFocus();
    this._unsubscribeConn && this._unsubscribeConn();
    // this.focusListener();
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // console.log('App has come to the foreground!');
      this.checkSocketAndConnect();
    }
    this.setState({appState: nextAppState});
    if (nextAppState && nextAppState === 'background') {
      // console.log(nextAppState);
    }
  };

  checkSocketAndConnect() {
    setTimeout(() => {
      if (!this.isConnecting) {
        if (WebsocketService.isConnected()) {
          // console.log('Socket is connected nothing to do');
        } else {
          // console.log('reconnecting');
          WebsocketService.disconnect();
          this.props.presenceStart();
        }
      }
    }, 1000);
  }

  checkIsFromPushNotification() {
    if (this.props?.pushMszData?.notifData) {
      let customData = null;
      customData = this.props?.pushMszData?.notifData?.customdata;
      if (!customData) {
        const customDataObj = JSON.parse(this.props?.pushMszData?.notifData);
        customData = customDataObj?.customdata;
      }
      new NotificationService().resolveNotifictionDataForAndroid(
        customData,
        true,
        null,
      );
      this.props.pushNotifData({});
    }
  }

  sessionExpireAlert = (message) =>
    Alert.alert('', message, [
      {
        text: 'OK',
        onPress: () => this.logout(),
        style: 'cancel',
      },
    ]);
  logout = () => {
    try {
      let account = AccountManager.getCurrentAccount();
      AccountManager.removeAccount(account);
      UsersDao.deleteAll();
      this.props.navigation.dispatch(StackActions.replace('Login'));
    } catch (error) {
      console.log(error);
    }
  };
  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.sessionExipryInfo !== this.props.sessionExipryInfo &&
      this.props.sessionExipryInfo
    ) {
      this.sessionExpireAlert(this.props.sessionExipryInfo);
    }
    if (prevProps.initialSync != this.props.initialSync) {
      this.setState({initialSync: this.props.initialSync});
    }
    if (
      prevProps.jwt !== this.props.jwt ||
      (this.props.jwt && prevProps.profile !== this.props.profile)
    ) {
      botClient.initializeBotClient(
        this.props.jwt,
        this.props?.permissions?.applicationControl,
        this.props.timeStamp,
      );
    }
    if (prevProps.syncCompleted !== this.props.syncCompleted) {
      if (this.props.syncCompleted) {
        // console.log('=========================================== Sync completed ==============');
        this.postSync();
      }
    }
    if (
      prevProps.presence !== this.props.presence &&
      this.props?.presence?.sToken
    ) {
      this.isConnecting = false;
      this.createSocketConnection(this.props.presence['sToken']);
    }
    if (this.props.deviceToken !== prevProps.deviceToken) {
      this.subscribeForPushNotifications();
    }
    // if (this.props.ksid == null || prevProps.ksid !== this.props.ksid) {
    //   this.subscribeForPushNotifications();
    // }
  }

  postSync() {
    this.props.presenceStart();
    AppState.addEventListener('change', this._handleAppStateChange);
    this._unsubscribeConn = NetInfo.addEventListener((connectionState) => {
      // console.log('Connection type', connectionState.type);
      // console.log('Is connected?', connectionState.isConnected);
      this.checkSocketAndConnect();
    });
  }

  createSocketConnection(sToken) {
    let socketObj = WebsocketService.createSocketConnection(
      UsersDao.getUserId(),
      sToken,
    );
    socketObj.on('live', (msg) => {
      // console.log('livemsg:::' + JSON.stringify(msg));
      if (msg && msg.action === 'update' && msg.entity === 'profile') {
        //   this.comCommu.updateProfile();
      }
      if (msg && msg.action === 'update' && msg.entity === 'panels') {
        if (msg.data.panelId.toLowerCase() === 'home') {
          // this.comCommu.updateHomePanel(msg.data);
        }
      }
      if (msg && msg.entity === 'articles' && msg.action === 'create') {
        //   this.comCommu.refreshArticles();
      }
      socketObj.on('notification', (msg) => {
        if (!msg) {
          return;
        }
        if (msg.customdata && msg.customdata.t && msg.customdata.t === 'kman') {
          //   this.comCommu.updateKoreTeamChat(msg.customdata);
          return;
        }
      });
    });
  }
  onNewThreadClick = (data) => {
    this.setState({shareData: data}, () => {
      this.onFinishThreadClick();
      setTimeout(() => {
        // console.log('onNewThreadClick data -----> : ', this.state.shareData);
        this.bottomSheetShareNewThread.current?.open();
      }, 1000);
    });
  };

  onFinishThreadClick = () => {
    this.bottomSheetShareNewThread.current?.closeBottomDrawer();
    this.bottomSheetShare.current?.closeBottomDrawer();
  };

  get showAddBoard() {
    return getCurrentScreenName() === ROUTE_NAMES.DISCUSSION_ROOMS;
  }

  subscribeForPushNotifications() {
    if (this.props.deviceToken) {
      let osType = Platform.OS == 'ios' ? 'iphone' : 'android';
      let parameters = {
        sToken: this.props.deviceToken.token,
        osType: osType,
        appType: 'kora',
      };
      this.props.subscribeForPushNotifications(parameters);
    }
  }

  onRegister(token) {
    this.props.setDeviceToken(token);
  }

  onNotification(notification) {
    this.notificationService?.localNotif(notification);
  }

  handlePerm(perms) {
    Alert.alert('Permissions', JSON.stringify(perms));
  }

  renderMeetings(actionName) {
    if (actionName === 'bt_newMeeting') {
      navigate(ROUTE_NAMES.NEW_MEETING, {
        isNewMeeting: true,
      });
    } else {
      Alert.alert('This feature is not yet enabled');
    }
  }

  fabActionPress = (actionName) => {
    if (actionName === 'bt_newchat') {
      navigate('Chat', {isNewChat: true});
    } else if (actionName === 'bt_newDiscussion') {
      // if (!hasAddBoardPermission) {
      //   SimpleToast.show(t('You dont have the permissions to create board'));
      //   return;
      // }
      navigate(ROUTE_NAMES.NEW_DISCUSSION, {
        isNewDiscussion: true,
      });
    } else if (newWorkspaceOption.name === actionName) {
      navigate(ROUTE_NAMES.NEW_WORKSPACE);
    } else {
      this.renderMeetings(actionName);
    }
  };

  tabBar = (props) => <MainTabBar {...props} />;

  onPress = (params, id) => {
    const currScreenName = getCurrentScreenName();
    if (currScreenName === ROUTE_NAMES.MESSAGES) {
      if (id === 'chats') {
        navigate('Chat', {isNewChat: true});
      } else {
        navigate(ROUTE_NAMES.NEW_DISCUSSION, {
          isNewDiscussion: true,
        });
      }
    } else {
      this.fabRef.current.animateButton(params);
    }

    if (currScreenName === ROUTE_NAMES.MESSAGES_DISCUSSION_ROOMS) {
      navigate(ROUTE_NAMES.NEW_DISCUSSION, {
        isNewDiscussion: true,
      });
      return;
    }
  };

  onDismissBottomSheet = () => {
    console.log('bottoms sheet sism');
    this.bottomSheetOpen = false;
    this.props.setShareExtensionData([]);
  };

  render() {
    const currScreenName = getCurrentScreenName();
    let hasAddBoardPermission = false;
    let _actions = [];
    let disableFloatingIcon = ['muted', 'unread', 'starred'];
    // if (
    //   this.props.selectedWS?.userStatus &&
    //   this.props.selectedWS?.userStatus !== 'nonMember'
    // ) {
    //   const {settings = {}} = this.props.selectedWS;
    //   const {
    //     whoCanCreateBoard = {all: false, roles: [], members: []},
    //   } = settings;
    //   if (whoCanCreateBoard.all) {
    hasAddBoardPermission = true;
    //   } else {
    //     const userId = UsersDao.getUserId();
    //     hasAddBoardPermission =
    //       whoCanCreateBoard.members.findIndex((user) => user.id === userId) !==
    //       -1;
    //   }
    // }

    const newChatOption = actions[0];
    const newBoardOption = actions[1];
    let shouldAddNewBoardOption = false;
    let shouldAddMessages = false;
    let shouldShowAddWorkspace = false;
    let hidFab = false;
    let showFloatingIcon = true;
    const params = getCurrentScreenData()?.params;
    if (currScreenName === ROUTE_NAMES.DISCUSSION_ROOMS) {
      shouldShowAddWorkspace = true;
    }
    if (
      currScreenName === ROUTE_NAMES.WORKSPACE_LIST ||
      currScreenName === ROUTE_NAMES.Workspaces
    ) {
      showFloatingIcon = false;
    }

    if (
      currScreenName === ROUTE_NAMES.Workspaces ||
      currScreenName === ROUTE_NAMES.DISCUSSION_ROOMS ||
      currScreenName === ROUTE_NAMES.MESSAGES_DISCUSSION_ROOMS
    ) {
      shouldAddNewBoardOption = true;
    } else if (currScreenName === ROUTE_NAMES.EVENTS) {
      _actions = meetings;
    } else if (currScreenName === ROUTE_NAMES.MESSAGES) {
      if (disableFloatingIcon.includes(params?.queryItem.id)) {
        showFloatingIcon = false;
      }
      if (!params?.filter) {
        shouldAddMessages = true;
        shouldAddNewBoardOption = true;
        hidFab = false;
      } else if (params.filter === 'chats') {
        shouldAddMessages = true;
        hidFab = false;
      } else if (params.filter === 'discussion') {
        shouldAddNewBoardOption = true;
        hidFab = false;
      } else {
        if (params.filter === 'muted' || params.filter === 'unread') {
          hidFab = true;
        } else {
          hidFab = false;
        }
        shouldAddMessages = true;
        shouldAddNewBoardOption = true;
      }
    }
    shouldAddNewBoardOption = shouldAddNewBoardOption && hasAddBoardPermission;

    if (shouldAddNewBoardOption) {
      _actions.push(newBoardOption);
    }

    if (shouldAddMessages) {
      _actions.push(newChatOption);
    }

    if (shouldShowAddWorkspace) {
      _actions.push(newWorkspaceOption);
    }
    // const {t} = this.props;
    return (
      <SafeAreaInsetsContext.Consumer>
        {(insets) => (
          <>
            <ModalActivityIndicator
              visible={this.state.initialSync}
              size="large"
              color="white"
            />
            <LiveActionNotification />
            <Notification />
            <EmojiDetailsModal ref={emojiDetailsModalRef} />
            <WorkspaceOptionsModal ref={workspaceOptionsModalRef} />
            <ConfirmationModal ref={confirmationModalRef} />
            <Tab.Navigator tabBar={this.tabBar}>
              <Tab.Screen
                name="Messages"
                options={navigationOptions('Messages')}
                component={MessagesStack}
              />
              <Tab.Screen
                name="Workspaces"
                options={navigationOptions('Workspaces')}
                component={WorkspacesStack}
              />
              <Tab.Screen
                name="Findly"
                options={navigationOptions('Findly')}
                component={HomeStack}
              />
              <Tab.Screen
                name="Home"
                options={navigationOptions('Home')}
                component={HomeStack}
              />
              <Tab.Screen
                name="More"
                options={navigationOptions('Findly')}
                component={HomeStack}
              />
              <Tab.Screen
                name="Tasks"
                options={navigationOptions('Tasks')}
                component={HomeStack}
              />
              <Tab.Screen
                name="Events"
                options={navigationOptions('Meetings')}
                component={MeetingsStack}
              />
              <Tab.Screen
                name="Profile"
                options={navigationOptions('Profile')}
                component={ProfileStack}
              />
              <Tab.Screen
                name="Knowledge"
                options={navigationOptions('Knowledge')}
                component={KnowledgeStack}
              />
              <Tab.Screen
                name="Automations"
                options={navigationOptions('Automations')}
                component={HomeStack}
              />
            </Tab.Navigator>
            <AppUpdateComponent />
            <BottomUpModalShare
              ref={this.bottomSheetShare}
              expandable={false}
              height={height - 270}
              onDismissSheet={this.onDismissBottomSheet}>
              {/*    <NewThreadShareComponentView></NewThreadShareComponentView> */}
              <ShareComponentView
                shareData={this.state.shareData}
                onNewThreadClick={(data) => this.onNewThreadClick(data)}
              />
            </BottomUpModalShare>
            <BottomUpModalShare
              ref={this.bottomSheetShareNewThread}
              expandable={false}
              onDismissSheet={this.onDismissBottomSheet}
              height={height - 270}>
              <NewThreadShareComponentView
                shareData={this.state.shareData}
                onFinishThreadClick={this.onFinishThreadClick}
              />
            </BottomUpModalShare>
            {showFloatingIcon && hidFab === false && (
              <FloatingAction
                ref={this.fabRef}
                actions={_actions}
                onPress={(data) => this.onPress(data, params?.queryItem.id)}
                color="#2A80FD"
                style={styles.floatingIcon1}
                distanceToEdge={{
                  vertical:
                    sizeConstants.bottomTabBar +
                    sizeConstants.paddingToTab +
                    insets.bottom,
                  horizontal: 18,
                }}
                actionsPaddingTopBottom={0}
                onPressItem={this.fabActionPress}
              />
            )}
          </>
        )}
      </SafeAreaInsetsContext.Consumer>
    );
  }
}
const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 5,
    backgroundColor: '#4741FA',
    color: '#ffffff',
    fontSize: normalize(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  input: {
    marginBottom: 11,
    marginTop: 11,
  },
  basicMargin: {
    paddingBottom: 11,
    paddingTop: 11,
  },
  floatingIcon1: {alignItems: 'center', justifyContent: 'center'},
});

const mapStateToProps = (state) => {
  const {native, home, auth, workspace, login, sync} = state;
  const wsList = workspace.workspacelist?.ws || emptyArray;
  const selectedWs =
    wsList.find((ws) => ws.id === workspace.activeWsId) || emptyObject;
  return {
    jwt: home.jwt,
    profile: auth.profile,
    // timestamp: userLogStatus.timeStamp,
    presence: home.presence,
    permissions: home.permissions,
    initialSync: native.loaders[INITIAL_SYNC],
    wsList: workspace.workspacelist?.ws || emptyArray,
    selectedWS: selectedWs || emptyObject,
    shareExtDataIos: native.shareExtensionDataIOS,
    // ksid: home.ksid,
    deviceToken: home.deviceToken,
    pushMszData: home.pushNotifData,
    sessionExipryInfo: login.sessionExipryInfo,
    syncCompleted: sync.syncCompleted,
    thunderBoltResp: home.thunderBoltResp,
    helpData:
      home.thunderBoltResp &&
      home.thunderBoltResp.thunderbolt &&
      home.thunderBoltResp.thunderbolt.help.resources,
  };
};

export default connect(mapStateToProps, {
  getJWTToken,
  getAppPermissions,
  getKoraProfile,
  getHelpThunderbolt,
  // userLogStatus,
  presenceStart,
  startInitialSync,
  startLaterSync,
  // getTimestamp,
  setDeviceToken,
  subscribeForPushNotifications,
  // threadResolve,
  setShareExtensionData,
  pushNotifData,
})(withTranslation()(Main));
