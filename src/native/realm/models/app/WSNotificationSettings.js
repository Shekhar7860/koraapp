import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class WSNotificationSettings extends Model {
  static table = Constants.WSNotificationSettings;

  @field('enable') enable;

  @field('teamChatSettings') teamChatSettings;

  @field('customSetting') customSetting;

  @field('forceApply') forceApply;
}
