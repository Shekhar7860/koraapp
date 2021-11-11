import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class PostUploadItem extends Model {
  static table = Constants.PostUploadItems;

  @field('itemId') itemId;

  @field('priority') priority;

  @field('progress') progress;

  @field('retryCount') retryCount;

  @field('message') message;

  @field('board') board;
}
