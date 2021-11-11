import {Model} from '@nozbe/watermelondb';
import {field, relation} from '@nozbe/watermelondb/decorators';
import * as Entity from '../../dbconstants';

export default class Member extends Model {
  static table = Entity.Members;
  static associations = {
    [Entity.Messages]: {
      type: 'belongs_to',
      key: 'member_message_id',
    },
    [Entity.Contacts]: {type: 'belongs_to', key: 'contact_id'},
  };

  @field('memberId') memberId;

  @relation(Entity.Contacts, 'contact_id') contact;

  @relation(Entity.Messages, 'member_message_id') memberOfMessage;

  @relation(Entity.Messages, 'author_message_id') authorOfMessage;

  @relation(Entity.Messages, 'from_message_id') fromOfMessage;

  @relation(Entity.Posts, 'author_post_id') authorOfPost;

  @relation(Entity.Posts, 'from_post_id') fromOfPost;
}
