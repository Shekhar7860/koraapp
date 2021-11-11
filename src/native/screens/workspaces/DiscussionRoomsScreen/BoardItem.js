import React from 'react';
import {
  View,
  TouchableHighlight,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import withObservables from '@nozbe/with-observables';
import {of as of$} from 'rxjs';
import {switchMap, catchError} from 'rxjs/operators';

import {Icon} from '../../../components/Icon/Icon';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {BottomUpModal} from '../../../components/BottomUpModal';
import {getTimeline} from '../../../utils/helpers';
import {RoomAvatar} from '../../../components/RoomAvatar';
import * as Constants from '../../../components/KoraText';
import {withTranslation} from 'react-i18next';
import {normalize} from '../../../utils/helpers';
import {emptyArray} from '../../../../shared/redux/constants/common.constants';
import {
  DeleteThread,
  MuteThread,
  StarThread,
} from '../../ChatsThreadScreen/chats-thread';
import {SvgIcon} from '../../../components/Icon/SvgIcon.js';
import ActionItemBottomSheet from '../../../components/BottomUpModal/ActionItemBottomSheet';
import PostActivity from '../../../components/Boards/PostActivity';
const row = [];
let prevOpenedRow = null;

class ItemList extends React.Component {
  constructor(props) {
    super(props);
  }

  addSomeMinutesToTime = (startTime, minutestoAdd) => {
    const dateObj = new Date(startTime);
    const newDateInNumber = dateObj.setMinutes(
      dateObj.getMinutes() + minutestoAdd,
    );
    const processedTime = new Date(newDateInNumber).getTime();
    return processedTime;
  };

  onClickMute(data) {
    const {item} = this.props;
    const minutesTillMute = data.value || 0;
    let d = new Date();
    let n = d.toISOString();
    let muteTime = this.addSomeMinutesToTime(n, data.value || 0);
    d.setMinutes(d.getMinutes() + minutesTillMute);

    let payload = {
      mute: muteTime,
    };
    let muteData = {
      action: 'muteButton',
      _params: {
        boardId: item?.id,
        wsId: item?.wsId,
      },
      payload,
    };
    this.props.onClickActions(muteData);
    this.modal.closeBottomDrawer();
  }

  showMuteModal() {
    const {t} = this.props;
    const options = [
      {text: t('4 hours'), value: 60 * 4},
      {text: t('1 day'), value: 60 * 4},
      {text: t('1 week'), value: 60 * 24 * 7},
      {text: t('Until turned off'), value: 60 * 24 * 7 * 52},
    ];
    let name = this.props.name;
    return (
      <BottomUpModal
        ref={(x) => {
          this.modal = x;
        }}
        height={350}>
        <View style={{flexDirection: 'column', borderRadius: 4}}>
          <View
            style={{
              paddingTop: 20,
              paddingLeft: 20,
              paddingBottom: 11,
              borderBottomWidth: 0.4,
              borderColor: '#9AA0A6',
              marginBottom: 9,
            }}>
            <Text
              numberOfLines={1}
              lineBreakMode={'middle'}
              style={styles.muteTextStyle}>
              {t('Mute {{context}} for...', {context: name})}
            </Text>
          </View>
          {options.map((option) => {
            return (
              <ActionItemBottomSheet
                title={option.text}
                iconName={option.icon}
                id={option.id}
                itemType={'titleOnly'}
                optionSelected={() =>
                  this.onClickMute(option)
                }></ActionItemBottomSheet>
            );
          })}
          <ActionItemBottomSheet
            title={'Cancel'}
            itemType={'titleOnly'}
            optionSelected={() =>
              this.modal.closeBottomDrawer()
            }></ActionItemBottomSheet>
        </View>
      </BottomUpModal>
    );
  }

  onClickDelete() {
    const {item} = this.props;
    // console.log('Item ------------>: ', item);
    let deleteData = {
      action: 'deleteButton',
      _params: {
        wsId: item?.wsId,
        rId: item?.id,
      },
    };

    console.log('deleteData ------------>: ', deleteData);
    this.props.onClickActions(deleteData);
    this.deleteModal.closeBottomDrawer();
  }

  showDeleteModal() {
    const {t} = this.props;
    return (
      <BottomUpModal
        ref={(y) => {
          this.deleteModal = y;
        }}
        height={250}>
        <View style={{flexDirection: 'column'}}>
          <View
            style={{
              marginHorizontal: 20,
              marginVertical: 30,
              flexDirection: 'row',
            }}>
            <Text style={styles.deleteTextStyle}>
              {t('Are you sure? Do you really want to delete this room?')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => this.onClickDelete()}
            style={{paddingHorizontal: 15}}>
            <View
              style={{
                borderRadius: 4,
                backgroundColor: '#DD3646',
                alignItems: 'center',
              }}>
              <Text style={styles.deleteDiscussionTextStyle}>
                {t('Yes, Delete Discussion')}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.deleteModal.closeBottomDrawer();
            }}
            style={{paddingHorizontal: 15}}>
            <View
              style={{
                borderRadius: 4,
                borderWidth: 1,
                borderColor: 'grey',
                alignItems: 'center',
                marginTop: 16,
              }}>
              <Text style={{...styles.cancelTextStyle, color: '#202124'}}>
                {t('Cancel')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </BottomUpModal>
    );
  }

  onMutePress = () => {
    const {item} = this.props;
    let muteOn = false;
    let till = item?.notifications?.mute?.till;
    if (till) {
      muteOn = new Date() < new Date(till);
    }

    if (!muteOn) {
      this.modal.openBottomDrawer();
    } else {
      this.onClickMute({});
    }
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

  newRight(progress, dragX, item, muteOn, starredStatus) {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [270, 0],
    });

    return (
      <View style={styles.rightItem}>
        <Animated.View
          style={
            (styles.swipeChildStyle,
            {backgroundColor: '#07377F'},
            {transform: [{translateX: trans}]})
          }>
          <TouchableOpacity
            style={[styles.swipeChildStyle, {backgroundColor: '#07377F'}]}
            onPress={() => {
              this.closeRow(-1);
              this.onMutePress();
            }}>
            <MuteThread mute={muteOn} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={
            (styles.swipeChildStyle,
            {backgroundColor: '#0D6EFD'},
            {transform: [{translateX: trans}]})
          }>
          <TouchableOpacity
            style={[styles.swipeChildStyle, {backgroundColor: '#0D6EFD'}]}
            onPress={() => {
              this.closeRow(-1);
              let data = {
                action: 'starButton',
                _params: {
                  wsId: item?.wsId,
                  rId: item?.id,
                },
                payload: {
                  markAsStar: !item.star,
                },
                updataDiscData: {
                  // boards: this.props,
                },
              };
              this.props.onClickActions(data);
            }}>
            <StarThread star={starredStatus} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={
            (styles.swipeChildStyle,
            {backgroundColor: '#DD3646'},
            {transform: [{translateX: trans}]})
          }>
          <TouchableOpacity
            style={[styles.swipeChildStyle, {backgroundColor: '#DD3646'}]}
            onPress={() => {
              this.closeRow(-1);
              this.deleteModal.openBottomDrawer();
            }}>
            <DeleteThread />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  render() {
    const {t, item, post, creator, index} = this.props;
    const isDiscussion = item?.type === 'discussion' ? true : false;
    const swipeAction =
      item?.type === 'task' ||
      item?.type === 'document' ||
      item?.type === 'embeddedweb' ||
      item?.type === 'file' ||
      item?.type === 'table'
        ? false
        : true;

    let logo = item?.logo || emptyArray;
    let muteOn = false;
    let till = item?.notifications?.mute?.till;
    if (till) {
      muteOn = new Date() < new Date(till);
    }

    return (
      <SafeAreaView style={{flex: 1}}>
        {this.showMuteModal()}
        {this.showDeleteModal()}

        <Swipeable
          ref={(ref) => {
            row[index] = ref;
          }}
          enabled={swipeAction}
          renderRightActions={(progress, dragx) =>
            this.newRight(progress, dragx, item, muteOn, item?.star)
          }
          friction={2}
          leftThreshold={30}
          rightThreshold={10}
          useNativeAnimations={true}
          onSwipeableOpen={() => {
            this.closeRow(index);
          }}>
          <TouchableHighlight
            underlayColor="rgba(0,0,0,0.05)"
            onPress={() => {
              this.props.onThreadClick(item);
            }}
            onPressIn={() => {
              this.closeRow(index);
            }}
            style={styles.mainViewStyle}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 5,
                paddingVertical: 5,
              }}>
              {!swipeAction &&
              <View style={{marginEnd:8,justifyContent:'center'}}> 
              <RoomAvatar boardIcon={logo} size={40} type={item?.type} />
              </View>
            } 
              <View
                style={{
                  flexShrink: 1,
                  flex: 1,
                  marginBottom: 4,
                  justifyContent: 'center',
                  height: 55,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingBottom: 2,
                  }}>
                  <Text
                    numberOfLines={1}
                    style={[styles.boardNameTextStyle, {paddingRight: 5}]}>
                    {item?.name !== undefined ? item?.name : t('No Board Name')}
                  </Text>
                  {isDiscussion && (
                    <Text style={styles.timelineTextStyle}>
                      {post?.deliveredOn
                        ? getTimeline(post?.deliveredOn, 'thread')
                        : getTimeline(item?.createdOn, 'thread')}
                    </Text>
                  )}
                </View>
                <View
                  style={{
                    flexDirection: 'row',

                    flexShrink: 1,
                  }}>
                  <View
                    style={{
                      alignItems: 'center',
                      flexShrink: 1,
                    }}>
                    {isDiscussion  ? (
                      <PostActivity post={post} creator={creator} />
                    ) : null}
                  </View>
                  <View style={{flex: 1}} />
                  {isDiscussion&&(
                  <View
                    style={{
                      alignItems: 'center',
                      flexDirection: 'row',
                    }}>
                    {muteOn === true ? (
                      <>
                        <Icon name={'Mute'} size={18} />
                      </>
                    ) : null}

                    {isDiscussion&& item?.star ? (
                      <View style={{padding: 3}}>
                        <SvgIcon name="Star_Filled" width={16} height={16} />
                      </View>
                    ) : null}

                    {item?.unreadCount !== 0 && (
                      <View style={styles.unreadCountTextStyleView}>
                        <Text style={styles.unreadCountTextStyle}>
                          {item?.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                  )}
                </View>
              </View>
            </View>
          </TouchableHighlight>
        </Swipeable>
      </SafeAreaView>
    );
  }
}

ItemList.propTypes = {
  onClickActions: PropTypes.func,
};

ItemList.defaultProps = {
  onClickActions: (data) => {},
};

const enhanceBoardAndMembers = withObservables(['item'], ({item}) => ({
  item: item.observe(),
  creator: item.creator.observe().pipe(
    catchError(() => of$({})),
    switchMap((_creator) => (_creator ? _creator.contact : of$(null))),
  ),
  post: item.lastActivity
    .observe()
    .pipe(
      switchMap((_lastActivity) =>
        _lastActivity ? _lastActivity.post : of$(null),
      ),
    ),
}));

export default withTranslation()(enhanceBoardAndMembers(ItemList));

const styles = StyleSheet.create({
  textStyle: {
    color: '#FFFFFF',
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  muteTextStyle: {
    color: '#202124',
    fontSize: normalize(16),
    fontWeight: '600',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  optionTextStyle: {
    fontWeight: '500',
    fontSize: normalize(16),
    fontFamily: Constants.fontFamily,
    color: '#202124',
  },
  cancelTextStyle: {
    color: '#DD3646',
    fontWeight: '400',
    fontSize: normalize(16),
    fontFamily: Constants.fontFamily,
    marginVertical: 12,
    marginHorizontal: 30,
  },
  deleteTextStyle: {
    color: '#202124',
    flexShrink: 1,
    fontSize: normalize(16),
    fontWeight: '400',
    fontFamily: Constants.fontFamily,
  },
  deleteDiscussionTextStyle: {
    fontWeight: '400',
    fontSize: normalize(16),
    fontFamily: Constants.fontFamily,
    color: '#ffffff',
    marginVertical: 15,
    marginHorizontal: 30,
  },
  boardNameTextStyle: {
    fontSize: normalize(16),
    fontWeight: '600',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,

    flex: 2,
    textAlignVertical: 'center',
    color: '#202124',
  },
  timelineTextStyle: {
    fontSize: normalize(12),
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#5F6368',
    right: 2,
    left: 4,
    textAlign: 'center',
    marginTop: 2,

    textAlignVertical: 'center',
  },
  lastTextStyle: {
    fontSize: normalize(14),
    fontWeight: '400',
    flexShrink: 1,
    fontFamily: Constants.fontFamily,
    color: '#9AA0A6',

    paddingRight: 5,
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
  lastTextStyle2: {
    fontSize: normalize(14),
    fontWeight: '600',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
  },
  mainViewStyle: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 4,
    justifyContent: 'center',
    backgroundColor: 'white',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  unreadCountTextStyleView: {
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
  unreadCountTextStyle: {
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
  swipeChildStyle: {
    width: 90,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightItem: {
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
});
