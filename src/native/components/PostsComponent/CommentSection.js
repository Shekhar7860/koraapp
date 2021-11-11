import React from 'react';
import {
  StyleSheet,
  View,
  TouchableHighlight,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Keyboard,
  BackHandler,
  FlatList,
} from 'react-native';
import {connect} from 'react-redux';
import {BottomUpModal} from './../BottomUpModal';
import {Icon} from '../Icon/Icon';
import {getTimeline} from '../../utils/helpers';
import {MultiEmoji} from '../Chat/MessageView';
import {decode} from 'html-entities';
import MessageComposebar from '../Composebar/MessageComposebar';
import {Header} from '../../navigation/TabStacks';
import userAuth from '../../../shared/utils/userAuth';
import {Avatar} from '../Icon/Avatar';
import {withTranslation, useTranslation} from 'react-i18next';
import {
  getComments,
  replyPost,
  replyComment,
  reactPost,
  reactComment,
  getReplies,
} from '../../../shared/redux/actions/discussions.action';
import KoraKeyboardAvoidingView from '../KoraKeyboardAvoidingView';
import * as Constants from '../KoraText';
import {normalize} from '../../utils/helpers';
import {SectionList} from 'react-native';
import PostComponent from './Post';
import {RoomAvatar} from '../RoomAvatar';
import {ReactionWithText} from '../ReactionWithText';
import {store} from '../../../shared/redux/store';
import {
  setCommentId,
  setPostId,
} from '../../../shared/redux/actions/native.action';
import {
  emptyArray,
  emptyObject,
} from '../../../shared/redux/constants/common.constants';
import {MultiComponentView} from '../Chat/extras/MultiComponentView';
import {emojiDetailsModalRef} from '../EmojiDetails';
import {KoraParsedText} from './../../components/KoraParsedText';
import {getBoardFromDb} from '../../../shared/redux/actions/message-thread.action';
import {Boards} from '../../realm/dbconstants';
import {navigate, goBack} from '../../navigation/NavigationService';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
import {postPayload} from '../../../helpers';
import * as PostsDao from '../../../dao/PostsDao';
import MessageUploadQueue from '../../screens/FileUploader/MessageUploadQueue';
import {singleAttachementPreview} from '../../screens/ChatScreen/SingleAttachementPreview';
import {Q} from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import {of as of$} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import database from '../../realm';
import * as Entity from '../../realm/dbconstants';
import * as BoardsDao from '../../../dao/BoardsDao';
const openMediaView = (components, titleName, index, postId) => {
  console.log('media view opened');
  // console.log('media view opened', components);

  if (components) {
    let newComponents = [];
    components?.map((data) => {
      if (
        data?._raw.componentType === 'image' ||
        data?._raw.componentType === 'video' ||
        data?._raw.componentType === 'audio' ||
        data?._raw.componentType === 'attachment'
      ) {
        let componentData = JSON.parse(data?._raw.componentData);

        let obj = {
          ...data?._raw,
          filename: componentData.filename,
          componentData: componentData,
        };
        newComponents.push(obj);
      }
    });
    if (newComponents.length > 0) {
      singleAttachementPreview(newComponents, postId, (status) => {
        if (!status) {
          navigate(ROUTE_NAMES.CHAT_MEDIA_VIEW, {
            components: newComponents,
            messageId: postId,
            titleName: titleName,
            selectedComponentID: index,
          });
        }
      });

      // navigate(ROUTE_NAMES.CHAT_MEDIA_VIEW, {
      //   components: post.components,
      //   messageId: post.postId,
      //   titleName: titleName,
      //   selectedComponentID: index,
      // });
    }
  }
};

const enhance = withObservables(['item'], ({item}) => ({
  item: item?.observe()||of$(null),
  components: item?.components ? item?.components?.observe() : null,
  author: item?.author?.observe()
    .pipe(switchMap((_author) => (_author ? _author.contact : of$(null)))),
  from: item?.from?.observe()
    .pipe(switchMap((author) => (author ? author.contact : of$(null)))),
}));

