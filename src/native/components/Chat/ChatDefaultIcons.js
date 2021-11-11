import File_Imoji from '../../assets/default_imojis/file_imoji.svg';
import Document_Imoji from '../../assets/default_imojis/document_imoji.svg';
import Web_Imoji from '../../assets/default_imojis/webpage_imoji.svg';
import Table_Imoji from '../../assets/default_imojis/table_imoji.svg';
import Task_Imoji from '../../assets/default_imojis/task_imoji.svg';

import {normalize} from '../../utils/helpers';
import {getEmojiFromUnicode} from '../../utils/emoji';
import React from 'react';
import {View, StyleSheet, Image, Text} from 'react-native';
export const workspaceEmojis = [
  {
    category: 'nature',
    unicode: '2600',
  },
  {
    category: 'symbols',
    unicode: '2705',
  },
  {
    category: 'symbols',
    unicode: '2734',
  },
  {
    category: 'people',
    unicode: '1f47e',
  },
  {
    category: 'objects',
    unicode: '1f52e',
  },
  {
    category: 'nature',
    unicode: '1fab4',
  },
  {
    category: 'activity',
    unicode: '1f3af',
  },
  {
    category: 'travel',
    unicode: '1f5fa',
  },
  {
    category: 'nature',
    unicode: '1f30a',
  },
  {
    category: 'objects',
    unicode: '1f9ed',
  },
  {
    category: 'activity',
    unicode: '1f3f5',
  },
  {
    category: 'travel',
    unicode: '1f304',
  },
  {
    category: 'activity',
    unicode: '1f3c0',
  },
  {
    category: 'nature',
    unicode: '1f984',
  },
  {
    category: 'nature',
    unicode: '1f341',
  },
  {
    category: 'nature',
    unicode: '1f33a',
  },
  {
    category: 'activity',
    unicode: '1f3c6',
  },
  {
    category: 'objects',
    unicode: '1f4da',
  },
  {
    category: 'nature',
    unicode: '1f332',
  },
  {
    category: 'nature',
    unicode: '1f338',
  },
  {
    category: 'nature',
    unicode: '1f525',
  },
  {
    category: 'travel',
    unicode: '1f680',
  },
  {
    category: 'nature',
    unicode: '1f308',
  },
  {
    category: 'objects',
    unicode: '23f0',
  },
];
export const discussion_roomEmoji = [
  {
    category: 'food',
    unicode: '1f36d',
  },
  {
    category: 'people',
    unicode: '1f44f',
  },
  {
    category: 'food',
    unicode: '1f96c',
  },
  {
    category: 'travel',
    unicode: '1f6f8',
  },
  {
    category: 'travel',
    unicode: '1f30b',
  },
  {
    category: 'food',
    unicode: '1f349',
  },
  {
    category: 'activity',
    unicode: '1f3aa',
  },
  {
    category: 'objects',
    unicode: '1f380',
  },
  {
    category: 'activity',
    unicode: '1f3c9',
  },
  {
    category: 'people',
    unicode: '1f44d',
  },
  {
    category: 'activity',
    unicode: '1f941',
  },
  {
    category: 'objects',
    unicode: '1f389',
  },
  {
    category: 'food',
    unicode: '1f951',
  },
  {
    category: 'nature',
    unicode: '1f99a',
  },
  {
    category: 'symbols',
    unicode: '1f4e3',
  },
  {
    category: 'activity',
    unicode: '1f3ae',
  },
  {
    category: 'food',
    unicode: '1f382',
  },
  {
    category: 'activity',
    unicode: '1f396',
  },
  {
    category: 'activity',
    unicode: '1f3d3',
  },
  {
    category: 'nature',
    unicode: '1f33b',
  },
  {
    category: 'people',
    unicode: '1f607',
  },
  {
    category: 'activity',
    unicode: '1f947',
  },
  {
    category: 'food',
    unicode: '1f36a',
  },
  {
    category: 'objects',
    unicode: '1f4d4',
  },
  {
    category: 'objects',
    unicode: '1f5c3',
  },
  {
    category: 'travel',
    unicode: '1f3d5',
  },
  {
    category: 'people',
    unicode: '270d',
  },
  {
    category: 'activity',
    unicode: '1f3ad',
  },
  {
    category: 'people',
    unicode: '1f60a',
  },
  {
    category: 'nature',
    unicode: '1f31f',
  },
  {
    category: 'objects',
    unicode: '1f4a1',
  },
  {
    category: 'objects',
    unicode: '1f381',
  },
  {
    category: 'people',
    unicode: '1f64c',
  },
  {
    category: 'travel',
    unicode: '1f697',
  },
  {
    category: 'activity',
    unicode: '1fa98',
  },
  {
    category: 'objects',
    unicode: '1f9ec',
  },
  {
    category: 'travel',
    unicode: '1f320',
  },
  {
    category: 'nature',
    unicode: '1f419',
  },
  {
    category: 'nature',
    unicode: '1f98a',
  },
  {
    category: 'people',
    unicode: '1f44b',
  },
  {
    category: 'people',
    unicode: '1f91d',
  },
  {
    category: 'nature',
    unicode: '1f33c',
  },
  {
    category: 'food',
    unicode: '1f369',
  },
  {
    category: 'activity',
    unicode: '1f6b5-2642',
  },
];

const NewDiscussionIcon = require('./../../assets/NewDiscussionIcon.png');

class ChatDefaultIcons extends React.Component {
  size = 22;
  /*    getRandomDiscussionImoji = () => {
      
      console.log(this.props.type)
      var IconName = this.discussion_roomEmoji[Math.floor(Math.random() * this.discussion_roomEmoji.length)];
      return (<IconName width={24} height={24}/>);
    } */

  getRandomDiscussionImoji = () => {
    const size = this.props.size || 20;
    switch (this.props.type) {
      case 'discussion':
        var IconName =
          discussion_roomEmoji[
            Math.floor(Math.random() * discussion_roomEmoji.length)
          ];
        return (
          <Text
            style={{
              fontSize: normalize(size),
            }}>
            {getEmojiFromUnicode(IconName.unicode)}
          </Text>
        );

      case 'file':
        return <File_Imoji width={this.size} height={this.size} />;
      case 'document':
        return <Document_Imoji width={this.size} height={this.size} />;
      case 'embeddedweb':
        return <Web_Imoji width={this.size} height={this.size} />;
      case 'table':
        return <Task_Imoji width={this.size} height={this.size} />;
      case 'table':
        return <Table_Imoji width={this.size} height={this.size} />;
      default:
        return (
          <Image
            style={{height: size - 20, width: size - 20}}
            source={NewDiscussionIcon}
          />
        );
    }
  };
  render() {
    return <View>{this.getRandomDiscussionImoji()}</View>;
  }
}
export default React.memo(ChatDefaultIcons);
