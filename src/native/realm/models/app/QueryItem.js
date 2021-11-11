import {Model} from '@nozbe/watermelondb';
import {field, date, readonly} from '@nozbe/watermelondb/decorators';
import * as Entity from '../../dbconstants';

export default class QueryItem extends Model {
  static table = Entity.QueryItems;

  @field('moreAvailable') moreAvailable;

  @date('laMod') laMod;

  @date('lastBoardSortTime') lastBoardSortTime;

  @field('badge') badge;

  @field('icon') icon;
  
  @field('name') name;
  
  @field('filter') filter;
  
  @field('index') index;

  @field('active') active;

  @readonly @date('updated_at') updatedAt;
}
