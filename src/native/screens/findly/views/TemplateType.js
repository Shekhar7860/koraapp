import {normalize} from '../../../utils/helpers';

export const TemplateType = {
  PICK_SLOT_TEMPLATE: 'pick_slot_template',
  MEETING_CONFIRMATION: 'meeting_confirmation',
  FORM_ACTIONS: 'form_actions',
  CALENDAR_EVENTS: 'calendar_events',
  CANCEL_CALENDAR_EVENTS: 'cancel_calendar_events',
  QUICK_REPLIES: 'quick_replies',
  BUTTON: 'button',
  TASK_LIST_PREVIEW: 'task_list_preview',
  START_TIMER: 'start_timer',
  TASK_LIST_FULL_PREVIEW: 'task_list_full_preview',
  HIDDEN_DIALOG: 'hidden_dialog',
  KORA_CONTACT_LOOKUP: 'kora_contact_lookup',
  KORA_SEARCH_CAROUSEL: 'kora_search_carousel',
  SESSION_EXPIRED: 'session_expired',
  SUMMARY_HELP: 'Summary_Help',
  FILES_SEARCH_CAROUSEL: 'files_search_carousel',
  ANNOUNCEMENT_CAROUSEL: 'announcement_carousel',
  ARTICLES_KORA_CAROUSEL: 'kora_carousel',
  KORA_WELCOME_SUMMARY: 'kora_welcome_summary',
  KA_SWITCH_SKILL: 'ka_switch_skill',
  TABLE: 'table',
  KA_SKILL_RESPONSE: 'ka_skill_response',
  KORA_UNIVERSAL_SEARCH: 'kora_universal_search',
  TABLE_LIST: 'tableList',
  MINI_TABLE: 'mini_table',
  BAR_CHART: 'barchart',
  PIE_CHART: 'piechart',
  LINE_CHART: 'linechart',
  CAROUSEL: 'carousel',
  LIST: 'list',
};

export const EMITTER_TYPES = {
  HELP_UTTRENCES: 'helpUttrences',
  RESET_ALL: 'reset_all',
  TASK_FULL_PREVIEW_EMITOR: 'task_full_preview_emitor',
  SPEECH_TO_TEXT: 'SPEECH_TO_TEXT',
};

export const BORDER = {
  WIDTH: 1,
  COLOR: '#E0E1E9',
  RADIUS: 6,
  TEXT_COLOR: '#202124',

  TEXT_SIZE: normalize(15),
};
