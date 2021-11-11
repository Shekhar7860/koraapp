import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class WSTeamChatSettings extends Model {
  static table = 'WSTeamChatSettings';

  @field('directMessages') directMessages;

  @field('groupMessages') groupMessages;
}
