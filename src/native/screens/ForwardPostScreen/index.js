import React from 'react';
import {
  StyleSheet,
  View,
  TouchableHighlight,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
import {SafeAreaView} from 'react-native-safe-area-context';
import {memberListToText, normalize} from '../../utils/helpers';
import {Header} from '../../navigation/TabStacks';
import {Avatar} from '../../components/Icon/Avatar';
import {getTimeline} from '../../utils/helpers';
import {Icon} from '../../components/Icon/Icon';
import {FlatList} from 'react-native';
import {RoomAvatar} from '../../components/RoomAvatar';
import * as Constants from '../../components/KoraText';
import {forwardPost} from './../../../shared/redux/actions/discussions.action';
import {PostComponent} from './../../components/PostsComponent/Post';
import {navigate} from '../../navigation/NavigationService';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
import {withTranslation} from 'react-i18next';
import {showToast} from '../../core/ErrorMessages';
import * as UsersDao from '../../../dao/UsersDao';
import {
  emptyArray,
  emptyObject,
} from '../../../shared/redux/constants/common.constants';
import * as ContactsDao from '../../../dao/ContactsDao';
import * as BoardsDao from '../../../dao/BoardsDao';
import {debounce} from 'lodash';
import {SvgIcon} from '../../components/Icon/SvgIcon.js';
import {ChatLoadingIndicator} from '../../components/Chat/ForwardMessag';
import database from '../../../native/realm';
import {Q} from '@nozbe/watermelondb';
import {sanitizedRaw} from '@nozbe/watermelondb/RawRecord';
import * as Entity from '../../../native/realm/dbconstants';
import {BoardItem} from './BoardItemForward';
import {MessageItem} from './MessageItemForward';
// const BoardItem = React.memo(
//   ({
//     id,
//     logo,
//     workspaceLogo,
//     boardTitle,
//     membersList,
//     isSentInBoard,
//     membersCount,
//     t = (s) => {
//       return s;
//     },
//     onSentClicked = () => {},
//   },isEqual) => {
//     // const {t} = useTranslation();
//     const [membersListStr, changeMembersListStr] = React.useState('');

//     React.useEffect(() => {
//       let membersListMap = membersList.map((member) => {
//         if (typeof member === 'string') {
//           return ContactsDao.getContact(member);
//         } else {
//           return member;
//         }
//       });

//       changeMembersListStr(memberListToText(membersListMap, membersCount, t));
//     }, [membersList, t, membersCount]);

//     return (
//       <View key={id} style={styles.boardItemMainContainer}>
//         <View>
//           <RoomAvatar showCircle={true} boardIcon={logo} />
//         </View>
//         <View style={styles.flexOneColumn}>
//           <View style={styles.container2}>
//             <RoomAvatar
//               size={10}
//               showCircle={false}
//               boardIcon={workspaceLogo}
//             />
//             <Icon
//               style={styles.left5}
//               name={'Right_Direction'}
//               size={10}
//               color={'#202124'}
//             />
//             <Text
//               numberOfLines={1}
//               style={[styles.boardTitleStyle, styles.flexShrinkOne]}>
//               {boardTitle}
//             </Text>
//            {/*  <View style={styles.width5} />
//             <View style={styles.roomOuter}>
//               <Text style={[styles.roomTextStyle, styles.flexShrinkOne]}>
//                 Room
//               </Text>
//             </View> */}
//           </View>
//           <View style={styles.marginHorizontal15MarginVertical5}>
//             <Text numberOfLines={1} style={styles.membersListTextStyle}>
//               {membersListStr}
//             </Text>
//           </View>
//         </View>
//         <View style={styles.alignItemsFlexEnd}>
//           <TouchableHighlight
//             underlayColor="rgba(0,0,0,0.05)"
//             onPress={onSentClicked}>
//             <View
//               style={[
//                 styles.container1,
//                 isSentInBoard ? styles.selectedStyles : emptyObject,
//               ]}>
//               <Text
//                 style={[
//                   styles.sendTextStyle,
//                   isSentInBoard ? styles.selectedTextColour : emptyObject,
//                 ]}>
//                 {isSentInBoard?t('Sent'):t('Send')}
//               </Text>
//             </View>
//           </TouchableHighlight>
//         </View>
//       </View>
//     );
//   },
// );

// const MessageThreadItem = React.memo(
//   ({
//     id,
//     logo,
//     workspaceLogo,
//     boardTitle,
//     membersList,
//     isSentInBoard,
//     type,
//     recentMembers = [],
//     isGroupChat = false,
//     membersCount = 0,
//     t = (s) => {
//       return s;
//     },
//     onSentClicked = () => {},
//   }) => {
//     const [membersListStr, changeMembersListStr] = React.useState('');

//     React.useEffect(() => {
//       let membersListMap = membersList.map((member) => {
//         if (typeof member === 'string') {
//           return ContactsDao.getContact(member);
//         } else {
//           return member;
//         }
//       });

//       changeMembersListStr(memberListToText(membersListMap, membersCount, t));
//     }, [membersList, t, membersCount]);
//     const userId = UsersDao.getUserId();
//     var titleName =
//       boardTitle !== '' && boardTitle !== undefined ? boardTitle : null;
//     let names = recentMembers
//       .filter(
//         (a) =>
//           a?.id !== undefined && a?.emailId !== undefined && a?.id !== userId,
//       )
//       .map((a) =>
//         a?.fN !== undefined && a?.lN !== undefined
//           ? a?.fN + ' ' + a?.lN
//           : a?.emailId,
//       )
//       .join(', ')
//       .trim();
//     if (
//       type === 'directChat' &&
//       (titleName === null || titleName === undefined)
//     ) {
//       titleName = recentMembers
//         .filter((a) => a.id !== undefined && a.id !== userId)
//         .map((a) => a.emailId)
//         .join(', ')
//         .trim();

//       let temp = names;
//       names = titleName;
//       titleName = temp;
//     }
//     return (
//       <View key={id} style={styles.boardItemMainContainer}>
//         <View>
//           <Avatar
//             name={titleName?.toUpperCase()}
//             groupMembers={recentMembers}
//             isGroupChat={isGroupChat}
//             membersCount={membersCount}
//           />
//         </View>
//         <View style={styles.flexOneColumn}>
//           <View style={styles.flexShrinkOneMarginHorizontal15}>
//             <Text
//               numberOfLines={1}
//               style={[
//                 styles.boardTitleStyle,
//                 styles.flexShrinkOneMarginHorizontal0,
//               ]}>
//               {titleName || membersListStr}
//             </Text>
//           </View>
//           <View style={styles.marginHorizontal15MarginVertical5}>
//             <Text numberOfLines={1} style={styles.membersListTextStyle}>
//               {isGroupChat ? membersListStr : names}
//             </Text>
//           </View>
//         </View>
//         <View style={styles.alignItemsFlexEnd}>
//           <TouchableHighlight
//             underlayColor="rgba(0,0,0,0.05)"
//             onPress={onSentClicked}>
//             <View
//               style={[
//                 styles.container1,
//                 isSentInBoard ? styles.selectedStyles : emptyObject,
//               ]}>
//               <Text
//                 style={[
//                   styles.sendTextStyle,
//                   isSentInBoard ? styles.selectedTextColour : emptyObject,
//                 ]}>
//                 {isSentInBoard ? t('Sent') : t('Send')}
//               </Text>
//             </View>
//           </TouchableHighlight>
//         </View>
//       </View>
//     );
//   },
// );

class ForwardPost extends React.Component {
  constructor(props) {
    super();
    this.state = {
      searchName: '',
      sentInBoardsFlag: {},
      showPreview: false,
      isLoading: false,
      allBoards: [],
      resultBoards:[],
    };
    // console.log('all boards', props.route.params?.boardId);
    // this.allBoards = BoardsDao.getBoardsShare(props.route.params?.boardId);
    // console.log('all boards', this.allBoards);
    // this.boards = this.allBoards;
  }

  componentDidMount() {
    this.subscribeBoards();
  }

  get post() {
    return this.props.route.params.post || emptyObject;
  }
  get boardId() {
    return this.props.route.params.boardId || emptyObject;
  }

  startButtonOnPress = () => {
    navigate(ROUTE_NAMES.ADD_PARTICIPANTS_FORWARD_POSTS, {
      post: this.post,
      boardId: this.boardId,
    });
  };

  renderStartThreadButton() {
    const {t} = this.props;
    return (
      <TouchableHighlight
        underlayColor="rgba(0,0,0,0.05)"
        style={styles.startButton}
        onPress={this.startButtonOnPress}>
        <View style={styles.startButtonView}>
          <View style={styles.startButtonInnerView}>
            <SvgIcon name="Specific" />
          </View>
          <Text style={styles.textStyle}>{t('Start a new Chat')}</Text>
          <View style={styles.flexOne}>
            <Icon name={'Right_Direction'} size={16} color="#202124" />
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  subscribeBoards = () => {
    try {
      const db = database.active;

      // if (this.boardsSubscription && this.boardsSubscription.unsubscribe) {
      //   this.boardsSubscription.unsubscribe();
      // }
      const types = ['directChat', 'groupChat', 'discussion'];
      const whereClause = [
        Q.where('type', Q.oneOf(types)),
        Q.experimentalSortBy('sortTime', Q.desc),
      ];
    //  const whereClause = [Q.experimentalSortBy('laMod', Q.desc)];

      this.boardsObservable = db.collections
        .get(Entity.Boards)
        .query(...whereClause)
        .observeWithColumns(['updated_at']);
      this.boardsSubscription = this.boardsObservable.subscribe((boards) => {
        this.setState({ resultBoards: boards.slice(0, 50), allBoards: boards });
      });
    } catch (e) {
      console.log('ThreadListView error : ', e);
    }
  };

  onSentClicked = (item) => () => {
    const {t} = this.props;

    let id = item?.boardId || item?.id;
    let type = item?.type;
    let wsId = item?.wsId;
    const {parentId, postId} = this.post;
    let {sentInBoardsFlag} = this.state;
    sentInBoardsFlag[id] = true;
    this.setState({sentInBoardsFlag}, () => {
      let payload = {
        forwardTo: [
          {
            boardId: id,
            boardType: type,
            ...(wsId ? {wsId: wsId} : {}),
          },
        ],
        boardType: 'discussion',
        boardId: parentId,
        messages: [postId],
      };
      let currentUserId = UsersDao.getUserId();
      let params = {userId: currentUserId};
      this.setState({loading: true});
      this.props.forwardPost(
        params,
        payload,
        () => {
          showToast(t('Post forwarded'));
          this.setState({loading: false});
        },
        () => this.setState({loading: false}),
      );
    });
  };

  renderItem = ({item}) => {
    const {t} = this.props;
    let {sentInBoardsFlag} = this.state;
    const {parentId, postId} = this.post;

    if (!item) {
      return null;
    }
    const {id, type, wsId} = item;
    const isSentInBoard = sentInBoardsFlag[id];

    if (type === 'discussion') {
      let {
        logo,
        wsId,
        name: boardTitle,
        recentMembers = [],
        members,
        membersCount,
        workspace,
      } = item;
      // console.log(
      //   'BOARD TITEL',
      //   boardTitle,
      //   'members\n',
      //   members,
      //   '\nRECENT\n',
      //   recentMembers,
      // );
      console.log('Board item', boardTitle);
      return (
        <BoardItem
          board={item}
          // t={t}
          // id={id}
          logo={logo}
          // wsId={wsId}
          // type={type}
          // membersList={members}
          // workspaceLogo={workspace?.logo}
          // membersCount={membersCount}
          boardTitle={boardTitle}
          isSentInBoard={isSentInBoard}
          onSentClicked={this.onSentClicked(item)}
        />
      );
    } else {
      return (
        <MessageItem
          board={item}
          // t={t}
          // id={id}
          // wsId={wsId}
          // type={type}
          // membersList={members}
          // workspaceLogo={workspace?.logo}
          // membersCount={membersCount}
          // boardTitle={boardTitle}
          isSentInBoard={isSentInBoard}
          onSentClicked={this.onSentClicked(item)}
        />
      );
      // let {
      //   logo,
      //   wsId,
      //   name = '',
      //   members,
      //   recentMembers = [],
      //   membersCount,
      //   lastActivity = {},
      // } = item;
      // let membersList = '';

      // return (
      //   <MessageThreadItem
      //     t={t}
      //     id={id}
      //     membersCount={membersCount}
      //     membersList={recentMembers}
      //     isGroupChat={membersCount > 2}
      //     type={type}
      //     recentMembers={recentMembers}
      //     boardTitle={name}
      //     isSentInBoard={isSentInBoard}
      //     onSentClicked={this.onSentClicked(item)}
      //   />
      // );
    }
  };

  filterList = debounce((searchText) => {
    let threadsList = Array.from(this.state?.allBoards) || [];

    if (searchText && searchText !== '') {
      threadsList = threadsList?.filter((item) => {
        var recentMemberItems = null;
        if(item?.members?.filter){
        recentMemberItems = item?.members?.filter((user) => {
          if (user.id !== null && user.id !== undefined) {
            let contact = user;
            let fullName = contact?.fN + ' ' + contact?.lN;
            let email = contact?.emailId || '';
            if (
              fullName.toUpperCase().indexOf(searchText.toUpperCase()) > -1 ||
              (email.toUpperCase().indexOf(searchText.toUpperCase()) > -1 &&
                contact.id !== UsersDao.getUserId())
            ) {
              return contact;
            }
          }
        });
      }

        if (
          (item && item.name &&
            item.name !== '' &&
            String(item.name?.toUpperCase()).indexOf(searchText.toUpperCase()) >
              -1) ||
          (recentMemberItems && recentMemberItems.length > 0)
        ) {
          return item;
        }
      });
    }
    threadsList.sort(function (a, b) {
      return a.type !== 'directChat';
    });
    if (searchText?.length === 0) {
      this.boards = this.state.allBoards;
    } else {
      this.boards = threadsList;
    }
    this.setState({
      resultBoards: this.boards.slice(0, 50),
    });
    this.forceUpdate();
  }, 100);

  keyExtractor = (item) => item?.id;

  renderListEmptyComponent = () => (
    <Text style={styles.textAlignCenter}>No Match Found</Text>
  );

  renderExistingThread() {
    return (
      <FlatList
        data={this.state.resultBoards}
        keyExtractor={this.keyExtractor}
        extraData={JSON.stringify(this.state.sentInBoardsFlag)}
        renderItem={this.renderItem}
        ListEmptyComponent={this.renderListEmptyComponent}
      />
    );
  }

  textChangeTriggered = (inputText) => {
    this.setState({searchName: inputText}, () => this.filterList(inputText));
  };

  renderSearchSection() {
    const {t} = this.props;
    return (
      <View style={styles.inputView}>
        <Icon name={'Contact_Search'} size={18} color={'#9AA0A6'} />
        <TextInput
          placeholder={t('Search people, chats & rooms')}
          maxLength={30}
          placeholderTextColor="#9AA0A6"
          onChangeText={this.textChangeTriggered}
          value={this.state.searchName}
          style={styles.searchTextInputStyle}
        />
      </View>
    );
  }

  renderHeader() {
    const {t} = this.props;
    return (
      <Header
        title={t('Forward Post')}
        goBack={true}
        navigation={this.props.navigation}
      />
    );
  }

  renderSeperator() {
    return <View style={styles.seperator} />;
  }
  setShowPreview = () => {
    this.setState({showPreview: !this.state.showPreview});
  };
  render() {
    const {t} = this.props;
    return (
      <SafeAreaView style={styles.safeAreaView}>
        {this.renderHeader()}
        {this.renderSeperator()}
        <View style={styles.marginTop10}>
          <View style={styles.mainContainer}>
            <Text style={styles.prevStyle}>{t('Preview')}</Text>
            <TouchableOpacity
              style={styles.circle}
              onPress={this.setShowPreview}>
              <Icon
                color={'grey'}
                name={this.state.showPreview ? 'Dropdown-Up' : 'Dropdown_Down'}
                size={normalize(20)}
              />
            </TouchableOpacity>
          </View>
          {this.state.showPreview && (
            <PostComponent post={this.post} hideButtons={true} />
          )}
        </View>
        {this.renderSearchSection()}
        {this.renderStartThreadButton()}
        <Text style={styles.existingThreadsTextStyle}>
          {t('Existing threads')}
        </Text>
        {this.state.loading ? <ChatLoadingIndicator /> : null}
        {this.renderExistingThread()}
      </SafeAreaView>
    );
  }
}

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

// const mapStateToProps = (state) => {
//   const {discussion, workspace, } = state;
//   return {
//     activeWsId: workspace.activeWsId,
//   };
// };

export default connect(null, {forwardPost})(withTranslation()(ForwardPost));