const _ReplyComponent = ({
  item,
  onLongPress,
  reactionLongPress,
  author,
  from,
  components,
}) => {
  const {
    sadCount,
    shockCount,
    likeCount,
    laughCount,
    angerCount,
    unlikeCount,
    commentCount,
  } = item;
  const multiEmojiObj = {
    sadCount,
    shockCount,
    likeCount,
    laughCount,
    angerCount,
    unlikeCount,
  };
  let showMultiEmoji = false;
  const sum = Object.values(multiEmojiObj).reduce((a, b) => a + b, 0);

  if (!isNaN(sum)) {
    if (sum > 0) {
      showMultiEmoji = true;
    }
  }
  return (
    <TouchableOpacity onLongPress={onLongPress} style={styles.mainContent1}>
      <Avatar
        profileIcon={author?.icon}
        userId={author?.id}
        name={author?.fN + ' ' + author?.lN}
        color={author?.color}
        rad={normalize(24)}
        textSize={normalize(12)}
        type={'offline'}
      />
      <View style={styles.mainContent2}>
        <View style={styles.mainContent3}>
          <Text style={styles.mainContent4}>
            {author?.fN + ' ' + author?.lN}
          </Text>
          <View style={styles.mainContent5} />
          <Text style={styles.timelineTextstyle}>
            {getTimeline(item.createdOn, 'time')}
          </Text>
        </View>
        <MessageContent data={item} components={components} />
        {showMultiEmoji > 0 && (
          <>
            <View style={styles.mainContent6} />
            <View style={styles.mainContent7}>
              <ReactionWithText onLongPress={reactionLongPress} data={item} />
              <MultiEmoji
                data={multiEmojiObj}
                sumPosition="right"
                border={false}
              />
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const ReplyComponent = enhance(_ReplyComponent);

const FooterComponent = React.memo(() => (
  <View style={styles.itemFooterStyle} />
));

const MessageContent = ({data = {}, components = []}) => {
  const {t} = useTranslation();
  let textComponent = '';
  let imageURI = '';
  let fileName = '';
  let type = '';
  let mediaComponents = [];
  for (let i = 0; i < Object.keys(components).length; i++) {
    const component = components[i];
    if (component.componentType === 'text') {
      textComponent = component.componentBody || emptyArray;
    } else {
      mediaComponents.push(component);
    }
  }

  const openMediaViewCB = React.useCallback(
    (index) => {
      let postId = data?._raw?.postId;
      openMediaView(mediaComponents, '', index, postId);
      //console.log('mediaComponents  ------------>:', mediaComponents);
    },
    [data],
  );

  return (
    <View style={styles.messageContentView}>
      {textComponent?.length > 0 && (
        <KoraParsedText
          atMentionStyle={false}
          isDR={true}
          style={styles.componentTextStyle}>
          {decode(textComponent)}
        </KoraParsedText>
      )}
      {/*   <Text style={styles.componentTextStyle}>{textComponent}</Text> */}
      {mediaComponents.length > 0 && (
        <MultiComponentView
          particularMediaClick={openMediaViewCB}
          borderRadius={10}
          components={mediaComponents}
        />
      )}
    </View>
  );
};

class CommentSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      commentId: props.route.params.post.postId,
      type: '',
      members: [],
      post: null,
      comments: [],
    };
    this.timer = null;
    this.commentRef = React.createRef();
    this.messageRef = React.createRef();
  }

  get postData() {
    return this.props.route.params.post || emptyObject;
  }
  get boardId() {
    return this.props.route.params.boardId || emptyObject;
  }

  getBoardMembers = async (boardId) => {
    var board = await BoardsDao.getSingleBoard(boardId);
    let member = await board.members.fetch();
    this.setState({members: member});
  };

  
  
  componentWillUnmount() {
    

    clearTimeout(this.timer);
    this.props.setCommentId('');
    this.props.setPostId('');
    if (this.messagesSubscription && this.messagesSubscription.unsubscribe) {
      this.messagesSubscription.unsubscribe();
    }
this.backHandler.remove();
    // this.postData &&
    //   this.postData?.removeAllListeners &&
    //   this.postData?.removeAllListeners();
  }
  backAction = () => {
    if (this.props.route?.params?.isFromNotificationTab) {
      goBack();
     // navigate(ROUTE_NAMES.FINDLY, {});
     navigate(ROUTE_NAMES.FINDLY, {
      screen:ROUTE_NAMES.KORA_NOTIFICATIONS
    });
      return true;
    } else {
      return false;
    }
  };



  observeComments = () => {
    //postType
    // const whereClause = [
    //   Q.where('parentId', this.props.route.params.post.postId)
    //   ,
    // ];

    const whereClause = [ Q.and(
      Q.where('parentId', this.props.route.params.post.postId),
      Q.where('postType', 'comment'),
    )];

    this.messagesObservable = database.active.collections
      .get(Entity.Posts)
      .query(...whereClause)
      .observe();
    this.messagesSubscription = this.messagesObservable.subscribe(
      (comments) => {
        if(comments){
        this.setState({comments});
        }
      },
    );
  };

  componentDidMount() {
    this.getBoardMembers(this.boardId);
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.backAction,
    );

    this.computePosts();
    this.observeComments();
    this.timer = setTimeout(
      () => this.messageRef?.current?.focusOnInput(),
      300,
    );
  }

  componentDidUpdate(prevProps) {
    if (this.props.route?.params?.isFromNotification) {
      // console.log(
      //   'this.props.route?.params?.isFromNotification  Comment Section------------->: ',
      //   this.props.route?.params?.isFromNotification,
      // );
      const {navigation} = this.props;
      navigation.setParams({
        isFromNotification: false,
      });
      this.computePosts();
    }
  }

  computePosts = () => {
    this.props.setPostId(this.postData.postId);
    // if (this.postData.commentCount || this.props?.post?.commentCount) {
    let _params = {
      postId: this.postData.postId,
      wsId: this.postData.wsId,
      rId: this.boardId,
      offset: 0,
      limit: 10,
    };
    this.props.getComments(_params);
    return;
    // let payload = {
    //   boardId: this.boardId,
    // };
    // store.dispatch(
    //   getBoardFromDb(payload, (type, board) => {
    //     if (type) {
    //       this.setState({
    //         members: board.members?.filter(function (e) {
    //           return (e != null && e?.fN) || e?.lN;
    //         }),
    //       });
    //     }
    //   }),
    // );

    // this.postData &&
    //   this.postData?.addListener((p) => {
    //     console.log('POST', p.commentCount);
    //     this.setState({post: p});
    //     // this.forceUpdate();
    //   });
  };

  get post() {
    return this.state.post;
  }

  rightHeaderIcon() {
    return (
      <TouchableOpacity
        underlayColor="rgba(0,0,0,0.05)"
        onPress={() => {}}
        style={styles.headerIconStyle}>
        <Icon
          style={{transform: [{rotate: '90 deg'}]}}
          name={'MoreFilled'}
          size={22}
          color="#202124"
        />
      </TouchableOpacity>
    );
  }

  renderEmojiModal() {
    const emojiList = ['like', 'unlike', 'laugh', 'sad', 'anger'];
    let onClickEmoji = (emoji) => {
      const {
        wsId = this.postData?.wsId,
        postId = this.postData?.postId,
        commentCount = this.postData?.commentCount,
      } = {};

      const boardId = this.boardId;
      let _params = {
        postId,
        wsId,
        rId: boardId,
      };
      let payload = {
        emotion: {
          add: emoji,
        },
      };
      if (this.state.selectedPostId !== this.postData.postId) {
        //_params.postId = comment?.parentId;
        _params.cId = this.state.commentId;
        //_params.cIndex = cIndex;
        this.props.reactComment(_params, payload);
      } else {
        this.props.reactPost(_params, payload);
      }
      //this.props.reactPost(_params, payload);
      this.commentModal.closeBottomDrawer();
    };
    return (
      <BottomUpModal
        ref={(commentModal) => {
          this.commentModal = commentModal;
        }}
        height={100}>
        <View style={styles.bottomModalStyle}>
          {emojiList.map((name) => (
            <TouchableOpacity
              key={name}
              onPress={() => onClickEmoji(name)}
              underlayColor="rgba(0,0,0,0.2)">
              <Icon name={name} size={40} />
            </TouchableOpacity>
          ))}
        </View>
      </BottomUpModal>
    );
  }
  loadMoreComments(post) {
    let offset = post.comments?.length;
    let _params = {
      postId: this.postData.postId,
      wsId: this.postData.wsId,
      rId: this.boardId,
      offset: offset,
      limit: 3,
      loadMore: true,
    };
    this.props.getComments(_params);
  }
  sendComment = (txtData) => {
    console.log('Commented', this.postData);
    // Keyboard.dismiss();
    // const {text, everyoneMentioned, mentions} = txtData;

    const {
      wsId = this.postData?.wsId,
      postId = this.postData?.postId,
      commentCount = this.postData?.commentCount,
    } = {};
    console.log('Commented', {wsId, postId, commentCount});
    const boardId = this.boardId;
    const _params = {
      postId: postId,
      wsId: wsId,
      rId: boardId,
      offset: 0,
      limit: 10,
    };
    // let payload = {
    //   classification: 'POSTS',
    //   mentions: mentions && mentions.length > 0 ? mentions : [],
    //   hashTag: [],
    //   components: [],
    // };
    // payload.components.push({
    //   componentId: userAuth.generateId(6),
    //   componentType: 'text',
    //   componentBody: text,
    // });
    // if (
    //   everyoneMentioned !== null &&
    //   everyoneMentioned !== undefined &&
    //   everyoneMentioned === true
    // ) {
    //   payload = {...payload, everyoneMentioned: true};
    // }

    postPayload(
      {toList: [], boardId: boardId, data: txtData, postId: postId},
      (payload) => {
        PostsDao.upsertNewPost(payload)
          .then((nMessage) => {
            MessageUploadQueue.addPost(nMessage);
          })
          .catch((e) => console.log('ERROR', e.message));
      },
    );

    if (commentCount > 0) {
      this.commentRef?.current?.scrollToIndex({
        index: this.state.comments.length - 1,
        animated: true,
      });
    }
  };

  sendReply(txtData) {
    const {text, everyoneMentioned, mentions} = txtData;
    // console.log('Replied');
    const {wsId, postId} = this.postData;
    const boardId = this.boardId;
    const _params = {
      cId: this.state.commentId,
      postId: postId,
      wsId: wsId,
      rId: boardId,
      offset: 0,
      limit: 10,
    };
    let payload = {
      classification: 'POSTS',
      mentions: mentions && mentions.length > 0 ? mentions : [],
      hashTag: [],
      components: [],
    };
    payload.components.push({
      componentId: userAuth.generateId(6),
      componentType: 'text',
      componentBody: text,
    });
    if (
      everyoneMentioned !== null &&
      everyoneMentioned !== undefined &&
      everyoneMentioned === true
    ) {
      payload = {...payload, everyoneMentioned: true};
    }

    this.props.replyComment(_params, payload);
  }
  likePost(comment) {
    const {wsId, postId} = this.postData;
    const boardId = this.boardId;
    let _params = {
      postId,
      wsId,
      rId: boardId,
    };
    let payload = {
      emotion: {
        add: 'like',
      },
    };
    if (comment?.postType === 'comment') {
      _params.postId = comment?.parentId;
      _params.cId = comment?.postId;
      this.props.reactComment(_params, payload);
    } else {
      this.props.reactPost(_params, payload);
    }
    //this.props.reactPost(_params, payload);
  }
  // renderGetReplies() {
  //   const {wsId, postId} = this.postData;
  //   const boardId = this.boardId;
  //   const _params = {
  //     cId: this.state.commentId,
  //     postId: postId,
  //     wsId: wsId,
  //     rId: boardId,
  //     offset: 0,
  //     limit: 3,
  //   };
  //   this.props.getReplies(_params);
  // }

  onCommentClicked = () => {
    // this.setState({commentId: this.postData.postId});
    // this.messageRef.current.focusOnInput();
  };

  get boardData() {
    return {
      boardId: this.boardId,
      postId: this.postData.postId,
      commentId: this.state.commentId,
      wsId: this.postData.wsId,
    };
  }

  listHeaderComponent = () => {
    const {t} = this.props;
    return (
      <>
        <View style={{height: 20}} />
        <PostComponent
          boardId={this.boardId}
          post={this.state.post || this.postData}
          disableLongPressOptions={true}
          textColor={'#5F6368'}
          onCommentClicked={this.onCommentClicked}
          fromCommentSection={true}
        />
        <View
          style={{
            height: 10,
            marginBottom: 10,
            borderBottomColor: '#E4E5E7',
            borderBottomWidth: 1,
          }}
        />
      </>
    );
  };
  renderMainContent() {
    let comments = [];
    // const Item = ({title}) => (
    // );
    comments = this.state.comments || emptyArray;
    const {t} = this.props;

    return (
      <View style={styles.mainContent8}>
        <FlatList
          ref={this.commentRef}
          style={{flex: 1}}
          keyboardShouldPersistTaps={'handled'}
          extraData={this.state.post}
          stickySectionHeadersEnabled={false}
          bounces={false}
          // Dont convert the arrowhead to reference function, comment count wont update
          ListHeaderComponent={() => this.listHeaderComponent()}
          ListFooterComponent={FooterComponent}
          removeClippedSubviews={true}
          data={comments}
          keyExtractor={(item, index) => index}
          renderItem={this.renderItem}
          renderSectionHeader={ReplyComponent}
        />
      </View>
    );
  }

  renderComposeBar() {
    const {t} = this.props;
    return (
      <MessageComposebar
        autofocus={true}
        canRecord={false}
        boardDataId={this.boardId}
        isGroupChat={true}
        contactData={this.state.members}
        isShowCamera={true}
        boardData={this.boardData}
        placeholder={t('Add comment')}
        ref={this.messageRef}
        onSendButtonClick={this.sendComment}
        containerStyle={styles.composerbar_container}
        buttons_container={styles.buttons_container}
        sendViewStyle={styles.sendViewStyle}
        send_button_container={styles.send_btn_container_style}
        buttons_sub_container={styles.buttons_sub_container}
        iconStyle={styles.iconStyle}
      />
    );
  }
  renderItem = ({item}) => {
    return (
      <View style={styles.mainContent9}>
        <View style={styles.mainContent10} />
        <ReplyComponent
          item={item}
          onLongPress={() => {
            this.setState({commentId: item.postId});
            this.commentModal.openBottomDrawer();
          }}
          reactionLongPress={() => {
            this.setState({commentId: item.postId});
            this.commentModal.openBottomDrawer();
          }}
        />
        {/* <ReplyComponent showLike={false} showReply={false} item={item} /> */}
      </View>
    );
  };

  render() {
    const {t} = this.props;

    return (
      <>
        {this.renderEmojiModal()}
        <View style={styles.mainContent11}>
          <Header
            title={t('Post')}
            goBack={true}
            isFromNotificationTab={
              this.props.route?.params?.isFromNotificationTab
            }
            navigation={this.props.navigation}
          />
        </View>
        <KoraKeyboardAvoidingView style={styles.commentSectionFlex}>
          {this.renderMainContent()}
          {this.renderComposeBar()}
        </KoraKeyboardAvoidingView>
        <SafeAreaView style={styles.mainContent12} />
      </>
    );
  }
}

