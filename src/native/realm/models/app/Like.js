import {Model} from '@nozbe/watermelondb';
import {field, date} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class Like extends Model {
  static table = Constants.Likes;

  @date('rAt') rAt;

  @field('userId') userId;
}
