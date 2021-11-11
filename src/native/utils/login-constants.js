import {isAndroid} from '../utils/PlatformCheck';
export const KORE_PREFIX = 'workassist://';
export const REDIRECT_URL =
  KORE_PREFIX + (isAndroid ? 'androidsso' : 'iphoneapp');

//Google
export const google_scopes = [
  'profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/admin.directory.user.readonly',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/directory.readonly',
  'https://www.googleapis.com/auth/contacts.other.readonly',
];
export const Google_WebClientId =
  '371763917376-qeop26gd2ejhigmbav6t5evta0pl9far.apps.googleusercontent.com';
export const Google_iOSClientId =
  '371763917376-pj31v91s4gs0rlqsjvu4rcev4drcag3q.apps.googleusercontent.com';
//Azure AD
export const azure_scopes =
  'User.Read MailboxSettings.Read People.Read Directory.Read.All Calendars.Read Calendars.ReadWrite Place.Read.All Mail.Read Files.ReadWrite Sites.Read.All Files.Read.All ExternalItem.Read.All offline_access';
export const SSO_GOOGLE = 'google';
export const SSO_365 = 'AzureAD';
export const SSO_365_EXCHAGE = 'ews';
