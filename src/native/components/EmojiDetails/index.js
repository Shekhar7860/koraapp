import React from 'react';
import {
  TouchableHighlight,
  FlatList,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import * as ContactsDao from '../../../dao/ContactsDao';
import {emptyArray} from '../../../shared/redux/constants/common.constants';
import {MemberItem} from '../../screens/workspaces/ManageWorkspaces';
import {normalize} from '../../utils/helpers';
import {BottomUpModal} from '../BottomUpModal';
import stylesLocal from '../Chat/MessagesListView.Style';
import {Icon} from '../Icon/Icon';
import {fontFamily} from '../KoraText';

export const emojiDetailsModalRef = React.createRef();

const allEmojis = ['like', 'unlike', 'laugh', 'anger', 'sad', 'shock'];

class _EmojiDetailsModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focusedMessage: {},
      focusedEmojiIndex: 0,
      members: [],
    };

    this.emojiDetailsModalRef = React.createRef();
  }

  open(focusedMessage) {
    let members = [];
    allEmojis.forEach((emoji) => {
      const users = focusedMessage[emoji] || emptyArray;
      users.forEach(({userId}) => {
        const contact = ContactsDao.getContact(userId) || {id: userId};
        members.push(contact);
      });
    });
    this.setState({focusedMessage, members});
    this.emojiDetailsModalRef.current.open();
  }

  render() {
    let {focusedMessage} = this.state;

    let {focusedEmojiIndex} = this.state;
    if (focusedMessage === null) {
      focusedMessage = {};
    }
    const emojis = allEmojis.filter((name) => {
      return focusedMessage[name + 'Count'] !== 0;
    });
    focusedEmojiIndex = focusedEmojiIndex || 0;

    let participants = focusedMessage[emojis[focusedEmojiIndex]] || emptyArray;
    const toShow = participants?.map((obj) => {
      const id = obj.userId;
      return this.state.members?.find((obj) => obj.id === id);
    });
    const Emoji = ({name}) => {
      let focus = false;
      if (name === emojis[focusedEmojiIndex]) {
        focus = true;
      }
      const index = emojis.findIndex((a) => a === name);
      return (
        <View
          style={{
            // borderBottomColor: '#BDC1C6',
            borderBottomWidth: 2,
            borderBottomColor: focus ? '#0D6EFD' : '#BDC1C6',

            // flex: 1,
          }}>
          <TouchableHighlight
            style={stylesLocal.emojiStyle1}
            onPress={() => {
              this.setState({focusedEmojiIndex: index});
            }}
            underlayColor="rgba(0,0,0,0.2)">
            <View style={stylesLocal.emojiStyle2}>
              <Icon name={name} size={30} />
              <Text
                style={{
                  ...styles.focusedMessageTextStyle,
                  color: focus ? '#0D6EFD' : '#9AA0A6',
                }}>
                {focusedMessage[name + 'Count']}
              </Text>
            </View>
          </TouchableHighlight>
        </View>
      );
    };
    return (
      <BottomUpModal
        ref={this.emojiDetailsModalRef}
        expandable={true}
        height={340}>
        <View style={stylesLocal.emojiStyle3}>
          {emojis.map((emoji) => (
            <Emoji name={emoji} key={emoji} />
          ))}
        </View>
        <FlatList
          data={toShow}
          ListEmptyComponent={() => {
            return (
              <View style={stylesLocal.emojiStyle4}>
                <Text>Empty</Text>
              </View>
            );
          }}
          renderItem={({item}) => {
            console.log('ITEM', item);
            const {icon, fN, lN, emailId, color} = item;
            return (
              <MemberItem
                icon={icon}
                fN={fN}
                lN={lN}
                emailId={emailId}
                color={color}
                id={item.id}
              />
            );
          }}
        />
      </BottomUpModal>
    );
  }
}

export const EmojiDetailsModal = React.memo(_EmojiDetailsModal);

const styles = StyleSheet.create({
  focusedMessageTextStyle: {
    paddingTop: 4,
    paddingLeft: 10,
    fontWeight: '500',
    fontSize: normalize(15),
    fontStyle: 'normal',
    fontFamily: fontFamily,
  },
});
