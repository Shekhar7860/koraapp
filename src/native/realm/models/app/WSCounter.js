import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class WSCounter extends Model {
  static table = Constants.WSCounters;

  @field('disb') disb;

  @field('docb') docb;

  @field('emwb') emwb;

  @field('taskb') taskb;

  @field('tabb') tabb;
}
