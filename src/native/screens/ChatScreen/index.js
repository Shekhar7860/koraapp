import React from 'react';
import {View, Text, Alert, Keyboard} from 'react-native';
import {SafeAreaView, BackHandler} from 'react-native';
import {connect} from 'react-redux';
import {Header} from './../../navigation/TabStacks';
import {MessagesHeaderView, getTitleName} from './MessagesHeaderView';
import MessagesListView from '../../components/Chat/';
import MessageComposebar from '../../components/Composebar/MessageComposebar';
import KoraKeyboardAvoidingView from '../../components/KoraKeyboardAvoidingView';
import {goBack, navigate} from '../../navigation/NavigationService';
import Toast from 'react-native-simple-toast';
import {sendMessage} from '../../../shared/redux/actions/message-thread.action';
import {createNewBoard} from '../../../shared/redux/actions/message-board.action';
import WebsocketService from '../../../shared/socket/socket.service';
import ContactsTag from '../NewChatScreen/ContactsTag';
import MultiSelectItem from '../../components/Chat/MultiSelectActionItems';
import {KoraReactComponent} from '../../core/KoraReactComponent';
import {setTopicName} from '../../../shared/redux/actions/create-message.action';
import {getBoardMembers} from '../../../shared/redux/actions/discussions.action';
import {
  markUnreadThread,
  MuteUnmute,
  markThreadAsStar,
  deleteUserChtHistry,
  clearUSerChatHistory,
  deleteUserFromGrup,
  deleteThreadChat,
  getBoardMessages,
  setActiveBoard,
  markBoardAsSeen,
  messageResolve,
  deleteMessage,
  deleteMessageForEveryone,
  getBoardMessagesMoreMessagesTrue,
  scrollToMessage,
} from '../../../shared/redux/actions/message-thread.action';
import {resolveUser} from '../../../shared/redux/actions/home.action';
import {
  createNewThread,
  replyTo,
  replyToPrivate,
  searchModeOn,
  searchModeOff,
  reactMessage,
  showMsgTraceInfo,
  storeForwardMessage,
  setMessageReminder,
  deleteMessageReminder,
} from '../../../shared/redux/actions/message-preview.action';
import {BottomUpModal} from '../../components/BottomUpModal';
import Attach from '../../components/Attachment.js';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
const sheetIds = {
  START_CONVERSATION: 'starConversation',
  MUTE_ID: 'mute',
  SELECT_MESSAGES_ID: 'selectmessages',
  LEAVE_CONVERSATION_ID: 'leaveConversation',
  MANAGE_GROUP_ID: 'manageGroup',
  MARK_AS_UNREAD_ID: 'markAsUnread',
  DELETE_CONVERSATION: 'delete_conversation',
  CLEAR_CONVERSATION: 'clear_conversation',
  VIEW_FILES: 'view_files',
};
import {messagePayload, boardPayload} from '../../../helpers';
import * as UsersDao from '../../../dao/UsersDao';
import MessageUploadQueue from '../FileUploader/MessageUploadQueue';
import * as BoardsDao from '../../../dao/BoardsDao';
import styles from './ChatScreen.Style';

import {resolveNotification} from '../../../shared/redux/actions/message-thread.action';
import {Loader} from '../ChatsThreadScreen/ChatLoadingComponent';
import {LOADING_MORE_MESSAGES} from '../../../shared/redux/constants/native.constants';
import ActionItemBottomSheet from '../../components/BottomUpModal/ActionItemBottomSheet';
import database from '../../../native/realm';

import * as Entity from '../../../native/realm/dbconstants';
import {upsertNewMessage} from '../../../dao/updateMessages';
import ReplyMessage from '../../components/Chat/ReplyMessage';

const options = [
  {
    //don't change this id
    id: sheetIds.START_CONVERSATION,
    text: 'Star Conversation',
    icon: 'kr-starred',
  },
  {
    id: sheetIds.MUTE_ID,
    text: 'Mute',
    icon: 'Mute',
  },
  {
    id: sheetIds.VIEW_FILES,
    text: 'View Files',
    icon: 'View_Files',
  },
  {
    id: sheetIds.SELECT_MESSAGES_ID,
    text: 'Select Messages',
    icon: 'CheckBox',
  },
  {
    id: sheetIds.CLEAR_CONVERSATION,
    text: 'Clear Chat History',
    icon: 'Retry',
  },
  {
    id: sheetIds.DELETE_CONVERSATION,
    text: 'Delete',
    icon: 'Delete_T',
    danger: true,
  },
];

