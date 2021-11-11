import * as Type from '../constants/home.constants';
import {REDUX_FLUSH} from '../constants/auth.constants';

const initState = {showLoader: '', permissions: ''};
export default (state = initState, action) => {
  switch (action.type) {
    case REDUX_FLUSH:
      return initState;

    case Type.DEFAULT:
      return state;

    case Type.JWT_TOKEN_SUCCESSFUL:
      return {...state, jwt: action.payload};

    case Type.JWT_TOKEN_FAILURE:
      return state;

    case Type.PRESENCE_START_SUCCESSFUL:
      return {...state, presence: action.payload};

    case Type.PRESENCE_START_FAILURE:
      return state;

    case Type.GET_HELP_THUNDERBOLT_SUCCESS:
      return {...state, thunderBoltResp: action.payload};

    case Type.GET_HELP_THUNDERBOLT_FAILURE:
      return state;

    case Type.HELP_SKILL_SUGGESTION_SUCCESS:
      return {...state, skillSuggestion: action.payload};

    case Type.HELP_SKILL_SUGGESTION_FAILURE:
      return state;

    case Type.SHOW_LOADER:
      return {...state, showLoader: action.payload};

    case Type.GET_META_DETAIL_SUCCESSFUL:
      return {...state, metaDetail: action.payload};
    case Type.GET_META_DETAIL_FAILURE:
      return state;

    case Type.SET_META_DETAIL_SUCCESSFUL:
      return {...state, metaDetail: action.payload};
    case Type.SET_META_DETAIL_FAILURE:
      return state;

    case Type.RESOLVE_USER_DETAIL_SUCCESSFUL:
      return {...state, contactDetail: action.payload};
    case Type.RESOLVE_USER_DETAIL_FAILURE:
      return state;

    case Type.APP_PERMISSIONS_SUCCESSFUL:
      return {...state, permissions: action.payload};

    case Type.SET_DEVICE_TOKEN:
      return {...state, deviceToken: action.payload};

    case Type.PUSH_NOTIFICATION_DATA:
      return {...state, pushNotifData: action.payload};

    case Type.PUSH_NOTIFICATIONS_SUBSCRIBE_SUCCESSFUL:
      return {...state, status: action.payload};
    case Type.PUSH_NOTIFICATIONS_SUBSCRIBE_FAILURE:
      return {...state, status: action.payload};

    case Type.PUSH_NOTIFICATIONS_UNSUBSCRIBE_SUCCESSFUL:
      return {...state, status: action.payload};
    case Type.PUSH_NOTIFICATIONS_UNSUBSCRIBE_FAILURE:
      return {...state, status: action.payload};

    default:
      return state;
  }
};
