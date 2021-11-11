import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {withTranslation} from 'react-i18next';
import {connect} from 'react-redux';

import {Loader} from './ChatLoadingComponent';
import {
  getThreadList,
  getNewChat,
  MuteUnmute,
  markThreadAsStar,
  deleteGroupChat,
  universalSearchCall,
} from '../../../shared/redux/actions/message-thread.action';
import {ThreadsListView} from './ThreadsListView';
import {KoraReactComponent} from '../../core/KoraReactComponent';
import {getMetaDetail} from '../../../shared/redux/actions/home.action';
import {
  searchModeOff,
  storeForwardMessage,
} from '../../../shared/redux/actions/message-preview.action';
import {Header} from '../../navigation/TabStacks';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
import {navigate} from '../../navigation/NavigationService';
import UniversalSearchDropDown from './UniversalSearchDropDown';
import Placeholder from '../../components/Icon/Placeholder';
import {emptyObject} from '../../../shared/redux/constants/common.constants';
import {getKoraProfile} from '../../../shared/redux/actions/auth.action';
import * as UsersDao from '../../../dao/UsersDao';
import {leaveDiscussion} from '../../../shared/redux/actions/discussions.action';
import {BottomUpModal} from '../../components/BottomUpModal';
import {muteOptions} from './ThreadsConstants';
import ActionItemBottomSheet from '../../components/BottomUpModal/ActionItemBottomSheet';
import database from '../../../native/realm';
import * as Entity from '../../realm/dbconstants';

const MESSAGES = 'messages';
const STARRED = 'starred';
const MENTIONS = 'mentions';
const CHAT = 'chat';

class _MessageThreads extends KoraReactComponent {
  constructor(props) {
    super(props);
    this.state = {
      moreAvailable: false,
      searchThreads: [],
      searchEnable: false,
      searchMeta: '',
      isPaginatingBoards:false,
    };
    this.getQueryItem();
    this.modalPanelRefs = React.createRef();
    this.timeout = null;
    this.currentThreadBoardID = null;
    this.headerChangeTimeout = null;
    this.isShowemptyState = null;
  }

  getQueryItem = async () => {
    let type = 'discussion';
    switch (type) {
      case 'all':
      case 'everything':
        type = 'everything';
        break;
      case 'chat':
        type = 'chats';
        break;
      default:
        break;
    }
    const db = database.active;
    const queryItemsCollection = db.collections.get(Entity.QueryItems);
    try {
      const queryItem = await queryItemsCollection.find(type);
      this.setState({queryItem: queryItem});
    } catch (err) {
      console.log('error in find query item : \n ', err);
    }
  }

  componentDidMount() {
    this.props.getMetaDetail();
    this.props.searchModeOff();
    this.props.getKoraProfile();
  }

  componentWillUnmount() {}

  getBoards = (offset) => {
    if(!this.state.isPaginatingBoards){
    const {queryItem} = this.state;
    let _params = {
      queryParam: this.getQueryParameter(),
      boardKey: queryItem.id,
      limit: 40,
      offset: offset,
    };
    console.log('Ok calling boards pagination from Message threads',_params);
    this.props.getThreadList(_params);
  }
  };

  getQueryParameter() {
    const {queryItem} = this.state;
    switch (queryItem.id) {
      case 'all':
      case '':
        return 'type=message';
      case 'starred':
        return 'type=message&star=true';
      case 'chat':
      case 'chats':
        return 'type=chat';
      case 'unread':
        return 'type=message&unread=true';
      case 'muted':
        return 'type=message&muted=true';
      case 'discussion':
        return 'type=discussion';
      default:
        return 'type=message';
    }
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('Message threads component did update called');
    const {queryItem} = this.state;
    const {navigation} = this.props;
    const {params} = this.props.route;
    let title = params?.queryItem?.name || 'Rooms';

    if (prevProps.syncCompleted !== this.props.syncCompleted) {
      if (this.props.syncCompleted) {
        this.getQueryItem();
      }
    }
    if (title !== prevProps.route.params?.title) {
      clearTimeout(this.headerChangeTimeout);
      this.headerChangeTimeout = setTimeout(() => {
        navigation.setOptions({
          title: title,
          header: () => (
            <Header navigation={navigation} title={title} isChat={true} />
          ),
        });
      }, 0);
    }
    if (params?.queryItem && params?.queryItem?.id !== queryItem?.id) {
      this.setState({queryItem: params?.queryItem});
    }
    if (prevProps.boards != this.props.boards) {
      this.isShowemptyState = this.props.boards;
    }
    if (prevProps.chatsLoading != this.props.chatsLoading) {
      // if (
      //   (this.state.offset !== this.props.boards) !== null
      //     ? this.props.boards?.length
      //     : 0
      // ) {
      //   this.setState({
      //     offset: this.props.boards !== null ? this.props.boards?.length : 0,
      //   });
      // }
    }
    if (prevProps.isPaginating != this.props.isPaginating) {
      this.setState({isPaginatingBoards : this.props.isPaginating});
    }
    if (prevProps.searchDonePressed !== this.props.searchDonePressed) {
      if (this.props.searchMeta.length > 0) {
        navigate('Universal Search', {
          searchThreads: this.state.searchThreads,
          searchMeta: this.props.searchMeta,
          metaSearchData: this.props.metaDetail,
        });
      }
    }
    if (prevProps.searchMeta !== this.props.searchMeta) {
      if (this.props.searchMeta.length !== 0) {
        this.filterThreadAccordingToSearch(this.props.searchMeta);
      } else {
        this.setState({searchThreads: []});
        this.setSearchMeta(this.props.searchMeta);
      }
    }
  }

