import * as Type from '../constants/syncwithserver.constants';
export function startInitialSync() {
    return {
      type: Type.GET_INITSYNC_RESULTS,
    };
  }

export function startLaterSync(params) {
    return {
      type: Type.GET_LATERSYNC_RESULTS,
      params : params,
    };
  }