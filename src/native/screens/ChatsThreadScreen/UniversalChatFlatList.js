import React, {Component} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, FlatList} from 'react-native';
import {Avatar} from '../../components/Icon/Avatar';
import {getTimeline} from '../../utils/helpers';
import {navigate} from '../../navigation/NavigationService';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
import {normalize} from '../../utils/helpers';
import * as Constants from '../../components/KoraText';
import {RoomAvatar} from '../../components/RoomAvatar';
import * as UsersDao from '../../../dao/UsersDao';
import {msgTimelineObj} from '../../components/Chat/helper';
import {emptyArray} from '../../../shared/redux/constants/common.constants';
import {
  getGoToMessage,
  getGoToPost,
} from '../../../shared/redux/actions/message-thread.action';
import {connect} from 'react-redux';
import * as BoardsDao from '../../../dao/BoardsDao';

const CustomText = (props) => {
  if (props.text === null || props.text === undefined || props.text === '') {
    return <Text> </Text>;
  }
  const text = props.text.split(' ');
  return (
    <Text numberOfLines={1} ellipsizeMode="tail" style={props.titleFont}>
      {text.map((text) => {
        if (text?.toUpperCase().includes(props.searchWord.toUpperCase())) {
          let startIndex = text
            .toUpperCase()
            .indexOf(props.searchWord.toUpperCase());
          let endIndex =
            text.toUpperCase().indexOf(props.searchWord.toUpperCase()) +
            props.searchWord.length;

          return (
            <Text style={props.titleFont}>
              {text.substring(0, startIndex)}
              <Text style={props.searchFont}>
                {text.substring(startIndex, endIndex)}
              </Text>
              {text.substring(endIndex, text.length) + ' '}
            </Text>
          );
          // return <Text style={stylesImageCell.searchMessageTextStyle}>{text} </Text>;
        }
        return `${text} `;
      })}
    </Text>
  );
};

