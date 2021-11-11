import * as Type from '../constants/message-preview.constants';
import {REDUX_FLUSH} from '../constants/auth.constants';
import {cloneDeep} from 'lodash';
import {ResourceState} from '../../../native/realm/dbconstants';

const initState = {
  searchModeOn: false,
  reply: null,
  replyPrivate: null,
  forwardMsg: null,
  forwardedMsgObject: null,
  messagetraceInfo: null,
  messageType: null,
  participants: null,
};
export default (state = initState, action) => {
  switch (action.type) {
    case REDUX_FLUSH:
      return initState;
    case Type.CREATE_THREAD_SUCCESSFUL:
      return {...state, thread: action.payload, messageType: 'success'};
    case Type.CREATE_THREAD_FAILURE:
      return {...state, thread: action.payload, messageType: 'failure'};
    case Type.SAVE_THREAD_SUCCESSFUL:
      let newMessage = action.payload;
      newMessage.message.messageState = ResourceState.SENDING;
      return {...state, thread: action.payload, messageType: 'success'};
    case Type.CREATE_NEW_THREAD_SUCCESSFUL:
      return {...state, newThread: action.payload, messageType: 'success'};
    case Type.CREATE_NEW_THREAD_FAILURE:
      return {...state, error: action.payload, messageType: 'failure'};
    case Type.SAVE_THREAD_FAILURE:
      return {...state, thread: action.payload, messageType: 'failure'};
      case Type.SAVE_THREAD_SENDING:
        return {...state, thread: action.payload, messageType: 'sending'};
    case Type.DOWNLOAD_ATTACHMENT_SUCCESSFUL:
      return {...state, downloadAttachment: action.payload};
    case Type.DOWNLOAD_ATTACHMENT_FAILURE:
      return state;
    case Type.MESSAGETRACE_INFO:
      return {...state, messagetraceInfo: null};
    case Type.MESSAGETRACE_INFO_SUCCESSFUL:
      return {...state, messagetraceInfo: action.payload};
    case Type.MESSAGETRACE_INFO_FAILURE:
      return {...state, messagetraceInfo: {}};
    case Type.RECALLMESSAGE_SUCCESSFUL:
      return {...state, recallMessageInfo: action.payload};

    case Type.RECALLMESSAGE_FAILURE:
      return state;

    case Type.SEND_PARTICIPANTS_BACK_SUCCESS:
      return {...state, conatactsSelectedBack: action.payload};

    case Type.ADD_PARTICIPANTS_SUCCESSFUL:
      return {...state, participants: action.payload};
    case Type.ADD_PARTICIPANTS_FAILURE:
      return state;
    case Type.SEARCH_MODE_ON:
      return {...state, searchModeOn: true};
    case Type.SEARCH_MODE_OFF:
      return {...state, searchModeOn: false};
    case Type.STORE_FORWARD_MESSAGE:
      return {...state, forwardedMsgObject: action.payload};
    case Type.FORWARD_MESSAGE_SUCCESSFUL:
      return {...state, forwardedMsg: action.payload};
    case Type.FORWARD_MESSAGE_FAILURE:
      return state;
    case Type.DELETE_MESSAGE_FAILURE:
      return state;
    case Type.DELETE_MESSAGE_EVERYONE_FAILURE:
      return state;
    case Type.REACT_MESSAGE_SUCCESSFUL:
      return {...state, reactMsg: action.payload};
    case Type.REACT_MESSAGE_FAILURE:
      return state;
    case Type.REPLY_TO:
      return {...state, reply: action.payload};
    case Type.REPLY_TO_PRIVATE:
      return {...state, replyPrivate: action.payload};
    // case Type.SET_MESSAGE_REMINDER:
    //   return state;
    default:
      return state;
  }
};
