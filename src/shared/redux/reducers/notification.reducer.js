import * as Type from '../constants/notification.constants';
import { REDUX_FLUSH } from '../constants/auth.constants';

export default (state = {}, action) => {
  
  switch (action.type) {
    case REDUX_FLUSH:
      return state;
    case Type.TYPING_SUCCESSFUL:        
      return { ...state, typing: action.payload };
    case Type.NOTIFICATION_SUCCESSFUL:
      return { ...state, notificationResp: action.payload };
    
    case Type.NOTIFICATION_LIVE_SUCCESSFUL:
        return { ...state, liveNotificationResp: action.payload };
    case Type.SUBSCRIBE_TYPING_SUCCESSFUL:
      return { ...state, typingSubscribe: action.payload };
    case Type.NOTIFICATION_STATUS_SUCCESSFUL:
      return { ...state, notificationStatus: action.payload };
    default:
      return state;
  }
}
