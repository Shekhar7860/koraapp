import {Model} from '@nozbe/watermelondb';
import {
  field,
  date,
  json,
  children,
  relation,
  readonly,
} from '@nozbe/watermelondb/decorators';
import {sanitizer} from '../../utils';
import * as Entity from '../../dbconstants';

export default class Workspace extends Model {
  static table = Entity.Workspaces;

  static associations = {
    // [Entity.Members]: {type: 'has_many', foreignKey: 'ws_member_id'},
    [Entity.Boards]: {type: 'has_many', foreignKey: 'workspace_id'},
  };

  @field('wsId') wsId;

  @json('settings', sanitizer) settings;

  @field('type') type;

  @field('requesttojoin') requesttojoin;

  @field('status') status;

  @field('name') name;

  @field('color') color;

  @json('logo', sanitizer) logo;

  @field('category') category;

  @field('orgId') orgId;

  @date('createDate') createDate;

  @date('modifiedDate') modifiedDate;

  @field('memberLastModified') memberLastModified;

  @field('modifiedBy') modifiedBy;

  @field('desc') desc;

  @json('geoFenceDetails', sanitizer) geoFenceDetails;

  @field('userStatus') userStatus;

  @field('membersCount') membersCount;

  @date('lMod') lMod;

  @date('sortTime') sortTime;

  @field('namelower') namelower;

  @field('hidden') hidden;

  @field('isWSStarred') isWSStarred;

  @json('counter', sanitizer) counter;

  @json('portal', sanitizer) portal;

  @json('layout', sanitizer) layout;

  @json('link', sanitizer) link;

  @field('moreAvailable') moreAvailable;

  @field('owner') owner;

  @field('createdBy') createdBy;

  @readonly @date('updated_at') updatedAt;

  @children(Entity.Boards) boards;

  @field('isMember') isMember;
}
