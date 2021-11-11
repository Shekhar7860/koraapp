import {Model} from '@nozbe/watermelondb';
import {relation, readonly, date} from '@nozbe/watermelondb/decorators';
import * as Entity from '../../dbconstants';

export default class Activity extends Model {
  static table = Entity.Activities;

  @relation(Entity.Boards, 'board_id') board;

  @relation(Entity.Messages, 'message_id') message;

  @relation(Entity.Posts, 'post_id') post;

  @readonly @date('updated_at') updatedAt;
}