  setSearchMeta = (searchMeta = '') => {
    if (typeof searchMeta !== 'string') {
      searchMeta = '';
    }
    this.setState({searchMeta});
  };

  filterThreadAccordingToSearch(query) {
    let boards = this.props.boards;
    let userID = UsersDao.getUserId();
    query = query.toUpperCase();
    let searchResultsByName = boards?.filter((s) => {
      var tName = '';
      if (s?.name?.trim().length > 0) {
        tName = s?.name;
      } else if (s?.recentMembers?.length >= 2 && s?.type !== 'discussion') {
        tName = s?.recentMembers
          .filter((a) => a && a.id !== userID)
          .map((a) => a && (a.fN !== null ? a.fN + ' ' + a.lN : a.lN))
          .join(', ');
      }
      // var memberName = '';
      // if (s?.members?.length > 2) {
      //   memberName = s?.members
      //     .filter((a) => a && a.id !== userID)
      //     .map((a) => a && (a.fN !== null ? a.fN + ' ' + a.lN : a.lN))
      //     .join(', ');
      // }
      let name = tName;
      return name?.toUpperCase().includes(query);
      // ||
      // memberName?.toUpperCase().includes(query)
    });
    var filterDirectChat = searchResultsByName.filter((s) => {
      return s?.type === 'directChat';
    });

    var filterGroupChatChat = searchResultsByName.filter((s) => {
      return s?.type === 'groupChat';
    });

    var filterDiscussion = searchResultsByName.filter((s) => {
      return s?.type === 'discussion';
    });
    this.setState({
      searchThreads: [
        ...filterDirectChat,
        ...filterGroupChatChat,
        ...filterDiscussion,
      ],
    });
  }

  renderMuteOptions() {
    // const options = [
    //   {text: '4 hours', value: 60 * 4},
    //   {text: '1 day', value: 60 * 24},
    //   {text: '1 week', value: 60 * 24 * 7},
    //   {text: 'Until turned off', value: 60 * 24 * 7 * 52},
    // ];
    const {item} = this.props;
    // let topicName =
    //   item?.name ||
    //   getThreadContact(
    //     item?.lastActivity?.message?.to,
    //     item?.lastActivity?.message?.from,
    //     UsersDao.getUserId(),
    //   );
    return (
      <BottomUpModal ref={this.modalPanelRefs} height={350}>
        <View style={styles.muteStyle1}>
          <ActionItemBottomSheet title={'Mute for ...'} itemType={'header'} />
          <View
            style={{
              height: 1,
              backgroundColor: '#EFF0F1',
            }}
          />
          {muteOptions.map((option, index) => {
            return (
              <ActionItemBottomSheet
                title={option.text}
                iconName={option.icon}
                key={option.id || option.text || index}
                id={option.id}
                itemType={'titleOnly'}
                optionSelected={() => this.onMuteButtonClicked(option)}
              />
            );
          })}
          <ActionItemBottomSheet
            title={'Cancel'}
            itemType={'titleOnly'}
            optionSelected={() => this.modalPanelRefs.current.close()}
          />
        </View>
      </BottomUpModal>
    );
  }

  onThreadClick = (data) => {
    if (data?.board?.type === 'discussion') {
      navigate(ROUTE_NAMES.DISCUSSION, {
        board: data?.board,
      });
      return;
    }
    navigate(ROUTE_NAMES.CHAT, {board_id: data?.board?.id});
  };

