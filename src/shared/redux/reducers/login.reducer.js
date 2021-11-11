import * as Type from '../constants/login.constants';
import {REDUX_FLUSH} from '../constants/auth.constants';

const initState = {emailId: ''};
export default (state = initState, action) => {
  switch (action.type) {
    case REDUX_FLUSH:
      const emailId = state.currentUser?.userInfo
        ? state.currentUser.userInfo?.emailId
        : '';
      return {...initState, emailId, sessionExipryInfo: undefined};

    case Type.LOGIN_SUCCESSFUL:
      return {...state, user: action.payload};
    case Type.LOGIN_FAILURE:
      return {...state, user: null};

    case Type.SSO_LOGIN_SUCCESSFUL:
      return {...state, currentUser: action.payload};
    case Type.SSO_LOGIN_FAILURE:
      return {...state, currentUser: null};

    case Type.PWD_LOGIN_SUCCESSFUL:
      return {...state, passwordLoginUser: action.payload};
    case Type.PWD_LOGIN_FAILURE:
      return {...state, passwordLoginUser: action.payload};

    case Type.PWD_RESET_SUCCESSFUL:
      return {...state, passwordLoginUser: action.payload};
    case Type.PWD_RESET_FAILURE:
      return {...state, resetPwd: action.payload};

    case Type.SESSION_EXPIRED:
      return {...state, sessionExipryInfo: action.payload};

    case Type.SIGNUP_SUCCESSFUL:
      return {...state, signup: action.payload};
    case Type.SIGNUP_FAILURE:
      return {...state, signup: action.payload};

    default:
      return state;
  }
};
