import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class LinkPreview extends Model {
  static table = Constants.LinkPreviews;

  @field('title') title;

  @field('description') description;

  @field('source') source;

  @field('url') url;

  @field('type') type;

  @field('site') site;

  @field('image') image;

  @field('video') video;
}
