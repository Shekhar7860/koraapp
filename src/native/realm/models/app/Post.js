import {Model} from '@nozbe/watermelondb';
import {
  field,
  json,
  date,
  relation,
  lazy,
  readonly,
} from '@nozbe/watermelondb/decorators';
import {Q} from '@nozbe/watermelondb';
import * as Entity from '../../dbconstants';
import {sanitizer} from '../../utils';

export default class Post extends Model {
  static table = Entity.Posts;
  static associations = {
    [Entity.Boards]: {type: 'belongs_to', key: 'board_id'},
    [Entity.Components]: {type: 'has_many', foreignKey: 'post_id'},
  };

  @field('boardId') boardId;

  @field('postId') postId;

  @field('clientId') clientId;

  @field('messageState') messageState;

  @field('postType') postType;

  @field('parentId') parentId;

  @field('namespaceId') namespaceId;

  @json('comments') comments;

  @field('commentCount') commentCount;

  @json('like', sanitizer) like;

  @json('sad', sanitizer) sad;

  @json('shock', sanitizer) shock;

  @json('laugh', sanitizer) laugh;

  @json('anger', sanitizer) anger;

  @json('unlike', sanitizer) unlike;

  @json('linkPreviews', sanitizer) linkPreviews;

  @json('mentions', sanitizer) mentions;

  @field('read') read;

  @field('isPostedAsTeam') isPostedAsTeam;

  @field('isEdited') isEdited;

  @field('policy') policy;

  @field('location') location;

  @date('lastModified') lastModified;

  @date('sortTime') sortTime;

  @field('lastModifiedBy') lastModifiedBy;

  @date('createdOn') createdOn;

  @date('deliveredOn') deliveredOn;

  @field('state') state;

  @field('metaType') metaType;

  @field('wsId') wsId;

  @field('orgId') orgId;

  @json('remind', sanitizer) remind;

  @field('actionCount') actionCount;

  @field('encrypted') encrypted;

  @field('hasHistory') hasHistory;

  @field('disabledLike') disabledLike;

  @field('disabledComment') disabledComment;

  @field('disabledOptions') disabledOptions;

  @field('postNumber') postNumber;

  @field('retentionState') retentionState;

  @field('classification') classification;

  @field('likeCount') likeCount;

  @field('unlikeCount') unlikeCount;

  @field('sadCount') sadCount;

  @field('laughCount') laughCount;

  @field('angerCount') angerCount;

  @field('shockCount') shockCount;

  @field('isFollowing') isFollowing;

  @field('readCount') readCount;

  @field('moreAvailable') moreAvailable;

  @readonly @date('updated_at') updatedAt;

  @relation(Entity.Boards, 'board_id') board;

  @relation(Entity.Members, 'from_id') from;

  @relation(Entity.Members, 'author_id') author;

  @lazy
  components = this.collections
    .get(Entity.Components)
    .query(Q.where('post_id', this.id));
}
