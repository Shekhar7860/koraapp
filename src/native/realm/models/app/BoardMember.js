import {Model} from '@nozbe/watermelondb';
import {field, relation} from '@nozbe/watermelondb/decorators';
import * as Entity from '../../dbconstants';

export default class BoardMember extends Model {
  static table = Entity.BoardMembers;
  static associations = {
    [Entity.Boards]: {
      type: 'belongs_to',
      key: 'member_board_id',
    },
    [Entity.Boards]: {
      type: 'belongs_to',
      key: 'recent_member_board_id',
    },
    [Entity.Contacts]: {type: 'belongs_to', key: 'contact_id'},
  };

  @field('memberId') memberId;

  @relation(Entity.Contacts, 'contact_id') contact;

  @relation(Entity.Boards, 'owner_board_id') ownerOfBoard;

  @relation(Entity.Boards, 'creator_board_id') creatorOfBoard;

  @relation(Entity.Boards, 'member_board_id') memberOfBoard;

  @relation(Entity.Boards, 'recent_member_board_id') recentMemberOfBoard;
}