const styles = StyleSheet.create({
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
    //marginVertical: -2.8,
    // paddingVertical: -2.8,
    justifyContent: 'center',
    alignItems: 'center',

    // marginTop: 0,
  },
  send_btn_container_style: {
    flexDirection: 'row',
    alignSelf: 'center',
    // justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    height: 50,
  },

  icon_Style: {marginStart: 10},
  buttons_container: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    // justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'white',
    height: 50,
  },
  buttons_sub_container: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    // justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'white',
    height: 50,
  },
  sendViewStyle: {
    // height: '100%',
    //  backgroundColor: 'white',
    justifyContent: 'center',
    // marginStart: 10,
    alignItems: 'center',
    borderRadius: 5,
    alignSelf: 'center',
    marginStart: 16,
    padding: 8,
    width: 35,
  },
  editedTextStyle: {
    fontWeight: '500',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#5F6368',
    marginStart: 5,
  },
  commentOptionStyle: {
    // margin: 10,
    // marginLeft: 10,

    fontWeight: '500',
    fontSize: normalize(14),
    lineHeight: 20,
    color: '#5F6368',
  },
  replyOptionStyle: {
    margin: 10,
    marginLeft: 0,
    fontWeight: '400',
    fontSize: normalize(14),
    lineHeight: 20,
    color: '#5F6368',
  },
  timelineTextstyle: {
    fontWeight: 'normal',
    fontSize: normalize(12),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#9AA0A6',
    lineHeight: normalize(20),
  },
  timelineViewStyle: {
    flexDirection: 'column',
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 10,
    paddingLeft: 15,
    marginHorizontal: 5,
    backgroundColor: '#f8f9fa',
  },
  replyViewStyle: {
    flexDirection: 'column',
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 10,
    paddingLeft: 15,
    marginHorizontal: 3,
    width: '90%',
    backgroundColor: '#f8f9fa',
  },
  commentAvatarStyle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginVertical: 3,
  },
  seperator2: {
    height: '50%',
    width: 1,
    backgroundColor: '#BDC1C6',
  },
  justifyContentStyle: {
    justifyContent: 'center',
  },
  likeInnerViewStyle: {
    flexDirection: 'row',
    width: '50%',
    justifyContent: 'center',
  },
  likeOuterViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    top: 5,
  },
  flatlistStyle: {
    maxHeight: 500,
    top: 5,
  },
  messageComposebarStyle: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
  seperator: {
    borderColor: '#E4E5E7',
    borderWidth: 0.5,
  },
  commentIconStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexDirectionStyles: {
    flexDirection: 'row',
  },
  authorViewStyle: {
    marginStart: 8,
    paddingVertical: 2,
  },
  alignmentStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentViewStyles: {
    flexDirection: 'column',
    padding: 15,
    margin: 5,
    borderRadius: 5,
    backgroundColor: '#f8f9fa',
  },
  KoraKeyboardAvoidingStyle: {
    flex: 1,
    backgroundColor: 'white',
  },
  safeAreaStyle: {
    flex: 1,
    backgroundColor: 'white',
  },
  commentSectionFlex: {
    backgroundColor: 'white',
    flex: 1,
    // paddingTop: 10,
    // paddingHorizontal: 9,
  },
  bottomModalStyle: {
    paddingBottom: 15,
    flexDirection: 'row',
    padding: 23,
    justifyContent: 'space-between',
  },
  fileViewStyle: {
    marginTop: 10,
    paddingHorizontal: 15,
    borderRadius: 10.4,
    borderWidth: 1,
    borderColor: '#BDC1C6',
    backgroundColor: '#ffffff',
  },
  imageViewStyle: {
    paddingTop: 15,
    paddingHorizontal: 2,
  },
  imageStyle: {
    height: 200,
    width: 355,
    borderRadius: 10.4,
  },
  messageContentView: {
    // paddingVertical: 10,
    //paddingHorizontal: 2,
  },
  headerIconStyle: {
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 5,
  },
  componentTextStyle: {
    fontWeight: '400',
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
  authorTextStyle: {
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    lineHeight: normalize(24),
    color: '#333333',
    //backgroundColor:"red",
    alignSelf: 'flex-start',
  },
  createdOnTextStyle: {
    fontWeight: '400',
    fontSize: normalize(12),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    lineHeight: normalize(16),
    color: '#605E5C',
    marginTop: 5,
  },
  likeTextStyle: {
    marginEnd: 10,
    padding: 5,
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#0D6EFD',
  },
  emojiCountTextStyle: {
    marginTop: 3,
    marginEnd: 15,
    color: '#9AA0A6',
    padding: 5,
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  commentTextStyle: {
    color: '#9AA0A6',
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    paddingRight: 8,
  },
  commentCountTextStyle: {
    color: '#9AA0A6',
    fontWeight: '500',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    marginLeft: 5,
  },
  loadMoreTextStyle: {
    fontWeight: '500',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    lineHeight: 20,
    left: 10,
    color: '#605E5C',
  },
  mainContent1: {
    flexDirection: 'row',
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 5,
    backgroundColor: 'white',
  },
  mainContent2: {
    marginLeft: 8,
    flexDirection: 'column',
    flex: 1,
  },
  mainContent3: {flexDirection: 'row', alignItems: 'center'},
  mainContent4: {
    fontSize: normalize(14),
    lineHeight: normalize(24),
    fontWeight: '500',
    alignItems: 'center',
    fontFamily: Constants.fontFamily,
    color: '#333333',
  },
  mainContent5: {width: 10},
  mainContent6: {height: 5},
  mainContent7: {flexDirection: 'row', alignItems: 'center'},
  mainContent8: {flex: 1},
  mainContent9: {flexDirection: 'row'},
  mainContent10: {width: 30},
  mainContent11: {backgroundColor: 'white'},
  mainContent12: {backgroundColor: 'white'},
  itemFooterStyle: { height: 90 },
});

const mapStateToProps = (state, ownProps) => {
  // console.log('====================================CommentSection==============================');
  const {discussion, native} = state;

  return {
    commentId: native.commentId,
    replies: discussion.replies || emptyArray,
    allComments: discussion?.comments || emptyArray,
  };
};

export default connect(mapStateToProps, {
  getComments,
  replyPost,
  replyComment,
  getReplies,
  reactPost,
  reactComment,
  setPostId,
  setCommentId,
  getBoardFromDb,
})(withTranslation()(CommentSection));
