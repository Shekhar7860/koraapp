import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class Notification extends Model {
  static table = Constants.Notifications;

  @field('mute') mute;
}
