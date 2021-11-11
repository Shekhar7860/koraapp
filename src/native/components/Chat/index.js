import React from 'react';
import {
  View,
  FlatList,
  TouchableHighlight,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import PropTypes from 'prop-types';
import {SearchBar} from 'react-native-elements';
import {Q} from '@nozbe/watermelondb';
import {BottomUpModalShare} from '../BottomUpModal/BottomUpModalShare';
import {BottomUpModal} from './../BottomUpModal';
import styles from './styles';
import stylesLocal from './MessagesListView.Style';
import {getTimeline, getHourDiiferenceFromToday} from '../../utils/helpers';
import {MessagesListViewItem} from './MessagesListViewItem';
import {Icon} from '../Icon/Icon';
import {navigate} from '../../navigation/NavigationService';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
import {Avatar} from '../Icon/Avatar';
import {reminderOptions} from './../PostsComponent/Post';
import {Text} from './../KoraText';
import DeleteMessage from './DeleteChatItemEvent.js';
import * as UsersDao from '../../../dao/UsersDao';
import Placeholder from '../../components/Icon/Placeholder';
import {emptyArray} from '../../../shared/redux/constants/common.constants';
import {loadMessagesToState, modifyThreadMessages} from '../../../helpers';
import MessageUploadQueue from '../../screens/FileUploader/MessageUploadQueue';
import {Loader} from '../../screens/ChatsThreadScreen/ChatLoadingComponent';
import {colors} from '../../theme/colors';
import ActionItemBottomSheet from '../BottomUpModal/ActionItemBottomSheet';
import database from '../../../native/realm';
import * as Entity from '../../../native/realm/dbconstants';
import ReplyMessage from './ReplyMessage';
import * as MessagesDao from '../../../dao/MessagesDao';
import {
  deleteMessageNew,
  deleteMessageForEveryoneNew,
  scrollToMessage,
} from '../../../shared/redux/actions/message-thread.action';
import {connect} from 'react-redux';


const reply_ = {
  id: 'reply',
  text: 'Reply',
  icon: 'Reply',
};
const copyMessage_ = {
  id: 'copy_message',
  text: 'Copy Message',
  icon: 'Copy',
};
const replyPrivate_ = {
  id: 'reply_private',
  text: 'Reply in private',
  icon: 'Reply_Private',
};
const deleteMessage_ = {
  id: 'delete_message',
  text: 'Delete',
  icon: 'Delete_T',
};
const forwardMessage_ = {
  id: 'forward_message',
  text: 'Forward',
  icon: 'forward',
};

const reminder_ = {
  id: 'reminder',
  text: 'Reminder',
  icon: 'Future',
};
const traceInfo_ = {
  id: 'trace_info',
  text: 'Message Info',
  icon: 'traceInfo',
};

export const unreadMessageTitle = 'Unread';
const SEARCH_INIT_STATE = {
  searchText: '',
  filteredMesages: [],
  highlightedMessageId: '',
  selectedFilterMessageIndex: 0,
};

const delteOptionsArray = [
  {name: 'Delete for everyone', key: 1, color: colors.koraAlertNegative},
  {name: 'Delete for me', key: 2, color: colors.koraAlertNegative},
  {name: 'Cancel', key: 3, color: colors.koraAlertPositive},
];

const delteOptionsArrayRemoveEveryone = [
  {name: 'Delete for me', key: 2, color: colors.koraAlertNegative},
  {name: 'Cancel', key: 3, color: colors.koraAlertPositive},
];

const delteOptionsArrayForReciever = [
  {name: 'Delete for me', key: 1, color: colors.koraAlertNegative},
  {name: 'Cancel', key: 2, color: colors.koraAlertPositive},
];

const SeperatorComponent = () => {
  return <View style={stylesLocal.separatorComponent1} />;
};

export const HeaderDateChangeTimeline = React.memo(({title}) => {
  return (
    <View style={[stylesLocal.dateChangeTimeLine1, {height: 30}]}>
      <View style={[stylesLocal.dateChangeTimeLine2, {marginTop: 0}]}>
        <View style={[styles.timelineMain, {}]}>
          <>
            <Text style={styles.timelineTextStyle}>
              {getTimeline(title, 'message')}
            </Text>
          </>
        </View>
      </View>
    </View>
  );
});

export const DateChangeTimeline = React.memo(({title}) => {
  return (
    <View style={stylesLocal.dateChangeTimeLine1}>
      <View style={stylesLocal.dateChangeTimeLine2}>
        <View style={styles.timelineMain}>
          {title === unreadMessageTitle ? (
            <Text style={styles.timelineTextStyle}>{unreadMessageTitle}</Text>
          ) : (
            <>
              <Text style={styles.timelineTextStyle}>
                {getTimeline(title, 'message')}
              </Text>
              {/* <View style={{width: 5}} />
              <Icon name={'DownArrow'} size={12} /> */}
            </>
          )}
        </View>
      </View>
    </View>
  );
});

class MessagesListView extends React.Component {
  constructor(props) {
    super(props);
    this.groupMessages = [];
    this.modifiedMessages = [];

    this.state = {
      refreshing: false,
      focusedMessage: null,
      focusedEmojiIndex: null,
      offset: 0,
      onDeletePannelStatus: false,
      showLoader: false,
      ...SEARCH_INIT_STATE,
      searchText: '',
      headerCurrentDate: null,
      showStickyHeader: false,
      reminderTime: null,
      creator: null,
      participants: null,
      selectedIndex : -1
    };
    this.traceInfoModalRef = React.createRef();
    this.emojiDetailsModalRef = React.createRef();
    this.reminderModalRef = React.createRef();
    this.reminderRef = React.createRef();
    this.listners = [];
    this.timeOut = null;
    this.timer = null;
    this._viewabilityConfig = {
      minimumViewTime: 0,
      itemVisiblePercentThreshold: 90,
      waitForInteraction: false,
    };
    this.scrolledToUnread = false;
    this._chatListRef = React.createRef();
  }

  subscribeMessages = async () => {
    try {
      const {board} = this.props;
      const db = database.active;

      if (this.messagesSubscription && this.messagesSubscription.unsubscribe) {
        this.messagesSubscription.unsubscribe();
      }

      if (this.creatorSubscription && this.creatorSubscription.unsubscribe) {
        this.creatorSubscription.unsubscribe();
      }

      const whereClause = [
        Q.where('board_id', board?.id),
        Q.experimentalSortBy('sentOn', Q.desc),
      ];

      this.messagesObservable = db.collections
        .get(Entity.Messages)
        .query(...whereClause)
        .observeWithColumns(['updated_at']);
      this.messagesSubscription = this.messagesObservable.subscribe(
        (messages) => {
          this.groupMessages = loadMessagesToState(messages);
          this.loadMessages(messages);
          this.setState({messages: messages});
          this.updateMarkBoardAsSeen();
        },
      );

      let creator = await board.creator.fetch();
      const observable = await creator.contact.observe();
      this.creatorSubscription = observable.subscribe((data) => {
        this.setState({creator: data});
      });
    } catch (e) {
      console.log('error in subscribeMessages', e);
    }
  };

  get chatListRef() {
    return this._chatListRef.current;
  }

  toggleSearchMode(searchMode) {
    this.setState(SEARCH_INIT_STATE);
    if (this.props.setSearchMode) {
      this.props.setSearchMode(searchMode);
    }
  }

  componentDidMount() {
    this.props?.onRef(this);
    this._isMounted = true;
    this.timer = null;
    this.subscribeMessages();
    if (this.props.storeForwardMessage) {
      this.props.storeForwardMessage(null);
    }
    let boardId = this.props.board?._id;
    if (this.props.setActiveBoard && boardId !== this.props.activeBoardId) {
      this.props.setActiveBoard({boardId: boardId});
    }
    this.unreadCount = this.props.unreadCount;
    this.updateMarkBoardAsSeen();

    this.toShowBoardId = this.props.board?._id;
  }

  scrollToUnreadMarker() {
    const index = Number(this.unreadCount);
    if (index !== 0) {
      this._chatListRef?.current?.scrollToItem({
        animated: true,
        item: this.groupMessages[index],
        viewPosition: 1,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.searchMode !== this.props.searchMode) {
      const searchMode = this.props.searchMode;
      if (searchMode) {
        setTimeout(() => {
          this.focusSearchHeader();
        }, 500);
      }
    }

    if (prevState.messages !== this.state.messages) {
      this.setState({offset: this.state.messages?.length});
      if (prevState.messages?.length !== this.state.messages?.length) {
        //console.log('SCROLL TO END');
        // setTimeout(() => {
        //   this.chatScrollToEnd();
        // }, 100);
      }
    }
    if (
      !this.scrolledToUnread ||
      (!prevProps.firstLoad && this.props.firstLoad)
    ) {
      this.scrolledToUnread = true;
      setTimeout(() => {
        this.scrollToUnreadMarker();
      }, 1000);
    }
    if (prevProps.multiSelectOn !== this.props.multiSelectOn) {
      if (this.props.multiSelectOn == false) {
        this.loadMessages(this.state.messages);
      }
    }
    // if(prevProps.messageIdToScroll != this.props.messageIdToScroll) {
    //   this.scrollToMessageId(this.props.messageIdToScroll);
    // } 
  } 

  loadMessages(messages) {
    this.modifiedMessages = modifyThreadMessages(messages);
    this.modifiedMessages = this.modifiedMessages.map(function (o) {
      o.isSelected = false;
      return o;
    });
    if (this.props.messageResolve) {
      let arrayIds = this.modifiedMessages
        .filter((el) => el?.replyTo !== undefined && el?.replyTo?.messageId)
        .map((el) => el?.replyTo?.messageId);
      this.props.messageResolve(arrayIds);
    }
  }

  componentWillUnmount() {
    // this.updateMarkBoardAsSeen();
    this._isMounted = false;
    clearTimeout(this.timer);
    clearTimeout(this.timeOut);
    this.toggleSearchMode(false);
    this.groupMessages = [];
    this.modifiedMessages = [];
    this.scrolledToUnread = false;

    if (this.messagesSubscription && this.messagesSubscription.unsubscribe) {
      this.messagesSubscription.unsubscribe();
    }
    if (this.creatorSubscription && this.creatorSubscription.unsubscribe) {
      this.creatorSubscription.unsubscribe();
    }
  }

  updateMarkBoardAsSeen() {
    let boardId = this.props.board?._id;
    if (boardId && this.props.markBoardAsSeen) {
      this.props.markBoardAsSeen();
    }
  }

  scrollToTop() {}

  onRefresh = () => {
    this.setState({refreshing: true});
    this.timer = setTimeout(() => {
      this.setState({refreshing: false});
    }, 1000);
  };

  isTimelineEvent(item) {
    return (
      item?.components?.length > 0 &&
      item?.components[0].componentType === 'timeline'
    );
  }

  searchText(txt) {
    this.setState({searchText: txt});
    this.searchMessages(txt);
    // if (txt?.length < 1) {
    //   this.setState({highlightedMessages: {}});
    //   this.setState({filteredMesages: []});
    //   return false;
    // }
    // let filteredMesages = this.modifiedMessages?.filter((val) => {
    //   const l = val.components?.length || 0;
    //   for (let i = 0; i < l; i++) {
    //     const component = val.components[i];
    //     if (component.componentType === 'text') {
    //       const text = component.componentBody?.toLowerCase();
    //       if (text.includes(txt?.toLowerCase())) {
    //         return true;
    //       }
    //     }
    //   }
    //   return false;
    // });
    // this.setState({highlightedMessages: {}});

    // const ids = filteredMesages.map((message) => message.messageId);
    // let selectedIdsMap = {};
    // ids.forEach((a) => {
    //   selectedIdsMap[a] = true;
    // });

    // this.setState({filteredMesages});
    // this.setState({selectedFilterMessageIndex: 0});
    // this.setState({highlightedMessages: selectedIdsMap});

    // if (filteredMesages.length > 0) {
    //   this.scrollTo(filteredMesages[0].messageId);
    // }
  }

  searchMessages = async (query) => {
    // if(query.length < 3) {
    //   return;
    // }
    try {
      this.setState({highlightedMessageId: ''});
      this.setState({filteredMesages: []});
      if (query !== null && query !== '') {
        let searchString = '%' + query + '%';
        // let searchString = '%' + query + '%';
        const db = database.active;
        const msgsCollection = db.collections.get(Entity.Messages);
        console.log('search string', searchString);
        await db.write(async () => {
          const msgs = await msgsCollection
            .query(
              Q.unsafeSqlQuery(
                'SELECT * from Messages m  left join Components c on c.message_id == m.id where c.componentBody LIKE ? and c.componentType = ?',
                [searchString, 'text'],
              ),
            )
            .fetchIds();

          let filterMessages = msgs;
          let finalMessages = this.state.messages.filter((s) => {
            return filterMessages.includes(s.id);
          });
          this.setState({selectedFilterMessageIndex: 0,filteredMesages: finalMessages});

          if (finalMessages.length > 0) {
            this.setState({highlightedMessageId: finalMessages[0].id});
          }
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  scrollTo = (key) => {
    const index = this.groupMessages.findIndex((msg) => msg.messageId === key);
    if (index !== -1) {
      this._chatListRef?.current?.scrollToIndex({
        animated: false,
        index: index,
      });
      this.setState({selectedIndex : index})
    }
  };

  scrollToMessageId = (key) => {
    const index = this.groupMessages.findIndex((msg) => msg.id === key);
    // this.props.scrollToMessage("");
    if (index !== -1) {
      this._chatListRef?.current?.scrollToIndex({
        animated: false,
        index: index,
      });
    }
  };

  scrollToMessage = (index) => {
    console.log('chat list ref', this._chatListRef);
    this._chatListRef.current?.scrollToIndex({
      animated: true,
      index: index,
    });
  };

  goIndex = (indexNumber) => {
    this._chatListRef.current?.scrollToIndex({
      animated: true,
      index: indexNumber,
    });
  };

  focusSearchHeader() {
    if (this.refs?.searchBar) {
      this.refs?.searchBar?.focus();
    }
  }

  renderSearchHeader() {
    return (
      <SafeAreaView>
        <View style={styles.searchHeader1}>
          <SearchBar
            ref="searchBar"
            round
            returnKeyType={'search'}
            searchIcon={{size: 24, color: '#202124'}}
            style={stylesLocal.searchHeaderLocal1}
            inputStyle={stylesLocal.searchHeaderLocal2}
            inputContainerStyle={stylesLocal.inputContainerStyle}
            containerStyle={styles.searchHeader2}
            cancelButtonProps={{color: '#0D6EFD'}}
            clearIcon={{marginRight: 0}}
            backgroundColor={'white'}
            onChangeText={(txt) => {
              this.searchText(txt);
            }}
            onSubmitEditing={() => {
              this.searchText(this.state.searchText);
            }}
            platform="ios"
            placeholder="Search"
            showCancel={true}
            cancelButtonText="Cancel"
            onCancel={() => {
              this.toggleSearchMode(false);
            }}
            value={this.state.searchText}
          />
        </View>
      </SafeAreaView>
    );
  }

  gotoNextSearchItem = (goUp = true) => {
    return () => {
      let {selectedFilterMessageIndex, filteredMesages} = this.state;
      let total = filteredMesages.length;
      if (goUp) {
        if (selectedFilterMessageIndex + 1 >= total) {
        } else {
          selectedFilterMessageIndex += 1;
        }
      } else {
        if (selectedFilterMessageIndex - 1 < 0) {
        } else {
          selectedFilterMessageIndex -= 1;
        }
      }
      let idOfSelected = filteredMesages[selectedFilterMessageIndex].id;
      var index = this.state.messages.findIndex(function (item, i) {
        return item.id === idOfSelected;
      });
      this.setState({
        selectedFilterMessageIndex: selectedFilterMessageIndex,
        highlightedMessageId: filteredMesages[selectedFilterMessageIndex].id,
      });

      this.scrollToMessage(index);
    };
  };

  renderStickyTimeline = () => {
    const {headerCurrentDate} = this.state;
    return headerCurrentDate ? (
      <View style={styles.stickyDate}>
        <HeaderDateChangeTimeline title={headerCurrentDate} />
      </View>
    ) : null;
  };

  renderSearchFooter() {
    let {selectedFilterMessageIndex, filteredMesages} = this.state;
    let total = filteredMesages.length;
    let showUpArrow = selectedFilterMessageIndex < total - 1;
    let showDownArrow = selectedFilterMessageIndex >= 1;
    return (
      <View style={stylesLocal.searchFooter1}>
        <View>
          <Text>
            {this.state.filteredMesages.length > 0
              ? this.state.selectedFilterMessageIndex +
                1 +
                '/' +
                this.state.filteredMesages.length
              : 'No Results'}
          </Text>
        </View>
        <View style={stylesLocal.searchFooter2}>
          {showUpArrow && (
            <View style={stylesLocal.searchFooter3}>
              <TouchableOpacity onPress={this.gotoNextSearchItem()}>
                <Icon name={'Up'} size={15} color={'#202124'} />
              </TouchableOpacity>
            </View>
          )}
          {showDownArrow && (
            <View style={[stylesLocal.searchFooter4,{ marginLeft:20}]}>
              <TouchableOpacity onPress={this.gotoNextSearchItem(false)}>
                <Icon name={'Down'} size={15} color={'#202124'} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

  copyToClipboard(message) {
    if (!message) {
      return;
    }
    const {componentsCount, components} = message;
    if (componentsCount === 0) {
      return;
    }
    try {
      components.fetch().then((componentsNew) => {
        const texts = componentsNew
          .filter((comp) => comp.componentType === 'text')
          .map((comp) => comp.componentBody)
          .join(' ');
        Clipboard.setString(texts);
      });
    } catch (e) {}
  }

  setReplyToMessage = (message = null) => {
    if (this.props.setReplyToMessage) {
      this.props.setReplyToMessage(message);
    }
  };

  deleteMessage(id, isSender) {
    if (!isSender) {
      this.refs.deleteMessageOptRec.openModal(
        (onPannelStatus) => {
          this.setState({
            onDeletePannelStatus: onPannelStatus,
          });
        },
        (element) => {
          switch (element.key) {
            case 1:
              this.deleteForSelf(id);
              break;
            case 2:
              break;
            case 3:
              break;
          }
        },
      );
      return;
    }

    this.setState({
      onDeletePannelStatus: true,
    });

    this.refs.deleteMessageOpt.openModal(
      (onPannelStatus) => {
        this.setState({
          onDeletePannelStatus: onPannelStatus,
        });
      },
      (element) => {
        console.log('element   ------>: ', element);
        switch (element.key) {
          case 1:
            this.deleteForEveryone(id);
            break;
          case 2:
            this.deleteForSelf(id);
            break;
          case 3:
            break;
        }
      },
    );
  }

  deleteForEveryone(id) {
    let mId = id;
    let payload = {
      recall: [mId],
      id: this.props.boardId,
      // message: this.state.focusedMessage
    };
    let _params = {
      id: this.props.boardId ? this.props.boardId : '',
      payload: payload,
      // message: this.state.focusedMessage,
    };
    const message = this.state.focusedMessage;
    if (this.props.deleteMessageForEveryoneNew) {
      // console.log
      this.props.deleteMessageForEveryoneNew(_params, () => {
        MessagesDao.deleteMessage(message);
      });
    }
  }

  deleteForSelf(id) {
    if (this.props.boardId) {
      let messageId = id;
      let payload = {
        messageId: messageId,
        boardId: this.props.boardId,
        index: true,
        // message: this.state.focusedMessage,
      };
      //let message = this.state.focusedMessage;
      if (this.props.deleteMessageNew) {
        //console.log("payload  ---->:",payload);
        this.props.deleteMessageNew(payload, () => {
          MessagesDao.deleteMessageObject(messageId);
        });
      }
    }
  }

  reactToMessage(emoji) {
    const {focusedMessage} = this.state;
    let _params = {
      boardId: focusedMessage.boardId,
      messageId: focusedMessage.messageId,
    };
    let payload = {
      emotion: {
        add: emoji,
      },
    };
    if (this.props.reactMessage) {
      this.props.reactMessage(_params, payload);
    }
  }

  openTraceModal() {
    setTimeout(() => {
      this.traceInfoModalRef.current &&
        this.traceInfoModalRef.current.openBottomDrawer();
    }, 500);
  }

  closeInfo() {
    let cb = () => {};
    this.traceInfoModalRef.current.close();
  }

  renderDeleteMessageOption() {
    var optionArray = delteOptionsArray;
    const {focusedMessage} = this.state;
    if(focusedMessage) {
      if(getHourDiiferenceFromToday(focusedMessage?.sentOn) > 1) {
      optionArray = delteOptionsArrayRemoveEveryone;
      } 
    }
    return (
      <DeleteMessage
        delteOptionsArray={optionArray}
        ref="deleteMessageOpt"
        title="Are you sure?"
      />
    );
  }

  renderDeleteMessageOptionForReciever() {
    return (
      <DeleteMessage
        delteOptionsArray={delteOptionsArrayForReciever}
        ref="deleteMessageOptRec"
        title="Are you sure?"
      />
    );
  }

  renderReminderModal() {
    const onReminderOptionClick = ({id, data}) => {
      const {focusedMessage} = this.state;
      if (focusedMessage) {
        const {messageId, boardId} = focusedMessage;

        const payload = {
          resourceType: 'message',
          resourceId: messageId,
          notificationMessage: 'Reminder on Message',
          scheduleAfter: data,
          resourceContext: {
            msgId: messageId,
            boardId: boardId,
          },
        };

        if (id === 'delete' && this.props.deleteMessageReminder) {
          this.props.deleteMessageReminder(
            {},
            payload,
            () => this.reminderModalRef.current.close(),
            this.setState({focusedMessage: null, participants: null}),
          );
        } else if (this.props.setMessageReminder) {
          this.reminderModalRef.current.close();
          this.props.setMessageReminder(
            {},
            payload,
            () => this.reminderModalRef.current.close(),
            this.setState({focusedMessage: null, participants: null}),
          );
        }
      }
    };

    return (
      <BottomUpModal ref={this.reminderModalRef} height={480}>
        <View style={stylesLocal.bottomUpModal4} />
        <ActionItemBottomSheet title={'Remind in'} itemType={'header'} />
        {/* <View style={stylesLocal.bottomUpModal1}>
          <Text style={styles.textStyle1}>Remind in</Text>
        </View> */}
        <View style={stylesLocal.bottomUpModal6} />
        {reminderOptions.map((option) => (
          <ActionItemBottomSheet
            key={option.id}
            title={option.text}
            iconName={option.icon}
            id={option.id}
            itemType={'titleOnly'}
            optionSelected={() => onReminderOptionClick(option)}
          />
        ))}
      </BottomUpModal>
    );
  }

  isAllMedia(focusedMessage) {
    if (
      focusedMessage &&
      focusedMessage?.components &&
      focusedMessage?.components.length > 0
    ) {
      for (let i = 0; i < focusedMessage?.components.length; i++) {
        if (focusedMessage?.components[i]?.componentType === 'text') {
          return false;
        }
      }
    } else {
      return false;
    }
    return true;
  }

  renderMessageOption() {
    let messageOptions = this.props.isGroupChat
      ? [
          reply_,
          forwardMessage_,
          reminder_,
          copyMessage_,
          replyPrivate_,
          deleteMessage_,
        ]
      : [reply_, forwardMessage_, reminder_, copyMessage_, deleteMessage_];

    const {focusedMessage} = this.state;
    if (
      typeof focusedMessage?.isValid === 'function' &&
      !focusedMessage?.isValid()
    ) {
      return null;
    }
    let isAllMedia = this.isAllMedia(focusedMessage);
    if (focusedMessage?.isSender) {
      messageOptions = isAllMedia
        ? [reply_, forwardMessage_, reminder_, traceInfo_, deleteMessage_]
        : [
            reply_,
            forwardMessage_,
            reminder_,
            copyMessage_,
            traceInfo_,
            deleteMessage_,
          ];
    } else {
      if (isAllMedia) {
        messageOptions = this.props.isGroupChat
          ? [reply_, forwardMessage_, reminder_, replyPrivate_, deleteMessage_]
          : [reply_, forwardMessage_, reminder_, deleteMessage_];
      }
    }
    const optionSelected = (id, emoji = null) => {
      let cb = () => {};
      if (id === reply_.id) {
        this.setState({focusedMessage: null, participants: null});
        this.setReplyToMessage(focusedMessage);
      }
      if (id === reminder_.id) {
        this.refs.messageOptions.closeBottomDrawer(cb);
        setTimeout(() => this.reminderModalRef.current.open(), 1500);
      }
      if (id === copyMessage_.id) {
        this.copyToClipboard(focusedMessage);
        this.setState({focusedMessage: null, participants: null});
      }
      if (id === deleteMessage_.id) {
        setTimeout(() => {
          this.deleteMessage(focusedMessage.messageId, focusedMessage.isSender);
        }, 1000);
      }
      if (id === 'react') {
        this.reactToMessage(emoji);
      }
      if (id === replyPrivate_.id) {
        if (this.props.replyToPrivate) {
          this.props.replyToPrivate(focusedMessage);
        }
      }
      if (id === traceInfo_.id && this.props.showMsgTraceInfo) {
        this.openTraceModal();
      }
      if (id === forwardMessage_.id) {
        if (this.props.forwardMessage) {
          this.props.forwardMessage([focusedMessage], this.props.boardType);
        } else {
          navigate(ROUTE_NAMES.FORWARD_MESSAGE, {
            selectedMessages: [focusedMessage],
            boardType: this.props.boardType,
          });
        }
      }

      this.refs.messageOptions.closeBottomDrawer(cb);
    };
    const emojis = ['like', 'unlike', 'laugh', 'sad', 'anger'];
    const Emoji = ({name}) => {
      return (
        <TouchableOpacity
          onPress={() => {
            optionSelected('react', name);
          }}
          underlayColor="rgba(0,0,0,0.2)">
          <Icon name={name} size={50} />
        </TouchableOpacity>
      );
    };

    return (
      <BottomUpModal ref="messageOptions" height={400}>
        <View style={stylesLocal.bottomUpModal3}>
          {emojis.map((emoji) => (
            <Emoji name={emoji} key={emoji} />
          ))}
        </View>
        {messageOptions.map((option) => (
          <ActionItemBottomSheet
            title={option.text}
            iconName={option.icon}
            key={option.id}
            id={option.id}
            optionSelected={() => optionSelected(option.id)}
          />
        ))}
      </BottomUpModal>
    );
  }

  renderTraceInfoComponent() {
    let {messagetraceInfo} = this.props;

    return (
      <BottomUpModalShare
        expandable={true}
        ref={this.traceInfoModalRef}
        height={300}>
        <View style={stylesLocal.traceInfo9}>
          <Text numberOfLines={1} style={styles.tranceInfoTextStyle}>
            Message Info
          </Text>
          <TouchableHighlight
            underlayColor="#ffffff00"
            onPress={() => {
              this.closeInfo();
            }}>
            <Icon name={'close'} size={24} color="#202124" />
          </TouchableHighlight>
        </View>
        {messagetraceInfo ? (
          <View style={{marginBottom: 70}}>
            <FlatList
              data={messagetraceInfo}
              style={{paddingTop: 9}}
              keyExtractor={(item, index) => index}
              renderItem={(props) => {
                const {recipient, readReceipt, sentOn} = props.item;
                const {firstName, lastName, profColour, profImage, _id} =
                  recipient;
                const {deliveredAt} = readReceipt;
                const {readAt} = readReceipt;
                const fullName = firstName + ' ' + lastName;
                return (
                  <View style={stylesLocal.traceInfo1}>
                    <View>
                      <Avatar
                        name={fullName}
                        color={profColour}
                        profileIcon={profImage}
                        userId={_id}
                      />
                    </View>
                    <View style={stylesLocal.traceInfo2}>
                      <Text style={styles.fullNameTextStyle}>{fullName}</Text>
                      <View style={stylesLocal.traceInfo3}>
                        <View style={stylesLocal.traceInfo4}>
                          <Text style={stylesLocal.traceInfo5}>
                            {getTimeline(
                              readAt
                                ? readAt
                                : deliveredAt
                                ? deliveredAt
                                : sentOn,
                              'numberDate',
                            )}{' '}
                            -{' '}
                          </Text>
                          <Text style={stylesLocal.traceInfo6}>
                            {getTimeline(
                              readAt
                                ? readAt
                                : deliveredAt
                                ? deliveredAt
                                : sentOn,
                              'time',
                            )}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={stylesLocal.traceInfo7}>
                      <Text style={stylesLocal.traceInfo8}>
                        {readAt ? 'Read' : deliveredAt ? 'Delivered' : 'Sent'}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        ) : (
          <View style={{margin: 35}}>
            <Loader size="small" />
          </View>
        )}
      </BottomUpModalShare>
    );
  }

  renderEmojiDetails() {
    let {focusedMessage, participants} = this.state;
    if (
      typeof focusedMessage?.isValid === 'function' &&
      !focusedMessage?.isValid()
    ) {
      return null;
    }

    const allEmojis = ['like', 'unlike', 'laugh', 'anger', 'sad', 'shock'];
    let {focusedEmojiIndex} = this.state;
    if (focusedMessage === null) {
      focusedMessage = {};
    }
    const emojis = allEmojis.filter((name) => {
      return focusedMessage[name + 'Count'] !== 0;
    });
    focusedEmojiIndex = focusedEmojiIndex || 0;

    const Emoji = ({name}) => {
      let focus = false;
      if (name === emojis[focusedEmojiIndex]) {
        focus = true;
      }
      const index = emojis.findIndex((a) => a === name);
      return (
        <View
          style={{
            borderBottomWidth: 2,
            borderBottomColor: focus ? '#0D6EFD' : '#BDC1C6',
          }}>
          <TouchableHighlight
            style={stylesLocal.emojiStyle1}
            onPress={() => {
              this.setState({focusedEmojiIndex: index});
            }}
            underlayColor="rgba(0,0,0,0.2)">
            <View style={stylesLocal.emojiStyle2}>
              <Icon name={name} size={30} />
              <Text
                style={{
                  ...styles.focusedMessageTextStyle,
                  color: focus ? '#0D6EFD' : '#9AA0A6',
                }}>
                {focusedMessage[name + 'Count']}
              </Text>
            </View>
          </TouchableHighlight>
        </View>
      );
    };
    return (
      <BottomUpModal
        ref={this.emojiDetailsModalRef}
        expandable={false}
        height={340}>
        <View style={stylesLocal.emojiStyle3}>
          {emojis.map((emoji) => (
            <Emoji name={emoji} key={emoji} />
          ))}
        </View>
        <FlatList
          data={participants}
          ListEmptyComponent={() => {
            return (
              <View style={stylesLocal.emojiStyle4}>
                <Text>Empty</Text>
              </View>
            );
          }}
          renderItem={(props) => {
            const {fN, lN, color, icon, id} = props.item;
            const fullName = fN + ' ' + lN;
            return (
              <View style={stylesLocal.emojiStyle5}>
                <View>
                  <Avatar
                    name={fullName}
                    color={color}
                    profileIcon={icon}
                    userId={id}
                  />
                </View>
                <View style={stylesLocal.emojiStyle6}>
                  <Text style={styles.fullNameTextStyle}>{fullName}</Text>
                </View>
              </View>
            );
          }}
        />
      </BottomUpModal>
    );
  }

  renderReminderInfoModal = (remind) => {
    return (
      <BottomUpModal ref={this.reminderRef} height={200}>
        <View style={styles.bottomUpmodal1}>
          {/* <View style={localStyles.bottomUpmodal2}> */}
          <Text style={styles.reminderHeaderStyle}>
            You will be reminded at
          </Text>
          {/* </View> */}
          <View
            style={{
              height: 1,
              backgroundColor: '#EFF0F1',
            }}
          />
          <ActionItemBottomSheet
            title={'' + getTimeline(this.state.reminderTime, 'fulldate')}
            itemType={'titleOnly'}
            optionSelected={() => onReminderOptionClick(option)}
          />
        </View>
      </BottomUpModal>
    );
  };

  loadMoreMessages = () => {
    let val = this.state.offset;
    const {board} = this.props;

    let _params = {
      _id: board?._id,
      id: board?.id,
      offset: val,
      limit: 40,
    };
    this.props.getBoardMessages(_params);
  };

  FlatListHeader = () => {
    return this.state.showLoader ? (
      <View style={[styles.container, styles.horizontal]}>
        <Loader size="small" />
      </View>
    ) : (
      <SeperatorComponent />
    );
  };

  onLongPress = (data) => {
    this.setState({focusedMessage: data});
    console.log(
      'Long press message time diff',
      getHourDiiferenceFromToday(data.sentOn),
    );
    this.refs.messageOptions.openBottomDrawer();
    if (data?.isSender) {
      this.props.showMsgTraceInfo({
        boardId: data?.boardId,
        messageId: data?.messageId,
      });
    }
  };

  onEmojiClick = async (focusedMessage) => {
    this.setState({focusedMessage: focusedMessage});
    let {focusedEmojiIndex} = this.state;
    if (focusedMessage === null) {
      focusedMessage = {};
    }

    const allEmojis = ['like', 'unlike', 'laugh', 'anger', 'sad', 'shock'];
    const emojis = allEmojis.filter((name) => {
      return focusedMessage[name + 'Count'] !== 0;
    });
    focusedEmojiIndex = focusedEmojiIndex || 0;

    let participants = focusedMessage[emojis[focusedEmojiIndex]] || emptyArray;
    const contactIds = participants?.map((obj) => {
      return obj.userId;
    });

    const db = database.active;
    try {
      const contactsCollection = db.collections.get(Entity.Contacts);
      const members = await contactsCollection
        .query(Q.where('id', Q.oneOf(contactIds)))
        .fetch();
      this.setState({participants: members});
      this.emojiDetailsModalRef.current?.openBottomDrawer();
    } catch (e) {
      console.log('error in onEmojiClick : ', e)
    }
  };

  onCheckBoxPress = (data) => {
    let dataMap = this.modifiedMessages.filter(function (o) {
      if (o.messageId === data.messageId) {
        return o;
      }
    });

    let result = this.modifiedMessages.map(function (o) {
      if (o.messageId === dataMap[0]?.messageId) {
        o.isSelected = !dataMap[0]?.isSelected;
      }
      return o;
    });
    this.modifiedMessages = result;

    const arrSelected = this.modifiedMessages?.filter(
      (d) => d.isSelected === true,
    );
    this.props.onPress(arrSelected);
  };

  getCreaterName = () => {
    const authorName =
      this.state.creator?.id === UsersDao.getUserId()
        ? 'You'
        : (this.state.creator?.fN || '') + ' ' + (this.state.creator?.lN || '');

    return authorName;
  };

  renderFooterComponent = () => {
    if (this.props.loadingMore) {
      return (
        <View style={{padding: 10}}>
          <Loader size="small" />
        </View>
      );
    }
    //console.log('this.state.creator  ---------->: ', this.state.creator);
    const creatorName =
      (this.state.creator?.fN || '') + ' ' + (this.state.creator?.lN || '');
    const showHeader =
      this.props.isGroupChat && creatorName && creatorName?.trim() !== '';

    if (this.props.moreMessages !== false) {
      return null;
    }
    return (
      <View>
        {showHeader ? (
          <View style={stylesLocal.listFooter1}>
            <View
              style={{
                width: 40,
                height: 40,
                justifyContent: 'center',
                borderRadius: 40 / 2,
                marginEnd: 10,
                paddingVertical: 5,
                alignItems: 'center',
                backgroundColor: this.state.creator?.color,
              }}>
              {this.state.creator?.fN && (
                <Text style={styles.fullNameTextStyleAvtar}>
                  {this.state.creator?.fN?.charAt(0) +
                    '' +
                    this.state.creator?.lN?.charAt(0)}
                </Text>
              )}
            </View>

            <View style={stylesLocal.listFooter2}>
              <Text style={stylesLocal.listFooter3}>
                {this.getCreaterName() + ' created this chat'}
              </Text>
              {/* <Text style={stylesLocal.listFooter5}>
                {moment(this.props.board?.createdOn).format(
                  'ddd, MMM D YYYY,  hh:mm a',
                )}
              </Text> */}
            </View>
          </View>
        ) : null}
      </View>
    );
  };

  chatScrollToEnd() {
    this._chatListRef?.current?.scrollToItem({
      animated: true,
      item: this.groupMessages[0],
      viewPosition: 1,
    });
  }

  updateStickyDate = ({viewableItems, changed}) => {
    if (viewableItems.length) {
      const lastItem = viewableItems.pop();
      if (
        changed &&
        lastItem.item?.deliveredOn !== this.state.headerCurrentDate
      ) {
        this.setState({
          headerCurrentDate: lastItem.item.deliveredOn,
        });
      }
    }
  };

  renderStickyDate = () => {
    const {headerCurrentDate} = this.state;
    return headerCurrentDate ? (
      <View style={styles.stickyDate}>
        <HeaderDateChangeTimeline title={headerCurrentDate} />
      </View>
    ) : null;
  };

  keyExtractor = (item, index) => {
    if (typeof item?.isValid === 'function' && !item?.isValid()) {
      return index;
    }
    return item?.id || index;
  };

  onReminderInfoPressed = (reminderTime) => {
    this.setState({reminderTime: reminderTime});
    this.reminderRef.current.open();
  };

  render() {
    if (this.groupMessages?.length > 0) {
      const searchMode = this.props.searchMode;
      return (
        <View style={stylesLocal.mainStyle1}>
          {searchMode && this.renderSearchHeader()}
          {this.renderMessageOption()}
          {this.renderDeleteMessageOption()}
          {this.renderDeleteMessageOptionForReciever()}
          {this.renderReminderModal()}
          {this.renderReminderInfoModal()}
          <View style={stylesLocal.mainStyle2}>
            <View style={[styles.mainContainer]}>
              <FlatList
                onScrollBeginDrag={() => {
                  if (!this.state.showStickyHeader) {
                    this.setState({showStickyHeader: true});
                  }
                }}
                onMomentumScrollEnd={() => {
                  if (this.state.showStickyHeader) {
                    this.setState({showStickyHeader: false});
                  }
                }}
                removeClippedSubviews={true}
                inverted={true}
                initialNumToRender={10}
                ListFooterComponent={this.renderFooterComponent}
                ref={this._chatListRef}
                ListHeaderComponent={this.FlatListHeader}
                style={stylesLocal.listFooter4}
                data={this.groupMessages}
                keyExtractor={this.keyExtractor}
                onEndReachedThreshold={0.1}
                renderItem={this.renderItem}
                windowSize={50}
                LineSeperator={SeperatorComponent}
                extraData={this.props.multiSelectOn}
                renderSectionFooter={this.renderSectionFooter}
                onViewableItemsChanged={this.updateStickyDate}
                viewabilityConfig={this._viewabilityConfig}
                onEndReached={this.loadMoreMessages}
                onScrollToIndexFailed={(info) => {
                  const wait = new Promise((resolve) =>
                    setTimeout(resolve, 100),
                  );
                  wait.then(() => {
                    this._chatListRef.current?.scrollToLocation({
                      index: info.index,
                      animated: true,
                      item: this.groupMessages[info.index],
                      viewPosition: 1,
                    });
                    this._chatListRef?.current?.scrollToItem({
                      animated: true,
                      item: this.groupMessages[info.index],
                      viewPosition: 1,
                    });
                  });
                }}
              />
              {this.state.showStickyHeader ? this.renderStickyDate() : null}
            </View>
          </View>
          {this.renderEmojiDetails()}
          {this.renderTraceInfoComponent()}
          {searchMode &&
            this.state?.searchText?.length > 0 &&
            this.renderSearchFooter()}
        </View>
      );
    } else if (this.groupMessages?.length === 0) {
      return <View style={stylesLocal.mainStyle1} />;
    } else if (
      this.state.showLoader == false &&
      this.groupMessages?.length <= 0
    ) {
      return (
        <View style={stylesLocal.listFooter6}>
          <Placeholder name={'chat'} />
        </View>
      );
    } else {
      return null;
    }
  }

  getSelectedMessage = (item) => {
    const messageSelectedState = this.modifiedMessages?.filter(
      (e) => e.messageId === item.messageId,
    );
    if (messageSelectedState && messageSelectedState.length > 0) {
      return messageSelectedState[0].isSelected;
    }
    return false;
  };

  messageRetry = (item) => {
    setTimeout(() => {
      MessageUploadQueue.addMessage(item, this.props.board);
    }, 100);
  };

  renderItem = (pr) => {
    const {item, index} = pr;
    var isHighLighted = false;
    // console.log("isHighlightes id", item.id, this.state.highlightedMessageId);
    if (item.id === this.state.highlightedMessageId) {
      isHighLighted = true;
    }

    var unreadCountFlag = false;
    if (this.unreadCount > 0 && index === this.unreadCount - 1) {
      unreadCountFlag = true;
    }
    // console.log('Unread Count item', unreadCountFlag, index);

    if (item?.type === 'clientSideTimeline') {
      return (
        <>
          <View style={{paddingVertical: 5}}>
            <DateChangeTimeline title={item?.deliveredOn} />
          </View>
        </>
      );
    } else if (item) {
      return (
        <MessagesListViewItem
          message={item}
          scrollTo={this.scrollTo}
          messageRetry={this.messageRetry}
          onLongPress={this.onLongPress}
          onEmojiClick={this.onEmojiClick}
          onCheckBoxPress={this.onCheckBoxPress}
          onReminderInfoPressed={this.onReminderInfoPressed}
          isSelectedMessage={this.getSelectedMessage(item)}
          titleName={this.props.titleName}
          replyToResolves={this.props.messageResolveResponse}
          multiSelectOn={this.props.multiSelectOn}
          highlighted={isHighLighted}
          unreadCountFlag={unreadCountFlag}
          messageStatus={this.props.messageStatus}
          universalSearch={this.props.universalSearch}
          searchMessageId={this.props.searchMessageId}
          index={index}
          selectedIndex = {this.state.selectedIndex}
        />
      );
    } else {
      return <View />;
    }
  };

  renderSectionFooter = ({section: {title}}) => {
    return (
      <View style={{paddingVertical: 5}}>
        <DateChangeTimeline title={title} />
      </View>
    );
  };
}

MessagesListView.propTypes = {
  boardId: PropTypes.string,
  mode: PropTypes.oneOf(['normal', 'compact']),
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.object),
  ]),
  messagetraceInfo: PropTypes.object,
  reply: PropTypes.string,
  replyPrivate: PropTypes.string,
  searchMode: PropTypes.bool,
  activeBoardId: PropTypes.string,
  messageResolveResponse: PropTypes.object,
  creatorContact: PropTypes.object,
  getBoardMessages: PropTypes.func,
  addMessageEventListener: PropTypes.func,
  removeMessageEventListener: PropTypes.func,
  setActiveBoard: PropTypes.func,
  markBoardAsSeen: PropTypes.func,
  messageResolve: PropTypes.func,
  setSearchMode: PropTypes.func,
  selectedContactList: PropTypes.func,
  reactMessage: PropTypes.func,
  deleteMessage: PropTypes.func,
  resolveUser: PropTypes.func,
  deleteMessageForEveryone: PropTypes.func,
  replyTo: PropTypes.func,
  replyToPrivate: PropTypes.func,
  showMsgTraceInfo: PropTypes.func,
  storeForwardMessage: PropTypes.func,
  setMessageReminder: PropTypes.func,
  getBoardMembers: PropTypes.func,
  deleteMessageReminder: PropTypes.func,
  unreadCount: PropTypes.number,
};

MessagesListView.defaultProps = {
  boardId: undefined,
  mode: 'normal',
  style: {paddingVertical: 10, backgroundColor: 'white'},
  searchMode: false,
  replyTo: null,
  unreadCount: 0,
};

//export default MessagesListView;
const mapStateToProps = (state) => {
  const {
    messageThreadList,
  } = state;
console.log("message thread list", messageThreadList);
  return {
    messageIdToScroll: messageThreadList.messageIdToScroll,
  };
};


export default connect(mapStateToProps, {
  deleteMessageNew,
  deleteMessageForEveryoneNew,
  scrollToMessage,
})(MessagesListView);