const optionsGroup = [
  //don't change this id
  {
    id: sheetIds.START_CONVERSATION,
    text: 'Star Conversation',
    icon: 'kr-starred',
  },
  {
    id: sheetIds.MUTE_ID,
    text: 'Mute',
    icon: 'Mute',
  },
  {
    id: sheetIds.MARK_AS_UNREAD_ID,
    text: 'Mark As Unread',
    icon: 'Mark_As_Read',
  },
  {
    id: sheetIds.VIEW_FILES,
    text: 'View Files',
    icon: 'View_Files',
  },
  {
    id: sheetIds.CLEAR_CONVERSATION,
    text: 'Clear Chat History',
    icon: 'Retry',
  },
  {
    id: sheetIds.SELECT_MESSAGES_ID,
    text: 'Select Messages',
    icon: 'CheckBox',
  },
  {
    id: sheetIds.MANAGE_GROUP_ID,
    text: 'Manage',
    icon: 'Admin-Settings',
  },
  {
    id: sheetIds.LEAVE_CONVERSATION_ID,
    text: 'Leave',
    icon: 'Exit',
    danger: true,
  },
];

const leftGroup = [
  {
    id: sheetIds.START_CONVERSATION,
    text: 'Star Conversation',
    icon: 'kr-starred',
  },
  {
    id: sheetIds.VIEW_FILES,
    text: 'View Files',
    icon: 'View_Files',
  },
  {
    id: sheetIds.SELECT_MESSAGES_ID,
    text: 'Select Messages',
    icon: 'CheckBox',
  },
  {
    id: sheetIds.DELETE_CONVERSATION,
    text: 'Delete',
    icon: 'Delete_T',
    danger: true,
  },
];

class _ChatScreen extends KoraReactComponent {
  textInComposeBar = '';
  constructor(props) {
    super(props);
    let value = this.props.route?.params?.isNewChat || false;
    const {board_id} = this.props?.route?.params;
    this.replyPrivate = Boolean(this.props.route?.params?.replyPrivate);
    this.state = {
      typingParticipant: null,
      isNewChat: value,
      board: '',
      multiSelectOn: false,
      selectedMessages: [],
      boardMembers: [],
      showLoader: false,
      showComposebar: true,
      listOffset: 'start',
      loading: false,
      board_id: board_id,
    };
    this.subscribeBoard(board_id);
    this.modalRef = React.createRef();
  }

  subscribeBoard = async (board_id) => {
    try {
      const db = database.active;

      const board = await db.collections.get(Entity.Boards).find(board_id);
      const observable = board.observe();
      this.boardSubscription = observable.subscribe((data) => {
        this.setState({board: data});
      });
      return board;
    } catch (e) {
      console.log('error in subscribeBoard', e);
    }
  };

