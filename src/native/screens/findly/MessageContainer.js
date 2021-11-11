/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { View, Text } from 'react-native';

import Avatar from '../../../bot-sdk/chat/Avatar';
import Bubble from '../../../bot-sdk/chat/Bubble';
import Message from '../../../bot-sdk/chat/Message';
import MessageText from '../../../bot-sdk/chat/MessageText';

export const renderAvatar = (props) => (
  <Avatar
    {...props}
    imageStyle={{ left: {}, right: {} }}
  />
);

export const renderBubble = (props) => (
  <Bubble
    {...props}
    renderTime={() => <Text>Time</Text>}
    renderTicks={() => <Text>Ticks</Text>}
    containerStyle={{
      left: { borderColor: 'teal', borderWidth: 8 },
      right: {},
    }}
    wrapperStyle={{
      left: { borderColor: 'tomato', borderWidth: 4 },
      right: {},
    }}
    bottomContainerStyle={{
      left: { borderColor: 'purple', borderWidth: 4 },
      right: {},
    }}
    tickStyle={{}}
    usernameStyle={{ color: 'tomato', fontWeight: '100' }}
    containerToNextStyle={{
      left: { borderColor: 'navy', borderWidth: 4 },
      right: {},
    }}
    containerToPreviousStyle={{
      left: { borderColor: 'mediumorchid', borderWidth: 4 },
      right: {},
    }}
  />
);

export const renderMessage = (props) => (
  <Message
    {...props}
    // renderDay={() => <Text>Date</Text>}
    containerStyle={{
      left: { backgroundColor: 'lime' },
      right: { backgroundColor: 'gold' },
    }}
  />
);

export const renderCustomView = ({ user }) => (
  <View style={{ minHeight: 20, alignItems: 'center' }}>
    <Text>
      Current user:
      {user.name}
    </Text>
    <Text>From CustomView</Text>
  </View>
);
