import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class WSSettings extends Model {
  static table = Constants.WSSettings;

  @field('wsId') wsId;

  @field('whoCanInviteUsers') whoCanInviteUsers;

  @field('whoCanCreateBoard') whoCanCreateBoard;

  @field('whoCanAcceptRequests') whoCanAcceptRequests;

  @field('allowExternalDomainUsers') allowExternalDomainUsers;

  @field('allowExternalDomains') allowExternalDomains;

  @field('allowNonManagedDomainUsers') allowNonManagedDomainUsers;

  @field('isDefaultAddMembers') isDefaultAddMembers;

  @field('notificationSettings') notificationSettings;
}
