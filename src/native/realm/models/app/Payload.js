import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class Payload extends Model {
  static table = Constants.Payloads;

  @field('url') url;
}
