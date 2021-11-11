import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  TextInput,
  PermissionsAndroid,
  FlatList,
  Alert,
  Animated,
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import {withTranslation} from 'react-i18next';
import {Icon} from '../../../components/Icon/Icon';
//import Swipeout from '../../../components/Library/react-native-swipeout/src';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {BottomUpModal} from '../../../components/BottomUpModal';
import Toast from 'react-native-simple-toast';
import {goBack, navigate} from '../../../navigation/NavigationService';
import {ROUTE_NAMES} from '../../../navigation/RouteNames';
import {Header} from '../../../navigation/TabStacks';
import {DeleteThread} from '../../ChatsThreadScreen/chats-thread';
import {RoomAvatar} from '../../../components/RoomAvatar';
import {
  getDiscussions,
  updateDiscussion,
  leaveDiscussion,
  deleteDiscussion,
  postViaEmail,
  discussionIcon,
  getBoardMembers,
} from '../../../../shared/redux/actions/discussions.action';
import {processLinkImage} from '../../../../shared/redux/actions/common.action';
import {
  setExceptionList,
  toggleExceptionListItem,
} from '../../../../shared/redux/actions/native.action';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Avatar} from '../../../components/Icon/Avatar';
import {
  getAllWSMembers,
  changeBoardLinkScope,
} from '../../../../shared/redux/actions/workspace.action';
import {getEmojiFromUnicode, getIconFromUnicode} from '../../../utils/emoji';
import emojiJSON from '../../../assets/joypixels/emoji.json';
import category from '../../../assets/joypixels/categories.json';
import * as Constants from '../../../components/KoraText';
import {normalize} from '../../../utils/helpers';
import {Keyboard} from 'react-native';
import {discussionsACL} from '../../../core/AccessControls';
import {toastRef} from '../../../components/Toast';
import {showToast} from '../../../core/ErrorMessages';
import {createRef} from 'react';
import {permissionOptions} from '../../NewDiscussion';
import {KoraToggleSwitch} from '../../../components/toggleButton';
import {SafeAreaView} from 'react-native';
import * as UsersDao from '../../../../dao/UsersDao';
import * as WorkspacesDao from '../../../../dao/WorkspacesDao';
import {
  emptyArray,
  emptyObject,
} from '../../../../shared/redux/constants/common.constants';
import {colors} from '../../../theme/colors';
import {BottomUpModalShare} from '../../../components/BottomUpModal/BottomUpModalShare';
import DeleteMessage from '../../../components/Chat/DeleteChatItemEvent';
import * as Entity from '../../../../native/realm/dbconstants';
import database from '../../../../native/realm';

const _emojiData = category;
const delteOptionsArray = [
  // {name: 'Are you sure? You really want to delete?', key: 1, color:'black'},
  {name: 'Delete Room', key: 1, color: colors.koraAlertNegative, title: ''},
  {name: 'Cancel', key: 2, color: colors.koraAlertPositive, title: ''},
];

const leaveDiscussionArray = [
  // {name: 'Are you sure? You really want to delete?', key: 1, color:'black'},
  {name: 'Yes, Leave Room', key: 1, color: colors.koraAlertNegative},
  {name: 'Cancel', key: 2, color: colors.koraAlertPositive},
];

const removeDiscussionArray = [
  // {name: 'Are you sure? You really want to delete?', key: 1, color:'black'},
  {name: 'Remove', key: 1, color: colors.koraAlertNegative},
  {name: 'Cancel', key: 2, color: colors.koraAlertPositive},
];

Object.keys(emojiJSON).map((unicode) => {
  if (emojiJSON[unicode].category !== 'modifier') {
    if (!_emojiData.hasOwnProperty(emojiJSON[unicode].category)) {
      _emojiData[emojiJSON[unicode].category] = {};
    }
    _emojiData[emojiJSON[unicode].category][unicode] = emojiJSON[unicode];
  }
});
// let data = Object.keys(_emojiData).map((key) => ({
//   ..._emojiData[key],
// }));

const emojiList = Object.keys(emojiJSON);
//const {t} = withTranslation();
//const description = t('Add description....');
const row = [];
let prevOpenedRow = null;

export class BoardProfilePicture extends React.Component {
  constructor(props) {
    super(props);
    this.modal = React.createRef();
  }

  open() {
    this.modal.current.open();
  }

  close() {
    this.modal.current.close();
  }

  renderItem = ({item}) => {
    const onPress = () => {
      let category = emojiJSON[item].category;
      let payload = {
        logo: {
          type: 'emoji',
          val: {
            category,
            unicode: item,
          },
        },
      };

      this.props.uploadEmoji(payload);
    };

    return (
      <TouchableHighlight
        underlayColor={(0, 0, 0, 0.5)}
        onPress={onPress}
        style={{
          margin: 3,
          // height: 35,
          // width: 35,
          alignItems: 'center',
        }}>
        <Text style={styles.emojiTextStyle}>
          {getEmojiFromUnicode(item, 24, 24)}
        </Text>
      </TouchableHighlight>
    );
  };

  keyExtractor = (item, index) => item;

