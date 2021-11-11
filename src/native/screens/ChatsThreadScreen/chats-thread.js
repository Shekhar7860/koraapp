import React from 'react';
import {View, Text, StyleSheet, Animated, TouchableOpacity, Alert} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import withObservables from '@nozbe/with-observables';
import {of as of$} from 'rxjs';
import {switchMap, catchError} from 'rxjs/operators';
import {
  getCurrentScreenName,
  getCurrentScreenData,
  navigate,
} from '../../navigation/NavigationService';
import {Avatar} from '../../components/Icon/Avatar';
import {colors} from './../../theme/colors';
import {delteOptionsArray, getTimeline} from '../../utils/helpers';
import {Icon} from '../../components/Icon/Icon';
import PropTypes from 'prop-types';
import Placeholder from '../../components/Icon/Placeholder';
import {ResourceState} from '../../realm/dbconstants';
import * as Constants from './../../components/KoraText';
import {normalize} from '../../utils/helpers';
import {RoomAvatar} from '../../components/RoomAvatar';
import * as UsersDao from '../../../dao/UsersDao';
import {emptyArray} from '../../../shared/redux/constants/common.constants';
import {SvgIcon} from '../../components/Icon/SvgIcon.js';
import DeleteMessage from '../../components/Chat/DeleteChatItemEvent';
import MessageActivity from '../../components/Boards/MessageActivity';
import PostActivity from '../../components/Boards/PostActivity';
import WorkspaceDBItem from '../workspaces/DiscussionRoomsScreen/WorkspaceDBItem';
export const MuteThread = ({mute}) => {
  let text = mute ? 'Unmute' : 'Mute';
  let icon = mute ? 'Mute' : 'Un_Mute';
  return (
    <View style={styles.actionButtonContainer}>
      <Icon name={icon} size={24} color={'white'} />
      <Text style={styles.actionButtonTextStyle}>{text}</Text>
    </View>
  );
};

export const DeleteThread = ({text = 'Delete'}) => {
  return (
    <View style={styles.actionButtonContainer}>
      <Icon name={'Delete_T'} size={24} color={'white'} />
      <Text style={styles.actionButtonTextStyle}>{text}</Text>
    </View>
  );
};

export const StarThread = ({star}) => {
  let text = star ? 'Unstar' : 'Star';
  return (
    <View style={styles.actionButtonContainer}>
      {star ? (
        <SvgIcon name="Star_Filled" width={24} height={24} />
      ) : (
        <Icon name={'DR_Starred'} size={24} color={'white'} />
      )}
      <Text style={styles.actionButtonTextStyle}>{text}</Text>
    </View>
  );
};

const EmptyComponent = (props) => {
  const {filter} = props;
  return (
    <View style={styles.emptyContainer}>
      <Placeholder name={filter || 'messages'} />
    </View>
  );
};
const row = [];
let prevOpenedRow = null;

