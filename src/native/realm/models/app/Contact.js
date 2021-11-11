import {Model} from '@nozbe/watermelondb';
import {field, date, readonly} from '@nozbe/watermelondb/decorators';
import * as Entity from '../../dbconstants';

export default class Contact extends Model {
  static table = Entity.Contacts;
  static associations = {
    [Entity.Members]: {type: 'has_many', foreignKey: 'contact_id'},
    [Entity.BoardMembers]: {type: 'has_many', foreignKey: 'contact_id'},
  };

  @field('accountId') accountId;

  @field('fN') fN;

  @field('lN') lN;

  @field('emailId') emailId;

  @field('phoneNo') phoneNo;

  @field('color') color;

  @field('icon') icon;

  @field('orgId') orgId;

  @readonly @date('updated_at') updatedAt;
}
