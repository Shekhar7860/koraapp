import {
  IS_OFFLINE,
  REMOVE_FROM_OFFLINE_QUEUE,
} from '../constants/offline.const';

export function isOfflineAction(status) {
  return {
    type: IS_OFFLINE,
    payload: status,
  };
}
export function removeFromOfflineQueue(offlineId, onDemandCall, type) {
  return {
    type: REMOVE_FROM_OFFLINE_QUEUE,
    payload: {
      offlineId,
      onDemandCall,
      type,
    },
  };
}
