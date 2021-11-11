/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TouchableHighlight,
  PermissionsAndroid,
  Alert,
  Linking,
  Animated,
} from 'react-native';
import {getBoardMembers} from '../../../shared/redux/actions/discussions.action';
import {requestMultiple, PERMISSIONS} from 'react-native-permissions';
import DocumentPicker from 'react-native-document-picker';
import ImagePicker from 'react-native-image-picker';
import DraggablePanel from './../../components/Library/react-native-draggable-panel';
import {connect} from 'react-redux';
import {normalize} from '../../utils/helpers';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {Avatar} from '../../components/Icon/Avatar';
import {BottomUpModal} from './../../components/BottomUpModal';
import {Icon} from '../../components/Icon/Icon';
import {Header} from '../../navigation/TabStacks';
import {DeleteThread} from './../ChatsThreadScreen/chats-thread';
import {
  addParticipants,
  searchModeOn,
} from '../../../shared/redux/actions/message-preview.action';
import {
  MuteUnmute,
  deleteUserFromGrup,
  deleteUserChtHistry,
  groupNameChange,
} from '../../../shared/redux/actions/message-thread.action';
import {getThreadContact} from '../../utils/helpers';
import {navigate} from '../../navigation/NavigationService';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
import {selectedContactList} from '../../../shared/redux/actions/create-message.action';
import FileUploader from '../FileUploader/index';
import {isAndroid, isIOS} from '../../utils/PlatformCheck';
import {groupIconUpdate} from '../../../shared/redux/actions/group-icon.action';
import * as Constants from '../../components/KoraText';
import {TextInput} from 'react-native';
import {withTranslation} from 'react-i18next';
import {Keyboard} from 'react-native';
import {APP_NAME} from '../../utils/AppConstants';
import * as UsersDao from '../../../dao/UsersDao';
import {emptyArray} from '../../../shared/redux/constants/common.constants';
import {colors} from '../../theme/colors';
import DeleteMessage from '../../components/Chat/DeleteChatItemEvent';
import {store} from '../../../shared/redux/store';
import database from '../../../native/realm';
import * as Entity from '../../../native/realm/dbconstants';

const array = [
  {icon: 'Contact_MediaFiles', name: 'Remove Icon', size: 18, key: 1},
  {icon: 'Camera', name: 'Take Photo', size: 24, key: 2},
  {icon: 'Upload', name: 'From Gallery', size: 24, key: 3},
  {icon: 'EmojiSmile', name: 'Emoji', size: 24, key: 4},
  {icon: 'DriveCloud', name: 'Drive', size: 18, key: 5},
];

const LAUNCH_CAMERA_TYPE = 1;
const OPENGALLERY_TYPE = 2;

const options1 = [
  {
    id: 'media_and_files',
    icon: 'Contact_MediaFiles',
    title: 'Media & Files',
    size: 20,
  },
  {
    id: 'chat_search',
    icon: 'Contact_Search',
    title: 'Chat Search',
    size: 24,
  },
];

const addParticipentsOption = {
  id: 'add_participants',
  icon: 'Contact_Addparticipant',
  title: 'Add People',
  size: 24,
};

const options2 = [
  {
    id: 'Leave_Conversation',
    icon: 'LeaveConversation',
    title: 'Leave Chat',
    size: 24,
  },
];

const row = [];
let prevOpenedRow = null;

class GroupDetailsScreen extends Component {
  constructor(props) {
    super(props);
    this.board_id = props.route.params?.board_id;
    this.subscribeBoard();
    const sortedMembers = [];
    this.state = {
      board: null,
      participants: sortedMembers,
      expandedParticpentList: false,
      toDeleteUser: {},
      toggleGroupPanel: false,
      thumbnailURL: null,
      groupIconloader: false,
    };
  }

  subscribeBoard = async () => {
    try {
      if (this.boardSubscription && this.boardSubscription.unsubscribe) {
        this.boardSubscription.unsubscribe();
      }

      if (this.membersSubscription && this.membersSubscription.unsubscribe) {
        this.membersSubscription.unsubscribe();
      }

      if (
        this.recentMembersSubscription &&
        this.recentMembersSubscription.unsubscribe
      ) {
        this.recentMembersSubscription.unsubscribe();
      }

      const {board_id} = this.props.route.params;
      const db = database.active;

      const board = await db.collections.get(Entity.Boards).find(board_id);
      const observable = board.observe();
      this.boardSubscription = observable.subscribe((data) => {
        this.setState({
          topicName: board.name,
          description: board.desc,
          board: data,
        });
        this.subscribeMembers();
      });
    } catch (e) {
      console.log('error in subscribeBoard', e);
    }
  };

