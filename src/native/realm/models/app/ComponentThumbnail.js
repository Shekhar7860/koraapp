import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class ComponentThumbnail extends Model {
  static table = Constants.ComponentThumbnails;

  @field('url') url;

  @field('localFilePath') localFilePath;
}
