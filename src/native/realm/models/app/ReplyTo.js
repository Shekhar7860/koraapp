import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class ReplyTo extends Model {
  static table = Constants.ReplyTos;

  @field('messageId') messageId;

  @field('boardId') boardId;

  @field('message') message;

  @field('threadId') threadId;

  @field('type') type;
}
