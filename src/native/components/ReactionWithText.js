import React from 'react';
import {useTranslation} from 'react-i18next';
import {Text, View} from 'react-native';
import * as UsersDao from '../../dao/UsersDao';
import {normalize} from '../utils/helpers';
import {MultiEmoji} from './Chat/MessageView';
import {fontFamily} from './KoraText';
import {emptyArray} from '../../shared/redux/constants/common.constants';

const emojiList = ['like', 'unlike', 'laugh', 'sad', 'shock', 'anger'];

//For auto parsing
export const mockTranslation = {
  t: (s) => s,
};

const reactionsObj = {
  like: {text: mockTranslation.t('Like'), color: '#0D6EFD'},
  unlike: {text: mockTranslation.t('Dislike'), color: '#DD3646'},
  laugh: {text: mockTranslation.t('Happy'), color: '#f3973e'},
  sad: {text: mockTranslation.t('Sad'), color: '#f3973e'},
  shock: {text: mockTranslation.t('Suspicious'), color: '#f3973e'},
  anger: {text: mockTranslation.t('Anger'), color: '#f1803a'},
};

export const ReactionWithText = ({
  data = {
    like: [],
    unlike: [],
    laugh: [],
    sad: [],
    shock: [],
    anger: [],
  },
  textStyle = {
    fontSize: normalize(14),
    lineHeight: normalize(20),
    fontFamily: fontFamily,
  },
  userId = UsersDao.getUserId(),
  onLongPress = () => {},
  onPress = () => {},
  onCancel = () => {},
}) => {
  const {t} = useTranslation();
  let userReaction = null;

  emojiList.forEach((emoji) => {
    const list = data[emoji] || emptyArray;
    try {
      // userReaction = null;
      if (list && list.find && list?.find((o) => o.userId === userId)) {
        userReaction = emoji;
      }
    } catch (e) {
      console.log('ERROR', e, list, data, emoji);
    }
  });
  if (userReaction === null) {
    return null;
  }
  const {text, color} = reactionsObj[userReaction];
  let multiEmojiObj = {};

  multiEmojiObj[userReaction + 'Count'] = 1;
  return (
    <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 15}}>
      <MultiEmoji border={false} data={multiEmojiObj} />
      <View style={{width: 5}} />
      <Text
        onLongPress={onLongPress}
        onPress={onPress}
        style={[textStyle, {color: color}]}>
        {t(text)}
      </Text>
    </View>
  );
};
