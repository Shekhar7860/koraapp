import * as Type from '../constants/meetings.constants';
// import {REMOVE_FROM_WORKSPACES} from '../constants/root-structure.const';

export function eventsChanged(payload) {
  return {
    type: Type.EVENT_CHANGED,
    payload,
  };
}

export function getAllEvents(_params, payload) {
  return {
    type: Type.GET_ALL_EVENTS,
    _params,
    payload,
  };
}

export function getAllTasks() {
  return {
    type: Type.GET_ALL_TASKS,
  };
}

export function updateEvent(payload, mailId) {
  return {
    type: Type.UPDATE_EVENT,
    payload,
    mailId,
  };
}

export function deleteEvent(payload, mailId) {
  return {
    type: Type.DELETE_EVENT,
    payload,
    mailId,
  };
}

export function sendReminder(payload) {
  return {
    type: Type.SEND_EVENT_REMINDER,
    payload,
  };
}

export function createEvent(payload) {
  return {
    type: Type.CREATE_CALENDAR_EVENT,
    payload,
  };
}

export function getAttendeeContact(payload) {
  return {
    type: Type.ATTENDEE_LIST,
    payload,
  };
}

export function getMemAvailability(payload) {
  return {
    type: Type.GET_MEMBER_AVAILABILITY,
    payload,
  };
}

export function getRoomList(searchValue) {
  return {
    type: Type.GET_ROOMS,
    payload: searchValue,
  };
}

export function rescheduleEvent(payload, mailId) {
  return {
    type: Type.RESCHEDULE_EVENT,
    payload,
    mailId,
  };
}
