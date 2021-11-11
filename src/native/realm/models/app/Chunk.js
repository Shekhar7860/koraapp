import {Model} from '@nozbe/watermelondb';
import {field, relation} from '@nozbe/watermelondb/decorators';
import * as Entity from '../../dbconstants';

export default class Chunk extends Model {
  static table = Entity.Chunks;
  static associations = {
    [Entity.UploadItems]: {type: 'belongs_to', key: 'uploadItem_id'},
  };

  @field('chunkOffset') chunkOffset;

  @field('chunkNumber') chunkNumber;

  @field('chunkSize') chunkSize;

  @field('chunkStatus') chunkStatus;

  @relation(Entity.UploadItems, 'uploadItem_id') uploadItem;
}
