import React from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import withObservables from '@nozbe/with-observables';
import {of as of$} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {RoomAvatar} from '../../components/RoomAvatar';
import * as Constants from '../../components/KoraText';
import {normalize} from '../../utils/helpers';
import * as UsersDao from '../../../dao/UsersDao';
import {
  emptyObject,
  emptyArray,
} from '../../../shared/redux/constants/common.constants';
import {Icon} from '../../components/Icon/Icon';
import {Avatar} from '../../components/Icon/Avatar';

class _MessageItem extends React.Component {
  constructor(props) {
    super(props);
  }
  onSentClicked = (item) => {
    this.props.onSentClicked(item);
  };

  render() {
    const {
      board,
      recentMembers,
      workspace,
      creator,
      message,
      post,
      index,
      isSentInBoard,
      logo,
    } = this.props;
    const starredStatus = board?.star;
    let muteOn = false;
    let till = board?.notifications?.mute?.till;
    if (till) {
      muteOn = new Date() < new Date(till);
    }

    const hasNotifcation = board?.unreadCount > 0;
    var isDraft = false;
    // if (message?.messageState === ResourceState.DRAFT) {
    //     isDraft = true;
    //     lastMessageText = '';
    // }

    let profileIcon = null;
    let userId = null;
    var directChat = board?.type == 'directChat';
    var topicName =
      board?.name?.trim().length > 0
        ? board?.name
        : recentMembers
            ?.filter((a) =>
              a && directChat ? a.id !== UsersDao.getUserId() : true,
            )
            .map(
              (a) =>
                a &&
                (a.fN !== null
                  ? recentMembers?.length == 1
                    ? a.fN + ' ' + a?.lN
                    : a?.fN
                  : a?.lN),
            )
            .join(', ');

    if (topicName !== null && topicName.endsWith(', '))
      topicName = topicName.substring(0, topicName.length - 1);
    if (
      topicName !== null &&
      topicName !== undefined &&
      topicName !== '' &&
      board?.name?.trim().length <= 0 &&
      board?.membersCount > 3 &&
      recentMembers
    ) {
      topicName +=
        ' and ' + (board?.membersCount - recentMembers?.length) + ' others';
    }
    var participants = recentMembers || emptyArray;
    participants = participants.filter(function (el) {
      return el != null;
    });
    const isDiscussion = board?.type === 'discussion';
    var workSpaceName = '';
    const isGroupChat = message?.groupMessage || false;
    if (isDiscussion) {
      topicName = board?.name;
    } else if (
      (topicName === null ||
        topicName === undefined ||
        topicName?.trim().length < 1) &&
      participants &&
      participants?.length === 2
    ) {
      if (UsersDao.getUserId() === participants[0].id) {
        topicName = participants[1].fN + ' ' + participants[1].lN;
        profileIcon = participants[1].icon;
        userId = participants[1].id;
      } else {
        topicName = participants[0].fN + ' ' + participants[0].lN;
        profileIcon = participants[0].icon;
        userId = participants[0].id;
      }
    }
    if (isDiscussion) {
      workSpaceName = workspace?.name;
    }
    // // Filter lastActivity not null
    // if (!post && !message) {
    //     return <></>;
    // }
    let showLogo = '';
    if (board?.logo === null && board?.name === 'General') {
      showLogo = workspace?.logo;
    } else {
      showLogo = board?.logo;
    }
    return (
      <View key={board?.id} style={styles.boardItemMainContainer}>
        <View>
          <Avatar
            name={topicName?.toUpperCase()}
            groupMembers={recentMembers}
            isGroupChat={isGroupChat}
            membersCount={board?.membersCount}
          />
        </View>
        <View style={styles.flexOneColumn}>
          <View style={styles.flexShrinkOneMarginHorizontal15}>
            <Text
              numberOfLines={1}
              style={[
                styles.boardTitleStyle,
                styles.flexShrinkOneMarginHorizontal0,
              ]}>
              {topicName}
            </Text>
          </View>
          {/* <View style={styles.marginHorizontal15MarginVertical5}>
                <Text numberOfLines={1} style={styles.membersListTextStyle}>
                  {topicName}
                </Text>
              </View> */}
        </View>
        <View style={styles.alignItemsFlexEnd}>
          <TouchableHighlight
            underlayColor="rgba(0,0,0,0.05)"
            onPress={this.onSentClicked}>
            <View
              style={[
                styles.container1,
                isSentInBoard ? styles.selectedStyles : emptyObject,
              ]}>
              <Text
                style={[
                  styles.sendTextStyle,
                  isSentInBoard ? styles.selectedTextColour : emptyObject,
                ]}>
                {isSentInBoard ? 'Sent' : 'Send'}
              </Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}
const enhanceBoardAndMembers = withObservables(['board'], ({board}) => ({
  board: board.observe(),
  members: board.members.observe(),
  recentMembers: board.recentMembers.observe(),
  owner: board.owner
    .observe()
    .pipe(switchMap((_owner) => (_owner ? _owner.contact : of$(null)))),
  creator: board.creator
    .observe()
    .pipe(switchMap((_creator) => (_creator ? _creator.contact : of$(null)))),
  message: board.lastActivity
    .observe()
    .pipe(
      switchMap((_lastActivity) =>
        _lastActivity ? _lastActivity.message : of$(null),
      ),
    ),
  post: board.lastActivity
    .observe()
    .pipe(
      switchMap((_lastActivity) =>
        _lastActivity ? _lastActivity.post : of$(null),
      ),
    ),
  workspace: board.workspace ? board.workspace.observe() : null,
}));

export const MessageItem = enhanceBoardAndMembers(_MessageItem);

const styles = StyleSheet.create({
  roomOuter: {
    backgroundColor: '#28A745',
    borderRadius: 2,
  },
  width5: {width: 5},
  left5: {left: 5},
  flexShrinkOne: {flexShrink: 1},
  container2: {
    flexDirection: 'row',
    flex: 1,
    flexShrink: 1,
    marginHorizontal: 15,
    alignItems: 'center',
  },
  flexShrinkOneMarginHorizontal0: {flexShrink: 1, marginHorizontal: 0},
  marginHorizontal15MarginVertical5: {
    marginHorizontal: 15,
    marginVertical: 5,
  },
  alignItemsFlexEnd: {alignItems: 'flex-end'},
  container1: {
    backgroundColor: '#E7F1FF',
    borderColor: '#85B7FE',
    borderWidth: 1,
    borderRadius: 4,
    alignContent: 'flex-end',
  },
  selectedStyles: {
    borderColor: '#BDC1C6',
    backgroundColor: '#EFF0F1',
  },
  selectedTextColour: {color: '#BDC1C6'},
  flexShrinkOneMarginHorizontal15: {
    flexShrink: 1,
    marginHorizontal: 15,
  },
  flexOneColumn: {
    flexDirection: 'column',
    flex: 1,
  },
  boardItemMainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 15,
    flex: 1,
  },
  flexOne: {flex: 1, alignItems: 'flex-end'},
  startButtonInnerView: {
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    backgroundColor: '#85B7FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  startButton: {
    marginTop: 10,
    height: 60,
    alignItems: 'center',
    flexDirection: 'row',
  },
  textAlignCenter: {textAlign: 'center'},
  seperator: {borderColor: '#E4E5E7', borderWidth: 0.5},
  mainContainer: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginBottom: 5,
    alignItems: 'center',
  },
  marginTop10: {marginTop: 10},
  safeAreaView: {flex: 1, backgroundColor: 'white'},
  inputView: {
    borderRadius: 4,
    padding: normalize(2),
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: normalize(10),
    marginHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderColor: '#BDC1C6',
    borderWidth: 1,
    alignItems: 'center',
    flexDirection: 'row',
  },
  prevStyle: {
    flex: 1,
    textAlignVertical: 'center',
    fontWeight: '500',
    fontSize: normalize(14),
    color: '#202124',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  circle: {
    height: normalize(30),
    width: normalize(30),
    borderRadius: normalize(15),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  componentTextStyle: {
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    lineHeight: normalize(19),
  },
  fileNameTextStyle: {
    fontWeight: '400',
    fontSize: normalize(18),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
    paddingVertical: 10,
  },
  fileTypeTextStyle: {
    fontWeight: '400',
    fontSize: normalize(10.4),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  fullNameTextStyle: {
    fontWeight: '600',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    lineHeight: normalize(20),
    color: '#333333',
  },
  createdOnTextStyle: {
    fontWeight: '400',
    fontSize: normalize(12),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    lineHeight: normalize(16),
    color: '#605E5C',
  },
  searchTextInputStyle: {
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
    flex: 1,
    paddingLeft: 10,
  },
  textStyle: {
    fontSize: normalize(16),
    fontWeight: '500',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    marginLeft: 10,
  },
  existingThreadsTextStyle: {
    marginVertical: 15,
    marginHorizontal: 10,
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    lineHeight: normalize(16),
    color: '#202124',
  },
  boardTitleStyle: {
    marginHorizontal: 10,
    fontWeight: '500',
    fontSize: normalize(15),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    lineHeight: normalize(17),
    color: '#202124',
  },
  roomTextStyle: {
    marginHorizontal: 5,
    marginVertical: 3,
    color: '#ffffff',
    fontWeight: '500',
    fontSize: normalize(9),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    lineHeight: normalize(9.68),
  },
  membersListTextStyle: {
    fontWeight: '400',
    fontSize: normalize(12),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#605E5C',
  },
  sendTextStyle: {
    marginHorizontal: 15,
    marginVertical: 5,
    color: '#07377F',
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    lineHeight: normalize(20),
  },
});
