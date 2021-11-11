import {ACCOUNT} from '../actions/actionTypes';

import * as Type from '../constants/auth.constants';

const initState = {
  user: null,
  authorization: null,
  laMod: new Date(),
};

export default (state = initState, action) => {
  switch (action.type) {
    case Type.REDUX_FLUSH:
      return initState;
    case Type.KORA_PROFILE_SUCCESSFUL:
      return {...state, profile: action.payload};
    case Type.KORA_IMAGE_REFRESH:
      return {...state, image_refresh_mode: action.payload};
    case Type.KORA_PROFILE_FAILURE:
      return state;
    case ACCOUNT.SUCCESS:
      return {
        ...state,
        user: action?.user,
        authorization: action?.authorization,
        loginResponse: action?.loginResponse,
        laMod: new Date(),
      };
    case ACCOUNT.FAILURE:
      return {
        ...state,
        laMod: new Date(),
      };
    default:
      return state;
  }
};
