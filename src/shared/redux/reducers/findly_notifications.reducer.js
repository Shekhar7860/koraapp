import * as Type from '../constants/findly_notification.constants';

const initState = { findlyNotif: {} };
export default (state = initState, action) => {
  switch (action.type) {

    case Type.FINDLY_NOTIFICATIONS_SUCCESSFUL:
      return { ...state, findlyNotif: action.payload };

    case Type.FINDLY_NOTIFICATIONS_FAILURE:
      return { ...state, findlyNotif: {} };

      case Type.FINDLY_TEXT_TO_SPEACH:
        return { ...state, findly_textToSpeach: action.payload };
    default:
      return state;
  }
};
