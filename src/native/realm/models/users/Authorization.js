import {Model} from '@nozbe/watermelondb';
import {field, date} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class Authorization extends Model {
  static table = Constants.Authorizations;

  @field('identity') identity;

  @field('resourceOwnerID') resourceOwnerID;

  @field('orgID') orgID;

  @field('clientID') clientID;

  @field('sesId') sesId;

  @field('accountId') accountId;

  @field('managedBy') managedBy;

  @field('botOrgID') botOrgID;

  @field('showNotificationContent') showNotificationContent;

  @field('scope') scope;

  @field('platDevType') platDevType;

  @field('lastActivity') lastActivity;

  @field('tokenIP') tokenIP;

  @field('accessToken') accessToken;

  @field('refreshToken') refreshToken;

  @field('token_type') token_type;

  @date('expiresDate') expiresDate;

  @date('refreshExpiresDate') refreshExpiresDate;

  @date('issuedDate') issuedDate;
}
