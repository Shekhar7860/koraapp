import * as Type from '../constants/native.constants';
import {cloneDeep} from 'lodash';

const initState = {
  searchHeaderText: '',
  shareExtensionDataIOS: [],
  exceptionList: [],
  networkBarHeight: 0,
  searchMode: false,
  searchDonePressed: false,
  loaders: {},
  postId: '',
  commentId: '',
  newWSRequestBody: {
    allowDefaultRoomsCreation: true,
    dashboard: [],
    color: '#654BAF',
    name: '',
    requesttojoin: true,
    members: [],
    type: 'public',
    logo: {type: 'emoji', val: {category: 'symbols', unicode: '2665'}},
  },
  messageBoards: {},
};
export default (state = initState, action) => {
  switch (action.type) {
    case Type.SET_SEARCH_HEADER_TEXT:
      return {...state, searchHeaderText: action.payload};
    case Type.SET_SHARE_EXTENSION_DATA:
      return {...state, shareExtensionDataIOS: action.payload};
      case Type.SET_NO_NETWORK_HEIGHT:
        return {...state, networkBarHeight: action.payload};
    case Type.SET_UNIVERSAL_SEARCH_FILTER_DATA:
      return {...state, searchFilterData: action.payload};
    case Type.SET_SEARCH_HEADER_MODE:
      return {...state, searchMode: action.payload};
    case Type.SET_SEARCH_SUBMIT_ACTION:
      return {...state, searchDonePressed: action.payload};
    case Type.SET_EXCEPTION_LIST:
      return {...state, exceptionList: action.payload};
    case Type.TOGGLE_EXCEPTION_LIST_ITEM:
      const index = state.exceptionList.findIndex(
        (obj) => obj._id === action.payload,
      );
      const newExceptionList = cloneDeep(state.exceptionList);
      newExceptionList[index].marked = !newExceptionList[index].marked;
      return {...state, exceptionList: newExceptionList};
    case Type.NATIVE_LOADER:
      let {loaders} = state;
      const {key, value} = action.payload;
      loaders[key] = value;
      return {...state, loaders};
    case Type.UPDATE_NEW_WS_REQ_BODY:
      let newWSRequestBody = state.newWSRequestBody;
      if (!action.payload) {
        newWSRequestBody = initState.newWSRequestBody;
      } else {
        newWSRequestBody = {...newWSRequestBody, ...action.payload};
      }
      return {...state, newWSRequestBody};
    case Type.SET_MESSAGE_BOARDS:
      return {...state, messageBoards: action.payload};
    case Type.SET_POST_ID:
      return {...state, postId: action.postId};
    case Type.SET_COMMENT_ID:
      let commentId = action.commentId;
      return {
        ...state,
        commentId,
      };
    default:
      return state;
  }
};
