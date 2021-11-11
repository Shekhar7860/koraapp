import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class Link extends Model {
  static table = Constants.Links;

  @field('linkId') linkId;

  @field('scope') scope;

  @field('access') access;

  @field('shareUrl') shareUrl;
}
