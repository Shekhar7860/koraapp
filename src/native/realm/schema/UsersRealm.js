import {appSchema, tableSchema} from '@nozbe/watermelondb';
import * as Constants from '../dbconstants';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: Constants.Users,
      columns: [
        {name: 'userId', type: 'string'},
        {name: 'enrollType', type: 'string'},
        {name: 'roles', type: 'string'},
        {name: 'pwdChangeRequire', type: 'string'},
        {name: 'makeConsentPolicyAccept', type: 'boolean', default: false},
        {name: 'makeBTConsentPolicyAccept', type: 'boolean'},
        {name: 'sourceType', type: 'string'},
        {name: 'isManage', type: 'boolean'},
        {name: 'img', type: 'string'},
        {name: 'orgID', type: 'string'},
        {name: 'emailId', type: 'string'},
        {name: 'profImage', type: 'string'},
        {name: 'profColour', type: 'string'},
        {name: 'fName', type: 'string'},
        {name: 'lName', type: 'string'},
        {name: 'isFirstTimeLogin', type: 'boolean'},
      ],
    }),
    tableSchema({
      name: Constants.Authorizations,
      columns: [
        {name: 'identity', type: 'string'},
        {name: 'resourceOwnerID', type: 'string'},
        {name: 'orgID', type: 'string'},
        {name: 'clientID', type: 'string'},
        {name: 'sesId', type: 'string'},
        {name: 'accountId', type: 'string'},
        {name: 'managedBy', type: 'string'},
        {name: 'botOrgID', type: 'string'},
        {name: 'showNotificationContent', type: 'string'},
        {name: 'scope', type: 'string'},
        {name: 'platDevType', type: 'string'},
        {name: 'lastActivity', type: 'string'},
        {name: 'tokenIP', type: 'string'},
        {name: 'accessToken', type: 'string'},
        {name: 'refreshToken', type: 'string'},
        {name: 'token_type', type: 'string'},
        {name: 'expiresDate', type: 'number'},
        {name: 'refreshExpiresDate', type: 'number'},
        {name: 'issuedDate', type: 'number'},
      ],
    }),
    tableSchema({
      name: Constants.Servers,
      columns: [
        {name: 'appServer', type: 'string'},
        {name: 'presenceServer', type: 'string'},
        {name: 'botServer', type: 'string'},
      ]
    }),
  ],
});
