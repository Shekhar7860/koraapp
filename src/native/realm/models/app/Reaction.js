import {Model} from '@nozbe/watermelondb';
import {field, date} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class Reaction extends Model {
  static table = Constants.Reactions;

  @date('rAt') rAt;

  @field('userId') userId;

  @field('_id') _id;
}
