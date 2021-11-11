import {Model} from '@nozbe/watermelondb';
import {
  field,
  date,
  json,
  children,
  relation,
  lazy,
  readonly,
} from '@nozbe/watermelondb/decorators';
import {Q} from '@nozbe/watermelondb';
import * as Entity from '../../dbconstants';
import {sanitizer} from '../../utils';

export default class Board extends Model {
  static table = Entity.Boards;

  static associations = {
    [Entity.BoardMembers]: {type: 'has_many', foreignKey: 'member_board_id'},
    [Entity.BoardMembers]: {
      type: 'has_many',
      foreignKey: 'recent_member_board_id',
    },
    [Entity.Messages]: {type: 'has_many', foreignKey: 'board_id'},
    [Entity.Posts]: {type: 'has_many', foreignKey: 'board_id'},
    [Entity.Workspaces]: {type: 'belongs_to', key: 'workspace_id'},
  };

  @field('_id') _id;

  @field('clientId') clientId;

  @field('name') name;

  @field('meta') meta;

  @field('desc') desc;

  @json('logo', sanitizer) logo;

  @field('isAllMembers') isAllMembers;

  @field('wsId') wsId;

  @field('namespaceId') namespaceId;

  @field('isMember') isMember;

  @field('isActive') isActive;

  @field('membersCount') membersCount;

  @date('laMod') laMod;

  @date('memberLastModified') memberLastModified;

  @field('isEmailEnabled') isEmailEnabled;

  @field('emailId') emailId;

  @field('friendlyAliasEmailId') friendlyAliasEmailId;

  @date('lastModified') lastModified;

  @date('createdOn') createdOn;

  @date('sortTime') sortTime;

  @field('lastModifiedBy') lastModifiedBy;

  @field('type') type;

  @json('link', sanitizer) link;

  @json('payload', sanitizer) payload;

  @field('allEmailIds') allEmailIds;

  @field('access') access;

  @field('isTopicMember') isTopicMember;

  @json('notifications', sanitizer) notifications;

  @field('unreadCount') unreadCount;

  @field('lastReadId') lastReadId;

  @date('firstUnreadTimestamp') firstUnreadTimestamp;

  @field('hasDraftPost') hasDraftPost;

  @field('isNew') isNew;

  @field('wsMembersAccess') wsMembersAccess;

  @field('star') star;

  @field('moreAvailable') moreAvailable;

  @field('boardState') boardState;

  @readonly @date('updated_at') updatedAt;

  @relation(Entity.Workspaces, 'workspace_id') workspace;

  @relation(Entity.Activities, 'activity_id') lastActivity;

  @relation(Entity.BoardMembers, 'creator_id') creator;

  @relation(Entity.BoardMembers, 'owner_id') owner;

  @lazy
  members = this.collections
    .get(Entity.Contacts)
    .query(Q.on(Entity.BoardMembers, Q.where('member_board_id', this.id)));

  @lazy
  recentMembers = this.collections
    .get(Entity.Contacts)
    .query(
      Q.on(Entity.BoardMembers, Q.where('recent_member_board_id', this.id)),
    );

  @children(Entity.Messages) messages;

  @children(Entity.Posts) posts;
}
