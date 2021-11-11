import {Model} from '@nozbe/watermelondb';
import {
  field,
  date,
  json,
  relation,
  children,
  lazy,
  readonly,
} from '@nozbe/watermelondb/decorators';
import {Q} from '@nozbe/watermelondb';
import * as Entity from '../../dbconstants';
import {sanitizer} from '../../utils';

export default class Message extends Model {
  static table = Entity.Messages;
  static associations = {
    [Entity.Boards]: {type: 'belongs_to', key: 'board_id'},
    [Entity.Components]: {type: 'has_many', foreignKey: 'message_id'},
  };

  @field('boardId') boardId;

  @field('encrypted') encrypted;

  @field('clientId') clientId;

  @field('messageId') messageId;

  @field('highImportance') highImportance;

  @field('name') name;

  @field('desc') desc;

  @field('logo') logo;

  @field('boardClientId') boardClientId;

  @field('views') views;

  @date('sentOn') sentOn;

  @date('deliveredOn') deliveredOn;

  @date('sortTime') sortTime;

  @field('isSender') isSender;

  @field('secureEmail') secureEmail;

  @field('forward') forward;

  @field('memo') memo;

  @field('deepRecalled') deepRecalled;

  @field('state') state;

  @field('messages') messages;

  @field('unread') unread;

  @field('groupMessage') groupMessage;

  @json('componentsCount', sanitizer) componentsCount;

  @field('namespaceId') namespaceId;

  @field('isPolicySet') isPolicySet;

  @field('retentionState') retentionState;

  @field('messageState') messageState;

  @json('remind', sanitizer) remind;

  @json('replyTo', sanitizer) replyTo;

  @json('sad', sanitizer) sad;

  @json('shock', sanitizer) shock;

  @json('like', sanitizer) like;

  @json('laugh', sanitizer) laugh;

  @json('anger', sanitizer) anger;

  @json('unlike', sanitizer) unlike;

  @field('likeCount') likeCount;

  @field('unlikeCount') unlikeCount;

  @field('sadCount') sadCount;

  @field('laughCount') laughCount;

  @field('angerCount') angerCount;

  @field('shockCount') shockCount;

  @field('msgNo') msgNo;

  @field('isEdited') isEdited;

  @json('linkPreviews', sanitizer) linkPreviews;

  @json('mentions', sanitizer) mentions;

  @field('everyoneMentioned') everyoneMentioned;

  @readonly @date('updated_at') updatedAt;

  @relation(Entity.Boards, 'board_id') board;

  @relation(Entity.Members, 'from_id') from;

  @relation(Entity.Members, 'author_id') author;

  @lazy
  to = this.collections
    .get(Entity.Contacts)
    .query(Q.on(Entity.Members, Q.where('member_message_id', this.id)));

  @lazy
  components = this.collections
    .get(Entity.Components)
    .query(Q.where('message_id', this.id));
}
