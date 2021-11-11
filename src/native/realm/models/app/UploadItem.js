import {Model} from '@nozbe/watermelondb';
import {field, date, children, relation} from '@nozbe/watermelondb/decorators';
import * as Entity from '../../dbconstants';

export default class UploadItem extends Model {
  static table = Entity.UploadItems;
  static associations = {
    [Entity.Chunks]: {type: 'has_many', foreignKey: 'uploadItem_id'},
  };
  
  @field('itemId') itemId;

  @field('cookie') cookie;

  @date('expiresOn') expiresOn;

  @field('fileContext') fileContext;

  @field('fileName') fileName;

  @field('fileExtn') fileExtn;

  @field('fileToken') fileToken;

  @field('mergeStatus') mergeStatus;

  @field('numberOfChunks') numberOfChunks;

  @field('uploadStatus') uploadStatus;

  @relation(Entity.Components, 'component_id') component;

  @children(Entity.Chunks) chunks;
}