class UniversalChatFlatList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [
        {
          id: 1,
          image: 'https://bootdey.com/img/Content/avatar/avatar1.png',
          name: 'Frank Odalthh',
          comment:
            'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.',
        },
        {
          id: 2,
          image: 'https://bootdey.com/img/Content/avatar/avatar6.png',
          name: 'John DoeLink',
          comment:
            'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.',
        },
        {
          id: 3,
          image: 'https://bootdey.com/img/Content/avatar/avatar7.png',
          name: 'March SoulLaComa',
          comment:
            'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.',
        },
      ],
    };
  }

  getBoardMappedWithMessage = (message) => {
    console.log('message in message board', message.id);
    var filterBoards = this.props.boards.filter((board) => {
      return this.props.data.filter((messageData) => {
        return messageData?.id === board.id;
      });
    });
    const unique = [...new Set(filterBoards)];

    const boardData = unique.filter((board) => {
      return message.boardId === board.id;
    });
    return boardData[0];
  };

  getLastMessageText(lastActivitySend, item) {
    let lastText = '';
    const lastActivity = item.lastActivity?.post || item.lastActivity?.message;
    try {
      const sender =
        lastActivity?.author?.id === UsersDao.getUserId()
          ? 'You'
          : lastActivity?.author?.fN;

      if (lastActivity?.components[0]?.componentType === 'timeline') {
        const {
          actionTakerText,
          actionReceiverText,
          middleText,
          postText,
        } = msgTimelineObj(lastActivity?.components[0].componentData);
        lastText =
          // sender +
          // ': ' +
          actionTakerText +
          '' +
          middleText +
          '' +
          actionReceiverText +
          ' ' +
          postText;
      } else {
        lastText = '';
        if (lastActivity?.author?.fN === undefined) {
        } else {
          if (
            lastActivity?.components.length > 1 ||
            lastActivity?.components[0]?.componentType !== 'text' ||
            lastActivity?.components[0]?.componentBody === undefined
          ) {
            lastText = '';
            let attachment = 0,
              images = 0,
              audio = 0,
              video = 0;
            let msg = '';
            lastActivity &&
              lastActivity['components'].forEach(function (value, index) {
                if (value.componentType === 'image') {
                  images = images + 1;
                }
                if (value.componentType === 'attachment') {
                  attachment = attachment + 1;
                }
                if (value.componentType === 'audio') {
                  audio = audio + 1;
                }
                if (value.componentType === 'video') {
                  video = video + 1;
                }
              });
            if (images > 0) {
              let img = images > 1 ? ' images' : ' image ';
              msg = msg + ' ' + images + img;
            }
            if (audio > 0) {
              let aud = audio > 1 ? ' audios' : ' audio ';
              msg = msg + ' ' + audio + aud;
            }
            if (attachment > 0) {
              let att = attachment > 1 ? ' attachments' : ' attachment ';
              msg = msg + ' ' + attachment + att;
            }
            if (video > 0) {
              let vid = video > 1 ? ' videos' : ' video ';
              msg = msg + ' ' + video + vid;
            }
            lastText = sender + ': Sent' + msg;
          } else if (lastActivity?.components[0]?.componentBody) {
            lastText =
              sender + ': ' + lastActivity?.components[0]?.componentBody;
          }
        }
      }
    } catch (e) {
      console.log('e', e);
      lastText = '';
    }
    return lastText;
  }

  msgMemberTimeline(comp) {
    let memberName = [],
      name = '';
    comp?.componentData.resources.forEach(function (value, index) {
      memberName.push(value.firstName + ' ' + value.lastName);
    });
    if (comp?.componentData.eventInitiator.userId === UsersDao.getUserId()) {
      name = 'You';
    } else {
      name =
        comp?.componentData.eventInitiator.firstName +
        ' ' +
        comp?.componentData.eventInitiator.lastName;
    }
    if (comp?.componentData?.eventType === 'board_add_member') {
      return name + ' added ' + memberName.join(', ') + ' to this chat';
    } else if (comp?.componentData?.eventType === 'board_remove_member') {
      return name + ' removed ' + memberName.join(', ') + ' from this chat';
    } else if (
      comp?.componentData?.eventType === 'board_member_left' ||
      comp?.componentData?.eventType === 'thread_member_left'
    ) {
      return name + ' left this chat';
    } else if (comp?.componentData?.eventType === 'board_name_change') {
      const newGroupName = comp?.componentData.resources[0].threadSubject;
      return name + ' changed the group name of this chat to ' + newGroupName;
    } else if (comp?.componentData?.eventType === 'board_description_change') {
      const newGroupDesc = comp?.componentData?.resources[0]?.boardDesc;
      return name + ' updated the chat description to ' + newGroupDesc;
    }
    return comp?.componentData?.eventType;
  }

  isTimelineEvent(item) {
    return (
      item?.components?.length > 0 &&
      item?.components[0].componentType === 'timeline'
    );
  }

  onPressItem = (data, boardData, section) => {
    console.log('messages search action', data, boardData, section);
    this.navigateToBoard(data);
    // if (boardData?.type === 'discussion') {
    //   let _params = {
    //     rId: data?.boardId,
    //     postId: data?.postId,
    //     offset: -5,
    //     limit: 11,
    //   };
    //   this.props.getGoToPost(_params);
    // } else {
    //   let _params = {
    //     id: data?.boardId,
    //     msgId: data?.messageId,
    //   };
    //   this.props.getGoToMessage(_params);
    // }
    // //console.log(JSON.stringify(data));

    // switch (section) {
    //   case 'messages':
       
    //     // if (boardData?.type === 'discussion') {
    //     //   navigate(ROUTE_NAMES.DISCUSSION, {
    //     //     board: board,
    //     //     // universalSearch: true,
    //     //   });
    //     // } else {
    //     //   navigate(ROUTE_NAMES.CHAT, {
    //     //     thread: boardData,
    //     //     universalSearch: true,
    //     //   });
    //     // }
    //     break;
    //   default:
    //     break;
    // }
  };

  navigateToBoard = async (data) => {
    var board = await BoardsDao.getSingleBoard(data.boardId);
    if (board?.type === 'discussion') {
      navigate(ROUTE_NAMES.DISCUSSION, {
        board: board,
      });
      return;
    }
    navigate(ROUTE_NAMES.CHAT, {board_id: board?.id}); 
  }

  keyExtractor = (item) => {
    return item.id;
  };

  renderItem = (item) => {
    const itemData = item.item;
    const boardData = this.getBoardMappedWithMessage(itemData);

    var lastMessage = '';
    var tName = '';
    var participants = [];
    var timeStr = '';
    var isDraft = false;
    var isDiscussion = false;
    var isMessages = false;
    switch (this.props.section) {
      case 'messages':
        // //{
        // // boardData?.type === 'chat'
        // console.log(
        //   'unique board data messages',
        //   JSON.stringify(boardData?.type),
        //   // itemData,
        //   // this.state.uniqueBoards,
        // );
        // // : null;
        // // }

        isMessages = true;
        participants = boardData?.recentMembers || emptyArray;
        tName =
          boardData?.name?.trim().length > 0
            ? boardData?.name
            : participants
                .filter((a) => a && a.id !== UsersDao.getUserId())
                .map((a) => a && (a.fN !== null ? a.fN : a.lN))
                .join(', ');
        if (tName !== null && tName !== undefined && tName.endsWith(', '))
          tName = tName.substring(0, tName.length - 1);
        if (boardData?.type === 'discussion') {
          if (boardData?.lastActivity?.deliveredOn !== null) {
            timeStr = getTimeline(
              boardData?.lastActivity?.post?.deliveredOn,
              'discList',
            );
          } else {
            timeStr = '';
          }
        } else {
          timeStr = getTimeline(itemData.sentOn, 'discList');
        }
        break;
      default:
        tName =
          boardData?.name?.trim().length > 0
            ? boardData?.name
            : boardData?.recentMembers
                .filter((a) => a && a.id !== UsersDao.getUserId())
                .map((a) => a && (a.fN !== null ? a.fN : a.lN))
                .join(', ');
        if (tName !== null && tName.endsWith(', '))
          tName = tName.substring(0, tName.length - 1);
        participants = boardData?.recentMembers;
    }
    const topicName = tName;

    if (itemData.components !== undefined) {
      if (itemData?.components[0]?.componentBody !== undefined) {
        lastMessage = itemData?.components[0].componentBody;
      }
    }

    return (
      <TouchableOpacity
        onPress={() => {
          this.onPressItem(itemData, boardData, this.props.section);
        }}>
        <View style={styles.container}>
          <View
            style={{
              alignSelf: 'center',
            }}>
            {boardData?.type === 'discussion' ? (
              <RoomAvatar boardIcon={boardData?.logo || emptyArray} />
            ) : (
              <Avatar
                name={topicName}
                groupMembers={participants || emptyArray}
                isGroupChat={boardData?.lastActivity?.groupMessage || false}
                membersCount={boardData?.membersCount}
              />
            )}
          </View>
          {/*  : <View>
          <Avatar
            name={topicName}
            groupMembers={participants || []}
            isGroupChat={boardData?.lastActivity?.groupMessage || false}
            membersCount={boardData?.membersCount}
            />
            </View>} */}
          {/* <Image style={styles.image} source={{uri: Notification.image}}/> */}
          <View
            style={[
              styles.content,
              {
                marginLeft:
                  boardData?.type === 'discussion' ||
                  boardData?.type === 'directChat'
                    ? 23
                    : 16,
              },
            ]}>
            <View style={styles.contentHeader}>
              {/* <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.name}>
                {tName}
              </Text> */}
              <CustomText
                numberOfLines={1}
                ellipsizeMode="tail"
                titleFont={styles.name}
                searchFont={styles.searchMessageTextStyle}
                text={tName}
                searchWord={this.props.searchWord}
              />
              <Text style={styles.time}>
                {isDiscussion
                  ? getTimeline(itemData?.lastModified, 'discList')
                  : !isDraft
                  ? itemData?.lastActivity?.message?.sentOn
                    ? getTimeline(
                        itemData?.lastActivity?.message?.sentOn,
                        'thread',
                      )
                    : ''
                  : '[Draft]'}
              </Text>
            </View>
            <CustomText
              titleFont={styles.lastMessageTextStyle}
              searchFont={styles.searchLastMessageTextStyle}
              text={lastMessage}
              searchWord={this.props.searchWord}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    // if (this.props.data.length === 0) {
    //   return null;
    // }

    return (
      <FlatList
        style={styles.root}
        data={this.props.data}
        extraData={this.state}
        ItemSeparatorComponent={ItemSeperator}
        keyExtractor={this.keyExtractor}
        renderItem={this.renderItem}
        ListFooterComponent={<View style={styles.listFooterStyle}></View>}
      />
    );
  }
}
const ItemSeperator = () => {
  return <View style={styles.separator} />;
};

export default connect(null, {
  getGoToMessage,
  getGoToPost,
})(UniversalChatFlatList);

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#ffffff',
    height: '100%',
    // marginTop: 0,
    // height: '87%',
  },
  listFooterStyle: {height: '100%'},
  container: {
    // paddingLeft: 19,
    // paddingRight: 16,
    // paddingVertical: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  content: {
    marginLeft: 16,
    flex: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  separator: {
    height: 1,
    backgroundColor: '#EFF0F1',
  },
  image: {
    width: 45,
    height: 45,
    borderRadius: 20,
    marginLeft: 0,
  },
  time: {
    fontSize: normalize(11),
    color: '#808080',
  },
  name: {
    fontSize: normalize(16),
    fontWeight: '400',
    flexShrink: 1,
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    paddingRight: 10,
  },
  lastMessageTextStyle: {
    fontSize: normalize(14),
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#5F6368',
  },
  searchMessageTextStyle: {
    fontSize: normalize(16),
    flexShrink: 1,
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#0D6EFD',
  },
  searchLastMessageTextStyle: {
    fontSize: normalize(14),
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#0D6EFD',
  },
});
