import { 
  GROUP_ICON_UPDATE
} from '../constants/group-icon.constants';




export function groupIconUpdate(_params, payload) {
  return {
    type: GROUP_ICON_UPDATE,
    _params: _params,
    payload: payload,

  }
}

