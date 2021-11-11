import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class AppControlPermissions extends Model {
  static table = Constants.AppControlPermissions;

  @field('userId') userId;

  @field('licenseId') licenseId;

  @field('role') role;

  @field('managedBy') managedBy;

  @field('emailId') emailId;

  @field('storage') storage;

  @field('applicationControl') applicationControl;
}
