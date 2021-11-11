import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class Logo extends Model {
  static table = Constants.Logos;

  @field('type') type;

  @field('val') val;
}
