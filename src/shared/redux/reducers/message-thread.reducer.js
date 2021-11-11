import * as Type from '../constants/message-thread.constants';
import * as _ from 'lodash';
import {REDUX_FLUSH} from '../constants/auth.constants';
import {cloneDeep} from 'lodash';

const initState = {
  messageThreadListLoading: false,
  boardList: [],
  boardMessages: [],
  activeBoardId: null,
  scrollToBottom: false,
  boardDeletedSuccess: false,
  moreMessages: true,
  firstLoad: false,
  messageIdToScroll: '',
};

export default (state = initState, action) => {
  switch (action.type) {
    case REDUX_FLUSH:
      return initState;
    case Type.THREAD_RESOLVE_SUCCESSFUL:
      let newBoards = null;
      try {
        if (state.boardList && Array.isArray(state.boardList.boards)) {
          newBoards = state.boardList.boards.map((board) => {
            return board.boardId === action.payload[0].boardId
              ? action.payload[0]
              : board;
          });
        }
      } catch (e) {}
      let obj = {
        board: {
          boards: newBoards,
        },
      };
      return {...state, obj};
    case Type.MESSAGE_RESOLVE_SUCCESSFUL:
      return {...state, messageResolveResponse: action.payload};
    case Type.MESSAGE_RESOLVE_FAILURE:
      return {...state, messageResolveResponse: null};
    case Type.MessageThreadListLoading:
      return {...state, messageThreadListLoading: true};
    case Type.MessageThreadListLoaded:
      return {...state, messageThreadListLoading: false};
    case Type.MessageThreadList:
      return state;
    case Type.MessageThreadList_SUCCESSFUL:
      // if (action._params.isRefresh) {
      //   if (action.payload && action.payload?.boards?.length > 0) {
      //     let boardList = cloneDeep({...state.boardList});
      //     if (boardList && boardList.boards) {
      //       boardList['moreAvailable'] = action.payload?.moreAvailable;
      //       boardList.boards = boardList['boards'].concat(
      //         action.payload.boards,
      //       );
      //       return {...state, boardList: boardList};
      //     } else {
      //       return {
      //         ...state,
      //         boardList: action.payload,
      //       };
      //     }
      //   }
      // } else if (action._params.offset === 0) {
      //   return {
      //     ...state,
      //     boardList: action.payload,
      //   };
      // } else {
      //   if (action.payload && action.payload?.boards?.length > 0) {
      //     let boardList = cloneDeep({...state.boardList});
      //     boardList['moreAvailable'] = action.payload?.moreAvailable;
      //     boardList.boards = boardList['boards'].concat(action.payload.boards);
      //     return {...state, boardList: boardList};
      //   }
      // }
      return {...state, moreThreadsAvailable: action.moreThreadsAvailable};
    case Type.MessageThreadList_FAILURE:
      return {...state, error: action.payload};
    case Type.GetBoardFiles_SUCCESSFUL:
      return {...state, boardFiles: action.payload};
    case Type.GetBoardFiles_FAILURE:
      return {...state, boardFilesFail: action.payload};
    case Type.GetBoardFiles_LOADING:
      return {...state, boardsLoading: action.payload};

    case Type.UNIVERSAL_SEARCH_SUCCESSFUL:
      return {...state, searchResult: action.payload};
    case Type.SEND_MESSAGE_TO_THREAD_SUCCESS:
      if (action.payload && action.payload?.message) {
        let message = action.payload.message;
        let boardMessages = state.boardMessages;
        boardMessages = boardMessages.concat(message);
        boardMessages = boardMessages.sort(
          (a, b) => new Date(b.sentOn) - new Date(a.sentOn),
        );
        let newStateAfterUpdate = {...state, boardMessages: boardMessages};
        return newStateAfterUpdate;
      }
      break;
    case Type.GET_BOARD_MESSAGES_SUCCESSFUL:
      return {
        ...state,
        boardMessages: action.messages,
      };
    case Type.GET_BOARD_MORE_MESSAGES:
      return {
        ...state,
        moreMessages: action.moreMessages,
      };
    case Type.GET_BOARD_MORE_MESSAGES_TRUE:
      return {
        ...state,
        moreMessages: action.payload,
      };
    case Type.GET_BOARD_MESSAGES_FAILURE:
      return {...state, error: action.payload};
    case Type.NEWCHAT_SUCCESSFUL:
      return {...state, newChat: action.payload};
      case Type.SCROLL_TO_MESSAGE:
      return {...state, messageIdToScroll: action.payload};
    case Type.NEWCHAT_FAILURE:
      return {...state, newChat: action.payload};
    case Type.ACTIVE_BOARD_SUCCESSFUL:
      return {...state, activeBoardId: action.payload};
    case Type.ACTIVE_BOARD_FAILURE:
      return {...state, activeBoardId: action.payload, boardMessages: []};

    case Type.MUTE_UNMUTE_THREAD_SUCCESSFUL:
      return {...state, usermuteUnmuteThread: action.payload};
    case Type.MUTE_UNMUTE_THREAD_FAILURE:
      return {...state, usermuteUnmuteThread: action.payload};

    case Type.DROPDOWNMESSAGE_SUCCESSFUL:
      return {...state, dropdownThread: action.payload};
    case Type.DROPDOWNMESSAGE_FAILURE:
      return {...state, dropdownThread: action.payload};

    case Type.STAR_MESSAGE_SUCCESSFUL:
      return {...state, starredMessageThread: action.payload};
    case Type.STAR_MESSAGE_FAILURE:
      return {...state, starredMessageThread: action.payload};
    case Type.CLEAR_USER_CHAT_HISTORY_SUCCESSFUL:
      return {...state, clearChatHistory: action.payload};
    case Type.CLEAR_USER_CHAT_HISTORY_FAILURE:
      return {...state, clearChatHistory: action.payload};

    case Type.DELETE_USER_CHAT_MESSAGE_SUCCESSFUL:
      return {...state, deleteChatMessage: action.payload};
    case Type.DELETE_USER_CHAT_MESSAGE_FAILURE:
      return {...state, deleteChatMessage: action.payload};
    case Type.DELETE_GROUP_CHAT_SUCCESSFUL:
      return {...state, boardDeletedSuccess: true};
    case Type.DELETE_GROUP_CHAT_FAILURE:
      return {...state, deleteChatMessage: action.payload};
    case Type.MUTE_SUCCESSFUL:
      return {...state, muteUnmuteThread: action.payload};
    case Type.MUTE_FAILURE:
      return {...state, usermuteUnmuteThread: action.payload};

    case Type.SET_THREAD_LIST_SUCCESSFUL:
      return {
        ...state,
        boardList: action.payload,
      };
    case Type.SET_THREAD_LIST_FAILURE:
      return {...state, error: action.payload};

    case Type.SET_THREAD_MESSAGE_SUCCESSFUL:
      return {...state, boardMessages: action.payload};
    case Type.SET_THREAD_MESSAGE_FAILURE:
      return {...state, boardMessages: action.payload};
    case Type.DELETE_MESSAGE_SUCCESSFUL:
      return state;
    case Type.DELETE_MESSAGE_EVERYONE_SUCCESSFUL:
      return state;
    case Type.DELETE_USER_FROM_GROUP_SUCCESSFUL:
      return {...state, boardMembersAfterDelete: action?.payload?.members};
    case Type.CHANGE_GROUP_NAME_SUCCESSFUL:
      return {...state, changedGroupName: action.payload};
    case Type.CHANGE_GROUP_NAME_FAILURE:
      return state;
    case Type.DELETE_USER_FROM_GROUP_FAILURE:
      return {
        ...state,
        deletedUserDetail: action.payload,
        userLeftConversation: false,
      };
    case Type.MARK_BOARD_AS_READ_SUCCESSFUL:
      let boardsAfterUpdate = state.boardList.boards.map((board) => {
        if (board.id === action.boardId) {
          board.unreadCount = 0;
        }
        return board;
      });
      let boardListAfterUpdate = {
        ...state.boardList,
        boards: boardsAfterUpdate,
      };
      return {...state, boardList: boardListAfterUpdate};
    case Type.MARK_BOARD_AS_READ_FAILURE:
      return {...state, threadSeen: action.payload};

    case Type.MARK_UNREAD_THREAD_SUCCESSFUL:
      return {...state, unreadThread: action.payload};
    case Type.MARK_UNREAD_THREAD_FAILURE:
      return {...state, unreadThread: action.payload};

    case Type.OnlyThreadList_SUCCESSFUL:
      return {...state, unreadThread: action.payload};
    case Type.OnlyThreadList_FAILURE:
      return state;
    case Type.CHANGE_GROUP_NAME_SUCCESSFUL:
      return {...state, changedGroupName: action.payload};
    case Type.CHANGE_GROUP_NAME_FAILURE:
      return state;
    case Type.SET_MESSAGE_ID_SUCCESSFUL:
      let totalMessages = Object.values(action.payload);
      return {
        ...state,
        messageId: totalMessages[totalMessages.length - 1].messageId,
      };
    case Type.MESSAGE_AVAILABILITY:
      return {...state, messageAvailability: action.payload};
    case Type.SET_FORWARD_MESSAGE_ID_SUCCESSFUL:
      return {...state, selectedForwardMessageID: action.payload};
    case Type.UPDATE_THREAD_USER_LIST:
      return {...state, activeThreadMembers: action.payload};
    case Type.GET_GO_TO_POST_SUCCESSFUL:
      return {
        ...state,
        goToPostDetail: action.payload,
        gotoPostId: action.gotoPostId,
      };
    case Type.GET_GO_TO_POST_FAILURE:
      return {...state};
    case Type.GET_GO_TO_MESSAGE_SUCCESSFUL:
      return {
        ...state,
        goToMessageDetail: action.payload,
        gotoMessageId: action.gotoMessageId,
        messageId: '',
      };
    case Type.GET_GO_TO_MESSAGE_FAILURE:
      return {...state};
    case Type.DELETE_CONVERSATION_FAILURE:
      return state;
    case Type.UPDATE_BOARD_MESSAGES:
      let boardMessages = Array.from(action.messages);
      let newStateAfterUpdate = {
        ...state,
        boardMessages: boardMessages,
        firstLoad: action.firstLoad,
      };
      return newStateAfterUpdate;
    case Type.RESOLVE_NOTIFICATION_THREAD_SUCCESS:
      return {...state, resolveThread: action.payload};
    case Type.REFRESH_CHAT_SCREEN:
      return {...state, refresh_chat_screen: action.payload};
    case Type.RESOLVE_NOTIFICATION_POST_SUCCESS:
      return {...state, resolvepost: action.payload};
    default:
      return state;
  }
};
