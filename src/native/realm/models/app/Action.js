import {Model} from '@nozbe/watermelondb';
import {field, date} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class Action extends Model {
  static table = Constants.Actions;

  @field('on') on;

  @date('till') till;
}
