import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class Emoji extends Model {
  static table = Constants.Emojis;

  @field('category') category;

  @field('unicode') unicode;

  @field('thumbnails') thumbnails;
}