  subscribeMembers = async () => {
    try {
      if (this.membersSubscription && this.membersSubscription.unsubscribe) {
        this.membersSubscription.unsubscribe();
      }
      const {board} = this.state;
      const membersObservable = board.members.observe();
      this.membersSubscription = membersObservable.subscribe((members) => {
        const sortedMembers = this.sortBoardsMembers(members);
        this.setState({
          participants: sortedMembers || emptyArray,
        });
      });

      const recentMembersObservable = board.recentMembers.observe();
      this.recentMembersSubscription = recentMembersObservable.subscribe(
        (recentMembers) => {
          this.setState({
            recentMembers: recentMembers || emptyArray,
          });
        },
      );
    } catch (e) {
      console.log('subscribeMembers error : ', e);
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.usermuteUnmuteThread !== this.props.usermuteUnmuteThread) {
      const {board} = this.state;
      const mute = this.props.usermuteUnmuteThread?.mute;
      const notifications = {
        notifications: {mute},
      };
      this.setState({board: board, ...notifications});
    }

    if (this.props.groupIconResponse) {
      if (!this.props.groupIconResponse.logo.val) {
        if (this.state.thumbnailURL) {
          this.setState({
            thumbnailURL: null,
            groupIconloader: false,
          });
        }
      } else {
        if (
          !this.state.thumbnailURL ||
          this.state.thumbnailURL !==
            this.props.groupIconResponse.logo.val.thumbnailURL
        ) {
          this.setState({
            thumbnailURL: this.props.groupIconResponse.logo.val.thumbnailURL,
            groupIconloader: false,
          });
        }
      }
    }
  }

  sortBoardsMembers(participants) {
    var sortedList = [...participants];
    const compareObjects = (a, b) => a.fN > b.fN;
    sortedList.sort(compareObjects);
    const userId = UsersDao.getUserId();
    let userList = sortedList.filter(function (currentElement) {
      return currentElement.id === userId;
    });
    var withoutUser = sortedList.filter(function (currentElement) {
      return currentElement.id !== userId;
    });
    if (userList.length > 0) {
      withoutUser.unshift(userList[0]);
    }
    return withoutUser;
  }

  componentDidMount() {
    this.props.selectedContactList([]);
    this._unsubscribe = this.props.navigation.addListener('focus', () => {});
  }

  componentWillUnmount() {
    if (this.boardSubscription && this.boardSubscription.unsubscribe) {
      this.boardSubscription.unsubscribe();
    }
    if (this.membersSubscription && this.membersSubscription.unsubscribe) {
      this.membersSubscription.unsubscribe();
    }
    if (
      this.recentMembersSubscription &&
      this.recentMembersSubscription.unsubscribe
    ) {
      this.recentMembersSubscription.unsubscribe();
    }
    this._unsubscribe();
  }

  list = () => {
    return array.map((element) => {
      if (!this.state.thumbnailURL && element.key == 1) {
        return <View></View>;
      }
      return (
        <TouchableOpacity
          key={element.key}
          style={groupStyles.opacityStyle}
          onPress={() => {
            this.onElementClick(element);
          }}
          activeOpacity={0.5}>
          <View style={groupStyles.opacityStyle1}>
            <View style={groupStyles.opacityStyle2}>
              <Icon name={element.icon} size={element.size} color="#202124" />
            </View>
            <Text
              numberOfLines={1}
              lineBreakMode={'middle'}
              style={styles.elementNameTextStyle}>
              {element.name}
            </Text>
          </View>
        </TouchableOpacity>
      );
    });
  };

  onElementClick(element) {
    this.setState({
      toggleGroupPanel: false,
    });
    switch (element.key) {
      case 2:
        this.checkPermissions(this.boardId, 1);
        break;
      case 3:
        this.checkPermissions(this.boardId, 2);

      case 5:
        this.openMediaPickerImage(this.boardId, [DocumentPicker.types.images]);
        break;
      case 1:
        this.removeGroupIconAlert();
        break;
    }
  }

  renderModalContent = () => (
    <View>
      <View style={groupStyles.modalContent}>
        <Text style={groupStyles.textStyle}>Group Icon</Text>
        <View style={groupStyles.modalStyle1} />
        <View style={groupStyles.viewStyle}>{this.list()}</View>
        <View style={groupStyles.modalStyle2} />
      </View>
    </View>
  );

  openGroupIcon(threadid) {
    this.setState({
      toggleGroupPanel: true,
      threadId: threadid,
    });
  }

  groupIconOptions() {
    return (
      <View style={groupStyles.container}>
        <DraggablePanel
          ref="draggablePanel"
          borderRadius={15}
          initialHeight={380}
          visible={this.state.toggleGroupPanel}
          onDismiss={() => this.setState({toggleGroupPanel: false})}>
          {this.renderModalContent()}
        </DraggablePanel>
      </View>
    );
  }

