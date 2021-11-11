import React from 'react';
import {
  KeyboardAvoidingView,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import {SafeAreaView, BackHandler} from 'react-native';
import {connect} from 'react-redux';
import {Q} from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import {of as of$} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {normalize} from '../../../utils/helpers';
import {selectedContactList} from '../../../../shared/redux/actions/create-message.action';
import {
  createPost,
  getAllPosts,
  markAsRead,
} from '../../../../shared/redux/actions/discussions.action';
import {getAllWSMembers} from '../../../../shared/redux/actions/workspace.action';
import MessageComposebar from '../../../components/Composebar/MessageComposebar';
import {Icon} from '../../../components/Icon/Icon';
import * as Constants from '../../../components/KoraText';
import PostsComponent from '../../../components/PostsComponent';
import DiscussionMoreOptions from './discussionMoreOptions';
import {RoomAvatar} from '../../../components/RoomAvatar';
import {navigate, goBack} from '../../../navigation/NavigationService';
import {ROUTE_NAMES} from '../../../navigation/RouteNames';
import {isIOS} from '../../../utils/PlatformCheck';
import {discussionsACL} from '../../../core/AccessControls';
import {setActiveBoard} from '../../../../shared/redux/actions/message-thread.action';
import {
  emptyArray,
  emptyObject,
} from '../../../../shared/redux/constants/common.constants';
import * as PostsDao from '../../../../dao/PostsDao';
import MessageUploadQueue from '../../FileUploader/MessageUploadQueue';
import {LOADING_MORE_POSTS} from '../../../../shared/redux/constants/native.constants';
import {postPayload} from '../../../../helpers';
import database from '../../../../native/realm';
import * as Entity from '../../../../native/realm/dbconstants';
import {upsertNewPost} from '../../../../dao/updatePosts';
import {loadMessagesToState} from '../../../../helpers';
import AccountManager from '../../../../shared/utils/AccountManager';
class DiscussionPostsScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      boards: {},
      sendingMessage: null,
      searchMode: false,
      searchText: '',
      board: {},
      mute: {},
      boardMembers: null,
      posts: [],
      loadFresh: false,
      isFromNotification: false,
    };
    this.searchInput = React.createRef();
    this.moreOptions = React.createRef();
    this.messageComposebarRef = React.createRef();
  }

  get board() {
    return this.props.route?.params?.board;
  }

  backAction = () => {
    if (this.props.route?.params?.isFromNotificationTab) {
      goBack();
      /* navigate(ROUTE_NAMES.FINDLY, {
        screen:ROUTE_NAMES.KORA_NOTIFICATIONS
      }); */
      navigate(ROUTE_NAMES.FINDLY, {
        screen:ROUTE_NAMES.KORA_NOTIFICATIONS
      });
      return true;
    } else {
      return false;
    }
  };
  boardMembersFromDb = async (board) => {
    let member = await board.members.fetch();
    this.setState({boardMembers: member});
  };
  componentDidUpdate(prevProps, prevState) {
    if (this.props.route?.params?.isFromNotification) {
      const {navigation} = this.props;
      navigation.setParams({
        isFromNotification: false,
      });
      const {board} = this.props.route?.params;
      //  console.log('componentDidUpdate this.board   ------->:', board);
      if (board) {
        // this.setState({loadFresh: true});
        this.loadBoardToScreen();
      }
    }
    if (prevProps.goToPostDetail?.posts !== this.props?.goToPostDetail?.posts) {
      this.setState({loadFresh: true});
    }
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.backAction,
    );
    this.loadBoardToScreen();
  }

  loadBoardToScreen = () => {
    this.boardMembersFromDb(this.board);

    let postTypes = ['default', 'timeline','email'];
    const whereClause = [
      Q.where('board_id', this.board?.id),
      Q.where('postType', Q.oneOf(postTypes)),
      Q.experimentalSortBy('deliveredOn', Q.desc),
    ];

    this.messagesObservable = database.active.collections
      .get(Entity.Posts)
      .query(...whereClause)
      .observe();
    this.messagesSubscription = this.messagesObservable.subscribe((posts) => {
      const posts_ = loadMessagesToState(posts);
      this.setState({posts: posts_, loadFresh: true});
      this.markBoardAsRead();
    }, console.log);
  };

  componentWillUnmount() {
    this.backHandler.remove();
    if (this.messagesSubscription && this.messagesSubscription.unsubscribe) {
      this.messagesSubscription.unsubscribe();
    }
  }

  markBoardAsRead = async () => {
    const {board} = this.props.route?.params;
    const boardId = board?._id;

    if (board?.unreadCount > 0) {
      try {
        let lastActivity = await board.lastActivity.fetch();
        let lastPost = await lastActivity.post.fetch();

        let params = {
          rId: boardId,
        };
        let payload = {
          markReadPostId: lastPost?.postId,
        };
        this.props.markAsRead(params, payload);
      } catch (error) {
        console.log('error in markAsRead : ', error);
      }
    }
  };

  searchAction() {
    const searchMode = this.state.searchMode;
    this.setState({searchText: ''});
    if (searchMode) {
      this.child.searchFunctionCalled('', false);
    }
    this.setState(
      {
        searchMode: !searchMode,
      },
      () => {
        if (!searchMode) {
          this.searchInput.current.focus();
        }
      },
    );
  }

  filterAction() {
    this.child.filterActionClick();
  }

  callTextChanged(text) {
    this.child.searchFunctionCalled(text, true);
    this.setState({searchText: text});

    this.setState({
      searchMode: text === undefined ? false : true,
    });
  }

  editPost = async (composebarObj) => {
    try {
      const {wsId, id} = this.board;
      const post = composebarObj.post;
      let components = await post.components.fetch();
      const componentId = components?.find(({componentType}) => {
        return componentType === 'text';
      })?.componentId;

      postPayload(
        {data: composebarObj, boardId: id, isEdited: true},
        async (payload) => {
          const index = payload.components?.findIndex(({componentType}) => {
            return componentType === 'text';
          });

          payload.postId = post.postId;
          payload.clientId = post.clientId;
          payload.boardId = id;
          if (componentId) {
            payload.components[index].componentId = componentId;
          }

          payload.deliveredOn = post.deliveredOn;

          let nPost = await PostsDao.upsertNewPost(payload);
          MessageUploadQueue.addPost(nPost, post);
          this.scrollToLatestPost();
        },
      );
    } catch (e) {
      console.log('error in editPost : ', e);
    }
  };

  scrollToLatestPost = () => {
    this.child?.goIndex(0);
  };

  sendPost = (obj) => {
    if (obj.post) {
      this.editPost(obj);
      return;
    }
    const {wsId, id, _id} = this.board;
    console.log('BOARD ID 1', obj);
    postPayload(
      {
        toList: [],
        boardId: _id,
        board_id: id,
        mediaList: [],
        data: obj,
      },
      (payload) => {
        try {
          this.scrollToLatestPost();
        } catch (e) {
          console.log('error in scroll');
        }
        upsertNewPost(payload)
          .then((nPost) => {
            console.log('Post : ', nPost);
            MessageUploadQueue.addPost(nPost, this.board);
          })
          .catch((error) => {
            console.log('exception in upsertNewPost: ' + error);
          });
      },
    );
  };

  onEditClicked = (post, index) => {
    const {wsId, id} = this.board;
    this.child?.goIndex(index);
    this.messageComposebarRef.current.setEditContext(post, true);
  };

  composeBarDiscardAlert = async () => {
    return new Promise(async (resolve, reject) => {
      if (this.messageComposebarRef?.current?.isAudioRecorded?.()) {
        Alert.alert(
          'Discard Message',
          'Are you sure you want to discard your changes?',
          [
            {
              text: 'Cancel',
              onPress: () => reject('cancel'),
              style: 'cancel',
            },
            {
              text: 'OK',
              onPress: () => {
                resolve('success');
              },
            },
          ],
        );
      } else {
        resolve('success');
      }
    });
  };

  clearComposebar = (data) => {
    if (this.messageComposebarRef.current) {
      this.messageComposebarRef?.current.clearAudioFromComposebar('clear');
    }
  };

  navigateToManageRoom = (board) => {
    // this.composeBarDiscardAlert()
    //   .then((data) => {
    this.clearComposebar();
    navigate(ROUTE_NAMES.ROOM_DETAILS, {
      board: board || emptyObject,
    });
    // })
    // .catch((error) => {});
  };
  navigateToFiles = (threadId, thread, titleName) => {
    this.composeBarDiscardAlert()
      .then((data) => {
        this.clearComposebar();
        navigate('View_Files', {
          threadId: threadId,
          thread: thread,
          titleName: titleName,
        });
      })
      .catch((error) => {});
  };

  onRef = (ref) => (this.child = ref);

  onRetryClick = (post) => {
    upsertNewPost(post)
      .then((nPost) => {
        MessageUploadQueue.addPost(nPost, this.board);
      })
      .catch((error) => {
        console.log('exception in upsertNewMessage: ' + error);
      });
  };

  render() {
    let {
      name,
      isAllMembers,
      wsId,
      id,

      star,
      postId,
      link,
    } = this.board;
    const dacl = discussionsACL(this.board);
    const {creator, members} = this.props;
    const {posts = []} = this.state;
    const {canSendPost} = dacl;
    let _members = members;

    //console.log('----members-------------------',JSON.stringify(_members))
    let logo = null;
    if (this.board?.logo === null && this.board?.name === 'General') {
      logo = this.board?.workspace?.logo;
    } else {
      logo = this.board?.logo;
    }

    let foundInDB;
    if (this.props?.route?.params?.universalSearch) {
      foundInDB = this.state.posts?.some(
        (item) => item.postId === this.props.gotoPostId,
      );
    }
    return (
      <SafeAreaView
        forceInset={{vertical: 'always', top: 'always', bottom: 'always'}}
        style={styles.safeArea}>
        <DiscussionMoreOptions
          ref={this.moreOptions}
          board={this.board || emptyObject}
          wsId={wsId}
          star={star}
          id={id}
          link={link}
          postId={this.state?.posts[0]?.postId}
          mute={this.state.mute || emptyObject}
          unreadCount={this.board?.unreadCount}
          titleName={name}
          navigateToFiles={this.navigateToFiles}
          navigateToManageRoom={this.navigateToManageRoom}
        />
        <KeyboardAvoidingView
          behavior={isIOS ? 'padding' : null}
          style={styles.safeArea1}>
          <TouchableWithoutFeedback style={styles.moreOptionsStyle}>
            <>
              <View style={styles.searchContainer1}>
                <TouchableOpacity
                  underlayColor="rgba(0,0,0,0.2)"
                  onPress={() => {
                    if (this.state.searchMode) {
                      this.setState({
                        searchMode: !this.state.searchMode,
                      });
                    } else {
                      if (this.props.route?.params?.isFromNotificationTab) {
                        goBack();
                      //  navigate(ROUTE_NAMES.FINDLY, {});
                      navigate(ROUTE_NAMES.FINDLY, {
                        screen:ROUTE_NAMES.KORA_NOTIFICATIONS
                      });
                      } else {
                        goBack();
                      }
                    }
                  }}
                  style={styles.searchHighlight}>
                  <Icon
                    color="#202124"
                    name="Left_Direction"
                    size={normalize(24)}
                  />
                </TouchableOpacity>
                {!this.state.searchMode ? (
                  <View style={styles.searchContainer2}>
                    <TouchableOpacity
                      style={styles.searchContainer3}
                      underlayColor="rgba(0,0,0,0.2)"
                      onPress={() =>
                        navigate(ROUTE_NAMES.ROOM_DETAILS, {
                          board: this.board || emptyObject,
                        })
                      }>
                      <View style={styles.searchContainer4}>
                        {/* <View style={styles.searchContainer5}>
                          <RoomAvatar
                            size={24}
                            wsId={this.board.wsId}
                            boardIcon={logo}
                            type={this.board?.type}
                            showCircle={false}
                          />
                        </View> */}
                        <Text
                          lineBreakMode="tail"
                          numberOfLines={1}
                          style={styles.boardNameTextStyle}>
                          {name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.marginRightSearch}
                      onPress={() => {
                        this.searchAction();
                      }}>
                      {!this.state.searchMode ? (
                        <Icon
                          name="Contact_Search"
                          size={normalize(20)}
                          color="black"
                        />
                      ) : null}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.marginRightSearch}
                      onPress={() => {
                        this.moreOptions.current.renderModal();
                      }}>
                      {!this.state.searchMode ? (
                        <Icon
                          name="options"
                          size={normalize(20)}
                          color="black"
                        />
                      ) : null}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.searchContainer}>
                    <View style={styles.searchRow}>
                      <Icon
                        name="Contact_Search"
                        size={normalize(17)}
                        color="#202124"
                      />
                      <TextInput
                        ref={this.searchInput}
                        style={styles.searchTextStyle}
                        placeholder="Search"
                        placeholderTextColor="#BDC1C6"
                        maxLength={20}
                        onChangeText={(text) => {
                          this.callTextChanged(text);
                        }}
                      />
                      {this.state.searchText?.length > 0 && (
                        <TouchableOpacity
                          onPress={() => {
                            this.searchInput.current.clear();
                            this.callTextChanged('');
                          }}>
                          <Icon
                            name="cross"
                            size={normalize(17)}
                            color="#202124"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => this.searchAction()}>
                      <Text style={styles.filterTextStyle}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <PostsComponent
                onRef={this.onRef}
                members={this.state.boardMembers}
                boardId={id}
                creator={creator}
                titleName={name}
                wsId={wsId}
                unreadCount={this.board?.unreadCount}
                activeBoardId={this.props.activeBoardId}
                moreAvailable={this.props.moreAvailable}
                loadingMore={this.props.loadingMore}
                setActiveBoard={this.props.setActiveBoard}
                wsName={this.board?.workspace?.name || ''}
                showLoader={this.props.showLoader}
                onEditClicked={this.onEditClicked}
                onRetryClick={this.onRetryClick}
                posts={posts}
                getAllPosts={this.props.getAllPosts}
                universalSearch={
                  this.props?.route?.params?.universalSearch || false
                }
                searchPostId={this.props?.gotoPostId}
              />

              {canSendPost && !this.state.searchMode && (
                <View>
                  <MessageComposebar
                    ref={this.messageComposebarRef}
                    placeholder={'Type your post'}
                    boardData={this.board}
                    isGroupChat={true}
                    contactData={this.state.boardMembers || []}
                    enableNewNotations={true}
                    onSendButtonClick={this.sendPost}
                    isShowCamera={true}
                    containerStyle={styles.composerbar_container}
                    buttons_container={styles.buttons_container}
                    sendViewStyle={styles.sendViewStyle}
                    send_button_container={styles.send_btn_container_style}
                    buttons_sub_container={styles.buttons_sub_container}
                    iconStyle={styles.iconStyle}
                  />
                </View>
              )}
            </>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  searchHighlight: {
    borderRadius: 4,
    marginLeft: 12,
    paddingLeft: 5,
    paddingRight: 5,
    marginVertical: -7,
    paddingVertical: 7,
  },
  searchContainer1: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#d9d9d9',
    borderBottomWidth: 1,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer2: {
    flexDirection: 'row',
    flex: 1,
  },
  searchContainer3: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: 7,
    paddingEnd: 7,
    borderRadius: 4,
  },
  searchContainer4: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  searchContainer5: {marginEnd: 14},
  searchRow: {
    borderWidth: 1,
    borderColor: '#E5E8EC',
    borderRadius: 8,
    flex: 1,
    marginStart: 20,
    marginEnd: 15,
    paddingStart: 10,
    paddingEnd: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  safeArea: {flex: 1, backgroundColor: 'white'},
  safeArea1: {flex: 1, backgroundColor: 'white'},
  marginRightSearch: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  boardNameTextStyle: {
    fontSize: normalize(20),
    fontWeight: '700',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    flexShrink: 1,
  },
  searchTextStyle: {
    flex: 1,
    paddingStart: 8,
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
    marginTop: 1,
    minHeight: 38,
  },
  filterTextStyle: {
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    flexShrink: 1,
    color: '#0D6EFD',
    marginEnd: 8,
  },
  moreOptionsStyle: {height: '100%'},
  iconStyle: {
    width: 36,
    height: '100%',
    alignContent: 'center',
    marginStart: 15,

    alignItems: 'center',
    borderRadius: 5,
    justifyContent: 'center',
  },
  composerbar_container: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingLeft: 15,
    paddingRight: 15,
    minHeight: 50,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#E6E7E9',
  },
  send_btn_style: {
    padding: 7,
    marginStart: 12,
    width: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  send_btn_container_style: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    height: 50,
  },

  icon_Style: {marginStart: 10},
  buttons_container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'white',
    height: 50,
  },
  buttons_sub_container: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    backgroundColor: 'white',
    height: 50,
  },
  sendViewStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    alignSelf: 'center',
    marginStart: 16,
    padding: 8,
    width: 35,
  },
});

const mapStateToProps = (state) => {
  const {messageThreadList, native, discussion, home, workspace} = state;
  const {messageBoards} = native;

  return {
    activeBoardId: messageThreadList.activeBoardId,
    moreAvailable: Boolean(discussion?.allPosts?.moreAvailable),
    loadingMore: native?.loaders[LOADING_MORE_POSTS],
    showLoader: home.showLoader,
    activeWsMembers: workspace.activeWsMembers?.members || emptyArray,
    activeWsId: workspace.activeWsId,
    allDiscussions: discussion.allDiscussions,
    filter: messageBoards.filter,
    goToPostDetail: messageThreadList.goToPostDetail,
    gotoPostId: messageThreadList.gotoPostId,
  };
};

const enhance = withObservables([], ({route}) => {
  const {board} = route.params;

  return {
    board: board.observe(),
    posts: of$([]),
    members: board.members.observe(),
    creator: board.creator
      .observe()
      .pipe(switchMap((_creator) => (_creator ? _creator.contact : of$(null)))),
  };
});

export default connect(mapStateToProps, {
  createPost,
  getAllPosts,
  markAsRead,
  getAllWSMembers,
  selectedContactList,
  setActiveBoard,
})(enhance(DiscussionPostsScreen));