  getMessages = () => {
    const {board} = this.state;
    if (board?._id || board?.clientId) {
      let _params = {
        // offset:0,
        id: board?._id,
        clientId: board?.clientId,
        limit: 40,
      };
      this.props.getBoardMessages(_params);
    }
  };

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.backAction,
    );

    this.replyInPrivateflag = false;

    if (this.props?.route?.params?.boardId) {
      let _params = {boardId: this.props.route?.params?.boardId};
      this.props.resolveNotification(_params);
    } else if (this.props.route?.params?.isFromNotificationMsz) {
      let _params = {boardId: this.props.route?.params?.boardId};
      this.props.resolveNotification(_params);
    } else {
      const {board} = this.props.route?.params;
      if (board) {
        this.setState({board: board});
        this.addMessageEventListener(board);
      }
    }
    this.replyPrivate = Boolean(this.props.route.params.replyPrivate);
    this.props.getBoardMessagesMoreMessagesTrue();
  }

  isParticipantFound = () => {
    const {board, isNewChat} = this.state;
    if (board?.type === 'directChat') {
      return true;
    }

    let isMember = board?.isMember;
    return isMember || isNewChat;
  };

  isMultiSelectPress = () => {
    this.moreOptionsRefs.openBottomDrawer();
  };

  componentDidUpdate(prevProps) {
    if (prevProps.boardId !== this.props.boardId) {
      this.setState({isNewChat: false, board_id: this.props.boardId});
      this.subscribeBoard(this.props.boardId);
    }
    if (this.props.route?.params?.isFromNotification) {
      const {navigation} = this.props;
      navigation.setParams({
        isFromNotification: false,
      });
      const {board} = this.props.route?.params;
      if (board) {
        this.setState({board: board});
        this.addMessageEventListener(board);
      }
    }
    if (prevProps.moreMessages !== this.props.moreMessages) {
      console.log('Hey updated the more messages', this.props.moreMessages);
    }
    if (prevProps.boardMembers !== this.props.boardMembers) {
      this.setState({boardMembers: this.props.boardMembers});
    }
    if (
      this.props.refresh_chat_screen &&
      prevProps.refresh_chat_screen !== this.props.refresh_chat_screen
    ) {
      const newBoardId = this.props.refresh_chat_screen;
      // this.setState({board: resolveThred});
      // this.addMessageEventListener(resolveThred);
      let data = this.subscribeBoard(newBoardId);
      // let data = this.subscribeBoard(resolveThred._id);
      this.setState({isNewChat: false, board_id: newBoardId, board: data});
    }

    if (prevProps.userLeftConversation !== this.props.userLeftConversation) {
      if (this.props.userLeftConversation === true) {
        Toast.showWithGravity('Left chat', Toast.SHORT, Toast.BOTTOM);
      }
    }
    if (prevProps.usermuteUnmuteThread !== this.props.usermuteUnmuteThread) {
      // for mute unmute update
      const {board} = this.state;
      const mute = this.props.usermuteUnmuteThread?.mute;
      const notifications = {
        notifications: {mute},
      };
      this.setState({board: board, ...notifications});
    }

    if (prevProps.nBoardId !== this.props.nBoardId) {
      let board_id = this.props.nBoardId;
      if (board_id) {
        this.setState({isNewChat: false, board_id: board_id});
        this.subscribeBoard(board_id);
      }
    }
    if (prevProps.starredMessageThread !== this.props.starredMessageThread) {
      //for star & unstar update
      const {board} = this.state;
      const markAsStar = this.props.starredMessageThread.markAsStar;
      const star = {
        star: markAsStar,
      };
      this.setState({board: board, ...star});
    }
    if (this.props.route.params?.id !== prevProps.route.params?.id) {
      let board = this.props.route.params;
      this.setState({board});
    }

    if (prevProps.clearChatHistory !== this.props.clearChatHistory) {
      this.setState({loading: false});
    }

    if (prevProps.notificationTyping !== this.props.notificationTyping) {
      const {resourceId, userId} = this.props.notificationTyping;
      if (!resourceId || !userId || userId === UsersDao.getUserId()) {
        return;
      }
      const {clientId} = this.props.route.params;
      if (resourceId !== clientId) {
        return;
      }
    }
  }

  backAction = () => {
    if (this.props.route?.params?.isFromNotificationTab) {
      goBack();
      navigate(ROUTE_NAMES.FINDLY, {
        screen: ROUTE_NAMES.KORA_NOTIFICATIONS,
      });
      return true;
    } else {
      return false;
    }
  };

  componentWillUnmount() {
    this.backHandler.remove();
    this.props.replyTo();
    if (!this.replyInPrivateflag) {
      this.props.replyToPrivate();
    }
    this.props.setActiveBoard({boardId: ''});
  }

  onDelete(id) {
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
          text: 'OK',
          style: 'destructive',
          onPress: () => {
            const {board} = this.state;
            let _params = {
              id: board?.id,
            };

            let payload = {
              leaveBoard: true,
              removeMembers: [id],
            };

            this.props.deleteUserFromGrup(_params, payload);
            this.setState({showComposebar: false});
          },
        },
      ],
      {cancelable: false},
    );
  }

  handleCameraActionFromAttachment(images, mszText) {
    const {board} = this.state;
    try {
      var imageArray = [];
      images.forEach(function (image) {
        var imageJson = {
          fileCopyUri: image.path,
          name: image.filename,
          size: image.size,
          type: image.mime,
          uri: image.path,
          path: image.path,
        };
        imageArray.push(imageJson);
      });
      navigate(ROUTE_NAMES.MEDIA_PREVIEW, {
        caption: mszText,
        mediaList: imageArray,
        boardDataId: board?.id,
        newThreadData: this.newThreadData,
        mszText: mszText,
      });
    } catch (err) {
      throw err;
    }
  }

  renderAttachment() {
    const {board} = this.state;
    return (
      <View style={{height: 0}}>
        <Attach
          ref="attachments"
          boardData={board}
          boardId={board?.id}
          newThreadData={this.newThreadData}
          cameraAction={(images, mszText) => {
            this.handleCameraActionFromAttachment(images, mszText);
          }}
        />
      </View>
    );
  }

  markBoardAsReadUnread = async (board, boardId) => {
    let lastActivity = await board.lastActivity.fetch();
    let lastMessage = await lastActivity.message.fetch();
    let payload = null;
    if (board?.unreadCount > 0) {
      payload = {
        markReadMsgId: lastMessage.messageId,
        unreadTemp: true,
      };
    } else {
      payload = {
        markUnreadMsgId: lastMessage.messageId,
        unreadTemp: false,
      };
    }
    this.props.markUnreadThread({id: boardId}, payload);
  };
  renderOptions() {
    const optionSelected = (caseId, isStarred, muteOn) => {
      const {board} = this.state;
      const boardId = board?._id;
      const clientId = board?.clientId;
      switch (caseId) {
        case sheetIds.SELECT_MESSAGES_ID:
          this.composeBarDiscardAlert()
            .then((data) => {
              this.clearComposebar();
              this.setState({multiSelectOn: true});
            })
            .catch((error) => {});

          break;
        case sheetIds.MANAGE_GROUP_ID:
          // this.composeBarDiscardAlert()
          //   .then((data) => {
          this.clearComposebar();
          if (board?.type === 'groupChat') {
            navigate('Group_Details', {board_id: board?.id});
          } else {
            navigate('Contact_Details', {board});
          }
          // })
          // .catch((error) => {});

          break;
        case sheetIds.START_CONVERSATION:
          let param = {id: boardId};
          let payload = {markAsStar: !isStarred};
          this.props.markThreadAsStar(param, payload);
          break;

        case sheetIds.MUTE_ID:
          if (muteOn) {
            payload = {
              mute: new Date().getTime(),
            };
            this.props.MuteUnmute({id: boardId}, payload, () => {});
          } else {
            this.moreOptionsRefs.closeBottomDrawer();
            setTimeout(() => this.modalRef.current.open(), 500);
          }

          break;
        case sheetIds.LEAVE_CONVERSATION_ID:
          setTimeout(() => {
            this.onDelete(UsersDao.getUserId());
          }, 1000);
          break;

        case sheetIds.DELETE_CONVERSATION:
          Alert.alert(
            'Alert',
            'Are you sure? Do you really want to delete?',
            [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {
                text: 'Delete',
                onPress: () => {
                  this.props.deleteThreadChat(boardId, false);
                },
                style: 'destructive',
              },
            ],
            {cancelable: false},
          );
          break;
        case sheetIds.CLEAR_CONVERSATION:
          let clearParam = {id: boardId, clientId: clientId, dbId: board.id};
          this.setState({loading: true});
          if (this.props.replyToPrivate) {
            this.props.replyToPrivate();
          }
          this.props.clearUSerChatHistory(clearParam);
          break;
        case sheetIds.MARK_AS_UNREAD_ID:
          this.markBoardAsReadUnread(board, boardId);
          break;
        case sheetIds.VIEW_FILES:
          this.composeBarDiscardAlert()
            .then((data) => {
              this.clearComposebar();
              Keyboard.dismiss();
              navigate('View_Files', {
                threadId: boardId,
                thread: board,
                titleName: getTitleName(board),
              });
            })
            .catch((error) => {});
      }
      this.moreOptionsRefs.closeBottomDrawer();
    };

    const {board} = this.state;
    let showOptions = '',
      height = 0;
    const isInGroup = this.isParticipantFound();
    if (board?.type === 'groupChat' && !isInGroup) {
      showOptions = leftGroup;
      height = 220;
    } else if (board?.type === 'groupChat') {
      showOptions = optionsGroup;
      height = 370;
    } else {
      showOptions = options;
      height = 270;
    }
    const isStarred = board?.star;
    let isUnread = false;
    if (board?.unreadCount > 0) {
      isUnread = true;
    } else {
      isUnread = false;
    }

    let muteOn = false;
    let till = board?.notifications?.mute?.till;
    if (till) {
      muteOn = new Date() < new Date(till);
    }

    return (
      <SafeAreaView forceInset={{vertical: 'never'}}>
        <BottomUpModal
          ref={(moreOptionsRefs) => {
            this.moreOptionsRefs = moreOptionsRefs;
          }}
          height={height}>
          <View style={styles.bottomUpModal3} />

          {showOptions.map((option) => (
            <ActionItemBottomSheet
              title={option.text}
              iconName={option.icon}
              key={option.id}
              id={option.id}
              isStarred={isStarred}
              muteOn={muteOn}
              isUnread={isUnread}
              optionSelected={() =>
                optionSelected(option.id, isStarred, muteOn)
              }
            />
          ))}
        </BottomUpModal>
      </SafeAreaView>
    );
  }

  checkBoxAction(item) {
    this.setState({selectedMessages: item});
  }

  cancelPressed = () => {
    this.setState({
      multiSelectOn: false,
      selectedMessages: [],
    });
    this.moreOptionsRefs.closeBottomDrawer();
  };

  renderHeader() {
    const {board} = this.state;
    return board?.id?.length > 0 ? (
      <MessagesHeaderView
        board={board}
        enableTouch={this.isParticipantFound()}
        multiSelectMode={this.state.multiSelectOn}
        onPressOptions={this.isMultiSelectPress}
        isFromNotificationTab={this.props.route?.params?.isFromNotificationTab}
        onCancelPressOptoions={this.cancelPressed}
      />
    ) : (
      <Header {...this.props} title={'New Chat'} goBack={true} />
    );
  }

  showAlert(alert = 'alert', message) {
    Alert.alert(alert, message);
  }

  get newThreadData() {
    return {
      isNewChat: this.state.isNewChat,
      contactData: this.props.contactData,
      topicName: this.props.topicName,
    };
  }

  callMembersApi = () => {
    const {board} = this.props.route?.params;
    if (board?.id) {
      this.props.getBoardMembers({
        rId: board?.id,
      });
    }
  };

  handleEmptyContacts = () => {
    this.showAlert('No recipients', 'Please add recipients to create the chat');
  };

  composeBarDiscardAlert = async () => {
    const promise = await new Promise(async (resolve, reject) => {
      if (this.messageCompRef?.isAudioRecorded()) {
        Alert.alert(
          'Discard Message',
          'Are you sure you want to discard your changes?',
          [
            {
              text: 'Cancel',
              onPress: () => reject('cancel'),
              style: 'cancel',
            },
            {
              text: 'OK',
              onPress: () => {
                resolve('success');
              },
            },
          ],
        );
      } else {
        resolve('success');
      }
    });
  };

  clearComposebar = (data) => {
    if (this.messageCompRef) {
      this.messageCompRef?.clearAudioFromComposebar('clear');
    }
  };
  onSendButtonClick = (data) => {
    if (data) {
      if (
        this.state.isNewChat &&
        this.props.contactData &&
        this.props.contactData.length === 0
      ) {
        this.showAlert(
          'No recipients',
          'Please add recipients to create the chat',
        );
        return;
      }

      this.sendAction(data);
    }
  };

  textDidChange = (data) => {
    const {board} = this.state;
    this.textInComposeBar = data;
    let args = {
      resourceId: board?.id,
      userId: UsersDao.getUserId(),
    };
    WebsocketService.sendDataToSocket('typing', args);
  };

  onCameraClick = () => {
    this.refs.attachments.handleItemClick({key: 3});
  };

  onPressAction = (data) => {
    const {board} = this.props.route?.params;
    navigate('Forward Message', {
      selectedMessages: data,
      boardType: board?.type,
    });

    this.setState({selectedMessages: [], multiSelectOn: false});
  };

  onClickAction = () => {
    this.setState({isNewChat: false, listOffset: 'start'});
  };

  setReplyToMessage = (message = null) => {
    if (this.props.replyTo) {
      this.props.replyTo(message?.id);
    }
    if (message === null && this.props.replyToPrivate) {
      this.props.replyToPrivate(message?.id);
    }
  };

  messagesListViewOnPress = (item) => this.checkBoxAction(item);

  replyTo = (message) => replyTo(message);

  forwardMessage = (focusedMessage, boardType) => {
    this.composeBarDiscardAlert()
      .then((data) => {
        this.clearComposebar();
        navigate(ROUTE_NAMES.FORWARD_MESSAGE, {
          selectedMessages: focusedMessage,
          boardType: boardType,
        });
      })
      .catch((error) => {});
  };

  replyToPrivate = (message) => {
    BoardsDao.findOneToOneBoard({message: message})
      .then(({board, contacts}) => {
        this.replyInPrivateflag = true;
        this.props.replyToPrivate(message?.id);
        goBack();
        if (!board) {
          navigate(ROUTE_NAMES.REPLY_PRIVATE_CHAT, {
            isNewChat: true,
            replyPrivate: true,
            contacts: contacts,
          });
        } else {
          let board_id = board.clientId || board._id;
          navigate(ROUTE_NAMES.REPLY_PRIVATE_CHAT, {
            board_id: board_id,
            isNewChat: false,
            replyPrivate: true,
            contacts: contacts,
          });
        }
      })
      .catch((error) => {});
  };

  renderReplyComponent() {
    let reply = this.props.reply || this.props.replyPrivate;
    if (reply == null) {
      return null;
    }
    setTimeout(() => {
      if (this.messageCompRef) {
        this.messageCompRef?.focusOnInput();
      }
    }, 500);
    return (
      <ReplyMessage
        messageId={reply}
        scrollTo={this.scrollTo.bind(this)}
        setReplyToMessage={this.setReplyToMessage}
      />
    );
  }

  scrollTo = (key) => {
    this.messagesListViewRef?.scrollToMessageId(key);
    // this.props.scrollToMessage(key);
  };
  scrollToLatestMsz = () => {
    this.messagesListViewRef?.goIndex(0);
  };
  onRef = (ref) => (this.messagesListViewRef = ref);
  render() {
    const searchMode = this.props.searchMode;
    const {board} = this.state;
    const {params} = this.props.route;
    let searchState = null;
    var components = null;
    if (!this.state.isNewChat) {
      searchState = board?.lastActivity?.sendingState;
      components = board?.lastActivity?.components;
    }
    const type = board?.type === 'directChat' ? false : true;
    const loading = this.state.loading;
    let foundInBoards;
    if (this.props?.route?.params?.universalSearch) {
      foundInBoards = this.props.boardMessages.some(
        (item) => item.messageId === this.props.gotoMessageId,
      );
    }
    try {
      return (
        <View style={styles.mainStyle1}>
          {!searchMode && this.renderHeader()}
          <KoraKeyboardAvoidingView style={styles.mainStyle2}>
            {this.renderOptions()}
            {!this.state.isNewChat ? null : (
              <ContactsTag
                visible={this.state.isNewChat}
                contacts={params.contacts || []}
              />
            )}

            {loading ? (
              <View style={styles.chatLoadingStyle}>
                <Loader size="small" />
              </View>
            ) : null}
            {!this.state.isNewChat && board?.id && (
              <MessagesListView
                universalSearch={
                  this.props?.route?.params?.universalSearch || false
                }
                onRef={this.onRef}
                firstLoad={this.props.firstLoad}
                searchMessageId={this.props.gotoMessageId}
                moreMessages={this.props.moreMessages}
                loadingMore={this.props.loadingMore}
                isGroupChat={board?.type === 'groupChat'}
                boardId={board?._id}
                clientId={board?.clientId}
                messageId={board?.lastActivity?.message?.messageId}
                messageState={searchState}
                board={board}
                multiSelectOn={this.state.multiSelectOn}
                onPress={this.messagesListViewOnPress}
                titleName={getTitleName(this.state.board)}
                boardType={board?.type}
                listOffset={this.state.listOffset}
                onClick={this.onClickAction}
                messagetraceInfo={this.props.messagetraceInfo}
                reply={this.props.reply}
                setReplyToMessage={this.setReplyToMessage}
                replyPrivate={this.props.replyPrivate}
                searchMode={this.props.searchMode}
                activeBoardId={this.state.board?.id}
                messageResolveResponse={this.props.messageResolveResponse}
                getBoardMessages={this.getBoardMessages}
                markBoardAsSeen={this.markBoardAsSeen}
                messageResolve={this.messageResolve}
                setSearchMode={this.setSearchMode}
                reactMessage={this.reactMessage}
                deleteMessage={this.deleteMessage}
                deleteMessageForEveryone={this.deleteMessageForEveryone}
                replyTo={this.replyTo}
                replyToPrivate={this.replyToPrivate}
                showMsgTraceInfo={this.showMsgTraceInfo}
                storeForwardMessage={this.storeForwardMessage}
                setMessageReminder={this.setMessageReminder}
                deleteMessageReminder={this.deleteMessageReminder}
                unreadCount={board?.unreadCount}
                forwardMessage={this.forwardMessage}
              />
            )}
            {this.renderReplyComponent()}
            {!this.state.multiSelectOn ? (
              !searchMode &&
              this.isParticipantFound() &&
              this.state.showComposebar !== false && (
                <View style={styles.composeBarParent}>
                  <MessageComposebar
                    ref={(ref) => (this.messageCompRef = ref)}
                    newThreadData={this.newThreadData}
                    typingParticipant={this.state.typingParticipant}
                    boardTotalMembers={board?.members?.length}
                    callMembersApi={this.callMembersApi}
                    handleEmptyContacts={this.handleEmptyContacts}
                    onSendButtonClick={this.onSendButtonClick}
                    boardData={board}
                    boardDataId={board?.id}
                    isGroupChat={type}
                    messageState={searchState}
                    lastMessage={components}
                    contactData={
                      this.state.boardMembers?.length > 0
                        ? this.state.boardMembers
                        : this.boardMembersFromDb(board)
                    }
                    textDidChange={this.textDidChange}
                    isShowCamera={true}
                    onCameraClick={this.onCameraClick}
                    containerStyle={styles.composerbar_container}
                    buttons_container={styles.buttons_container}
                    sendViewStyle={styles.sendViewStyle}
                    send_button_container={styles.send_btn_container_style}
                    buttons_sub_container={styles.buttons_sub_container}
                    iconStyle={styles.iconStyle}
                  />
                </View>
              )
            ) : this.state.selectedMessages.length > 0 ? (
              <MultiSelectItem
                selectedMessages={this.state.selectedMessages}
                onPressAction={this.onPressAction}
              />
            ) : null}

            {this.renderMute(board?.type, board?.name)}
          </KoraKeyboardAvoidingView>
          {this.renderAttachment()}
        </View>
      );
    } catch (e) {
      console.error('ERROR', e);
      return null;
    }
  }

  renderMuteButton(data) {
    const {board} = this.state;
    const item = board;
    const minutesTillMute = data.value || -60 * 24;
    let d = new Date();
    d.setMinutes(d.getMinutes() + minutesTillMute);
    const payload = {
      mute: minutesTillMute !== 0 ? d.getTime() : new Date().getTime(),
    };

    this.props.MuteUnmute({id: item?.id}, payload);
    this.modalRef.current.closeBottomDrawer();
  }
  renderMute(type, name) {
    const muteOptions = [
      {text: '4 hours', value: 60 * 4},
      {text: '1 day', value: 60 * 24},
      {text: '1 week', value: 60 * 24 * 7},
      {text: 'Until turned off', value: 60 * 24 * 7 * 52},
    ];
    return (
      <SafeAreaView forceInset={{vertical: 'never'}}>
        <BottomUpModal ref={this.modalRef} height={300}>
          <View
            style={{
              paddingTop: 20,
              paddingLeft: 20,
              paddingBottom: 11,
              borderBottomWidth: 0.4,
              borderColor: '#9AA0A6',
            }}>
            <Text
              numberOfLines={1}
              lineBreakMode={'middle'}
              style={styles.muteStyle}>
              {'Mute Notification'}
            </Text>
          </View>
          {/* <View style={styles.bottomUpModal1}> */}
          {muteOptions.map((option) => {
            return (
              <ActionItemBottomSheet
                title={option.text}
                iconName={option.icon}
                id={option.id}
                key={option.id}
                itemType={'titleOnly'}
                optionSelected={() => this.renderMuteButton(option)}
              />
            );
          })}
          <ActionItemBottomSheet
            title={'Cancel'}
            itemType={'titleOnly'}
            optionSelected={() => this.modalRef.current.closeBottomDrawer()}
          />

          {/* </View> */}
        </BottomUpModal>
      </SafeAreaView>
    );
  }

  async sendAction(data) {
    const {board} = this.state;
    let toList = [];
    let boardId = null;
    let board_id = null;
    if (this.state.isNewChat) {
      toList = this.props.contactData;
    } else {
      boardId = board?._id;
      board_id = board?.id;
    }
    //

    let replyObj = this.props.reply || this.props.replyPrivate;
    const db = database.active;

    let replyMessageId = null;
    if (replyObj) {
      try {
        const message = await db.collections
          .get(Entity.Messages)
          .find(replyObj);
        replyObj = {
          messageId: message?.messageId,
          type: 'message',
          boardId: message.boardId,
        };
      } catch (e) {
        replyMessageId = null;
      }
    }
    this.props.replyTo();
    this.props.replyToPrivate();

    let isNewChat = this.state.isNewChat;
    let startConversation = this.props.route?.params?.startConversation;
    if (isNewChat || startConversation) {
      let topicName = this.props.topicName;
      messagePayload(
        {
          toList: toList,
          boardId: boardId,
          board_id: board_id,
          data: data,
          replyObj: replyObj,
        },

        (message) => {
          let boardObject = boardPayload({
            toList: toList,
            topicName: topicName,
            message: message,
          });
          this.scrollToLatestMsz();
          BoardsDao.upsertNewBoard(boardObject)
            .then(({nMessage, nBoard}) => {
              this.props.createNewBoard(nBoard?.id);
              MessageUploadQueue.addMessage(nMessage, nBoard);
            })
            .catch((error) => {
              console.log('exception in upsertNewBoard: ' + error);
            });
        },
      );
    } else {
      this.setState({isNewChat: false, listOffset: 'down'});
      messagePayload(
        {
          toList: toList,
          boardId: boardId,
          board_id: board_id,
          boardClientId: board?.clientId,
          data: data,
          replyObj: replyObj,
        },
        (messageObject) => {
          this.scrollToLatestMsz();
          upsertNewMessage(messageObject)
            .then((nMessage) => {
              MessageUploadQueue.addMessage(nMessage);
            })
            .catch((error) => {
              console.log(
                'exception in upsertNewMessage :: sendAction ' + error,
              );
            });
        },
      );
    }
  }

  getBoardMessages = (params) => {
    if (this.props.route?.params?.isNewChat) return;
    if (this.props.moreMessages !== true) {
      return;
    }
    this.props.getBoardMessages(params);
  };

  addMessageEventListener = (board) => {
    if (board?._id || board?.clientId) {
      this.getMessages();
      this.props.setActiveBoard({boardId: board?.clientId});
    }
  };

  removeMessageEventListener = () => {};

  setActiveBoard = (boardId) => {
    this.props.setActiveBoard({boardId: boardId});
  };

  boardMembersFromDb = async (board) => {
    let member = await board.members.fetch();
    this.setState({boardMembers: member});
  };

  markBoardAsSeen = async () => {
    const {board} = this.state;
    const boardId = board?._id;
    WebsocketService.sendDataToSocket('typingSubscribe', [boardId]);

    if (board?.unreadCount > 0) {
      try {
        let lastActivity = await board.lastActivity.fetch();
        let lastMessage = await lastActivity.message.fetch();

        let params = {
          boardId: boardId,
        };
        let payload = {
          markReadMsgId: lastMessage?.messageId,
        };
        this.props.markBoardAsSeen(params, payload);
      } catch (error) {
        console.log('error in markBoardAsSeen : ', error);
      }
    }
  };

  messageResolve = (arrayIds) => {
    if (arrayIds && arrayIds.length > 0) {
      let idsString = arrayIds.join('&id=');
      let mainId = {
        messageId: idsString,
      };
      //      this.props.messageResolve(mainId, null);
    }
  };

  setSearchMode = (searchMode) => {
    if (searchMode) {
      this.props.searchModeOn();
    } else {
      this.props.searchModeOff();
    }
  };

  reactMessage = (_params, payload) => {
    this.props.reactMessage(_params, payload);
  };

  deleteMessage = (payload, message, status) => {
    this.props.deleteMessage(payload, message, status);
  };

  resolveUser = () => {};

  deleteMessageForEveryone = (_params, payload, message) => {
    this.props.deleteMessageForEveryone(_params, payload, message);
  };

  showMsgTraceInfo = (params) => {
    this.props.showMsgTraceInfo(params);
  };

  storeForwardMessage = (_params) => {
    this.props.storeForwardMessage(_params);
  };

  setMessageReminder = (_params, payload, onSuccessCB = () => {}) => {
    this.props.setMessageReminder(_params, payload, onSuccessCB);
  };

  deleteMessageReminder = (_params, payload, onSuccessCB = () => {}) => {
    this.props.deleteMessageReminder(_params, payload, onSuccessCB);
  };
}

