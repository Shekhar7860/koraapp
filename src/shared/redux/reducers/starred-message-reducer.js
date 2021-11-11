import * as Type from '../constants/starred-message.constants';

export default (state = {}, action) => {
  switch (action.type) {
    case Type.STARRED_MESSAGE_LIST_SUCCESSFUL:
      return {...state, starredThread: action.payload};
    case Type.STARRED_MESSAGE_LIST_FAILURE:
      return state;
    case Type.DELETE_USER_FROM_GROUP_SUCCESSFUL:
      console.log('STARRED THREAD', state.starredThread);
     /*  state.starredThread.threads = state.starredThread.threads.map(
        (thread) => {
          if (thread.threadId == action.payload._params.threadId) {
            thread.participants = thread.participants.filter(
              (p) => p !== action.payload.payload.removeMembers[0],
            );
            thread.lastMessage.to = thread.lastMessage.to.filter(
              (u) => u.id !== action.payload.payload.removeMembers[0],
            );
            if (
              thread.lastMessage.from.id ===
              action.payload.payload.removeMembers[0]
            ) {
              thread.lastMessage.from == null;
            }
          }
          return thread;
        },
      ); */
      return state;

    case Type.MUTE_UNMUTE_THREAD_SUCCESSFUL:
      state.starredThread.threads = state.starredThread.threads.map(
        (thread) => {
          if (thread.threadId == action.payload.threadId) {
            return {...thread, ...action.payload};
          }
          return thread;
        },
      );
      return state;
    default:
      return state;
  }
};