class _ThreadsListViewItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasWorkspace: false,
    };
    this.onDeleteThreadClick = this.onDeleteThreadClick.bind(this);
  }

  onButtonClicked(data) {
    const {board} = this.props;

    const minutesTillMute = data.value || 0;
    let d = new Date();
    d.setMinutes(d.getMinutes() + minutesTillMute);
    const payload = {
      mute: minutesTillMute !== 0 ? d.getTime() : new Date().getTime(),
    };
    let params = {
      action: 'unmuteAction',
      payload: {boardId: board?._id, requestObj: payload},
    };
    this.props.buttonAction(params);
  }

  onDeleteButtonClick = () => {
    const {board} = this.props;

    let params = {
      action: 'deleteAction',
      payload: {
        boardId: board?._id,
        type: board?.type,
      },
    };
    this.props.buttonAction(params);
    this.refs.deleteModal.closeModal();
  };

  renderDeleteMessageOption() {
    return (
      <DeleteMessage
        delteOptionsArray={delteOptionsArray}
        title="Are you sure you want to delete?"
        ref="deleteModal"
      />
    );
  }

  onMuteUnmuteButtonClick = (muteOn, boardId) => {
    this.closeRow(-1);
    if (!muteOn) {
      this.props.muteButtonClicked(boardId);
    } else {
      this.onButtonClicked({});
    }
  };

  onStarUnStarButtonClick = (boardId, starredStatus) => {
    this.closeRow(-1);
    let params = {
      action: 'starAction',
      payload: {
        boardId: boardId,
        starStatus: !starredStatus,
      },
    };
    this.props.buttonAction(params);
  };

  onDeleteThreadClick() {
    this.closeRow(-1);
    this.refs?.deleteModal?.openModal(
      (onPannelStatus) => {},
      (element) => {
        switch (element.key) {
          case 1:
            this.onDeleteButtonClick();
            break;
          case 2:
            break;
          case 3:
            break;
        }
      },
    );
  }

  newRight(progress, dragX, boardId, isGroupChat, muteOn, starredStatus) {
    return (
      <View style={styles.rightItem}>
        <Animated.View
          style={
            (styles.swipeChildStyle,
            {backgroundColor: '#07377F'},
            {
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: !isGroupChat ? [270, 0] : [180, 0],
                  }),
                },
              ],
            })
          }>
          <TouchableOpacity
            style={styles.swipeChildStyle3}
            onPress={() => {
              this.onMuteUnmuteButtonClick(muteOn, boardId);
            }}>
            <MuteThread mute={muteOn} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={
            (styles.swipeChildStyle,
            {backgroundColor: '#0D6EFD'},
            {
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: !isGroupChat ? [180, 0] : [90, 0],
                  }),
                },
              ],
            })
          }>
          <TouchableOpacity
            style={styles.swipeChildStyle1}
            onPress={() => {
              this.onStarUnStarButtonClick(boardId, starredStatus);
            }}>
            <StarThread star={starredStatus} />
          </TouchableOpacity>
        </Animated.View>

        {!isGroupChat && (
          <Animated.View
            style={
              (styles.swipeChildStyle,
              {backgroundColor: '#DD3646'},
              {
                transform: [
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [90, 0],
                    }),
                  },
                ],
              })
            }>
            <TouchableOpacity
              style={styles.swipeChildStyle2}
              onPress={() => this.onDeleteThreadClick()}>
              <DeleteThread />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    );
  }

  renderSwiprRightItem = () => {
    // console.log('Render swipe right in chat-thread.js 1');
    return (
      <View style={styles.rightItem}>
        <TouchableOpacity style={styles.deleteButtonStyle}>
          <Text style={styles.textButtonStyle}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.archiveButtonStyle}>
          <Text style={styles.archiveTextButtonStyle}>Archive</Text>
        </TouchableOpacity>
      </View>
    );
  };

  closeRow(index) {
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow.close();
    }

    if (index !== -1) {
      prevOpenedRow = row[index];
    } else {
      prevOpenedRow = null;
      for (let i = 0; i < row.length; i++) {
        if (row[i]) {
          row[i].close();
        }
      }
    }
  }

  renderAvatar(board, showLogo, profileIcon, userId, topicName, participants) {
    const isDiscussion = board?.type === 'discussion';
    const params = getCurrentScreenData()?.params;
    let showDRIcon = ['muted', 'unread', 'starred'];
    if (showDRIcon.includes(params?.queryItem?.id)) {
      if (isDiscussion) {
        return (
          <View style={{paddingHorizontal: 7}}>
            <SvgIcon name="DR_Icon" width={45} height={45} />
          </View>
        );
      } else {
        return (
          <View
            style={{paddingHorizontal: board?.type === 'groupChat' ? 3 : 6}}>
            <Avatar
              profileIcon={profileIcon}
              userId={userId}
              name={topicName}
              groupMembers={participants || emptyArray}
              isGroupChat={board?.type === 'groupChat' || false}
              membersCount={board?.membersCount}
            />
          </View>
        );
      }
    } else if (params?.queryItem?.id === 'chats') {
      return (
        <View style={{paddingHorizontal: board?.type === 'groupChat' ? 3 : 6}}>
          <Avatar
            profileIcon={profileIcon}
            userId={userId}
            name={topicName}
            groupMembers={participants || emptyArray}
            isGroupChat={board?.type === 'groupChat' || false}
            membersCount={board?.membersCount}
          />
        </View>
      );
    }
  }

  render() {
    const {
      board,
      recentMembers,
      //workspace,
      creator,
      message,
      post,
      index,
    } = this.props;
    const isDiscussion = board?.type === 'discussion';
    const params = getCurrentScreenData()?.params;
    let showDRIcon = ['chats', 'muted', 'unread', 'starred'];
    const starredStatus = board?.star;
    let muteOn = false;
    let till = board?.notifications?.mute?.till;
    if (till) {
      muteOn = new Date() < new Date(till);
    }

    const hasNotifcation = board?.unreadCount > 0;
    var isDraft = false;
    let lastMessageText = '';
    if (message?.messageState === ResourceState.DRAFT) {
      isDraft = true;
      lastMessageText = '';
    }

    let profileIcon = null;
    let userId = null;
    var directChat = board?.type == 'directChat';
    var topicName =
      board?.name?.trim().length > 0
        ? board?.name
        : recentMembers
            ?.filter?.((a) =>
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
            .join?.(', ');

    if (topicName !== null && topicName?.endsWith?.(', '))
      topicName = topicName.substring(0, topicName.length - 1);
    if (
      topicName !== null &&
      topicName !== undefined &&
      topicName !== '' &&
      board?.name?.trim?.().length <= 0 &&
      board?.membersCount > 3 &&
      recentMembers
    ) {
      topicName +=
        ' and ' + (board?.membersCount - recentMembers?.length) + ' others';
    }
    var participants = recentMembers || emptyArray;
    participants = participants.filter?.(function (el) {
      return el != null;
    });

    const isGroupChat = message?.groupMessage || false;
    if (isDiscussion) {
      topicName = board?.name;
    } else if (
      (topicName === null ||
        topicName === undefined ||
        topicName?.trim?.().length < 1) &&
      participants &&
      participants?.length === 2
    ) {
      if (UsersDao.getUserId() === participants[0]?.id) {
        topicName = participants[1].fN + ' ' + participants[1].lN;
        profileIcon = participants[1].icon;
        userId = participants[1].id;
      } else {
        topicName = participants[0].fN + ' ' + participants[0].lN;
        profileIcon = participants[0].icon;
        userId = participants[0].id;
      }
    }
    // Filter lastActivity not null
    if (!post && !message) {
      return <></>;
    }
    let showLogo = '';
    if (board?.logo === null && board?.name === 'General') {
      //showLogo = workspace?.logo;
    } else {
      showLogo = board?.logo;
    }
    return (
      <>
        {this.renderDeleteMessageOption()}
        <Swipeable
          ref={(ref) => {
            row[index] = ref;
          }}
          renderRightActions={(progress, dragx) =>
            this.newRight(
              progress,
              dragx,
              board?._id,
              isGroupChat,
              muteOn,
              starredStatus,
            )
          }
          friction={1.5}
          leftThreshold={5}
          rightThreshold={10}
          useNativeAnimations={true}
          overshootLeft={false}
          overshootRight={false}>
          <TouchableOpacity
            onPressIn={() => {
              this.closeRow(index);
            }}
            onPress={() => {
             // Alert.alert('hiii')
              this.props.onThreadClick({board});
            }}
            style={
              isDiscussion
                ? styles.mainContainerDiscussion
                : styles.mainContainerMessages
            }>
            <>
              <View style={[styles.mainContainerSub1]}>
                {this.renderAvatar(
                  board,
                  showLogo,
                  profileIcon,
                  userId,
                  topicName,
                  participants,
                )}
              </View>
              <View style={styles.mainContainerSub2}>
                {isDiscussion ? (
                  <WorkspaceDBItem
                    id={board?.wsId}
                    fromMenu={false}
                    hasWorkspace={(booleanValue) => {
                      this.setState({hasWorkspace: booleanValue});
                    }}
                  />
                ) : null}

                <View style={styles.workSpaceTextStyle1}>
                  <View style={styles.workSpaceTextStyle2}>
                    {topicName?.length > 0 ? (
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[
                          styles.topicNameTextStyle,
                          isDiscussion && this.state.hasWorkspace
                            ? {fontWeight: '500', fontSize: normalize(14)}
                            : {
                                fontWeight: '600',
                                fontSize: normalize(16),
                              },
                        ]}>
                        {topicName}
                      </Text>
                    ) : (
                      <Text style={styles.nbsp}>&nbsp;</Text>
                    )}
                  </View>
                  <Text style={styles.draftMessageTextStyle}>
                    {isDiscussion
                      ? getTimeline(board?.sortTime, 'thread')
                      : !isDraft
                      ? message?.sentOn
                        ? getTimeline(board?.sortTime, 'thread')
                        : ''
                      : '[Draft]'}
                  </Text>
                </View>
                <View style={styles.draftMessageTextStyle1}>
                  <View style={styles.draftMessageTextStyle2}>
                    {message ? (
                      <MessageActivity message={message} creator={creator} />
                    ) : post ? (
                      <PostActivity post={post} creator={creator} />
                    ) : (
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={styles.messageTextStyle}
                      />
                    )}
                  </View>
                  <View style={styles.draftMessageTextStyle3}>
                    {starredStatus ? (
                      <View
                        style={
                          hasNotifcation || muteOn
                            ? {
                                marginEnd:
                                  hasNotifcation && muteOn
                                    ? 12
                                    : muteOn
                                    ? 26
                                    : hasNotifcation
                                    ? 10
                                    : 0,
                              }
                            : {position: 'absolute', right: 0}
                        }>
                        <SvgIcon name="Star_Filled" width={16} height={16} />
                      </View>
                    ) : null}
                    {muteOn ? (
                      <View
                        style={[
                          {
                            alignItems: 'center',
                            justifyContent: 'center',
                          },
                          hasNotifcation
                            ? {marginEnd: 12}
                            : {position: 'absolute', right: 0},
                        ]}>
                        <Icon name={'Mute'} size={18} />
                      </View>
                    ) : null}
                    {hasNotifcation ? (
                      <View style={styles.draftMessageTextStyle4}>
                        <View style={styles.draftMessageTextStyle5}>
                          <Text style={styles.unseenMarkerTextStyle}>
                            {board?.unreadCount}
                          </Text>
                        </View>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            </>
          </TouchableOpacity>
        </Swipeable>

        <View style={styles.draftMessageTextStyle6} />
      </>
    );
  }
}

const enhanceBoardAndMembers = withObservables(['board'], ({board}) => ({
  board: board.observe(),
  // members: board.members.observe().pipe(catchError(() => of$([]))),
  recentMembers: board.recentMembers.observe().pipe(catchError(() => of$([]))),
  // owner: board.owner.observe().pipe(
  //   catchError(() => of$({})),
  //   switchMap((_owner) => (_owner ? _owner.contact : of$(null))),
  // ),
  creator: board.creator.observe().pipe(
    catchError(() => of$({})),
    switchMap((_creator) => (_creator ? _creator.contact : of$(null))),
  ),
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
  // workspace: board.workspace ? board.workspace.observe() : null,
}));

export const ThreadsListViewItem = enhanceBoardAndMembers(_ThreadsListViewItem);

ThreadsListViewItem.propTypes = {
  buttonAction: PropTypes.func,
};
ThreadsListViewItem.defaultProps = {
  buttonAction: (data) => {},
};

const styles = StyleSheet.create({
  actionButtonContainer: {
    flex: 1,
    height: '100%',
    paddingBottom: 5,
    paddingTop: 10,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  actionButtonTextStyle: {
    color: '#FFFFFF',
    fontSize: normalize(14),
    fontWeight: '200',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  emptyContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteTextStyle: {
    color: '#202124',
    flexShrink: 1,
    fontSize: normalize(16),
    fontWeight: '600',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  deleteOptionTextStyle: {
    fontSize: normalize(16),
    fontWeight: '500',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: colors.koraAlertNegative,
  },
  cancelTextStyle: {
    color: colors.koraAlertPositive,
    fontSize: normalize(16),
    fontWeight: '500',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  topicContainerTextStyle: {
    color: '#202124',
    fontSize: normalize(16),
    fontWeight: '600',
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
  },
  topicOptionTextStyle: {
    color: '#202124',
    fontWeight: 'bold',
    fontStyle: 'normal',
    fontSize: normalize(16),
    fontFamily: Constants.fontFamily,
  },
  topicNameTextStyle: {
    paddingRight: 5,
    flexShrink: 1,
    fontWeight : '900',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    
    color: '#202124',
  },
  workSpaceTextStyle: {
    fontSize: normalize(12),
    marginLeft: 5,
    paddingRight: 5,
    flexShrink: 1,
    color: colors.koraGray,
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  workSpaceTextStyle1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // paddingVertical: 3,
    alignItems: 'center',
    flexShrink: 1,
  },
  workSpaceTextStyle2: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    // paddingVertical: 3,
    paddingRight: 10,
    flexShrink: 1,
  },
  nbsp: {
    fontSize: normalize(16),
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  messageTextStyle: {
    fontSize: normalize(14),
    flexShrink: 1,
    paddingRight: 50,
    fontWeight: '400',
    fontStyle: 'normal',
    color: '#5F6368',
    fontFamily: Constants.fontFamily,
  },
  draftMessageTextStyle: {
    fontSize: normalize(14),
    color: colors.koraGray,
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  draftMessageTextStyle1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2.3,
    alignItems: 'center',
  },
  draftMessageTextStyle2: {
    flexDirection: 'row',
    maxWidth: '100%',
    flexShrink: 1,
  },
  draftMessageTextStyle3: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    minWidth: 20,
  },
  draftMessageTextStyle4: {
    height: 30,
    //width: 35,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  draftMessageTextStyle5: {
    borderRadius: 25 / 2,
    backgroundColor: '#DD3646',
    minWidth: 25,
    height: 25,
    borderWidth: 1,
    borderColor: '#DD3646',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  draftMessageTextStyle6: {
    height: 1,
    backgroundColor: '#EFF0F1',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginBottom: 2,
    marginTop: 2,
    marginEnd: 10,
    marginStart: 10,
  },
  unseenMarkerTextStyle: {
    fontSize: normalize(12),
    fontWeight: 'bold',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#fff',
    paddingEnd: 2,
    paddingStart: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 5,
  },
  mainContainerMessages: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 4,
    justifyContent: 'center',
    backgroundColor: 'white',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  mainContainerDiscussion: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 4,
    justifyContent: 'center',
    backgroundColor: 'white',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 7,
    paddingBottom: 0,
  },
  mainContainerSub1: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 3,
  },
  mainContainerSub2: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'space-around',
    padding: 3,
    paddingLeft: 5,
    flexShrink: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-around',
    flexDirection: 'column',
    backgroundColor: '#eee',
  },
  titleWrapper: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    marginLeft: 20,
    color: 'black',
    marginVertical: 20,
  },
  leftItem: {
    flex: 1,
    backgroundColor: '#76a21e',
    justifyContent: 'center',
  },
  archiveButtonStyle: {
    width: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3e64ff',
  },
  archiveTextButtonStyle: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  textButtonStyle: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  deleteButtonStyle: {
    width: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#c00000',
  },
  swipeChildStyle: {
    width: 90,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeChildStyle1: {
    backgroundColor: '#0D6EFD',
    width: 90,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeChildStyle2: {
    backgroundColor: '#DD3646',
    width: 90,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeChildStyle3: {
    backgroundColor: '#07377F',
    width: 90,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightItem: {
    // width: 270,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  leftItemText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    color: '#fff',
  },
  listItemWrapper: {
    flex: 1,
    flexDirection: 'column',
  },

  listItem: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderTopWidth: 0.6,
    borderBottomWidth: 0.6,
    borderBottomColor: '#ccc',
    borderTopColor: '#ccc',
    flex: 1,
    height: 60,
    backgroundColor: '#fff',
  },
  item2: {
    flex: 4,
    justifyContent: 'center',
  },
  item: {
    flex: 2,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  textBtn: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  btn: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    width: '80%',
    margin: 5,
    alignSelf: 'center',
  },
  description: {
    fontSize: 16,
    color: '#000',
  },
  listFooter1: {height: 20},
  listFooter2: {flex: 1},
  bottomUpModal1: {
    borderRadius: 4,
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginHorizontal: 10,
    paddingVertical: 6,
  },
  bottomUpModal2: {paddingLeft: 20, paddingVertical: 8},
  muteStyle1: {flexDirection: 'column', borderRadius: 4},
  muteStyle2: {
    paddingTop: 20,
    paddingLeft: 20,
    paddingBottom: 11,
    borderBottomWidth: 0.4,
    borderColor: '#9AA0A6',
    marginBottom: 9,
  },
  muteStyle3: {
    borderRadius: 4,
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginHorizontal: 10,
    paddingVertical: 16,
  },
  muteStyle4: {paddingLeft: 20, paddingVertical: 16},
  threadListParent1: {flexGrow: 1},
  threadListParent2: {backgroundColor: 'white'},
});
