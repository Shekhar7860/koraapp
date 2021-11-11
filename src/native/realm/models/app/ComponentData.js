import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';
import * as Constants from '../../dbconstants';

export default class ComponentData extends Model {
  static table = Constants.ComponentDatas;

  @field('eventType') eventType;

  @field('filename') filename;

  @field('eventInitiator') eventInitiator;

  @field('resources') resources;
}
