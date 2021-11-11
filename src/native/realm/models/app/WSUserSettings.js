import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class WSUserSettings extends Model {
  static table = Constants.WSUserSettings;

  @field('all') all;

  @field('roles') roles;

  @field('members') members;
}
