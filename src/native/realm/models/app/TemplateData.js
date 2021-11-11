import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class TemplateData extends Model {
  static table = Constants.TemplateDatas;

  @field('variables') variables;
}
