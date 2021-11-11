import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class Reminder extends Model {
  static table = Constants.Reminders;

  @field('userId') userId;

  @field('remindAt') remindAt;
}