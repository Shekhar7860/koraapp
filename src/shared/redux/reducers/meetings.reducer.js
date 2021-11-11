import * as Type from '../constants/meetings.constants';

export default (state = {}, action) => {
  switch (action.type) {
    case Type.GET_ALL_EVENTS_SUCCESSFUL:
      return {...state, meetEvents: action.payload};
    case Type.GET_ALL_EVENTS_FAILURE:
      return state;
    case Type.GET_ALL_TASKS_SUCCESSFUL:
      return {...state, allTasks: action.payload};
    case Type.GET_ALL_TASKS_FAILURE:
      return state;
    case Type.EVENT_CHANGED_SUCCESSFUL:
      return {...state, eventChanged: action.payload};
    case Type.EVENT_CHANGED_FAILURE:
      return state;
    case Type.UPDATE_EVENT_SUCCESSFUL:
      return {...state, eventUpdated: action.payload};
    case Type.UPDATE_EVENT_FAILURE:
      return state;
    case Type.EVENT_DELETED:
      return {...state, eventDeleted: action.payload};
    case Type.REMINDER:
      return {...state, sentReminder: action.payload};
    case Type.MEMBER_AVAILABLE_STATUS:
      return {...state, memberStatus: action.payload};
    case Type.GET_CALENDAR_EVENT:
      return {
        ...state,
        calendars: action.payload.created,
        newEvent: action.payload.newEvent,
      };
    case Type.ROOMS_LIST:
      return {...state, roomsList: action.payload};
    case Type.RESCHEDULE_EVENT_SUCCESSFUL:
      return {
        ...state,
        edited: action.payload.edited,
        editedEvent: action.payload.event,
      };
    case Type.ATTENDEE_LIST_SUCCESSFUL:
      return {...state, contactList: action.payload};
    default:
      return state;
  }
};
