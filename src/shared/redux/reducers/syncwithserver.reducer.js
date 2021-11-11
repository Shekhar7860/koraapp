import * as Type from '../constants/syncwithserver.constants';

export default (state = {}, action) => {
    switch (action.type) {
        case Type.GET_INITSYNC_MSG_BOARDS_SUCCESSFUL:
      // console.log('step 4');
      // return {
      //   ...state,
      //   boardList: action.payload,
      // };
      return {...state, messageBoards: action.payload};
    case Type.GET_INITSYNC_MSG_BOARDS_FAILURE:
      return state;

    case Type.GET_INITSYNC_WS_BOARDS_SUCCESSFUL:
      return {...state, wsBoards: action.payload};
    case Type.GET_INITSYNC_WS_BOARDS_FAILURE:
      return state;
    case Type.WS_INITIAL_LOADED:
      return {...state, syncCompleted: action.payload}
    default:
        return state;
    }
  };
  