const mapStateToProps = (state) => {
  const {
    createMessage,
    preview,
    messageThreadList,
    notification,
    discussion,
    home,
    messageBoards,
    native,
  } = state;

  return {
    loadingMore: native?.loaders[LOADING_MORE_MESSAGES],
    topicName: createMessage.topicName,
    contactData: createMessage.contactData,
    reply: preview.reply,
    nBoardId: messageBoards.nBoardId,
    replyPrivate: preview.replyPrivate,
    board: preview.board,
    messageStatus: preview.messageType,
    searchMode: preview.searchModeOn,
    messageThreadList: messageThreadList,
    usermuteUnmuteThread: messageThreadList.usermuteUnmuteThread,
    clearChatHistory: messageThreadList.clearChatHistory,
    starredMessageThread: messageThreadList.starredMessageThread,
    unreadThread: messageThreadList.unreadThread,
    userLeftConversation: messageThreadList.userLeftConversation,
    boardMembers: discussion.boardMembers?.members?.filter(function (e) {
      return (e != null && e?.fN) || e?.lN;
    }),
    notificationTyping: notification.typing,
    messagetraceInfo: preview.messagetraceInfo,
    grpName: createMessage.grpName,
    activeBoardId: messageThreadList.activeBoardId,
    firstLoad: messageThreadList.firstLoad,
    moreMessages: messageThreadList.moreMessages,
    newChat: messageThreadList.newChat,
    messageResolveResponse: messageThreadList.messageResolveResponse,
    creatorContact: home.contactDetail,
    filter: messageBoards.filter,
    resolveThred: messageThreadList.resolveThread,
    refresh_chat_screen: messageThreadList.refresh_chat_screen,
    goToMessageDetail: messageThreadList.goToMessageDetail,
    gotoMessageId: messageThreadList.gotoMessageId,
  };
};

export const ChatScreen = connect(mapStateToProps, {
  createNewThread,
  createNewBoard,
  sendMessage,
  replyTo,
  replyToPrivate,
  setTopicName,
  markThreadAsStar,
  deleteUserFromGrup,
  deleteUserChtHistry,
  clearUSerChatHistory,
  deleteThreadChat,
  markUnreadThread,
  getBoardMembers,
  MuteUnmute,
  getBoardMessages,
  setActiveBoard,
  markBoardAsSeen,
  messageResolve,
  searchModeOn,
  searchModeOff,
  reactMessage,
  deleteMessage,
  resolveUser,
  deleteMessageForEveryone,
  getBoardMessagesMoreMessagesTrue,
  showMsgTraceInfo,
  storeForwardMessage,
  setMessageReminder,
  deleteMessageReminder,
  resolveNotification,
  scrollToMessage,
})(_ChatScreen);
