import {
  CHAT_TIMESTAMP_SUCCESSFUL,
  USER_LOG_SUCCESSFUL,
} from '../constants/userLog.constants';
import {REDUX_FLUSH} from '../constants/auth.constants';

const initState = {isUserLoggedIn: false};
export default (state = initState, action) => {
  switch (action.type) {
    case REDUX_FLUSH:
      return initState;
    case USER_LOG_SUCCESSFUL:
      return {...state, isUserLoggedIn: action.payload};
    case CHAT_TIMESTAMP_SUCCESSFUL:
      return {...state, timestamp: action.payload};
    default:
      return state;
  }
};
