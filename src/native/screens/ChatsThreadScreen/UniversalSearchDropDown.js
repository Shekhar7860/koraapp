import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TouchableHighlight,
} from 'react-native';
import {Icon} from '../../components/Icon/Icon';
import {ResourceState} from '../../realm/dbconstants';
import * as Constants from '../../components/KoraText';
import {normalize} from '../../utils/helpers';
import {Avatar} from '../../components/Icon/Avatar';
import {getTimeline} from '../../utils/helpers';
import {navigate} from '../../../native/navigation/NavigationService';
import {ROUTE_NAMES} from '../../../native/navigation/RouteNames';
import {RoomAvatar} from '../../components/RoomAvatar';
import * as UsersDao from '../../../dao/UsersDao';
import {colors} from '../../theme/colors';
import {msgTimelineObj} from '../../components/Chat/helper';
import {emptyArray} from '../../../shared/redux/constants/common.constants';
import {isEqual} from 'lodash';
import {connect} from 'react-redux';
import database from '../../../native/realm';
import {Q} from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import * as Entity from '../../../native/realm/dbconstants';
import { ThreadsListViewItem } from './chats-thread';
import { ThreadsListViewSearchItem } from './ThreadListSearchItem';

class UniversalSearchDropDown extends Component {
  constructor(props) {
    super(props);
    // const result = this.searchText(this.props?.query) || [];

    this.state = {
      data: [],
      searchData: [],
    };
    this.currentUserId = UsersDao.getUserId();
  }

