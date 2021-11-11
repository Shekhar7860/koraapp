import {
  ADD_TO_OFFLINE_QUEUE,
  IS_OFFLINE,
  REMOVE_FROM_OFFLINE_QUEUE,
} from '../constants/offline.const';
import {REDUX_FLUSH} from '../constants/auth.constants';

const initState = {isOffline: false, actionQueue: [], onDemandActionQueue: {}};
const findIndex = (arr, findKey, matchValue) => {
  return arr.reduce((sIndex, item, index) => {
    if (item[findKey] === matchValue) {
      sIndex = index;
    }
    return sIndex;
  }, -1);
};

export default (state = initState, action) => {
  switch (action.type) {
    case REDUX_FLUSH:
      return initState;

    case IS_OFFLINE:
      return {...state, isOffline: action.payload};

    case ADD_TO_OFFLINE_QUEUE:
      let tempQueue;
      if (action.payload.callOnDemand) {
        tempQueue = state.onDemandActionQueue;
        if (!tempQueue.hasOwnProperty(action.payload.action.type)) {
          tempQueue[action.payload.action.type] = [];
        }
        tempQueue[action.payload.action.type].push({
          offlineId: action.payload.offlineId,
          action: action.payload.action,
        });
        return {...state, onDemandActionQueue: tempQueue};
      }
      tempQueue = state.actionQueue;
      tempQueue.push({
        offlineId: action.payload.offlineId,
        action: action.payload.action,
      });
      return {...state, actionQueue: tempQueue};

    case REMOVE_FROM_OFFLINE_QUEUE:
      let extQueue;
      if (action.payload.callOnDemand) {
        extQueue = state.onDemandActionQueue;
        if (
          action.payload.type &&
          extQueue.hasOwnProperty(action.payload.type)
        ) {
          const actionIndex = findIndex(
            extQueue[action.payload.type],
            'offlineId',
            action.payload.offlineId,
          );
          extQueue[action.payload.type].splice(actionIndex, 1);
        }
        return {...state, onDemandActionQueue: extQueue};
      }
      extQueue = state.actionQueue;
      const actionIndex = findIndex(
        extQueue,
        'offlineId',
        action.payload.offlineId,
      );
      if (actionIndex > -1) {
        extQueue.splice(actionIndex, 1);
      }
      return {...state, actionQueue: extQueue};

    default:
      return state;
  }
};
