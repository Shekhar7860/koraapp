import * as Type from '../constants/findly_notification.constants';

export function getFindlyNotifications(payload) {
    return {
        type: Type.FINDLY_NOTIFICATIONS,
        payload: payload,
    };
}

export function setSpeachToText(payload) {
    return {
        type: Type.FINDLY_TEXT_TO_SPEACH,
        payload: payload,
    };
}