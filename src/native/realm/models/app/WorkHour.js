import {Model} from '@nozbe/watermelondb';
import {field, relation} from '@nozbe/watermelondb/decorators';
import * as Entity from '../../dbconstants';

export default class WorkHour extends Model {
  static table = Entity.WorkHours;
  static associations = {
    [Entity.Profiles]: {type: 'belongs_to', key: 'profile_id'},
  };

  @field('a') a;

  @field('s') s;

  @field('e') e;

  @field('ua') ua;

  @field('start') start;

  @field('end') end;

  @relation(Entity.Profiles, 'profile_id') profile;

  // methods
  updateWorkHour(workHour) {
    this.a = workHour?.a;
    this.s = workHour?.s;
    this.e = workHour?.e;
    this.ua = workHour?.ua;
    this.start = workHour?.start;
    this.end = workHour?.end;
  };

  async deleteWorkHour() {
    await this.markAsDeleted(); // syncable
    await this.destroyPermanently(); // permanent
  }
}
