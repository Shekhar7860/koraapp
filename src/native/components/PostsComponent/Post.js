import React, {useCallback, useState, useEffect} from 'react';
import {
  View,
  TouchableHighlight,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {decode} from 'html-entities';
import withObservables from '@nozbe/with-observables';
import {of as of$} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {getTimeline, normalize} from '../../utils/helpers';
import {MultiEmoji, renderUnForURL} from '../Chat/MessageView';
import {Avatar} from '../Icon/Avatar';
import {BottomUpModal} from './../BottomUpModal';
import {Icon} from '../Icon/Icon';
import {
  createReminder,
  deletePost,
  deleteReminder,
  reactPost,
  showPostTraceInfo,
} from '../../../shared/redux/actions/discussions.action';
import {navigate} from '../../navigation/NavigationService';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
import {selectedContactList} from '../../../shared/redux/actions/create-message.action';
import TimelineEventItem from '../../components/Chat/TimelineEventItem';
import * as Constants from '../KoraText';
import {MultiComponentView} from '../../components/Chat/extras/MultiComponentView';
import {getPrettifiedFileSize} from '../Chat/helper';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import {useTranslation} from 'react-i18next';
import {ScrollView} from 'react-native';
import {ReactionWithText} from '../ReactionWithText';
import {Keyboard} from 'react-native';
import {DateChangeTimeline} from '../Chat';
import * as UsersDao from '../../../dao/UsersDao';
import {KoraParsedText} from '../../components/KoraParsedText';
import {
  emptyArray,
  emptyObject,
} from '../../../shared/redux/constants/common.constants';
import Clipboard from '@react-native-community/clipboard';

import {BottomUpModalShare} from '../BottomUpModal/BottomUpModalShare';
import {Loader} from '../../screens/ChatsThreadScreen/ChatLoadingComponent';
import {showToast} from '../../core/ErrorMessages';
import ActionItemBottomSheet from '../BottomUpModal/ActionItemBottomSheet';
import {colors} from '../../../native/theme/colors';
import {singleAttachementPreview} from '../../screens/ChatScreen/SingleAttachementPreview';
import * as Entity from '../../../native/realm/dbconstants';
import HTML from 'react-native-render-html';

const edit_ = {
  id: 'edit',
  text: 'Edit',
  icon: 'edit',
};
const startConversation_ = {
  id: 'start_conversation',
  text: 'Start Conversation',
  icon: 'Messages',
};
const copyUrl_ = {
  id: 'copy_url',
  text: 'Copy',
  icon: 'Copy',
};
const reminder_ = {
  id: 'reminder',
  text: 'Reminder',
  icon: 'Future',
};

const comment_ = {
  id: 'comment',
  text: 'Comment',
  icon: 'Comment_Icon',
};
// const editReminder_ = {
//   id: 'reminder',
//   text: 'Edit Reminder',
//   icon: 'Future',
// };

// const savePost_ = {
//   id: 'save',
//   text: 'Save post',
//   icon: 'BookmarkOutlined',
// };
const forward_ = {
  id: 'forward',
  text: 'Forward',
  icon: 'forward',
};
const postInfo_ = {
  id: 'postInfo',
  text: 'Post Info',
  icon: 'traceInfo',
};
const deleteMessage_ = {
  id: 'delete',
  text: 'Delete',
  icon: 'Delete_T',
};

const cancelMessage_ = {
  id: 'cancel',
  text: 'Cancel',
  icon: 'Delete_T',
};
export const reminderOptions = [
  {
    id: '15_min',
    text: '15 mins',
    icon: 'Delete_T',
    data: {days: 0, hours: 0, minutes: 15},
  },
  {
    id: '1_hrs',
    text: '1 hr',
    icon: 'Delete_T',
    data: {days: 0, hours: 1, minutes: 0},
  },
  {
    id: '2_hrs',
    text: '2 hrs',
    icon: 'Delete_T',
    data: {days: 0, hours: 2, minutes: 0},
  },
  {
    id: '4_hrs',
    text: '4 hrs',
    icon: 'Delete_T',
    data: {days: 0, hours: 4, minutes: 0},
  },
  {
    id: '1_day',
    text: '1 day',
    icon: 'Delete_T',
    data: {days: 1, hours: 0, minutes: 0},
  },
  {
    id: '2_days',
    text: '2 days',
    icon: 'Delete_T',
    data: {days: 2, hours: 0, minutes: 0},
  },
  {
    id: '1_week',
    text: '1 week',
    icon: 'Delete_T',
    data: {days: 7, hours: 0, minutes: 0},
  },
  cancelMessage_,
];

export const PostState = ({messageState = 2, timelineText = ''}) => {
  const {t} = useTranslation();

  if (messageState === Entity.ResourceState.SENDING) {
    return <Text style={styles.timelineTextStyle}>{t('Sending...')}</Text>;
  } else if (messageState === Entity.ResourceState.FAILED) {
    return <Text style={styles.timelineTextStyle}>{t('Failed')}</Text>;
  } else {
    return <Text style={styles.timelineTextStyle}>{timelineText}</Text>;
  }
};

const _PostComponent = ({
  post = {},
  showLoader = false,
  boardId = '',
  titleName = '',
  itemIndex = '',
  hideButtons = false,
  showHeader = true,
  onPress = () => {},
  onCommentClicked = () => {},
  disableLongPressOptions = false,
  textColor = '#9AA0A6',
  onEditClicked = () => {},
  audioPlayer = null,
  universalSearch = 'false',
  fromCommentSection = false,
  searchPostId = '',
  onRetryClick = () => {},
  ...remainingProps
}) => {
  const {t} = useTranslation();
  const postTraceInfo = useSelector((s) => s.discussion.posttraceInfo) || {};
  const dispatch = useDispatch();
  const modalOptionsRef = React.useRef();
  const emojiModalRef = React.useRef();
  const reminderModalRef = React.useRef();
  const postInfo = React.useRef();
  const deletePostRef = React.useRef();
  const reminderInfo = React.useRef();
  // const [remind, changeRemind] = useState([]);

  let {
    postId,
    from = {},
    createdOn,
    deliveredOn,
    loading = false,
    active,
    remind = [],
    isEdited = false,
    type = '',
  } = post;
  from = remainingProps.from;
  if (!remainingProps.from) {
    from = remainingProps.author;
  }

  const openMediaViewCB = useCallback(
    (index) => {
      let postId = post?._raw?.postId;
      if (fromCommentSection) {
        openMediaView(components, titleName, index, postId);
      }
    },
    [fromCommentSection, post, titleName],
  );

  const onComponentCB = useCallback((type, component) => {
    console.log('clicked ----> ', type);
    //const {componentData, componentSize, componentId} = component;
    if (!fromCommentSection) {
      onPressCB();
      return;
    }
    if (type && type === 'email') {
      // console.log("clicked component----> ", component?._raw?.componentData);
      navigate(ROUTE_NAMES.EMAIL_DETAILS, {
        componentData: component?._raw?.componentData,
      });
    } 
    //openMediaView(components, titleName, index, postId);
  }, []);

  const openReminderInfo = (id) => () => {
    reminderInfo.current.open();
  };

  const onCommentClickedCB = useCallback(
    () => onCommentClicked(post),
    [onCommentClicked, post],
  );

  const onPressCB = useCallback(() => {
    Keyboard.dismiss();
    onPress(post);
  }, [onPress, post]);

  const onLongPress = useCallback(() => {
    !disableLongPressOptions && modalOptionsRef.current.open();
  }, [disableLongPressOptions]);

  const copyFuntion = async (post) => {
    try {
      let componets = await post?.components.fetch();
      const texts = componets
        .filter((comp) => comp.componentType === 'text')
        .map((comp) => comp.componentBody)
        .join(' ');
      Clipboard.setString(texts);
    } catch (e) {}
  };
  const onClickModalOptions = useCallback(
    (id) => () => {
      if (id === deleteMessage_.id) {
        modalOptionsRef.current.closeBottomDrawer();
        setTimeout(() => deletePostRef.current.open(), 1000);
      }

      if (id === startConversation_.id) {
        dispatch(selectedContactList([from]));
        navigate(ROUTE_NAMES.CHAT, {startConversation: true, authorId});
      }
      if (id === forward_.id) {
        navigate(ROUTE_NAMES.FORWARD_POST, {post, boardId});
      }
      if (id === comment_.id) {
        onCommentClickedCB();
      }
      if (id === postInfo_.id) {
        let _params = {
          postId,
          wsId,
          rId: boardId,
        };
        dispatch(showPostTraceInfo(_params));
        modalOptionsRef.current.closeBottomDrawer();
        setTimeout(() => postInfo.current.open(), 200);
      }
      if (id === copyUrl_.id) {
        // eslint-disable-next-line no-alert
        copyFuntion(post);
      }
      if (id === edit_.id) {
        if (post?.postType === 'forwarded') {
          showToast('User is not allowed edit forwarded post');
          return;
        }

        onEditClicked(post);
      }
      if (id === reminder_.id) {
        modalOptionsRef.current.closeBottomDrawer();
        setTimeout(() => reminderModalRef.current.open(), 1500);
      }
      modalOptionsRef.current.closeBottomDrawer();
    },
    [
      dispatch,
      from,
      authorId,
      post,
      boardId,
      onCommentClickedCB,
      postId,
      wsId,
      onEditClicked,
    ],
  );

  const likeButtonClicked = useCallback(() => {
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
    try {
      if (post.like.find(({userId}) => userId === UsersDao.getUserId())) {
        payload = {
          emotion: {
            remove: 'like',
          },
        };
      }
    } catch (e) {
      console.log('post[emoji]', e);
    }

    dispatch(reactPost(_params, payload));
  }, [boardId, dispatch, post, postId, wsId]);
  const onReminderOptionClick = useCallback(
    ({id, data}) =>
      () => {
        if (id === deleteMessage_.id) {
          dispatch(
            deleteReminder({}, {postId}, () =>
              reminderModalRef.current.closeBottomDrawer(),
            ),
          );
        } else {
          const payload = {
            resourceType: 'post',
            resourceId: postId,
            notificationMessage: 'Reminder on Post',
            scheduleAfter: data,
            resourceContext: {
              postId: postId,
              topicId: boardId,
              teamId: wsId,
            },
          };
          dispatch(
            createReminder({}, payload, () =>
              reminderModalRef.current.closeBottomDrawer(),
            ),
          );
        }
      },
    [boardId, dispatch, postId, wsId],
  );

  const onRetryCB = useCallback(() => {
    onRetryClick(post);
  }, [onRetryClick, post]);

  const onDelete = useCallback(() => {
    let _params = {
      postId: post.postId,
      wsId,
      rId: boardId,
    };
    dispatch(deletePost(_params));
    deletePostRef.current.closeBottomDrawer();
  }, [boardId, dispatch, post.postId, wsId]);

  const renderDeleteModal = () => {
    return (
      <BottomUpModal ref={deletePostRef} height={250}>
        <View style={styles.flexDirectionColumn}>
          <View style={styles.areYouSureContainer}>
            <Text style={styles.deleteTextStyle}>{t('Are you sure?')}</Text>
          </View>
          <TouchableOpacity
            onPress={onDelete}
            style={styles.paddingHorizontal15}>
            <View style={styles.paddingHorizontal16}>
              <Text style={styles.deleteDiscussionTextStyle}>
                {t('Yes, Delete Post')}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => deletePostRef.current?.closeBottomDrawer()}
            style={styles.margin15}>
            <View style={styles.cancelTextStyle1}>
              <Text
                style={[styles.cancelTextStyle, {color: colors.color_202124}]}>
                {t('Cancel')}
              </Text>
            </View>
          </TouchableOpacity>
          {/* <TouchableHighlight
            // style={{marginBottom: 5}}
            onPress={deletePostRef.current?.closeBottomDrawer}
            underlayColor="rgba(0,0,0,0.05)"
            style={styles.paddingHorizontal15}
           >
             <View
              style={{
                marginTop:8,
                borderRadius: 4,
                borderWidth:1,
                borderColor: 'grey',
                alignItems: 'center',
              }}>
            <Text style={[styles.cancelTextStyle, {color: '#202124'}]}>
              {t('Cancel')}
            </Text>
            </View>
          </TouchableHighlight> */}
        </View>
      </BottomUpModal>
    );
  };

  const returnPostInfoTime = (timeStamp) => {
    let date = getTimeline(timeStamp, 'numberDate');
    let time = getTimeline(timeStamp, 'time');
    let postInfo = date + ' - ' + time;
    return postInfo;
  };

  const renderPostInfo = () => {
    return (
      <BottomUpModalShare ref={postInfo} expandable={true} height={300}>
        <View style={styles.traceInfoView}>
          <Text numberOfLines={1} style={styles.traceInfoText}>
            Post Info
          </Text>
          <TouchableOpacity onPress={() => postInfo.current.close()}>
            <Icon name={'close'} size={24} color="#202124" />
          </TouchableOpacity>
        </View>

        {postTraceInfo?.members?.length === 0 ? (
          <Text style={styles.text1}>No data to display</Text>
        ) : null}
        <FlatList
          data={postTraceInfo?.members}
          style={{paddingTop: 9}}
          keyExtractor={(item, index) => index}
          renderItem={(element) => {
            const {item} = element;
            return (
              <View key={item?.id} style={styles.postInfo2}>
                <Avatar
                  color={item?.color}
                  profileIcon={item?.icon}
                  userId={item?.id}
                  name={item?.fN + ' ' + item?.lN}
                  rad={48}
                  type={'offline'}
                />
                <View style={styles.postInfo3}>
                  <Text numberOfLines={1} style={styles.postInfo4}>
                    {item?.fN + ' ' + item?.lN}
                  </Text>
                  <View style={styles.flexDirectionStyles}>
                    <Text style={styles.postInfo5}>
                      {item?.readAt
                        ? returnPostInfoTime(item?.readAt)
                        : returnPostInfoTime(item?.deliveredAt)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.readReceiptStyle}>
                  {item?.readAt ? 'Read' : 'Sent'}
                </Text>
              </View>
            );
          }}
        />
      </BottomUpModalShare>
    );
  };

  const renderReminderModal = () => {
    return (
      <BottomUpModal ref={reminderModalRef} height={480}>
        <View style={styles.bottomUpModal4} />
        <ActionItemBottomSheet title={'Remind in'} itemType={'header'} />
        <View
          style={{
            height: 1,
            backgroundColor: '#EFF0F1',
          }}
        />
        {reminderOptions.map((option) => (
          <ActionItemBottomSheet
            title={option.text}
            iconName={option.icon}
            id={option.id}
            key={option.id}
            itemType={'titleOnly'}
            optionSelected={onReminderOptionClick(option)}
          />
        ))}
      </BottomUpModal>
    );
  };

  const renderReminderModalInfo = (remind) => {
    return (
      <BottomUpModal ref={reminderInfo} height={200}>
        <View style={styles.bottomUpmodal1}>
          <View style={styles.bottomUpmodal2}>
            <Text style={styles.reminderHeaderTimeStyle}>
              You will be reminded at
            </Text>
          </View>
          <View style={styles.reminderStyle1}></View>

          <TouchableOpacity
            // style={localStyles.bottomUpmodal3}
            // onPress={}
            style={styles.bottomUpmodal4}>
            <Text style={styles.reminderTimeStyle}>
              {'' + getTimeline(remind, 'fulldate')}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomUpModal>
    );
  };

  const renderEmojiModal = () => {
    return (
      <BottomUpModal ref={emojiModalRef} height={100}>
        <View style={styles.bottomModalStyle}>
          {emojiList?.map((name) => (
            <TouchableOpacity
              key={name}
              onPress={onClickEmoji(name)}
              underlayColor="white">
              <Icon name={name} size={50} />
            </TouchableOpacity>
          ))}
        </View>
      </BottomUpModal>
    );
  };
  const reminderModalInfo = () => {
    reminderInfo.current.open();
  };

  const renderModalOptions = () => {
    return (
      <BottomUpModal ref={modalOptionsRef} height={modalSize}>
        <View style={styles.modalOption1}>
          {emojiList?.map((name) => (
            <TouchableOpacity
              key={name}
              onPress={onClickEmoji(name)}
              underlayColor="white">
              <Icon name={name} size={normalize(50)} />
            </TouchableOpacity>
          ))}
        </View>
        {modalOptions?.map((options) => (
          <TouchableOpacity
            key={options.id}
            onPress={onClickModalOptions(options.id)}
            style={styles.modalOption2}>
            <View style={styles.modalOption3}>
              <View style={styles.modalOption4}>
                {options.icon === 'Delete_T' ? (
                  <Icon
                    size={normalize(18)}
                    name={options.icon}
                    color="#DD3646"
                  />
                ) : (
                  <Icon size={normalize(18)} name={options.icon} />
                )}
              </View>
              {options.text === 'Delete' ? (
                <Text style={[styles.textStyle, {color: '#DD3646'}]}>
                  {options.text}
                </Text>
              ) : (
                <Text style={styles.textStyle}>{options.text}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </BottomUpModal>
    );
  };

  const onClickEmoji = useCallback(
    (emoji) => () => {
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
      try {
        if (post[emoji].find(({userId}) => userId === UsersDao.getUserId())) {
          payload = {
            emotion: {
              remove: emoji,
            },
          };
        }
      } catch (e) {
        console.log(' here is post[emoji]', e);
      }
      dispatch(reactPost(_params, payload));
      modalOptionsRef.current.closeBottomDrawer();
      emojiModalRef.current.closeBottomDrawer();
    },
    [boardId, dispatch, post, postId, wsId],
  );

  if (type === 'clientSideTimeline') {
    return <DateChangeTimeline title={post.deliveredOn} />;
  }

  loading = Boolean(loading);
  let edited = isEdited;
  let hasReminder = false;
  let remindAt = '';
  // if (Array.isArray(remind)) {
  const id = UsersDao.getUserId();
  const index = remind.findIndex((obj) => obj.userId === id);

  if (index !== -1) {
    remindAt = remind[index].scheduledOn || remind[index].remindAt;
    hasReminder = new Date(remindAt) > new Date();
  }
  // }
  const fullName = from?.fN + ' ' + from?.lN;
  let {
    sadCount,
    shockCount,
    likeCount,
    laughCount,
    angerCount,
    unlikeCount,
    components,
    wsId,
    commentCount,
    linkPreviews = emptyArray,
    messageState,
  } = post;
  const hasFailed = messageState === Entity.ResourceState.FAILED;
  components = remainingProps.components;
  const multiEmojiObj = {
    sadCount,
    shockCount,
    likeCount,
    laughCount,
    angerCount,
    unlikeCount,
  };
  let emojiCount =
    sadCount + shockCount + likeCount + laughCount + angerCount + unlikeCount;

  // const emojis = ['like', 'unlike', 'laugh', 'anger', 'sad', 'shock'];
  if (
    components?.length &&
    components?.length > 0 &&
    components[0].componentType === 'timeline'
  ) {
    return <TimelineEventItem data={components[0]} />;
  }
  if (showLoader) {
    return <Loader />;
  }
  const curUserId = UsersDao.getUserId();
  const isSelf = from?.id === curUserId || from === curUserId;
  const emojiList = ['like', 'unlike', 'laugh', 'sad', 'anger'];
  let modalOptions = [];

  let modalSize = 510;
  if (isSelf) {
    modalOptions = [
      edit_,
      reminder_,
      comment_,
      copyUrl_,
      // savePost_,
      forward_,
      postInfo_,
      deleteMessage_,
    ];
  } else {
    modalOptions = [
      // startConversation_,
      reminder_,
      comment_,
      copyUrl_,
      // savePost_,
      forward_,
    ];
    modalSize = 330;
  }

  // const likeId = Array.isArray(post?.like)
  //   ? post?.like?.map((options) => options.userId)
  //   : [];
  let authorId = post?.from?.id;
  let showSeperator = false;
  showSeperator = emojiCount > 0 && commentCount > 0;
  let highlightPost = universalSearch && post?.postId === searchPostId;

  return (
    <View>
      {renderReminderModal()}
      {renderReminderModalInfo(remindAt)}
      {renderModalOptions()}
      {renderEmojiModal()}
      {renderPostInfo()}
      {renderDeleteModal()}
      <TouchableHighlight
        style={
          (!showHeader ? styles.marginTop15 : emptyObject,
          highlightPost
            ? {
                borderColor: '#FF784B',
                borderWidth: 2,
                backgroundColor: '#FFF1ED',
                borderBottomColor: '#FF784B',
                borderBottomWidth: 2,
              }
            : {})
        }
        underlayColor="rgba(0,0,0,0.05)"
        onLongPress={onLongPress}
        onPress={onPressCB}>
        <View
          style={[
            styles.mainPostContainer,
            {
              borderColor: active ? '#FF784B' : '#E4E5E7',
              borderWidth: active ? 2 : 0,
            },
          ]}>
          <View style={{flexDirection: 'column', flex: 1}}>
            {showHeader && (
              <View style={styles.mainPostContainer1}>
                <Avatar
                  color={from?.color}
                  profileIcon={from?.icon}
                  userId={from?.id}
                  name={fullName}
                  type={'offline'}
                  rad={normalize(20) + normalize(14.8)}
                />
                <View style={styles.mainPostContainer2}>
                  <View style={styles.flexDirectionStyles}>
                    <Text style={styles.fullNameTextStyle}>{fullName}</Text>
                  </View>
                  <PostState
                    messageState={messageState}
                    timelineText={getTimeline(deliveredOn, 'time')}
                  />
                </View>
              </View>
            )}

            {showHeader && <View style={styles.mainPostContaine3} />}
            <View style={styles.mainPostContaine4}>
              <TagsComponents
                forwarded={post?.postType === 'forwarded'}
                edited={edited}
                remind={remind}
                hasReminder={hasReminder}
                onPress={openReminderInfo}
                // hasMention={true}
              />
            </View>
            {(post?.postType === 'forwarded' || edited || hasReminder) && (
              <View style={styles.mainPostContaine5} />
            )}
            {hideButtons ? (
              <ScrollView style={styles.hideButtons}>
                <Components
                  onMediaClick={openMediaViewCB}
                  components={components}
                  postId={postId}
                  audioPlayer={audioPlayer}
                  post={post}
                  linkPreviews={linkPreviews}
                  fromCommentSection={fromCommentSection}
                  onComponentClick={onComponentCB}
                />
              </ScrollView>
            ) : (
              <View style={styles.hideButtons1}>
                <Components
                  onMediaClick={openMediaViewCB}
                  components={components}
                  postId={postId}
                  post={post}
                  linkPreviews={linkPreviews}
                  audioPlayer={audioPlayer}
                  fromCommentSection={fromCommentSection}
                  onComponentClick={onComponentCB}
                />
              </View>
            )}
            {(emojiCount > 0 || commentCount > 0) && (
              <>
                <View style={styles.hideButtons2} />
                <View style={styles.emojiCount1}>
                  <ReactionWithText
                    onLongPress={() => {
                      emojiModalRef.current.open();
                    }}
                    data={post}
                  />
                  <MultiEmoji
                    data={multiEmojiObj}
                    sumPosition="right"
                    border={false}
                  />
                  {showSeperator ? (
                    <View style={styles.separatorStyle1} />
                  ) : null}
                  <CommentCount
                    onPress={onCommentClickedCB}
                    commentCount={commentCount}
                  />
                </View>
              </>
            )}
          </View>
          {hasFailed && (
            <View style={{justifyContent: 'center'}}>
              <Text onPress={onRetryCB} style={styles.timelineTextStyle}>
                Retry
              </Text>
            </View>
          )}
        </View>
      </TouchableHighlight>
    </View>
  );
};
const enhance = withObservables(['post'], ({post}) => ({
  post: post?.observe(),
  components: post?.components ? post?.components?.observe() : null,
  author: post?.author
    .observe()
    .pipe(switchMap((_author) => (_author ? _author.contact : of$(null)))),
  from: post.from
    .observe()
    .pipe(switchMap((author) => (author ? author.contact : of$(null)))),
}));

export const PostComponent = enhance(_PostComponent);

const TagsComponents = ({
  forwarded = false,
  edited = false,
  hasReminder = false,
  hasMention = false,
  remind = [],
  onPress = () => {},
}) => {
  const {t} = useTranslation();
  if (!(forwarded || edited || hasReminder || hasMention)) {
    return null;
  }
  return (
    <View style={styles.tagsComponent1}>
      {/* <View style={{height: 5}} /> */}
      <View style={styles.tagsComponent2}>
        {forwarded ? (
          <View style={styles.tagContainer}>
            <Icon name={'forward'} size={18} color={'#5F6368'} />
            <Text style={styles.tagText}>{t('Forwarded')}</Text>
          </View>
        ) : null}
        {edited ? (
          <View style={styles.tagContainer}>
            <Icon name={'edit'} size={18} color={'#07377F'} />
            <Text style={styles.tagText}>{t('Edited')}</Text>
          </View>
        ) : null}
        {hasReminder ? (
          <TouchableOpacity
            style={styles.tagContainer}
            onPress={onPress(remind)}>
            <Icon name={'History'} size={18} color={'#07377F'} />
            <Text style={styles.tagText}>{t('Reminder')}</Text>
          </TouchableOpacity>
        ) : null}
        {hasMention ? (
          <View style={styles.tagContainer}>
            <Icon name={'History'} size={18} color={'#07377F'} />
            <Text style={styles.tagText}>{t('Mentioned')}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const CommentCount = ({commentCount = 0, onPress = () => {}}) => {
  const {t} = useTranslation();
  if (commentCount === 0) {
    return null;
  }

  const postStr = commentCount > 1 ? t('comments') : t('comment');
  const commentStr = `${commentCount} ${postStr}`;
  return (
    <TouchableOpacity onPress={onPress} style={styles.commentCount1}>
      <Icon name={'Comment_Icon'} color={'#202124'} size={normalize(14)} />
      <View style={styles.commentCount2} />
      <Text style={styles.commentCount3}>{commentStr}</Text>
    </TouchableOpacity>
  );
};

const renderMediaComponents = (
  audioPlayer = null,
  postId = null,
  components,
  onSendIndex = () => {},
) => {
  const totalComponents = components?.length;
  if (totalComponents === 0) {
    return <></>;
  }
  return (
    <MultiComponentView
      borderRadius={10}
      components={components}
      postId={postId}
      audioPlayer={audioPlayer}
      particularMediaClick={onSendIndex}
    />
  );
};

const OtherComponent = ({
  component,
  linkPreviews = [],
  post = {},
  onSendIndex = () => {},
  fromCommentSection = false,
  onComponentClick = () => {},
}) => {
  if (component) {
    if (component.componentType === 'text') {
      if (linkPreviews && linkPreviews.length > 0) {
        return renderUnForURL(
          component.componentId,
          component.componentBody,
          linkPreviews,
          false,
          fromCommentSection,
        );
      } else {
        if (component.componentBody?.length === 0) {
          return null;
        }
        return (
          <View key={component.componentId} style={styles.paddingTop5}>
            <KoraParsedText
              atMentionStyle={false}
              style={styles.text}
              isDR={true}>
              {decode(component.componentBody)}
            </KoraParsedText>
          </View>
        );
      }
    } else if (component.componentType === 'attachment') {
      const {componentData, componentSize, componentId} = component;
      const fileName = componentData?.filename;
      return (
        <TouchableHighlight
          style={styles.touchStyle}
          onPress={() => {
            onSendIndex(componentId);
          }}>
          <View style={styles.componentStyle}>
            <View style={styles.componentStyle1}>
              <View style={styles.componentStyle2}>
                <Icon name={'document'} size={16} color={'#85B7FE'} />
              </View>
            </View>
            <View style={styles.componentStyle3}>
              <View style={styles.componentStyle4}>
                <Text
                  numberOfLines={1}
                  lineBreakMode={'clip'}
                  style={styles.componentStyle5}>
                  {fileName}
                </Text>
              </View>
              <View style={styles.componentStyle6}>
                <View>
                  <Text>&nbsp;</Text>
                </View>
                <View style={styles.componentStyle7}>
                  <Text style={styles.fileSizeTextStyle}>
                    {getPrettifiedFileSize(componentSize)}
                  </Text>
                  <AntDesignIcon
                    style={styles.componentStyle8}
                    name={'arrowdown'}
                    color={'#5F6368'}
                  />
                </View>
              </View>
            </View>
          </View>
        </TouchableHighlight>
      );
    } else if (component.componentType === 'email') {
      const {componentData, componentSize, componentId} = component;

      const subject = componentData?.subject;
      const body = componentData?.body;
      const html = componentData?.to?.html;

      return (
        <TouchableWithoutFeedback
          style={styles.touchStyle}
          onPress={() => {
            onComponentClick('email', component);
          }}>
          <View key={component.componentId} style={styles.paddingTop5}>
            <View>
              <View
                style={{
                  borderRadius: 5,
                  padding: 4,
                  backgroundColor: '#EAF6EC',
                  marginBottom: 10,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'baseline',
                }}>
                <Icon name={'email'} color={'#28A755'} size={normalize(14)} />
                <View style={styles.commentCount2} />
                <Text style={[styles.commentCount3, {color: '#28A755'}]}>
                  Post via email
                </Text>
              </View>
            </View>
            <View
              style={{
                borderWidth: 1,
                borderColor: '#E4E5E7',
                borderRadius: 5,
                padding: 5,
                //backgroundColor: 'white',
              }}>
              <View
                style={{
                  //backgroundColor: 'gray',
                  flexDirection: 'row',
                }}>
                <View
                  style={{
                    borderRadius: 5,
                    padding: 8,
                    backgroundColor: '#0D6EFD',
                    flexDirection: 'row',
                    alignSelf: 'baseline',
                    justifyContent: 'center',
                    // width:80,
                    // height:80,
                  }}>
                  <Icon name={'email'} color={'white'} size={normalize(25)} />
                </View>

                <View style={{flex: 1, marginStart: 5}}>
                  <Text
                    style={[styles.commentCount3, {fontWeight: '800'}]}
                    numberOfLines={1}>
                    {subject}
                  </Text>
                  {/* <HTML
                      baseFontStyle={styles.baseFontStyle}
                      source={{html: decode(body)}}
                      tagsStyles={{
                        img: {
                          flexDirection: 'row',
                        },
                        p: {
                          flexDirection: 'row',
                        },
                      }}
              
                      //ignoredStyles={['line-height']}
                    /> */}

                  <Text style={[styles.commentCount3]} numberOfLines={1}>
                    {decode(html)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    } else {
      // return <View />;

      // console.log("component  ----->: ",component);
      return (
        <View key={component.componentId} style={styles.paddingTop5}>
          <KoraParsedText
            atMentionStyle={false}
            style={styles.text}
            isDR={true}>
            {component._raw}
          </KoraParsedText>
        </View>
      );
    }
  } else {
    return <View />;
  }
};

const openMediaView = (components, titleName, index, postId) => {
  if (components) {
    if (components[0]?._raw.componentFileId === null) {
      return;
    }
    let newComponents = [];
    components.map?.((data) => {
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
          componentThumbnails: data?.componentThumbnails,
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

const Components = ({
  components = [],
  linkPreviews = [],
  onMediaClick = () => {},
  postId = null,
  post = {},
  audioPlayer = null,
  fromCommentSection = false,
  onComponentClick = () => {},
}) => {
  const mediaComponentsArray = ['image', 'video', 'audio', 'attachment'];
  const mediaComponents =
    components && components.filter
      ? components.filter((component) =>
          mediaComponentsArray.includes(component.componentType),
        )
      : [];

  const otherComponents =
    components &&
    components.filter &&
    components?.filter(
      (component) => !mediaComponentsArray.includes(component.componentType),
    );

  // let otherComponents = [];
  // otherComponents.push(otherComponents_1);
  // let component = {
  //   ...components[0],
  //   componentType: 'email',
  // };
  // otherComponents.push(component);

  return (
    <View style={styles.otherComponents1}>
      {otherComponents &&
        otherComponents?.map((c, index) => {
          return (
            <OtherComponent
              key={c.componentId}
              component={c}
              post={post}
              linkPreviews={linkPreviews}
              onSendIndex={onMediaClick}
              fromCommentSection={fromCommentSection}
              onComponentClick={onComponentClick}
            />
          );
        })}
      <View style={{maxWidth: 250}}>
        {renderMediaComponents(
          audioPlayer,
          postId,
          mediaComponents,
          (index) => {
            onMediaClick(index);
          },
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontWeight: 'normal',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
    lineHeight: normalize(21),
  },
  baseFontStyle: {
    marginEnd: 5,
    color: '#202124',
    fontSize: normalize(16),
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    height: normalize(30),
  },

  text1: {
    marginTop: 15,
    margin: 25,
    justifyContent: 'center',
    alignItems: 'center',
    color: '#5F6368',
    fontSize: normalize(16),
  },
  postInfo1: {height: 10},
  postInfo2: {
    flexDirection: 'row',
    margin: 20,
    marginVertical: 10,
  },
  postInfo3: {marginStart: 10, flex: 1},
  postInfo4: {fontWeight: '500', fontSize: normalize(16)},
  postInfo5: {marginTop: 5, color: '#605E5C'},
  marginTop15: {marginTop: 0},
  tagText: {
    marginLeft: 5,
    fontSize: normalize(14),
    lineHeight: normalize(16),
    color: '#5F6368',
  },
  fileSizeTextStyle: {
    paddingRight: 4,
    color: '#5F6368',
    fontWeight: '400',
    fontSize: normalize(10),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  paddingHorizontal15: {paddingHorizontal: 15},
  paddingHorizontal16: {
    borderRadius: 4,
    backgroundColor: '#DD3646',
    alignItems: 'center',
  },
  traceInfoView: {
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 11,
    borderBottomWidth: 0.4,
    borderColor: '#9AA0A6',
    flexDirection: 'row',
  },
  traceInfoText: {
    color: '#202124',
    flexShrink: 1,
    fontWeight: '600',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    flex: 1,
  },
  areYouSureContainer: {
    marginHorizontal: 20,
    marginVertical: 20,
    flexDirection: 'row',
  },
  flexDirectionColumn: {flexDirection: 'column'},
  disableLongPressOptionsStyle: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  mainPostContainer: {
    flexDirection: 'row',
    padding: 0,
    paddingHorizontal: 10,
    paddingTop: 2,
    paddingBottom: 5,
    borderRadius: 10,

    // borderBottomLeftRadius: 10,
    // borderBottomRightRadius: 10,
    marginHorizontal: 10,

    // backgroundColor: '#f8f9fa',
  },
  mainPostContainer1: {flexDirection: 'row'},
  mainPostContainer2: {marginStart: 8, flex: 1},
  mainPostContaine3: {height: 5},
  mainPostContaine4: {paddingLeft: normalize(20) + normalize(14.8) + 10.2},
  mainPostContaine5: {height: 5},
  hideButtons: {
    paddingLeft: normalize(20) + normalize(14.8) + 10.2,
    maxHeight: 200,
  },
  hideButtons1: {paddingLeft: normalize(20) + normalize(14.8) + 10.2},
  hideButtons2: {height: 5},
  commentCount1: {flexDirection: 'row', alignItems: 'center'},
  commentCount2: {width: 5},
  commentCount3: {fontSize: normalize(14), color: '#202124'},
  emojiCount1: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: normalize(20) + normalize(14.8) + 10.2,
  },
  separatorStyle1: {
    marginHorizontal: 10,
    backgroundColor: '#BDC1C6',
    width: 1,
    height: 14,
  },
  likeButtonContainer: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: -10,
    alignItems: 'center',
  },
  paddingTop0: {paddingTop: 0},
  paddingTop10: {paddingTop: 10},
  commentVerticalSeperator: {
    borderLeftWidth: 1,
    height: normalize(14),
    borderColor: '#BDC1C6',
  },
  commentContainerStyle: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: -10,
    alignItems: 'center',
  },
  activityIndicator: {
    flexDirection: 'row',
    paddingLeft: 15,
    paddingTop: 5,
    paddingBottom: 15,
  },
  paddingVertical0: {paddingTop: 0},
  autoLinkContainer: {paddingVertical: 10, paddingHorizontal: 2},
  autoLinkText: {
    fontWeight: 'normal',
    lineHeight: normalize(19),
    fontSize: normalize(16),
  },
  documentContainer: {display: 'flex', flexDirection: 'row'},
  documentView: {
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentLogo: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 0,
    borderBottomWidth: 2,
    borderRadius: 3,
    backgroundColor: '#F8F9FA',
    borderColor: '#85B7FE',
  },
  fileStyle: {
    paddingLeft: 10,
    flexDirection: 'column',
    flexShrink: 1,
  },
  paddingBottom9: {paddingBottom: 9},
  fileNameStyle: {
    color: '#202124',
    lineHeight: normalize(17),
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  justifyContentSpaceBetween: {justifyContent: 'space-between'},
  flexDirectionRow: {flexDirection: 'row'},
  arrowDown: {paddingLeft: 4},
  timeLineEventMargin: {marginVertical: -5},
  tagContainer: {
    paddingHorizontal: 5,
    borderRadius: 4,
    marginHorizontal: 5,
    paddingVertical: 3,
    marginTop: 5,
    backgroundColor: '#eff0f1',
    borderColor: '#eff0f1',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelTextStyle: {
    color: '#DD3646',
    fontWeight: '400',
    fontSize: normalize(16),
    fontFamily: Constants.fontFamily,
    marginVertical: 10,
    marginHorizontal: 30,
  },
  cancelTextStyle1: {
    // borderRadius: 4,
    borderColor: 'grey',
    // borderWidth: 1,
    alignItems: 'center',
  },
  bottomUpModal1: {
    paddingLeft: 20,
    paddingBottom: 11,
    borderColor: '#9AA0A6',
    marginBottom: 9,
    backgroundColor: 'red',
  },
  bottomUpModal2: {paddingVertical: 16, backgroundColor: 'red'},
  bottomUpModal4: {padding: 10},
  bottomUpModal5: {
    fontSize: normalize(18),
    fontWeight: '400',
    fontStyle: 'normal',
    color: '#DD3646',
  },
  tagsComponent1: {flexDirection: 'column', flexShrink: 1},
  tagsComponent2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: -5,
    marginTop: -5,
  },
  reminderTimeStyle: {
    color: '#202124',
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    textAlign: 'center',
    fontFamily: Constants.fontFamily,
    padding: 5,
  },
  reminderHeaderTimeStyle: {
    color: '#202124',
    fontWeight: '600',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#202124',
    textAlign: 'center',
    paddingTop: 15,
  },
  reminderModal1: {
    top: 8,
    padding: 11,
    paddingLeft: 15,
    margin: 4,
    borderRadius: 5,
  },
  reminderModal2: {flexDirection: 'row', alignItems: 'center'},
  margin15: {margin: 15},
  deleteTextStyle: {
    color: colors.color_202124,
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
  readReceiptStyle: {
    color: '#989FA5',
    fontSize: normalize(15),
    alignSelf: 'center',
  },
  commentIconStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  flexDirectionStyles: {
    flexDirection: 'row',
  },
  bottomModalStyle: {
    paddingBottom: 15,
    flexDirection: 'row',
    padding: 23,
    justifyContent: 'space-between',
  },
  textStyle: {
    fontSize: normalize(18),
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  fullNameTextStyle: {
    fontWeight: '500',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    lineHeight: normalize(20),
    color: '#202124',
    alignSelf: 'flex-start',
  },
  editedTextStyle: {
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#5F6368',
    // marginTop: 5,
  },
  timelineTextStyle: {
    fontWeight: 'normal',
    fontSize: normalize(12),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    lineHeight: normalize(14.52),
    color: '#9AA0A6',
    // marginTop: 5,
  },
  likeTextStyle: {
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    // color: '#0D6EFD',
    color: '#9AA0A6',
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
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  fileNameTextStyle: {
    fontWeight: '400',
    fontSize: normalize(18),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
    paddingVertical: 10,
  },
  touchStyle: {
    marginBottom: 5,
  },
  componentStyle: {
    display: 'flex',
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,

    backgroundColor: 'white',
    borderRadius: 4,
    borderColor: '#e4e5e8',
  },
  componentStyle1: {
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  componentStyle2: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 0,
    borderBottomWidth: 2,
    borderRadius: 3,
    backgroundColor: '#F8F9FA',
    borderColor: '#85B7FE',
  },
  componentStyle3: {
    flexDirection: 'column',
    flexShrink: 1,
  },
  componentStyle4: {paddingBottom: 9},
  componentStyle5: {
    color: '#202124',
    lineHeight: normalize(17),
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  componentStyle6: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  componentStyle7: {flexDirection: 'row'},
  componentStyle8: {paddingLeft: 4},
  fileTypeTextStyle: {
    fontWeight: '400',
    fontSize: normalize(10.4),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  reminderStyle1: {
    height: 1,
    backgroundColor: '#EFF0F1',
  },
  modalOption1: {
    paddingBottom: 15,
    flexDirection: 'row',
    padding: 23,
    justifyContent: 'space-between',
  },
  modalOption2: {
    padding: 14,
    margin: 3,
    borderRadius: 5,
    //backgroundColor: 'red',
  },
  modalOption3: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOption4: {paddingRight: 15},
  // otherComponents1: {maxWidth: '75%', maxWidth: 250},
});

export default React.memo(PostComponent);
