import {Model} from '@nozbe/watermelondb';
import {field, json, relation} from '@nozbe/watermelondb/decorators';
import * as Entity from '../../dbconstants';
import {sanitizer} from '../../utils';

export default class Component extends Model {
  static table = Entity.Components;
  static associations = {
    [Entity.Messages]: {type: 'belongs_to', key: 'message_id'},
    [Entity.Posts]: {type: 'belongs_to', key: 'post_id'},
  };

  @field('componentId') componentId;

  @field('componentType') componentType;

  @field('componentBody') componentBody;

  @json('componentThumbnails', sanitizer) componentThumbnails;

  @json('componentData', sanitizer) componentData;

  @field('componentSize') componentSize;

  @field('componentLength') componentLength;
  
  @field('thumbnailURL') thumbnailURL;

  @field('componentFileId') componentFileId;

  @field('localFilePath') localFilePath;

  @relation(Entity.Messages, 'message_id') message;

  @relation(Entity.Posts, 'post_id') post;

  @relation(Entity.FileMetas, 'fileMeta_id') fileMeta;

  @relation(Entity.UploadItems, 'uploadItem_id') uploadItem;
}