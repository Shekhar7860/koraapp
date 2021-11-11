import {Model} from '@nozbe/watermelondb';
import {field, date} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class NPref extends Model {
  static table = Constants.NPrefs;

  @field('sound') sound;

  @date('dndTill') dndTill;
}