  checkPermissions(boardId, type) {
    this.boardId = threadId;
    if (isAndroid) {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]).then((result) => {
        if (
          result['android.permission.CAMERA'] &&
          result['android.permission.READ_EXTERNAL_STORAGE'] &&
          result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
        ) {
          switch (type) {
            case LAUNCH_CAMERA_TYPE:
              this.launchCamera(this.boardId);
              break;

            case OPENGALLERY_TYPE:
              this.openGallery(this.boardId);
              break;
          }
        } else if (
          result['android.permission.CAMERA'] ||
          result['android.permission.READ_EXTERNAL_STORAGE'] ||
          result['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            'never_ask_again'
        ) {
          Alert.alert(
            'Alert',
            'Please Go into Settings -> Applications -> ' +
              APP_NAME +
              ' -> Permissions and Allow permissions to continue',
            [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {text: 'OK', onPress: () => Linking.openSettings()},
            ],
            {cancelable: false},
          );
        }
      });
    } else if (isIOS) {
      requestMultiple([
        PERMISSIONS.IOS.CAMERA,
        PERMISSIONS.IOS.PHOTO_LIBRARY,
      ]).then((result) => {
        console.log('Camera', result[PERMISSIONS.IOS.CAMERA]);
        console.log('Photo', result[PERMISSIONS.IOS.PHOTO_LIBRARY]);
        if (
          result[PERMISSIONS.IOS.CAMERA] &&
          result[PERMISSIONS.IOS.PHOTO_LIBRARY] === 'granted'
        ) {
          switch (type) {
            case LAUNCH_CAMERA_TYPE:
              this.launchCamera(threadId);
              break;

            case OPENGALLERY_TYPE:
              this.openGallery(threadId);
              break;
          }
        } else if (
          result[PERMISSIONS.IOS.CAMERA] &&
          result[PERMISSIONS.IOS.PHOTO_LIBRARY] === 'blocked'
        ) {
          Alert.alert(
            'alert',
            'Please Go into Settings -> Applications -> ' +
              APP_NAME +
              ' -> Permissions and Allow permissions to continue',
          );
        }
      });
    }
  }

  launchCamera = (threadId) => {
    this.boardId = threadId;
    var options = {
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.launchCamera(options, (res) => {
      if (res.didCancel) {
        console.log('User cancelled image picker');
      } else if (res.error) {
        console.log('ImagePicker Error: ', res.error);
      } else if (res.customButton) {
        console.log('User tapped custom button: ', res.customButton);
        alert(res.customButton);
      } else {
        try {
          this.processToUploadinImage(this.boardId, res);
        } catch (err) {
          throw err;
        }
      }
    });
  };

  openGallery = (threadId) => {
    this.boardId = threadId;
    var options = {
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.launchImageLibrary(options, (res) => {
      if (res.didCancel) {
        console.log('User cancelled image picker');
      } else if (res.error) {
        console.log('ImagePicker Error: ', res.error);
      } else if (res.customButton) {
        console.log('User tapped custom button: ', res.customButton);
        alert(res.customButton);
      } else {
        try {
          this.processToUploadinImage(this.boardId, res);
        } catch (err) {
          throw err;
        }
      }
    });
  };

  openMediaPickerImage(threadId, type) {
    if (isAndroid) {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]).then((result) => {
        if (
          result['android.permission.CAMERA'] &&
          result['android.permission.READ_EXTERNAL_STORAGE'] &&
          result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
        ) {
          this.picksingleFile(threadId, type);
        } else if (
          result['android.permission.CAMERA'] ||
          result['android.permission.READ_EXTERNAL_STORAGE'] ||
          result['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            'never_ask_again'
        ) {
          Alert.alert(
            'Alert',
            'Please Go into Settings -> Applications -> ' +
              APP_NAME +
              ' -> Permissions and Allow permissions to continue',
            [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {text: 'OK', onPress: () => Linking.openSettings()},
            ],
            {cancelable: false},
          );
        }
      });
    } else if (isIOS) {
      requestMultiple([
        PERMISSIONS.IOS.CAMERA,
        PERMISSIONS.IOS.PHOTO_LIBRARY,
      ]).then((result) => {
        console.log('Camera', result[PERMISSIONS.IOS.CAMERA]);
        console.log('Photo', result[PERMISSIONS.IOS.PHOTO_LIBRARY]);
        if (
          result[PERMISSIONS.IOS.CAMERA] &&
          result[PERMISSIONS.IOS.PHOTO_LIBRARY] === 'granted'
        ) {
          this.picksingleFile(threadId, type);
        } else if (
          result[PERMISSIONS.IOS.CAMERA] ||
          result[PERMISSIONS.IOS.PHOTO_LIBRARY] === 'blocked'
        ) {
          Alert.alert(
            'alert',
            'Please Go into Settings -> Applications -> ' +
              APP_NAME +
              ' -> Permissions and Allow permissions to continue',
          );
        }
      });
    }
  }

  async picksingleFile(threadId, types) {
    console.log('types :', types);
    try {
      const res = await DocumentPicker.pick({
        type: types,
      });

      let mediaList = [
        {
          fileCopyUri: res.uri,
          name: res.name,
          size: res.size,
          type: res.type,
          uri: res.uri,
          path: null,
        },
      ];
      this.uploagIcon(threadId, mediaList);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log(err);
      } else {
        throw err;
      }
    }
  }

  processToUploadinImage(threadId, res) {
    let mediaList = [
      {
        fileCopyUri: res.uri,
        name: res.fileName,
        size: res.fileSize,
        type: res.type,
        uri: res.uri,
        path: res.path,
      },
    ];

    this.uploagIcon(threadId, mediaList);
  }

  async uploagIcon(threadId, mediaList) {
    this.setState({groupIconloader: true});
    const promisesArray = mediaList.map((media) => {
      return this.imageUpload(media);
    });
    const responses = await Promise.all(promisesArray);
    let files = responses.map((res, i) => {
      return {
        ...res,
        ...mediaList[i],
      };
    });

    files.map((file) => {
      let _params = {
        logo: {
          type: 'link',
          val: {
            fileId: file.fileId,
            fileName: file.name,
            thumbnailURL: file.thumbnailURL,
            type: file.type,
            threadId: threadId,
          },
        },
      };
      this.callGroupIconAPI(threadId, _params);
    });
  }

  callGroupIconAPI = (threadId, payload) => {
    this.setState({groupIconloader: true});
    this.props.groupIconUpdate({threadId}, payload);
  };

  removeGroupIcon = () => {
    let _params = {
      logo: {},
    };

    this.callGroupIconAPI(this.boardId, _params);
  };

  removeGroupIconAlert = () => {
    Alert.alert('Logout', 'Are you sure to remove group icon?', [
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => this.removeGroupIcon(),
        style: 'destructive',
      },
    ]);
  };

  getUID(pattern) {
    var _pattern = pattern || 'xxxxyx';
    _pattern = _pattern.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    return _pattern;
  }

  imageUpload(image) {
    return new Promise((resolve, reject) => {
      let userId = UsersDao.getUserId();
      let userAccessToken = UsersDao.getAccessToken();
      let mediaName = this.getUID();
      let obj = {};

      const uploader = new FileUploader(
        image,
        userId,
        'icon',
        userAccessToken,
        mediaName,
      );

      uploader.start(
        (progress) => {
          console.log('progress', 'in-progress');
        },
        (success) => {
          console.log('SUCCESS', success);
          obj.status = 200;
          obj.response = JSON.parse(success);
          console.log('result', 'success', obj);

          resolve(JSON.parse(success));
        },
        function (onError) {
          console.log('error', onError);
          reject(onError);
        },
      );
    });
  }

  optionsView1 = () => {
    return options1.map((data) => {
      return this.getSigleOptionsView(data);
    });
  };
  optionsView2 = () => {
    return options2.map((data) => {
      return this.getSigleOptionsView(data);
    });
  };

  renderMuteButton() {
    const data = {
      id: 'mute_unmute',
      icon: 'Contact_Mute',
      title: 'Mute',
      size: 24,
    };

    let muteOn = false;
    const {board} = this.state;
    let till = board?.notifications?.mute?.till;
    if (till) {
      muteOn = new Date() < new Date(till);
    }

    let text = muteOn ? 'Unmute' : 'Mute';
    return (
      <View style={[styles.sectionSingleView]} key={data.id}>
        <View style={styles.muteStyle1}>
          <Icon
            name={muteOn ? data.icon : 'Contact_Unmute'}
            size={data.size}
            color="#202124"
          />
        </View>
        <TouchableOpacity
          style={styles.sectionSingleViewSub}
          onPress={() => {
            if (muteOn) {
              this.muteButtonClick({});
              return;
            }
            this.onOptionClick(data.id);
          }}>
          <Text style={styles.textStyle}>{text}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  getSigleOptionsView = (data) => {
    if (data.id === 'mute_unmute') {
      let muteOn = false;
      const {board} = this.state;
      let till = board?.notifications?.mute?.till;
      if (till) {
        muteOn = new Date() < new Date(till);
      }

      let text = muteOn ? 'Unmute' : 'Mute';

      return (
        <View style={[styles.sectionSingleView]} key={data.id}>
          <View style={styles.sectionSingleView1}>
            <Icon name={data.icon} size={data.size} color="#202124" />
          </View>
          <TouchableOpacity
            style={styles.sectionSingleViewSub}
            onPress={() => {
              if (muteOn) {
                this.muteButtonClick({});
                return;
              }
              this.onOptionClick(data.id);
            }}>
            <Text style={styles.textStyle}>{text}</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (data.id === 'delete_chat') {
      return (
        <View style={[styles.sectionSingleView]} key={data.id}>
          <View style={styles.sectionSingleView2}>
            <Icon name={data.icon} size={data.size} color="#DD3646" />
          </View>
          <TouchableOpacity
            style={styles.sectionSingleViewSub}
            onPress={() => {
              this.onOptionClick(data.id);
            }}>
            <Text
              style={{
                ...styles.textStyle,
                color: '#DD3646',
              }}>
              {data.title}
            </Text>
          </TouchableOpacity>
        </View>
      );
    } else if (
      data.id === 'Leave_Conversation' ||
      data.id === 'add_participants'
    ) {
      let textColor = '#202124';
      if (data.id === 'Leave_Conversation') {
        const {board} = this.state;

        const participants = this.state.participants;
        const isUserInParticipents =
          participants.findIndex((user) => user.id == UsersDao.getUserId()) !==
          -1;
        if (!isUserInParticipents) {
          return null;
        }
        textColor = '#DD3646';
      }
      return (
        <TouchableOpacity
          style={[styles.sectionSingleView]}
          key={data.id}
          onPress={() => {
            this.onOptionClick(data.id);
          }}>
          <View style={styles.sectionSingleView3}>
            <Icon name={data.icon} size={data.size} color={textColor} />
          </View>
          <View style={styles.sectionSingleViewSub}>
            <Text
              style={{
                ...styles.textStyle,
                color: textColor,
              }}>
              {data.title}
            </Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <View style={[styles.sectionSingleView]} key={data.id}>
          {/* <Image source={data.icon} /> */}
          <View style={styles.sectionSingleView4}>
            <Icon name={data.icon} size={data.size} color="#202124" />
          </View>
          <TouchableOpacity
            style={styles.sectionSingleViewSub}
            onPress={() => {
              this.onOptionClick(data.id);
            }}>
            <Text style={[styles.setion2Text, {marginStart: 0}]}>
              {data.title}
            </Text>
            <View style={styles.arrow}>
              <Icon name="Right_Direction" size={16} color="#5F6368" />
            </View>
            {/* <Image
            source={require('../../assets/contact/right_arrow.png')}
            style={styles.arrow}
          /> */}
          </TouchableOpacity>
        </View>
      );
    }
  };

  onOptionClick = (id) => {
    console.log('Now clicked : ' + id);
    if (id === 'mute_unmute') {
      this.refs.modal.openBottomDrawer();
    } else if (id === 'Leave_Conversation') {
      this.onLeaveConversation(id);
    }
    if (id === 'chat_search') {
      this.props.searchModeOn();
      this.props.navigation.goBack();
    }
    if (id === 'delete_chat') {
      const {board} = this.state;
      this.props.deleteUserChtHistry(board?._id, true);
    }
    if (id === 'add_participants') {
      const {board} = this.state;
      navigate(ROUTE_NAMES.ADD_PARTICIPENTS, {
        thread: board,
        participants: this.state.participants,
      });
    }
    if (id === 'media_and_files') {
      const {board} = this.state;
      navigate('View_Files', {
        threadId: board?._id,
        thread: board,
      });
    }
  };

  onLeaveConversation(id) {
    Alert.alert(
      'Leave Chat',
      'Are you sure you want to leave chat',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            console.log('OK Pressed');

            const {board} = this.state;
            let _params = {
              id: board?._id,
            };

            let payload = {
              leaveBoard: true,
              removeMembers: [id],
            };

            store.dispatch(
              deleteUserFromGrup(_params, payload, (data) => {
                this.props.navigation.goBack();
              }),
            );
          },
        },
      ],
      {cancelable: false},
    );
  }

  onDelete(id, isSelf) {
    const {board} = this.state;
    let _params = {
      id: board?._id,
    };
    let payload = {
      leaveBoard: isSelf ? true : undefined,
      removeMembers: [id],
    };

    this.props.deleteUserFromGrup(_params, payload);
  }

  newRight(progress, dragX, data, isUser, isUserInParticipents) {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [90, 0],
    });

    return !isUser && isUserInParticipents ? (
      <View style={styles.rightItem}>
        <Animated.View
          style={
            (styles.swipeChildStyle,
            {backgroundColor: '#DD3646'},
            {transform: [{translateX: trans}]})
          }>
          <TouchableOpacity
            style={[styles.swipeChildStyle, {backgroundColor: '#DD3646'}]}
            onPress={() => {
              this.closeRow(-1);
              this.setState({toDeleteUser: data});
              this.refs.deleteModal.openModal(
                (onPannelStatus) => {},
                (element) => {
                  switch (element.key) {
                    case 1:
                      const data = this.state.toDeleteUser;
                      this.onDelete(data.id, false);
                      this.refs.deleteModal.closeModal();
                      break;
                    case 2:
                      break;
                    case 3:
                      break;
                  }
                },
              );
            }}>
            <DeleteThread text={'Remove'} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    ) : null;
  }

  closeRow(index) {
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow.close();
    }

    if (index !== -1) {
      prevOpenedRow = row[index];
    } else {
      prevOpenedRow = null;
      for (let i = 0; i < row.length; i++) {
        if (row[i]) {
          row[i].close();
        }
      }
    }
  }

  renderParticipants(participants) {
    const showLessCount = 3;
    const isUserInParticipents =
      participants.findIndex((user) => user?.id == UsersDao.getUserId()) !== -1;

    const ParticipantsComponent = () => {
      const twoParticipents = participants.slice(0, showLessCount);
      const allParticipents = participants;
      const toShowParticipents = this.state.expandedParticpentList
        ? allParticipents
        : twoParticipents;
      const {board} = this.state;

      return toShowParticipents.map((data, index) => {
        let name = data.fN + ' ' + data.lN;
        const isUser = data.id === UsersDao.getUserId();
        if (isUser) {
          name = 'You';
        }
        if (!isUser && isUserInParticipents) {
        }
        return (
          <Swipeable
            ref={(ref) => {
              row[index] = ref;
            }}
            renderRightActions={(progress, dragx) =>
              this.newRight(progress, dragx, data, isUser, isUserInParticipents)
            }
            friction={2}
            leftThreshold={30}
            rightThreshold={10}
            useNativeAnimations={true}
            onSwipeableOpen={() => {
              this.closeRow(index);
            }}>
            <View key={data.id} style={styles.swipeoutstyle}>
              <View style={styles.swipeoutstyle1}>
                <Avatar
                  profileIcon={data?.icon}
                  userId={data?.id}
                  name={data?.fN}
                  color={data?.color}
                  isGroupChat={false}
                />

                <View style={styles.swipeoutstyle2}>
                  <Text style={styles.setion3Text}>{name}</Text>
                  <Text style={styles.setion4Text}>{data.emailId}</Text>
                </View>
              </View>
              <View style={styles.swipeoutstyle3} />
            </View>
          </Swipeable>
        );
      });
    };

    const ShowMore = () => {
      if (participants.length <= showLessCount) {
        return null;
      }
      const {expandedParticpentList} = this.state;
      return (
        <TouchableHighlight
          style={styles.showMore1}
          underlayColor="rgba(0,0,0,0.05)"
          onPress={() => {
            this.setState({expandedParticpentList: !expandedParticpentList});
          }}>
          <>
            <Text style={styles.textStyle}>
              {expandedParticpentList ? 'See Less' : 'See All'}
            </Text>
            <View
              style={{
                transform: [
                  {rotate: expandedParticpentList ? '270deg' : '90deg'},
                ],
              }}>
              <Icon name="Right_Direction" size={16} color="#5F6368" />
            </View>
          </>
        </TouchableHighlight>
      );
    };
    return (
      <>
        {this.getSigleOptionsView(addParticipentsOption)}
        <ParticipantsComponent />
        <ShowMore />
      </>
    );
  }

  muteButtonClick(data) {
    const {board} = this.state;
    const item = board;
    const minutesTillMute = data.value || -60 * 24;
    let d = new Date();
    d.setMinutes(d.getMinutes() + minutesTillMute);
    const payload = {
      mute: minutesTillMute !== 0 ? d.getTime() : new Date().getTime(),
    };
    console.log('MUTE UN MUTE', payload);
    this.props.MuteUnmute({id: item?._id}, payload);
    this.refs.modal.closeBottomDrawer();
  }

  renderMuteOptions() {
    const options = [
      {text: '4 hours', value: 60 * 4},
      {text: '1 day', value: 60 * 24},
      {text: '1 week', value: 60 * 24 * 7},
      {text: 'Until turned off', value: 60 * 24 * 7 * 52},
    ];

    const {board} = this.state;
    const item = board;

    let topicName =
      item?.name ||
      getThreadContact(this.state.participants, UsersDao.getUserId());
    return (
      <BottomUpModal ref="modal" height={280}>
        <View style={styles.muteStyle2}>
          <View style={styles.muteViewStyle}>
            <Text
              numberOfLines={1}
              lineBreakMode={'middle'}
              style={styles.muteTextStyle}>
              {'Mute Notification'}
            </Text>
          </View>
          {options.map((option) => {
            return (
              <TouchableHighlight
                key={option.text}
                underlayColor="rgba(0,0,0,0.05)"
                onPress={() => this.muteButtonClick(option)}
                style={styles.muteStyle3}>
                <Text style={styles.optionTextStyle}>{option.text}</Text>
              </TouchableHighlight>
            );
          })}
          <TouchableHighlight
            onPress={() => {
              this.refs.modal.closeBottomDrawer();
            }}
            underlayColor="rgba(0,0,0,0.05)"
            style={styles.muteStyle4}>
            <Text style={styles.cancelTextStyle}>Cancel</Text>
          </TouchableHighlight>
        </View>
      </BottomUpModal>
    );
  }

  renderDeleteMessageOption() {
    const {item} = this.props;
    const delteOptionsArray = [
      {name: 'Remove', key: 1, color: colors.koraAlertNegative},
      {name: 'Cancel', key: 2, color: colors.koraAlertPositive},
    ];
    return (
      <DeleteMessage
        delteOptionsArray={delteOptionsArray}
        title="Do you really want to Remove?"
        ref="deleteModal"
      />
    );
  }

  renderDeleteOptions() {
    const options = [{text: 'Remove'}];
    const {item} = this.props;
    const data = this.state.toDeleteUser;
    let topicName = data.fN + ' ' + data.lN;

    return (
      <BottomUpModal ref="deleteModal" height={200}>
        <View style={styles.bottomModalStyle1}>
          <View style={styles.bottomModalStyle2}>
            <Text numberOfLines={2} style={styles.deleteTopicNameStyle}>
              Do you really want to Remove? {/* Delete {topicName} */}
            </Text>
          </View>
          {options.map((option) => {
            return (
              <TouchableHighlight
                key={option.text}
                underlayColor="rgba(0,0,0,0.05)"
                onPress={() => {
                  this.onDelete(data.id, false);
                  this.refs.deleteModal.closeBottomDrawer();
                }}
                style={styles.bottomModalStyle3}>
                <Text style={styles.removeTextStyle}>{option.text}</Text>
              </TouchableHighlight>
            );
          })}
          <TouchableHighlight
            onPress={() => {
              this.refs.deleteModal.closeBottomDrawer();
            }}
            underlayColor="rgba(0,0,0,0.05)"
            style={styles.bottomModalStyle4}>
            <Text style={styles.cancelTextStyle}>Cancel</Text>
          </TouchableHighlight>
        </View>
      </BottomUpModal>
    );
  }

  renderLeaveOptions() {
    const options = [{text: 'Leave'}];
    const {item} = this.props;
    const data = this.state.toDeleteUser;
    let topicName = data.fN + ' ' + data.lN;

    return (
      <BottomUpModal ref="leaveModal" height={200}>
        <View style={styles.bottomModalStyle1}>
          <View style={styles.bottomModalStyle2}>
            <Text numberOfLines={1} style={styles.deleteTopicNameStyle}>
              Are you sure?
            </Text>
          </View>
          {options.map((option) => {
            return (
              <TouchableHighlight
                key={option.text}
                underlayColor="rgba(0,0,0,0.05)"
                onPress={() => {
                  this.onDelete(data.id, false);
                  this.refs.leaveModal.closeBottomDrawer();
                }}
                style={styles.bottomModalStyle3}>
                <Text style={styles.removeTextStyle}>{option.text}</Text>
              </TouchableHighlight>
            );
          })}
          <TouchableHighlight
            onPress={() => {
              this.refs.leaveModal.closeBottomDrawer();
            }}
            underlayColor="rgba(0,0,0,0.05)"
            style={styles.bottomModalStyle4}>
            <Text style={styles.cancelTextStyle}>Cancel</Text>
          </TouchableHighlight>
        </View>
      </BottomUpModal>
    );
  }

  updateNameDesc(_params, payload) {
    let updataGroupData = {action_type: 'manageGroup'};
    this.props.groupNameChange(_params, payload, updataGroupData);
  }

  render() {
    const {board, recentMembers} = this.state;
    const participants = this.state.participants || emptyArray;
    this.boardId = board?._id;
    const threadId = this.boardId;
    const {t} = this.props;
    const onDoneClick = () => {
      const {topicName, description} = this.state;
      let _params = {
        id: threadId,
      };
      let payload = {name: topicName, desc: description};

      this.updateNameDesc(_params, payload);
      Keyboard.dismiss();
    };

    return (
      <>
        <Header {...this.props} title={t('Group Info')} goBack={true} />
        <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
          <ScrollView bounces={false}>
            <View style={styles.container}>
              <View style={[styles.sectionSingleViewTop]}>
                <View
                  style={{
                    paddingVertical: 18,
                    marginLeft: 90,
                  }}>
                  {recentMembers?.length > 0 ? (
                    <Avatar
                      name={board?.name?.toUpperCase()}
                      groupMembers={recentMembers}
                      isGroupChat={true}
                      membersCount={board?.membersCount}
                    />
                  ) : null}
                </View>
                <TextInput
                  placeholder={t('Name')}
                  placeholderTextColor={'#9AA0A6'}
                  onBlur={() => onDoneClick()}
                  style={[
                    styles.contact,
                    {
                      paddingVertical: 18,
                      paddingHorizontal: 20,
                    },
                  ]}
                  value={this.state.topicName}
                  onChangeText={(topicName) => this.setState({topicName})}
                />
              </View>
              <View
                style={[
                  styles.sectionSingleViewTop,
                  {paddingVertical: 18, paddingHorizontal: 20},
                ]}>
                <TextInput
                  multiline={true}
                  placeholder={t('Add description...')}
                  onBlur={() => onDoneClick()}
                  placeholderTextColor={'#9AA0A6'}
                  value={this.state.description}
                  onChangeText={(description) => this.setState({description})}
                  style={[styles.availableDetails, {paddingVertical: 0}]}
                />
              </View>
              <View style={{flex: 1, marginTop: 25}}>
                {this.optionsView1()}
              </View>
              {this.renderMuteButton()}
              <View style={styles.countTextStyle1}>
                <Text style={styles.countTextStyle}>
                  {participants.length} Participants
                </Text>
              </View>
              <View style={styles.participantsStyle}>
                {this.renderParticipants(participants)}
              </View>
              <View style={styles.participantsStyle1}>
                {this.optionsView2()}
              </View>
            </View>
          </ScrollView>
          {this.renderMuteOptions()}
          {this.renderDeleteMessageOption()}
          {this.renderLeaveOptions()}
          {this.state.toggleGroupPanel && this.groupIconOptions()}
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EFF0F1',
    flex: 1,
    alignItems: 'baseline',
    justifyContent: 'flex-start',
  },
  image: {
    width: '100%',
    height: 230,
  },
  textStyle: {
    marginStart: 10,
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
  },
  showMore1: {
    padding: 21,
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  sectionSingleViewTop: {
    backgroundColor: '#FFF',
    width: '100%',
    borderBottomWidth: 1.5,
    borderColor: '#EFF0F1',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionSingleView: {
    backgroundColor: '#FFF',
    width: '100%',
    padding: 20,
    borderBottomWidth: 1.5,
    borderColor: '#EFF0F1',
    justifyContent: 'flex-start',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionSingleViewSub: {
    backgroundColor: '#FFF',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 0,
  },
  sectionSingleView1: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionSingleView2: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionSingleView3: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionSingleView4: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  setion2Text: {
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    fontWeight: 'normal',
    marginStart: 10,
    fontSize: normalize(16),
    lineHeight: 19,
    color: '#202124',
    flex: 1,
    paddingStart: 10,
  },
  setion3Text: {
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: normalize(16),
    maxHeight: 25,
    color: '#202124',
    flex: 1,
    paddingStart: 10,
  },
  setion4Text: {
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: normalize(13),
    maxHeight: 20,
    color: '#202124',
    flex: 1,
    paddingStart: 10,
  },
  contact: {
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: normalize(20),
    color: '#202124',
    width: '100%',
  },
  availableDetails: {
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: normalize(16),
    width: '100%',
  },
  arrow: {
    alignSelf: 'center',
    alignItems: 'center',
  },
  elementNameTextStyle: {
    color: '#202124',
    fontWeight: 'normal',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    marginStart: 20,
  },
  optionTextStyle: {
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
  },
  removeTextStyle: {
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: colors.koraAlertNegative,
  },
  muteViewStyle: {
    paddingTop: 10,
    paddingLeft: 20,
    paddingBottom: 11,
    borderBottomWidth: 0.4,
    borderColor: '#9AA0A6',
  },
  muteTextStyle: {
    color: '#202124',
    fontSize: normalize(16),
    fontWeight: '600',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  cancelTextStyle: {
    color: colors.koraAlertPositive,
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  deleteTopicNameStyle: {
    color: '#202124',
    flexShrink: 1,
    fontSize: normalize(16),
    fontWeight: '600',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  countTextStyle: {
    color: '#202124',
    fontSize: normalize(12),
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  countTextStyle1: {
    flex: 1,
    paddingStart: 20,
    paddingTop: 15,
    paddingBottom: 12,
  },
  participantsStyle: {
    flexDirection: 'column',
    flex: 1,
    width: '100%',
  },
  participantsStyle1: {
    flex: 1,
    marginTop: 15,
    backgroundColor: '#FFF',
  },
  swipeoutstyle: {
    backgroundColor: '#fff',
    paddingTop: 1,
    width: '100%',
  },
  swipeoutstyle1: {
    height: 60,
    flex: 1,
    paddingStart: 15,
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  swipeoutstyle2: {
    flexDirection: 'column',
    alignContent: 'center',
    flexShrink: 1,
  },
  swipeoutstyle3: {
    borderBottomColor: '#EFF0F1',
    borderBottomWidth: 1.5,
  },
  rightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  swipeChildStyle: {
    width: 90,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteStyle1: {width: 24, alignItems: 'center', justifyContent: 'center'},
  muteStyle2: {flexDirection: 'column', paddingTop: 10, borderRadius: 4},
  muteStyle3: {
    borderRadius: 4,
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginHorizontal: 10,
    paddingVertical: 16,
  },
  muteStyle4: {paddingLeft: 20, paddingVertical: 16},
  bottomModalStyle1: {
    flexDirection: 'column',
    borderRadius: 4,
  },
  bottomModalStyle2: {
    paddingTop: 14,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 14,
    borderBottomWidth: 0.4,
    borderColor: '#9AA0A6',
    marginBottom: 9,
    flexShrink: 1,
    flexDirection: 'row',
  },
  bottomModalStyle3: {
    borderRadius: 4,
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginHorizontal: 10,
    paddingVertical: 10,
  },
  bottomModalStyle4: {paddingLeft: 20, paddingVertical: 10},
});

const groupStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 15,
    backgroundColor: 'white',
    padding: 5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  textStyle: {
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: normalize(16),
    fontFamily: Constants.fontFamily,
    padding: 15,
  },
  viewStyle: {
    padding: 5,
  },
  opacityStyle: {
    height: 60,
    justifyContent: 'center',
    flexDirection: 'column',
  },
  opacityStyle1: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  opacityStyle2: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalStyle1: {borderWidth: 0.4, borderColor: '#9AA0A6'},
  modalStyle2: {padding: 10},
});

const mapStateToProps = (state) => {
  let {
    createMessage,
    messageThreadList,
    groupIconUpdate,
    discussion,
    preview,
  } = state;
  return {
    groupIconResponse: groupIconUpdate.groupIconResponse,
    contactlist: createMessage.contactlistData,
    threadFindData: createMessage.threadFindData,
    newChat: messageThreadList.newChat,
    grpName: createMessage.grpName,
    threadList: messageThreadList.thread,
    activeBoardId: messageThreadList.activeBoardId,
    boardMembers: discussion.boardMembers,
    boardMembersAfterDelete: messageThreadList.boardMembersAfterDelete,
    usermuteUnmuteThread: messageThreadList.usermuteUnmuteThread,
    changedGroupName: messageThreadList.changedGroupName,
  };
};

export default connect(mapStateToProps, {
  addParticipants,
  MuteUnmute,
  deleteUserFromGrup,
  searchModeOn,
  deleteUserChtHistry,
  selectedContactList,
  groupIconUpdate,
  getBoardMembers,
  groupNameChange,
})(withTranslation()(GroupDetailsScreen));
