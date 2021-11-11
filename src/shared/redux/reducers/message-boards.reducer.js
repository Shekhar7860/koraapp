import * as Type from '../constants/message-board.constants';
import {CREATE_NEW_BOARD, QUERY_ITEM} from '../actions/actionTypes';
import * as _ from 'lodash';

const initState = {
  messageBoardList: null,
  boards: [],
  filter: 'all',
  disBoardsTracking: true,
  msgBoardsTracking: true,
  queryItem: null,
};

export default (state = initState, action) => {
  switch (action.type) {
    case Type.MessageBoardsListLoading:
      return {...state, messageBoardListLoading: true, messageApiFailed: false};
    case Type.MessageBoardsLoaded:
      return {...state, messageBoardListLoading: false};
    case Type.GET_MESSAGE_BOARDS_SUCCESSFUL:
      return {...state, messageBoardList: action.payload};
    case Type.GET_SHARE_BOARDS_SUCCESSFUL:
      return {...state, messageBoardListShare: action.payload};
    case Type.GET_MESSAGE_BOARDS_FAILURE:
      return {...state, messageApiFailed: true};
    case Type.GET_CHAT_BOARDS:
      let chatBoardsFilterState = _.assign({}, state, {
        boards: action.payload,
      });
      return chatBoardsFilterState;
    case Type.GET_UNREAD_BOARDS:
      let unreadBoardsFilterState = _.assign({}, state, {
        boards: action.payload,
      });
      return unreadBoardsFilterState;
    case Type.GET_MUTED_BOARDS:
      let mutedBoardsFilterState = _.assign({}, state, {
        boards: action.payload,
      });
      return mutedBoardsFilterState;
    case Type.GET_STARRED_BOARDS:
      let starredBoardsFilterState = _.assign({}, state, {
        boards: action.payload,
      });
      return starredBoardsFilterState;
    case Type.UPDATE_MESSAGE_BOARDS:
      console.log('Hey calling the boards reducer', action?.boards?.length);
      let boards = Array.from(action.boards);
      return {...state, boards: boards};
    case Type.UPDATE_BOARDS_FILTER:
      return {...state, filter: action.filter};
    case Type.START_OR_STOP_TRACK_MSG_BOARDS_LISTENER:
      console.log('Updating the message tracking', action.params.isTracking);
      return {...state, msgBoardsTracking: action.params.isTracking};
    case Type.START_OR_STOP_TRACK_DIS_BOARDS_LISTENER:
      return {...state, disBoardsTracking: action.params.isTracking};
    case QUERY_ITEM.SUCCESS:
      return {...state, queryItem: action.queryItem};
    case CREATE_NEW_BOARD.SUCCESS:
      return {...state, nBoardId: action.boardId};
    default:
      return state;
  }
};