  onMuteClicked = (boardId, payload, muteAction) => {
    if (muteAction === 'unmuteAction') {
      this.props.MuteUnmute({id: boardId}, payload, () => {});
    } else {
      this.modalPanelRefs.current.open();
      this.currentThreadBoardID = boardId;
    }
  };

  onMuteButtonClicked(data) {
    const {item} = this.props;

    const minutesTillMute = data.value || 0;
    let d = new Date();
    d.setMinutes(d.getMinutes() + minutesTillMute);
    const payload = {
      mute: minutesTillMute !== 0 ? d.getTime() : new Date().getTime(),
      //on: minutesTillMute !== 0,
    };
    let params = {
      action: 'muteAction',
      payload: {boardId: this.currentThreadBoardID, requestObj: payload},
    };
    this.props.MuteUnmute({id: this.currentThreadBoardID}, payload, () => {});
    this.modalPanelRefs.current.close();
  }

  onStarButtonClick = (boardId, starred) => {
    let params = {id: boardId};
    let payload = {markAsStar: starred};
    this.props.markThreadAsStar(params, payload);
  };

  onDeleteButtonClick = (boardId, type) => {
    if (type === 'discussion') {
      let payload = {
        leaveBoard: true,
      };
      let _params = {
        rId: boardId,
      };
      this.props.leaveDiscussion(_params, payload, {});
      return;
    }
    this.props.deleteGroupChat(boardId);
  };

  render() {
    // console.log('=================MessageThreads.js================');
    // if (this.props.chatsLoading) {
    //   return <Loader />;
    // }
 
    const {queryItem} = this.state;
    if (queryItem) {
      return (
        <View style={styles.mainStyle}>

          {this.renderMuteOptions()}
          {this.props.searchMeta.length > 0 &&
          this.props.searchModeOff 
           ? (
            <View style={styles.uniDropDownStyles}>
              <UniversalSearchDropDown
                query={this.props.searchMeta}
                queryItem={queryItem}
                result={this.state.searchThreads}
                item={'recent'}
              />
            </View>
          ) : (
            <ThreadsListView
              // database={database.active}
              queryItem={queryItem}
              loadMoreBoards={this.getBoards}
              onThreadClick={this.onThreadClick}
              onMuteClicked={this.onMuteClicked}
              loading={this.props.chatsLoading}
              filter={queryItem?.id}
              onStarButtonClick={this.onStarButtonClick}
              onDeleteButtonClick={this.onDeleteButtonClick}
            />
          )}
        </View>
      );
    } else if (this.isShowemptyState) {
      setTimeout(() => {
        this.isShowemptyState = null;
      }, 500);
      return (
        <View style={styles.placeHolderStyle}>
          <Placeholder
            name={
              this.props.route.params?.title === 'Chats'
                ? MESSAGES
                : this.props.route.params?.title === 'Starred'
                ? STARRED
                : this.props.route.params?.title === 'Discussion Rooms'
                ? MESSAGES //msseges
                : this.props.route.params?.title === 'Unread'
                ? CHAT //chat
                : this.props.route.params?.title === 'Muted'
                ? CHAT //chat
                : this.props.route.params?.title === 'Mentions'
                ? MENTIONS
                : MESSAGES
            }
          />
        </View>
      );
    } else {
      return null;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
  },
  uniDropDownStyles: {
    flex: 1,
    width: '100%',
    borderColor: '#f5f5f5',
    borderWidth: 1,
    shadowColor: 'grey',
    backgroundColor: 'white',
  },
  mainStyle: {flex: 1},
  placeHolderStyle: {flex: 1, alignItems: 'center', justifyContent: 'center'},
});

const mapStateToProps = (state) => {
  let {home, preview, native, messageBoards, sync, messageThreadList} = state;
  return {
    boards: messageBoards.boards,
    forwardMessageObject: preview.forwardedMsgObject,
    searchResult: preview.searchResults,
    chatsLoading: messageBoards.messageBoardListLoading,
    searchMeta: native.searchHeaderText,
    searchDonePressed: native.searchDonePressed,
    metaDetail: home.metaDetail,
    syncCompleted: sync.syncCompleted,
    queryItem: messageBoards.queryItem,
    isPaginating : messageThreadList.messageThreadListLoading,
  };
};

export const MessageThreads = connect(mapStateToProps, {
  getThreadList,
  getNewChat,
  MuteUnmute,
  markThreadAsStar,
  deleteGroupChat,
  searchModeOff,
  storeForwardMessage,
  getMetaDetail,
  universalSearchCall,
  getKoraProfile,
  leaveDiscussion,
})(withTranslation()(_MessageThreads));

export default MessageThreads;
