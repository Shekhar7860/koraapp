import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class Video extends Model {
  static table = Constants.Videos;

  @field('url') url;

  @field('secureUrl') secureUrl;

  @field('width') width;

  @field('height') height;

  @field('type') type;
}