  render() {
    return (
      <BottomUpModalShare ref={this.modal} height={470}>
        <View style={{marginTop: 35}}>
          <View
            style={{
              borderColor: '#EFF0F1',
            }}
          />
          <View
            style={{
              marginLeft: 15,
              marginRight: 15,
            }}>
            <View
              style={{
                borderColor: '#BDC1C6',
                borderWidth: 1,
                borderRadius: 4,
                height: 45,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Icon
                name={'Contact_Search'}
                size={18}
                color={'#5F6368'}
                style={{padding: 10}}
              />
              <TextInput
                placeholder="Search emoji"
                placeholderTextColor="#5F6368"
                maxLength={15}
                onChangeText={this.emojiSearchChange}
                style={styles.searchTextInputStyle}
              />
            </View>
            <FlatList
              data={emojiList}
              height={360}
              initialNumToRender={8}
              style={styles.marginTop10}
              horizontal={false}
              numColumns={8}
              windowSize={50}
              columnWrapperStyle={styles.justifyContentSpaceBetween}
              removeClippedSubviews={true}
              renderItem={this.renderItem}
              //numColumns={9}
              keyExtractor={this.keyExtractor}
            />
          </View>
        </View>
      </BottomUpModalShare>
    );
  }
}

class RoomDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      desc: '',
      currentTab: 1,
      searchEmoji: '',
      imageUrl: '',
      allowedForPost: {
        isAllMembers: true,
        members: [],
      },
      switchValue: false,
      showAll: false,
      wsName: '',
      // description: description,
      board: {},
      allowViaEmail: true,
      emailid: '',
      toDeleteUser: {},
      members: [],
    };
    this.copyLinkModalRef = createRef(null);
    this.permissionLevel = createRef(null);
    this.deleteUserConfirmModalRef = createRef(null);
    this.deleteBoardConfirmModalRef = createRef(null);
    this.leaveBoardConfirmModalRef = createRef(null);
    //const t = this.props;
  }

  showAll_fun = () => {
    this.setState({showAll: !this.state.showAll});
  };

  get board() {
    return this.state.board;
  }

  get boardFromRoute() {
    return this.props.route.params.board;
  }
  subscribeBoard = async () => {
    try {
      // const workspace= await workSpaceCollection.find(wsId);
      this.boardObservable = this.boardFromRoute.observe();
      this.boardSubscription = this.boardObservable.subscribe((board) => {
        this.setState({board: board});
      });
    } catch (e) {}
  };

  subscribeWorkspaces = async (wsId) => {
    const db = database.active;
    const workSpaceCollection = db.collections.get(Entity.Workspaces);
    try {
      const workspace = await workSpaceCollection.find(wsId);
      this.wsObservable = workspace.observe();
      this.wsSubscription = this.wsObservable.subscribe((workspaces) => {
        this.setState({workspace: workspaces});
      });
    } catch (e) {}
  };

  componentDidMount() {
    const board = this.boardFromRoute;
    const {wsId, id} = this.props.route.params.board;
    this.props.getBoardMembers({
      wsId: wsId,
      rId: id,
    });
    this.subscribeWorkspaces(wsId);
    this.subscribeBoard();

    if (board?.isAllMembers) {
      this.props.getAllWSMembers(wsId);
    }
    // this.board?.addListener &&
    //   this.board?.addListener((b) => {
    this.setState({name: board.name, desc: board.desc});
    // });
    this.subscribeWorkspaceMember();
  }

  subscribeWorkspaceMember = async () => {
    try {
      const members = await this.board?.members.fetch();
      this.setState({members: members});
    } catch (e) {}
  };

  componentWillUnmount() {
    this.board?.removeAllListeners && this.board?.removeAllListeners();
    this.setState = (param1, param2) => {};

    if (this.wsSubscription && this.wsSubscription.unsubscribe) {
      this.wsSubscription.unsubscribe();
    }
    if (this.boardSubscription && this.boardSubscription.unsubscribe) {
      this.boardSubscription.unsubscribe();
    }
  }

  button = () => {
    const {t} = this.props;
    return (
      <TouchableOpacity
        style={{
          marginLeft: 20,
          height: 60,
          alignItems: 'center',
          flexDirection: 'row',
        }}
        onPress={() =>
          navigate(ROUTE_NAMES.MEMBERS, {
            board: this.board,
          })
        }>
        <Text style={styles.seeAllTextStyle}>{t('See all')}</Text>
        <View style={{paddingRight: 20}}>
          <Icon name={'Right_Direction'} size={16} color="#5F6368" />
        </View>
      </TouchableOpacity>
    );
  };

  leaveDiscussion(id) {
    const board = this.board;
    //console.log('Button',[id]);
    let _params = {
      wsId: board.wsId,
      rId: board.id,
    };
    let payload = {
      removeMembers: [id],
    };
    let boards = board;
    let updataDiscData = {
      action_type: 'delete-member',
      boards,
    };
    //console.log(id);
    if (id === UsersDao.getUserId()) {
      payload = {
        leaveBoard: true,
      };
    }
    this.props.leaveDiscussion(_params, payload, () => {
      if (id === UsersDao.getUserId()) {
        goBack();
        goBack();
      }
    });
  }
  deleteDiscussion(value) {
    const board = this.board;
    let _params = {
      wsId: board.wsId,
      rId: board.id,
      fromManageDiscussion: value,
    };
    this.props.deleteDiscussion(_params);
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

  newRight(progress, dragX, data, isUser, canRemoveMember) {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [90, 0],
    });

    return !isUser && canRemoveMember ? (
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
              this.deleteUserConfirmModalRef?.current?.openModal(
                (onPannelStatus) => {
                  // this.setState({
                  //   onDeletePannelStatus: onPannelStatus,
                  // });
                },
                (element) => {
                  switch (element.key) {
                    case 1:
                      this.removeUser();
                      // this.onDeleteButtonClick();
                      // this.deleteForSelf(id);
                      break;
                    case 2:
                      break;
                    case 3:
                      break;
                  }
                },
              );
              // this.deleteUserConfirmModalRef.current.openBottomDrawer();
            }}>
            <DeleteThread text="Remove" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    ) : null;
  }

  showParticipants = () => {
    const {t} = this.props;
    const {canRemoveMember} = discussionsACL(this.board);
    if (!this.state.showAll) {
      let members = this.props.boardMembers?.members || emptyArray;
      return members?.slice(0, 2).map((data, index) => {
        if (!data) {
          return null;
        }
        let name = data.fN + ' ' + data.lN;
        const isUser = data.id === UsersDao.getUserId();
        if (isUser) {
          name = t('You');
        }

        // let swipeoutBtns = null;
        // if (!isUser && canRemoveMember) {
        // swipeoutBtns = [
        //   {
        //     text: t('Remove'),
        //     component: <DeleteThread text={t('Remove')} />,
        //     onPress: () => {
        //       this.leaveDiscussion(data.id);
        //     },
        //     backgroundColor: '#DD3646',
        //   },
        // ];
        // }
        return (
          <Swipeable
            ref={(ref) => {
              row[index] = ref;
            }}
            renderRightActions={(progress, dragx) =>
              this.newRight(progress, dragx, data, isUser, canRemoveMember)
            }
            friction={2}
            leftThreshold={30}
            rightThreshold={10}
            useNativeAnimations={true}
            onSwipeableOpen={() => {
              this.closeRow(index);
            }}>
            <View style={styles.view1}>
              <Avatar
                profileIcon={data?.icon}
                userId={data?.id}
                name={data?.fN}
                color={data?.color}
              />
              <TouchableOpacity
                style={{flexDirection: 'column', marginLeft: 10}}>
                <Text style={{...styles.nameTextStyle, paddingVertical: 2}}>
                  {name}
                </Text>
                <Text
                  style={{...styles.emailIdTextStyle, paddingVertical: 1.5}}>
                  {data.emailId}
                </Text>
              </TouchableOpacity>
            </View>
          </Swipeable>
        );
      });
    } else {
      return this.board?.members.map((data, index) => {
        let name = data.fN + ' ' + data.lN;
        const isUser = data.id === UsersDao.getUserId();
        if (isUser) {
          name = 'You';
        }
        let swipeoutBtns = null;
        if (!isUser) {
          swipeoutBtns = [
            {
              text: 'Remove',
              component: <DeleteThread text={'Remove'} />,
              onPress: () => {
                this.leaveDiscussion(data.id);
              },
              backgroundColor: '#DD3646',
            },
          ];
        }
        return (
          <Swipeable
            ref={(ref) => {
              row[index] = ref;
            }}
            renderRightActions={(progress, dragx) =>
              this.newRight(progress, dragx, data, isUser, true)
            }
            friction={2}
            leftThreshold={30}
            rightThreshold={10}
            useNativeAnimations={true}
            onSwipeableOpen={() => {
              this.closeRow(index);
            }}>
            <View
              style={{
                borderBottomColor: '#EFF0F1',
                borderBottomWidth: 1,
              }}>
              <Avatar
                profileIcon={data?.icon}
                userId={data?.id}
                name={data?.fN}
                color={data?.color}
              />
              <TouchableOpacity style={styles.view3}>
                <Text style={styles.nameTextStyle}>{name}</Text>
                <Text style={styles.emailIdTextStyle}>{data.emailId}</Text>
              </TouchableOpacity>
            </View>
          </Swipeable>

          // <Swipeout
          //   key={data.id}
          //   right={swipeoutBtns}
          //   style={{backgroundColor: 'white'}}>
          //   <View
          //     style={{
          //       borderBottomColor: '#EFF0F1',
          //       borderBottomWidth: 1,
          //     }}>
          //     <Avatar name={data?.fN} color={data?.color} />
          //     <TouchableOpacity
          //       style={{flexDirection: 'column', marginLeft: 10}}>
          //       <Text style={styles.nameTextStyle}>{name}</Text>
          //       <Text style={styles.emailIdTextStyle}>{data.emailId}</Text>
          //     </TouchableOpacity>
          //   </View>
          // </Swipeout>
        );
      });
    }
  };

  leaveBoardConfirmModal() {
    const {t} = this.props;
    const onYesClick = () => this.leaveDiscussion(UsersDao.getUserId());
    const title = t('Are you sure?');
    const yesText = t('Yes, Leave Discussion');
    //let boardName = this.props.boardName;
    return (
      <BottomUpModal ref={this.leaveBoardConfirmModalRef} height={250}>
        <View style={{flexDirection: 'column'}}>
          <View
            style={{
              marginHorizontal: 20,
              marginVertical: 30,
              flexDirection: 'row',
            }}>
            <Text style={styles.leaveRoomTextStyle}>{title}</Text>
          </View>
          <TouchableHighlight
            underlayColor="rgba(0,0,0,0.05)"
            onPress={() => onYesClick()}
            style={{paddingHorizontal: 15}}>
            <View
              style={{
                borderRadius: 4,
                backgroundColor: '#DD3646',
                alignItems: 'center',
              }}>
              <Text style={styles.leaveDiscussionTextStyle}>{yesText}</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor="rgba(0,0,0,0.05)"
            onPress={() => {
              this.leaveBoardConfirmModalRef?.current?.closeModal();
            }}
            style={{paddingHorizontal: 15}}>
            <View
              style={{
                marginTop: 8,
                alignItems: 'center',
              }}>
              <Text style={styles.cancelTextStyle}>{t('Cancel')}</Text>
            </View>
          </TouchableHighlight>
          {/* <TouchableHighlight
            onPress={() => {
              this.leaveBoardConfirmModalRef?.current?.closeBottomDrawer();
            }}
            underlayColor="rgba(0,0,0,0.05)"
            style={{alignItems: 'center', marginTop:8}}>
           <View style={{borderRadius: 4,
           alignItems: 'center',
           justifyContent:'center',
                borderWidth:1,
                borderColor: 'grey',
                height:48,
                width:'92%',
                paddingHorizontal: 15}}>
            <Text style={styles.cancelTextStyle}>{t('Cancel')}</Text>
            </View>
          </TouchableHighlight> */}
        </View>
      </BottomUpModal>
    );
  }

  deleteBoardConfirmModal() {
    const {t} = this.props;
    let onYesClick = () => this.deleteDiscussion(true);
    let title = t('Are you sure?');
    let yesText = t('Yes, Leave Discussion');
    return (
      <BottomUpModal ref={this.deleteBoardConfirmModalRef} height={250}>
        <View style={{flexDirection: 'column'}}>
          <View
            style={{
              marginHorizontal: 20,
              marginVertical: 30,
              flexDirection: 'row',
            }}>
            <Text style={styles.leaveRoomTextStyle}>{title}</Text>
          </View>
          <TouchableHighlight
            underlayColor="rgba(0,0,0,0.05)"
            onPress={() => onYesClick()}
            style={{paddingHorizontal: 15}}>
            <View
              style={{
                borderRadius: 4,
                backgroundColor: '#DD3646',
                alignItems: 'center',
              }}>
              <Text style={styles.leaveDiscussionTextStyle}>{yesText}</Text>
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            onPress={() => {
              this.deleteBoardConfirmModalRef.current?.closeModal();
            }}
            underlayColor="rgba(0,0,0,0.05)"
            style={{paddingHorizontal: 15}}>
            <View
              style={{
                marginTop: 16,
                borderRadius: 4,
                borderWidth: 1,
                alignItems: 'center',
                borderColor: 'grey',
              }}>
              <Text style={styles.cancelTextStyle}>{t('Cancel')}</Text>
            </View>
          </TouchableHighlight>
        </View>
      </BottomUpModal>
    );
  }

  deleteUserConfirmModal(options) {
    return (
      <DeleteMessage
        delteOptionsArray={options}
        title="Are you sure?"
        ref={this.deleteUserConfirmModalRef}
      />
    );

    // const {t} = this.props;
    // let onYesClick = () => this.deleteDiscussion(true);
    // let title = t('Are you sure?');
    // let yesText = t('Remove');
    // return (
    //   <BottomUpModal ref={this.deleteUserConfirmModalRef} height={250}>
    //     <View style={{flexDirection: 'column'}}>
    //       <View
    //         style={{
    //           marginHorizontal: 20,
    //           marginVertical: 30,
    //           flexDirection: 'row',
    //         }}>
    //         <Text style={styles.leaveRoomTextStyle}>{title}</Text>
    //       </View>
    //       <TouchableHighlight
    //         underlayColor="rgba(0,0,0,0.05)"
    //         onPress={() => this.removeUser()}
    //         style={{paddingHorizontal: 15}}>
    //         <View
    //           style={{
    //             borderRadius: 4,
    //             backgroundColor: '#DD3646',
    //             alignItems: 'center',
    //           }}>
    //           <Text style={styles.leaveDiscussionTextStyle}>{yesText}</Text>
    //         </View>
    //       </TouchableHighlight>

    //       <TouchableHighlight
    //         onPress={() => {
    //           this.deleteUserConfirmModalRef.current?.closeBottomDrawer();
    //         }}
    //         underlayColor="rgba(0,0,0,0.05)"
    //         style={{paddingHorizontal: 15}}>
    //         <View
    //           style={{
    //             marginTop: 16,
    //             borderRadius: 4,
    //             borderWidth: 1,
    //             alignItems: 'center',
    //             borderColor: 'grey',
    //           }}>
    //           <Text style={styles.cancelTextStyle}>{t('Cancel')}</Text>
    //         </View>
    //       </TouchableHighlight>
    //     </View>
    //   </BottomUpModal>
    // );
  }

  removeUser = () => {
    this.deleteUserConfirmModalRef.current?.closeModal();
    this.leaveDiscussion(this.state.toDeleteUser.id);
  };
  uploadEmoji = (payload) => {
    const board = this.board;
    let _params = {
      wsId: board.wsId,
      rId: board.id,
    };

    this.props.discussionIcon(_params, payload);
    this.refs.DiscProfilePicture.close();
  };

  uploadViaLink() {
    const board = this.board;
    let _params = {
      wsId: board.wsId,
      rId: board.id,
    };
    let payload = {
      imageUrl: {link: this.state.imageUrl},
    };
    this.props.discussionIcon(_params, payload);
  }
  renderEmojiList(searchValue) {
    console.log('EmojiList', emojiJSON);
  }

  emojiSearchChange = (searchEmoji) => {
    this.setState({searchEmoji});
    this.renderEmojiList(searchEmoji);
  };

  updateProfilePicture() {
    const {t} = this.props;
    return null;
  }

  renderException() {
    const {t} = this.props;
    return (
      <View style={{backgroundColor: 'white'}}>
        <TouchableHighlight
          style={{
            display: 'flex',
            paddingTop: 5,
            paddingStart: 10,
            paddingEnd: 10,
            marginStart: 10,
            marginEnd: 10,
            marginBottom: 5,
          }}
          underlayColor="rgba(0,0,0,0.05)"
          onPress={() => {
            this.props.setExceptionList(this.board.members);
            navigate(ROUTE_NAMES.ADD_EXCEPTIONS, {
              board: this.board,
            });
            this.board.members;
          }}>
          <View style={{}}>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text
                style={{
                  ...styles.textStyle,
                  color: '#202124',
                }}>
                {t('Add Exceptions')}
              </Text>

              <Icon name={'Right_Direction'} size={22} color="#9AA0A6" />
            </View>
            <Text style={styles.addExceptionTextStyle}>
              {t(
                'You can still make a set of people in your discussion room can share posts by selecting “Add Exceptions” above.',
              )}
            </Text>
          </View>
        </TouchableHighlight>
      </View>
    );
  }

  renderCopyLinkModal() {
    let {link} = this.board;
    link = {};
    const {id, scope = '', access, shareUrl = ''} = link;
    const {t} = this.props;
    const options = [
      {
        id: 1,
        title: t('Anyone with Link'),
        desc: t('Everyone with this link can access using this link'),
        icon: 'Globe',
        access: 'View Only',
        value: 'private',
      },
      {
        id: 2,
        title: t('Everyone in the account'),
        desc: t('Everyone at kore can access using this link'),
        icon: 'Company',
        access: 'View Only',
        value: 'account',
      },
    ];
    return (
      <BottomUpModal ref={this.copyLinkModalRef} height={200}>
        <View
          style={{
            marginVertical: 15,
            paddingVertical: 10,
            paddingHorizontal: 10,
          }}>
          {options.map(({title, desc, icon, value}) => {
            const isSelected = scope === value;
            return (
              <TouchableOpacity
                onPress={() => {
                  this.props?.changeBoardLinkScope({
                    wsId: this.board?.wsId,
                    boardId: this.board?._id,
                    data: {
                      scope: value,
                    },
                    link: this.board?.link,
                  });
                  this.copyLinkModalRef.current?.closeBottomDrawer();
                }}
                underlayColor="rgba(0,0,0,0.1)"
                style={{
                  flexDirection: 'row',
                  borderRadius: 5,
                  paddingVertical: 10,
                }}>
                <View style={{flexDirection: 'row', flex: 1}}>
                  <View style={{paddingHorizontal: 10, paddingTop: 4}}>
                    <Icon size={normalize(19)} name={icon} />
                  </View>
                  <View style={{flexShrink: 1}}>
                    <Text style={styles.title}>{title}</Text>
                    <Text numberOfLines={1} style={styles.content}>
                      {desc}
                    </Text>
                  </View>
                  <View style={{flex: 1, flexDirection: 'row'}} />
                  {isSelected && (
                    <View
                      style={{
                        justifyContent: 'center',
                      }}>
                      <Icon name={'SingleTick'} color={'#0d6efd'} size={15} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomUpModal>
    );
  }

  renderCopyLink() {
    let {link} = this.board;
    link = link || emptyObject;
    const {id, scope = '', access, shareUrl = ''} = link;
    if (shareUrl === '') {
      return null;
    }
    return (
      <View
        style={{
          backgroundColor: 'white',
          paddingHorizontal: 20,
          paddingVertical: 20,
          marginBottom: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <View style={{flexDirection: 'column', flexShrink: 1}}>
          <View>
            <Text numberOfLines={1} style={styles.postViaEmailTextStyle}>
              {'Get Link'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              this.copyLinkModalRef.current?.open();
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingRight: 15,
              marginTop: 4,
              flex: 1,
            }}>
            <Text
              numberOfLines={1}
              style={[styles.emailTextStyle, {flexShrink: 1}]}>
              {'Only people invited can join with this link'}
            </Text>
            <View style={{width: 15}}>
              <Icon name={'Right_Direction'} size={15} color="#5F6368" />
            </View>
          </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'column', justifyContent: 'center'}}>
          <TouchableOpacity
            onPress={() => {
              Clipboard.setString(shareUrl || '');
              Toast.showWithGravity('Copied', Toast.SHORT, Toast.BOTTOM);
            }}>
            <Icon name={'Copy'} size={22} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderSubMenu() {
    const BOARD_ACCESS = {
      10: {title: 'View Only', subText: 'Only view'},
      20: {title: 'Comment Only', subText: 'Can view and comment'},
      30: {title: 'Post Only', subText: 'Can post and comment'},
      40: {title: 'Full Access', subText: 'Can edit and share'},
      50: {title: 'Owner', subText: 'Can delete and restore'},
    };
    const options = Object.entries(BOARD_ACCESS).map(([key, val]) => {
      return {...val, key};
    });
    const _key = this.board.access || permissionOptions[0].key;
    const text = permissionOptions.find(({key}) => key === _key)?.text;
    const ws = this.state.workspace;
    let wsName = ws?.name || 'this workspace';

    return (
      <View
        style={{
          flexDirection: 'column',
          backgroundColor: 'white',
          marginTop: 20,
        }}>
        <View style={{margin: 20, flexDirection: 'row'}}>
          <View style={{paddingHorizontal: 5, marginEnd: 4}}>
            <Icon size={normalize(24)} name={'People'} />
          </View>
          <View
            style={{
              paddingHorizontal: 5,
              marginStart: 4,
              marginEnd: 10,
              flexShrink: 1,
            }}>
            <Text style={styles.postViaEmailTextStyle}>
              <Text
                style={{color: '#0D6EFD', marginLeft: -10}}
                suppressHighlighting={true}
                onPress={() => {
                  this.setState({wsName});
                  navigate(ROUTE_NAMES.WORKSPACE_MEMBERS_SCREEN, {
                    wsName: wsName,
                    wsId: this.board?.wsId,
                  });
                }}>
                All Members{' '}
              </Text>
              at{' '}
              <Text
                style={{...styles.postViaEmailTextStyle, fontWeight: '700'}}>
                {wsName}{' '}
              </Text>
              can{' '}
              <Text
                onPress={() => this.permissionLevel.current.openBottomDrawer()}
                suppressHighlighting={true}
                style={{...styles.postViaEmailTextStyle, fontWeight: '700'}}>
                {BOARD_ACCESS[this.board?.wsMembersAccess]?.title || ''}
              </Text>{' '}
              to this board
            </Text>
          </View>
          <View>
            <KoraToggleSwitch
              isToggleOn={this.board?.isAllMembers}
              onChange={(isAllMembers) => {
                let _params = {
                  wsId: this.board.wsId,
                  rId: this.board.id,
                };

                this.props.updateDiscussion(_params, {isAllMembers});
              }}
            />
          </View>
        </View>
        {/* {this.board.isAllMembers ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginStart: 20,
              marginEnd: 20,
              marginBottom: 20,
            }}>
            <Text style={styles.permissionsTextStyle}>Permission Level</Text>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.textStyle2}>{text}</Text>
              <TouchableHighlight
                underlayColor={'rgba(0,0,0,0.1)'}
                onPress={() => this.permissionLevel.current.openBottomDrawer()}>
                <Icon name={'DownArrow'} size={normalize(24)} color="#5F6368" />
              </TouchableHighlight>
            </View>
          </View>
        ) : null} */}
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: '#E4E5E7',
          }}
        />
      </View>
    );
  }

  renderPermissionLevel() {
    return (
      <BottomUpModal ref={this.permissionLevel} height={270}>
        <View style={{padding: 14}}>
          {permissionOptions.map((option) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  let _params = {
                    wsId: this.board.wsId,
                    rId: this.board.id,
                  };
                  this.props.updateDiscussion(_params, {
                    wsMembersAccess: option.key,
                  });

                  this.permissionLevel.current.closeBottomDrawer();
                }}
                key={option.key}
                underlayColor={'rgba(0,0,0,0.1)'}
                style={{
                  margin: 6,
                  borderRadius: 4,
                  marginHorizontal: 10,
                }}>
                <View>
                  <Text style={styles.optionTextStyle}>{option.text}</Text>
                  <Text style={styles.optionDescTextStyle}>
                    {option.description}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomUpModal>
    );
  }

  renderDeleteBoard() {
    const {t} = this.props;
    return (
      <View style={{backgroundColor: 'white', marginTop: 20}}>
        <View
          style={{
            borderBottomColor: '#EFF0F1',
            borderBottomWidth: 1,
          }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              height: 60,
              marginLeft: 20,
              alignItems: 'center',
              color: '#DD3646',
            }}
            onPress={() => {
              this.deleteBoardConfirmModalRef?.current?.openModal(
                (onPannelStatus) => {
                  // this.setState({
                  //   onDeletePannelStatus: onPannelStatus,
                  // });
                },
                (element) => {
                  switch (element.key) {
                    case 1:
                      this.deleteDiscussion(true);
                      // this.onDeleteButtonClick();
                      // this.deleteForSelf(id);
                      break;
                    case 2:
                      break;
                    case 3:
                      break;
                  }
                },
              );
              // this.deleteBoardConfirmModalRef.current.openBottomDrawer();
              //this.leaveDiscussion(UserAuth.getUserId());
            }}>
            <Icon name={'Delete_T'} size={22} color={'#DD3646'} />
            <Text style={styles.leaveTextStyle}>{t('Delete Room')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderLeaveDiscussion() {
    const {t} = this.props;
    return (
      <View style={{backgroundColor: 'white'}}>
        <View
          style={{
            borderBottomColor: '#EFF0F1',
            borderBottomWidth: 1,
          }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              height: 60,
              marginLeft: 20,
              alignItems: 'center',
              color: '#DD3646',
            }}
            onPress={() => {
              this.leaveBoardConfirmModalRef?.current?.openModal(
                (onPannelStatus) => {
                  // this.setState({
                  //   onDeletePannelStatus: onPannelStatus,
                  // });
                },
                (element) => {
                  switch (element.key) {
                    case 1:
                      this.leaveDiscussion(UsersDao.getUserId());
                      // this.onDeleteButtonClick();
                      // this.deleteForSelf(id);
                      break;
                    case 2:
                      break;
                    case 3:
                      break;
                  }
                },
              );
              //this.leaveDiscussion(UserAuth.getUserId());
            }}>
            <Icon name={'Exit'} size={22} color={'#DD3646'} />
            <Text style={styles.leaveTextStyle}>{t('Leave Room')}</Text>
          </TouchableOpacity>
          {/* ) : null} */}
        </View>
      </View>
    );
  }

  renderDeleteMessageOption(options) {
    return (
      <DeleteMessage
        delteOptionsArray={options}
        title="Are you sure?"
        ref={this.deleteBoardConfirmModalRef}
      />
    );
  }

  renderLeaveDiscussionOption(options) {
    return (
      <DeleteMessage
        delteOptionsArray={options}
        title="Are you sure?"
        ref={this.leaveBoardConfirmModalRef}
      />
    );
  }

  render() {
    const {t} = this.props;
    const postviaEmail = this.board.isEmailEnabled;
    const emailId = this.board.friendlyAliasEmailId || this.board.emailId;
    let {link} = this.board;
    link = {};
    const {id, scope = '', access, shareUrl = ''} = link;
    const {
      canSeePostViaEmail,
      canAddMember,
      canEditName,
      canEditBoardLogo,
      canEditPostViaEmail,
      canSeeAllowWorkspaceMembers,
      canDeleteBoard,
    } = discussionsACL(this.board);
    const logo = this.board.logo;
    let boardIcon = null;
    if (logo === null && this.board?.name === 'General') {
      boardIcon = this.board?.workspace?.logo;
    } else {
      boardIcon = this.board?.logo;
    }
    //console.log('----------------this.board-------------------->',this.board)
    const {name} = this.board;
    const {desc} = this.board;
    const i = this.board?.members?.length;
    let currentUser = false;

    const index = this.state?.members?.findIndex((data) => {
      return data?.id === UsersDao.getUserId() || data === UsersDao.getUserId();
    });
    currentUser = index !== -1;
    const onDoneClick = () => {
      Keyboard.dismiss();
      const board = this.board;
      let _params = {
        wsId: board.wsId,
        rId: board.id,
        skipGenerateboardEmailId: true,
      };
      const {name, desc} = this.state;
      let payload = {name, desc};
      this.props.updateDiscussion(_params, payload);
    };

    const workspace = this.state.workspace;
    currentUser = index !== -1;
    let membersCount = this.props.boardMembers?.members.length;
    return (
      <View style={{flex: 1, backgroundColor: ''}}>
        <BoardProfilePicture
          uploadEmoji={this.uploadEmoji}
          ref="DiscProfilePicture"
        />
        {this.renderDeleteMessageOption(delteOptionsArray)}
        {this.renderLeaveDiscussionOption(leaveDiscussionArray)}
        {/* {this.deleteBoardConfirmModal()} */}
        {this.deleteUserConfirmModal(removeDiscussionArray)}
        {/* {this.leaveBoardConfirmModal()} */}
        {this.renderCopyLinkModal()}
        {this.renderPermissionLevel()}
        <Header
          title="Manage Room"
          goBack={true}
          // backIcon={<Icon name={'cross'} size={30} />}
          navigation={this.props.navigation}
          // rightContent={
          //   canEditName && (
          //     <Text
          //       style={{
          //         fontWeight: '500',
          //         fontSize: normalize(16),
          //         lineHeight: normalize(20),
          //         color: '#0D6EFD',
          //       }}
          //       onPress={() => onDoneClick()}>
          //       {canEditName ? t('Save') : null}
          //     </Text>
          //   )
          // }
        />
        <ScrollView bounces={false} keyboardShouldPersistTaps={'handled'}>
          <View style={{backgroundColor: 'white'}}>
            <View
              style={{
                borderBottomColor: '#EFF0F1',
                borderBottomWidth: 1,
                flexDirection: 'row',
                alignItems: 'center',
                height: 75,
                marginLeft: 20,
                marginRight: 20,
              }}>
              <TextInput
                style={[styles.boardNameTextStyle, {flexShrink: 1}]}
                value={this.state.name}
                editable={canEditName}
                placeholderTextColor={'#9AA0A6'}
                onChangeText={(name) => this.setState({name})}
                onEndEditing={() => {
                  if (this.state.name === '') {
                    Toast.showWithGravity(
                      'Discussion title is required.',
                      Toast.SHORT,
                      Toast.CENTER,
                    );
                  } else {
                    onDoneClick();
                  }
                }}
              />
            </View>
            <TouchableOpacity>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginHorizontal: 20,
                  marginTop: 13,
                  marginBottom: 20,
                }}>
                <TextInput
                  multiline={true}
                  style={styles.addDescTextStyle}
                  placeholderTextColor={'#9AA0A6'}
                  placeholder={t('Add description...')}
                  editable={canEditName}
                  value={this.state.desc}
                  onChangeText={(desc) => this.setState({desc})}
                  onEndEditing={() => onDoneClick()}
                />
              </View>
            </TouchableOpacity>
          </View>
          <View style={{backgroundColor: 'white', marginTop: 20}}>
            {canAddMember ? (
              <View
                style={{
                  borderBottomColor: '#EFF0F1',
                  borderBottomWidth: 1,
                }}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    height: 60,
                    alignItems: 'center',
                    marginLeft: 20,
                  }}
                  onPress={() =>
                    navigate(ROUTE_NAMES.ADD_PARTICIPANTS_POSTS, {
                      board: this.board,
                    })
                  }>
                  <Icon name={'Contact_Addparticipant'} size={22} />
                  <Text style={styles.addMembersTextStyle}>
                    {t('Add People')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
            <View
              style={{
                borderBottomColor: '#EFF0F1',
                borderBottomWidth: 1,
              }}></View>
            {this.showParticipants()}
            {membersCount < 2 ? null : <View>{this.button()}</View>}
          </View>
          {!this.state.switchValue ? (
            <View>
              {!this.state.allowedForPost.isAllMembers &&
                this.renderException()}
            </View>
          ) : null}
          {workspace && this.renderSubMenu()}

          {canSeePostViaEmail && (
            <View
              style={{
                backgroundColor: 'white',
                marginTop: 20,
                marginBottom: 20,
              }}>
              <View
                style={{
                  borderBottomColor: '#EFF0F1',
                  borderBottomWidth: 1,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    height: 60,
                    alignItems: 'center',
                    marginLeft: 20,
                  }}>
                  <Text style={styles.postViaEmailTextStyle}>
                    {t('Post via email')}
                  </Text>
                  <View style={{flex: 1}} />

                  <TouchableOpacity
                    onPress={() => {
                      if (!canEditPostViaEmail) {
                        toastRef?.current?.show(
                          t('You dont have permission to change this field'),
                        );
                        return;
                      }
                      navigate(ROUTE_NAMES.POST_VIA_EMAIL, {
                        // board:this.state.board,
                        boardName: name,
                        board: this.board,
                      });
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingRight: 20,
                    }}>
                    <Text style={styles.statusTextStyle}>
                      {postviaEmail ? t('Enabled') : t('Disabled')}
                      {/* Enabled */}
                    </Text>
                    <Icon name={'Right_Direction'} size={15} color="#5F6368" />
                  </TouchableOpacity>
                </View>
              </View>

              {postviaEmail ? (
                <View
                  style={{
                    height: 60,
                    alignItems: 'center',
                    marginLeft: 20,
                    flexDirection: 'row',
                    flexShrink: 1,
                  }}>
                  <Text
                    numberOfLines={1}
                    style={[styles.emailTextStyle, {flexShrink: 1}]}>
                    {emailId}
                  </Text>
                  <View style={{flex: 1}} />
                  <TouchableOpacity
                    style={{paddingRight: 20}}
                    onPress={() => {
                      Clipboard.setString(emailId || '');
                      Toast.showWithGravity(
                        'Copied',
                        Toast.SHORT,
                        Toast.BOTTOM,
                      );
                    }}>
                    <Icon name={'Copy'} size={22} />
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          )}
          {this.renderCopyLink()}
          {this.renderLeaveDiscussion()}
          {canDeleteBoard && this.renderDeleteBoard()}
        </ScrollView>
        <SafeAreaView />
      </View>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const {discussion, native, workspace, home, common} = state;

  return {
    // selectedBoard: board,
    processedImg: common.processedImage,
    allDiscussions: discussion.allDiscussions,
    boardMembers: discussion.boardMembers,
    list: native.exceptionList,
    activeWsId: workspace.activeWsId,
    workspacelist: workspace.workspacelist?.ws || emptyArray,
    activeWsMembers: workspace.activeWsMembers?.members || emptyArray,
    showLoader: home.showLoader,
  };
};

const styles = StyleSheet.create({
  marginTop10: {marginTop: 10},
  justifyContentSpaceBetween: {justifyContent: 'space-between'},
  optionTextStyle: {
    fontWeight: '500',
    lineHeight: 20,
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  optionDescTextStyle: {
    marginTop: 5,
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#5F6368',
  },
  text1: {fontSize: normalize(16), fontWeight: '600'},
  view1: {
    borderBottomColor: '#EFF0F1',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  view2: {
    alignItems: 'flex-end',
    flex: 1,
  },
  view3: {flexDirection: 'column', marginLeft: 10},
  roleText: {fontSize: normalize(14), color: '#5F6368'},
  title: {
    fontSize: normalize(16),
    lineHeight: normalize(19),
    fontWeight: '700',
    fontFamily: Constants.fontFamily,
    flexShrink: 1,
    paddingRight: 10,
  },
  content: {
    fontSize: normalize(14),
    lineHeight: normalize(16),
    fontWeight: '400',
    fontFamily: Constants.fontFamily,
    flexShrink: 1,
    paddingRight: 10,
  },
  tabTextStyle: {
    color: '#201F1E',
    marginLeft: 10,
    marginRight: 10,
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  seeAllTextStyle: {
    fontSize: normalize(16),
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    //marginLeft: 10,
    flex: 1,
  },
  nameTextStyle: {
    fontWeight: '500',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    paddingVertical: 2,
    color: '#292929',
  },
  emailIdTextStyle: {
    fontWeight: '400',
    fontSize: normalize(12),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#5F6368',
  },
  leaveRoomTextStyle: {
    color: colors.koraAlertCancel,
    flexShrink: 1,
    fontSize: normalize(16),
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  leaveDiscussionTextStyle: {
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#ffffff',
    marginVertical: 15,
    marginHorizontal: 30,
  },
  cancelTextStyle: {
    color: colors.koraAlertOk,
    fontSize: normalize(16),
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    marginVertical: 10,
    marginHorizontal: 30,
  },
  searchTextInputStyle: {
    flex: 1,
    fontSize: normalize(14),
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
    minHeight: 40,
  },
  emojiTextStyle: {
    fontWeight: '400',
    fontSize: normalize(34),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  textInputStyle: {
    flex: 1,
    fontWeight: '400',
    fontSize: normalize(12),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  textStyle: {
    color: 'white',
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  addExceptionTextStyle: {
    paddingVertical: 10,
    paddingBottom: 20,
    lineHeight: 20,
    color: '#9AA0A6',
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  boardNameTextStyle: {
    fontSize: normalize(18),
    fontWeight: '700',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    flex: 1,
  },
  addDescTextStyle: {
    fontSize: normalize(16),
    fontWeight: '400',
    fontStyle: 'normal',
    // backgroundColor: 'red',
    fontFamily: Constants.fontFamily,
    flex: 1,
  },
  addMembersTextStyle: {
    fontSize: normalize(16),
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    marginLeft: 10,
  },
  postViaEmailTextStyle: {
    fontSize: normalize(16),
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    // flex: 1,
  },
  statusTextStyle: {
    fontSize: normalize(16),
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#9AA0A6',
    marginRight: 10,
  },
  emailTextStyle: {
    color: '#9AA0A6',
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    // flex: 1,
  },
  leaveTextStyle: {
    fontSize: normalize(16),
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    marginLeft: 10,
    color: '#DD3646',
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
});

RoomDetails.propTypes = {
  leaveDiscussion: PropTypes.func,
};

RoomDetails.defaultProps = {
  leaveDiscussion: (data) => {},
};

export default connect(mapStateToProps, {
  getDiscussions,
  updateDiscussion,
  leaveDiscussion,
  deleteDiscussion,
  setExceptionList,
  postViaEmail,
  discussionIcon,
  processLinkImage,
  getBoardMembers,
  getAllWSMembers,
  toggleExceptionListItem,
  changeBoardLinkScope,
})(withTranslation()(RoomDetails));
