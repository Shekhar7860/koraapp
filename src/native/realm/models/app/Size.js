import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class Size extends Model {
  static table = Constants.Sizes;

  @field('size') size;

  @field('url') url;
}