  getLastMessageText(lastActivitySend, item) {
    let lastText = '';
    const lastActivity = item.lastActivity?.post || item.lastActivity?.message;
    try {
      const sender =
        lastActivity?.author?.id === this.currentUserId
          ? 'You'
          : lastActivity?.author.fN;

      if (lastActivity?.components[0]?.componentType === 'timeline') {
        const {
          actionTakerText,
          actionReceiverText,
          middleText,
          postText,
        } = msgTimelineObj(lastActivity?.components[0].componentData,this.currentUserId);
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
    if (comp?.componentData.eventInitiator.userId === this.currentUserId) {
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
      comp?.componentData?.eventType == 'thread_member_left'
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
  onPressItem = (item) => {
    if (item.type === 'discussion') {
      navigate(ROUTE_NAMES.DISCUSSION, {board: item});
    } else {
      navigate(ROUTE_NAMES.CHAT, {thread: item});
    }
  };

  init = async () => {
    try {
      // this.setState({
      //   searchData: [],
      // });
      console.log('query ', this.props.query);
      const db = database.active;
      const boardsCollection = db.collections.get(Entity.Boards);
      // const boardSearched = await boardsCollection
      //   .query(
      //     Q.where('name', Q.like(`${Q.sanitizeLikeString(this.props.query)}%`)),
      //   )
      //   .fetch();
        let searchString = '%' + this.props.query + '%';

        const results = await boardsCollection
        .query(
        Q.unsafeSqlQuery(
        'SELECT * from Boards where name LIKE ? or id IN ' +
        '(SELECT member_board_id from BoardMembers where contact_id IN ' +
              '(SELECT id from Contacts where fN LIKE ? OR lN LIKE ?))' +
              ' order by type asc, name asc',
            [searchString, searchString, searchString],
        ),
        )
        .fetch();

        // const resultsOtherThanGroup = await boardsCollection
        // .query(
        // Q.unsafeSqlQuery(
        // 'SELECT * from Boards where type != ? AND id IN ' +
        // '(SELECT member_board_id from BoardMembers where contact_id IN ' +
        // '(SELECT id from Contacts where fN LIKE ? OR lN LIKE ?))',
        //     ['directChat', searchString, searchString],
        // ),
        // )
        // .fetch();
        console.log('searchString ', searchString, results);
        
      this.setState({
        searchData: [...results],
      });

      // this.setState({searchData: boardSearched});
    } catch (e) {
      console.log(e);
    }
  };

  onThreadClick = (data) => {
    if (data?.board?.type === 'discussion') {
      navigate(ROUTE_NAMES.DISCUSSION, {
        board: data?.board,
      });
      return;
    }
    navigate(ROUTE_NAMES.CHAT, {board_id: data?.board?.id});
  };

  renderItemWithImages = (item) => {
    return (<ThreadsListViewSearchItem
      board={item.item}
      index={item.index}
      searchWord={this.props.query}
      onThreadClick={this.onThreadClick}
  />);
    // const lastActivity = item.lastActivity?.post || item.lastActivity?.message;

    // // var isDiscussion = false;
    // // if (item?.type === 'discussion') {
    // //   isDiscussion = true;
    // // }
    // // var lastMessage = '';
    // // var tName = '';
    // // var participants = [];
    // // tName =
    // //   item?.name?.trim().length > 0
    // //     ? item?.name
    // //     : item?.recentMembers
    // //       .filter((a) => a && a.id !== userAuth.getUserId())
    // //       .map((a) => a && (a.fN !== null ? a.fN : a.lN))
    // //       .join(', ');
    // // if (tName !== null && tName.endsWith(', '))
    // //   tName = tName.substring(0, tName.length - 1);
    // // participants = item?.recentMembers;
    // // lastMessage = this.getLastMessageText(item?.lastActivity, item);
    // const starredStatus = item?.star;

    // let muteOn = false;
    // let till = item?.notifications?.mute?.till;
    // if (till) {
    //   muteOn = new Date() < new Date(till);
    // }

    // const hasNotifcation = item?.unreadCount > 0;
    // var isDraft = false;
    // let lastMessageText = this.getLastMessageText(lastActivity, item);
    // if (lastActivity?.messageState === ResourceState.DRAFT) {
    //   isDraft = true;
    //   lastMessageText = '';
    // }
    // let profileIcon = null;
    // let userId = null;
    // var tName =
    //   item?.name?.trim().length > 0
    //     ? item?.name
    //     : item?.recentMembers?.length === 2 && item?.type === 'groupChat'
    //     ? item?.recentMembers
    //         .filter((a) => a && a.id !== UsersDao.getUserId())
    //         .map((a) => a && (a.fN !== null ? a.fN : a.lN))
    //         .join('')
    //     : item?.recentMembers?.length > 2
    //     ? item?.recentMembers
    //         .filter((a) => a && a.id !== UsersDao.getUserId())
    //         .map((a) => a && (a.fN !== null ? a.fN : a.lN))
    //         .join(', ')
    //     : '';
    // if (tName !== null && tName.endsWith(', '))
    //   tName = tName.substring(0, tName.length - 1);
    // var participants = item?.recentMembers || emptyArray;
    // participants = participants.filter(function (el) {
    //   return el != null;
    // });
    // const isDiscussion = item.type === 'discussion';
    // var workSpaceName = '';
    // const isGroupChat = item?.lastActivity?.message?.groupMessage || false;
    // if (isDiscussion) {
    //   tName = item?.name;
    // } else if (
    //   (tName === null || tName === undefined || tName?.trim().length < 1) &&
    //   participants &&
    //   participants?.length === 2
    // ) {
    //   //item?.type === 'directChat'
    //   if (UsersDao.getUserId() === participants[0].id) {
    //     tName = participants[1].fN + ' ' + participants[1].lN;
    //     profileIcon = participants[1].icon;
    //     userId = participants[1].id;
    //   } else {
    //     tName = participants[0].fN + ' ' + participants[0].lN;
    //     profileIcon = participants[0].icon;
    //     userId = participants[0].id;
    //   }
    // }

    // // let isDiscussion = false;

    // // switch (item?.type) {
    // //   case 'directChat':
    // //   case 'groupChat':
    // //     if (participants && participants?.length === 2) {
    // //       if (UsersDao.getUserId() === participants[0].id) {
    // //         tName = participants[1].fN + ' ' + participants[1].lN;
    // //         profileIcon = participants[1].icon;
    // //         userId = participants[1].id;
    // //       } else {
    // //         tName = participants[0].fN + ' ' + participants[0].lN;
    // //         profileIcon = participants[0].icon;
    // //         userId = participants[0].id;
    // //       }
    // //     }
    // //     break;
    // //   case 'discussion':
    // //     tName = item?.name;
    // //     isDiscussion = true;
    // //     break;
    // //   default:
    // //     break;
    // // }

    // //Filter lastActivity not null
    // if (!isDiscussion && !lastActivity) {
    //   return <></>;
    // }
    // const topicName = tName;

    // if (topicName.trim() === '') {}

    // return (
    //   <TouchableHighlight
    //     underlayColor="rgba(0,0,0,0.05)"
    //     onPress={() => {
    //       this.onPressItem(item);
    //     }}
    //     style={{
    //       display: 'flex',
    //       flexDirection: 'row',
    //       borderRadius: 4,
    //       paddingHorizontal: 10,
    //       paddingVertical: 5,
    //     }}>
    //     <>
    //       <View
    //         style={{
    //           justifyContent: 'center',
    //           alignItems: 'flex-start',
    //           paddingTop: 1,
    //           paddingBottom: 1,
    //           width: '16%',
    //           marginTop: 2,
    //           marginBottom: 2,
    //         }}>
    //         {isDiscussion ? (
    //           <RoomAvatar boardIcon={item.logo || emptyArray} />
    //         ) : (
    //           <Avatar
    //             profileIcon={profileIcon}
    //             userId={userId}
    //             name={topicName}
    //             groupMembers={participants || emptyArray}
    //             isGroupChat={item?.type === 'groupChat' || false}
    //             membersCount={item?.membersCount}
    //           />
    //         )}
    //       </View>
    //       <View
    //         style={{
    //           flexDirection: 'column',
    //           justifyContent: 'space-around',
    //           flex: 1,
    //           padding: 3,
    //           flexShrink: 1,
    //         }}>
    //         <View
    //           style={{
    //             flexDirection: 'row',
    //             justifyContent: 'space-between',
    //             paddingVertical: 3,
    //             alignItems: 'center',
    //             flexShrink: 1,
    //           }}>
    //           <View
    //             style={{
    //               flexDirection: 'row',
    //               justifyContent: 'flex-start',
    //               alignItems: 'center',
    //               // paddingVertical: 3,
    //               paddingRight: 10,
    //               flexShrink: 1,
    //             }}>
    //             {item?.name.length === 0 && (
    //               <CustomText
    //                 numberOfLines={1}
    //                 ellipsizeMode="tail"
    //                 titleFont={styles.topicNameTextStyle}
    //                 searchFont={styles.searchMessageTextStyle}
    //                 text={topicName}
    //                 searchWord={this.props.searchMeta}>
    //                 {topicName}
    //               </CustomText>
    //             )}

    //             {isDiscussion ? (
    //               <CustomText
    //                 numberOfLines={1}
    //                 ellipsizeMode="tail"
    //                 titleFont={styles.topicNameTextStyle}
    //                 searchFont={styles.searchMessageTextStyle}
    //                 text={topicName}
    //                 searchWord={this.props.searchMeta}>
    //                 {topicName}
    //               </CustomText>
    //             ) : item?.name?.length > 0 ? (
    //               <CustomText
    //                 numberOfLines={1}
    //                 ellipsizeMode="tail"
    //                 titleFont={styles.topicNameTextStyle}
    //                 searchFont={styles.searchMessageTextStyle}
    //                 text={topicName}
    //                 searchWord={this.props.searchMeta}>
    //                 {topicName}
    //               </CustomText>
    //             ) : (
    //               <Text style={styles.nbsp}>&nbsp;</Text>
    //             )}

    //             {/*  {isDiscussion && (
    //               <Text
    //                 style={{
    //                   color: '#FFFFFF',
    //                   backgroundColor: '#28A745',
    //                   fontWeight: '600',
    //                   padding: 4,
    //                   minWidth: 33,
    //                   marginEnd: 5,
    //                   borderRadius: 3,
    //                   textAlign: 'center',
    //                   fontSize: normalize(8),
    //                   marginStart: 10,
    //                 }}>
    //                 Room
    //               </Text>
    //             )} */}

    //             {/* {starredStatus ? (
    //               <Icon name={'Favourite'} size={13} color={'#FFDA2D'} />
    //             ) : null} */}
    //           </View>
    //           <CustomText
    //             numberOfLines={1}
    //             ellipsizeMode="tail"
    //             titleFont={styles.draftMessageTextStyle}
    //             searchFont={styles.searchMessageTextStyle}
    //             text={
    //               isDiscussion && lastActivity?.lastModified
    //                 ? getTimeline(lastActivity?.lastModified, 'discList')
    //                 : !isDraft
    //                 ? lastActivity?.sentOn
    //                   ? getTimeline(lastActivity?.sentOn, 'thread')
    //                   : ''
    //                 : '[Draft]'
    //             }
    //             searchWord={this.props.searchMeta}>
    //             {isDiscussion
    //               ? getTimeline(lastActivity?.lastModified, 'discList')
    //               : !isDraft
    //               ? lastActivity?.sentOn
    //                 ? getTimeline(lastActivity?.sentOn, 'thread')
    //                 : ''
    //               : '[Draft]'}
    //           </CustomText>
    //           {/* 
    //           <Text style={styles.draftMessageTextStyle}>
    //             {/* {!isDraft
    //             ? item?.lastActivity?.sentOn
    //               ? getTimeline(item?.lastActivity?.sentOn, 'thread')
    //               : ''
    //             : '[Draft]'} */}

    //           {/* </Text> */}
    //         </View>
    //         <View
    //           style={{
    //             flexDirection: 'row',
    //             justifyContent: 'space-between',
    //             paddingVertical: 2.3,
    //             alignItems: 'center',
    //           }}>
    //           <View style={styles.messageParentStyle}>
    //             <Text
    //               numberOfLines={1}
    //               ellipsizeMode="tail"
    //               style={styles.messageTextStyle}>
    //               {lastMessageText}
    //             </Text>
    //           </View>
    //           <View style={{flexDirection: 'row', alignItems: 'center'}}>
    //             {muteOn ? <Icon name={'Mute'} size={18} /> : null}
    //             {hasNotifcation ? (
    //               <View
    //                 style={{
    //                   width: 45,
    //                   display: 'flex',
    //                   flexDirection: 'row',
    //                   justifyContent: 'flex-end',
    //                 }}>
    //                 <View
    //                   style={{
    //                     borderRadius: 25 / 2,
    //                     backgroundColor: 'red',
    //                     width: 25,
    //                     height: 25,
    //                     padding: 3,
    //                     borderWidth: 1,
    //                     borderColor: '#DD3646',
    //                     justifyContent: 'center',
    //                     alignContent: 'center',
    //                     alignItems: 'center',
    //                   }}>
    //                   <Text style={styles.unseenMarkerTextStyle}>
    //                     {item?.unreadCount}
    //                   </Text>
    //                 </View>
    //               </View>
    //             ) : null}
    //           </View>
    //         </View>
    //       </View>
    //     </>
    //   </TouchableHighlight>
    // );
  };

  renderRecentItem = (data) => {
    var tName =
      data?.name.trim().length > 0
        ? data?.name
        : data?.recentMembers
            .filter((a) => a && a.id !== this.currentUserId)
            .map((a) => a && (a.fN !== null ? a.fN : a.lN))
            .join(', ');
    if (tName !== null && tName.endsWith(', '))
      tName = tName.substring(0, tName.length - 1);
    const topicName = tName;
    let participants = data?.recentMembers;

    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => {}}>
          <Icon name={'Future'} size={24} />
        </TouchableOpacity>
        <View style={styles.content}>
          <View style={styles.contentHeader}>
            <Text style={styles.name}>{topicName}</Text>
          </View>
          {/* <Text rkType='primary3 mediumLine'>{Notification.comment}</Text> */}
        </View>
        <TouchableOpacity onPress={() => {}}>
          <Icon name={'cross'} size={24} />
        </TouchableOpacity>
      </View>
    );
  };

  componentDidUpdate(prevProps) {
    if (prevProps.query !== this.props.query) {
      this.init();
    }
    if (prevProps.searchMeta !== this.props.searchMeta) {
      const result = this.searchText(this.props.searchMeta);
      if (result.length > 0) {
        // this.setState({searchData: result});
      }
    }
  }

  searchText = (query) => {
    //override suggestion filter, we can search by specific attributes
    query = query?.toUpperCase();
    let searchResults = this.state.data.filter((s) => {
      if (!s.name) {
        return true;
      }
      var name = s.name;
      return name?.toUpperCase().includes(query);
    });
    return searchResults;

    // if (searchResults.length === 0) {
    //   this.setState({searchData: this.state.data});
    // } else {
    //   this.setState({searchData: searchResults});
    // }
  };
  FlatListItemSeparator = () => {
    return <View style={styles.separator} />;
  };
  renderEmptyComponent = () => {
    return (
      <View
        style={{
          alignItems: 'center',
        }}>
        <Text>No results found</Text>
      </View>
    );
  };
  render() {
    const data = this.state.searchData || emptyArray;
    return (
      <FlatList
        // nestedScrollEnabled={true}
        style={styles.root}
        data={data}
        ListEmptyComponent={this.renderEmptyComponent}
        extraData={this.state}
        ItemSeparatorComponent={this.FlatListItemSeparator}
        keyExtractor={(item) => {
          return item.id;
        }}
        renderItem={(item) => {
          // const data = item?.item;
          return this.renderItemWithImages(item);
          //  return {
          //     this.props.item === 'recent'
          //       ? this.renderItemWithImages(data)
          //       : this.renderRecentItem(data)
          //   }
        }}
      />
    );
  }
}
const mapStateToProps = (state) => {
  let {native} = state;
  return {
    searchMeta: native.searchHeaderText,
  };
};

export default connect(mapStateToProps, {})(UniversalSearchDropDown);

const styles = StyleSheet.create({
  actionButtonContainer: {
    backgroundColor: '#07377F',
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#EFF0F1',
  },
  actionButtonTextStyle: {
    color: '#FFFFFF',
    fontSize: normalize(14),
    fontWeight: '400',
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
    fontWeight: '600',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
  },
  cancelTextStyle: {
    color: '#DD3646',
    fontSize: normalize(16),
    fontWeight: '600',
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
    fontWeight: '500',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  topicNameTextStyle: {
    fontSize: normalize(16),
    paddingRight: 5,
    flexShrink: 1,
    fontWeight: '600',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
  },
  bottomModal: {flexDirection: 'column', borderRadius: 4},
  textContainer: {
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 11,
    borderBottomWidth: 0.4,
    borderColor: '#9AA0A6',
    marginBottom: 9,
    flexShrink: 1,
    flexDirection: 'row',
  },
  nbsp: {
    fontSize: normalize(18),
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
    fontFamily: Constants.fontFamily,
  },
  draftMessageTextStyle: {
    fontSize: normalize(14),
    color: colors.koraGray,
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  unseenMarkerTextStyle: {
    color: 'white',
    fontWeight: 'bold',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
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
  searchMessageTextStyle: {
    fontSize: normalize(16),
    paddingRight: 5,
    flexShrink: 1,
    fontWeight: '600',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#0D6EFD',
  },
  messageParentStyle: {
    flexDirection: 'row',
    maxWidth: '100%',
    flexShrink: 1,
  },
});
