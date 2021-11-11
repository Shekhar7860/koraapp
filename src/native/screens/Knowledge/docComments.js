import React from 'react';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import moment from 'moment';
import {Header} from '../../navigation/TabStacks';
// import ReadMore from 'react-native-read-more-text';
// import {goBack} from '../../navigation/NavigationService';
import DocCommentItem from './DocCommentItem';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Linking,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
// import Clipboard from '@react-native-community/clipboard';
// import Toast from 'react-native-simple-toast';
import {Icon} from '../../components/Icon/Icon.js';
import {navigate} from '../../navigation/NavigationService';
import {getTimeline, normalize} from '../../utils/helpers';
import {
  getComments,
  resolvePost,
} from '../../../shared/redux/actions/knowledge.action';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
import {Avatar} from '../../components/Icon/Avatar';
// import MeetMoreInfo from './moreInfo.js';
// import EventDelete from './deleteEvent.js';
// import {url_regex} from '../../utils/regexconstants';
// import ContactsDao from '..../../dao/ContactsDao';
import {decode} from 'html-entities';
import HTML from 'react-native-render-html';
import * as UsersDao from '../../../dao/UsersDao';

const windowHeight = Dimensions.get('window').height;
const documentInfo = React.createRef();

class DocComments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 1,
      openComments: {},
      resolvedComments: {},
      assignedComments: {},
    };
  }

  componentDidMount() {
    this.filterComments();
    //this.props.getComments(this.props.route?.params?.board?.id);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.comments !== this.props.comments) {
      this.filterComments();
    }
  }

  filterComments() {
    let openComments = [],
      resolvedComments = [],
      assignedComments = [];
    this.props.comments.posts.map((item) => {
      if (item?.status === 'open' || item?.status === 'reopen') {
        openComments.push(item);
      } else if (item?.status === 'close') {
        resolvedComments.push(item || []);
      }
      if (item?.assignee === UsersDao.getUserId()) {
        assignedComments.push(item);
      }
    });
    this.setState({openComments, resolvedComments, assignedComments});
  }

  renderHeaderIcons() {
    return (
      <View style={styles.flexStyle}>
        <TouchableOpacity onPress={() => {}} style={styles.paddingStyle}>
          <View style={styles.commentCountView}>
            <Text style={styles.commentText}>1</Text>
          </View>
          <Icon name={'Comment_Icon'} size={normalize(24)} color="#202124" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}} style={styles.paddingStyle}>
          <Icon name={'options'} size={normalize(24)} color="#202124" />
        </TouchableOpacity>
      </View>
    );
  }

  showContent = ({item, index}) => {
    // console.log('index', JSON.stringify(item.description));
    return (
      <View style={{marginVertical: 5}}>
        <HTML
          source={{
            html: decode(item?.description),
          }}
        />
      </View>
    );
  };
  onCommentClick = (props) => {
    // console.log('Props clicked', props.showReplies);
    if (props.showReplies) {
      navigate(ROUTE_NAMES.DOC_COMMENT_REPLY, {commentData: props.data});
    }
  };

  renderItem = ({item}) => {
    let replyCount;
    if (item.commentCount === 1) {
      replyCount = item.commentCount + ' reply';
    } else if (item.commentCount > 1) {
      replyCount = item.commentCount + ' replies';
    }
    if (item.postType !== 'timeline') {
      return (
        <DocCommentItem
          onCommentClick={this.onCommentClick}
          showReplies={true}
          item={item}
          replyCount={replyCount}
        />
      );
    }
  };

  renderComments(comments) {
    console.log('Comments', comments);
    return (
      <FlatList
        data={comments}
        height={windowHeight - 180}
        showsVerticalScrollIndicator={false}
        style={styles.flatlistStyle}
        horizontal={false}
        ListEmptyComponent={() => this.renderNoData('No comments')}
        renderItem={this.renderItem}
      />
    );
  }

  renderNoData(text) {
    return (
      <View style={styles.noDataStyle}>
        <Text style={styles.greyText}>{text}</Text>
      </View>
    );
  }
  setCommentResolved(comment) {
    let status;
    if (comment?.status === 'close') {
      status = 'reopen';
    } else {
      status = 'close';
    }
    let payload = {
      classification: 'POSTS',
      status: status,
    };
    let params = {
      boardId: comment?.boardId,
      postId: comment?.postId,
    };
    this.props.resolvePost(params, payload);
  }

  render() {
    const {event} = this.state;
    // console.log('Comments', JSON.stringify(this.props.commentCount));
    return (
      <View style={styles.main}>
        <Header {...this.props} title={'Comments'} goBack={true} />
        <View>
          <View style={{flexDirection: 'row'}}>
            <View>
              <TouchableOpacity
                onPress={() => {
                  this.setState({currentTab: 1});
                }}
                style={styles.headerTabView}>
                <Icon name={'Open'} size={normalize(24)} color={'#202124'} />
                <Text style={styles.tabTextStyle}>{'Open'}</Text>
              </TouchableOpacity>
              {this.state.currentTab === 1 ? (
                <View style={styles.tabIndicator} />
              ) : null}
            </View>
            <View>
              <TouchableOpacity
                onPress={() => {
                  this.setState({currentTab: 2});
                }}
                style={styles.headerTabView}>
                <Icon
                  name={'Contacts'}
                  size={normalize(24)}
                  color={'#202124'}
                />
                <Text style={styles.tabTextStyle}>Assigned to me</Text>
              </TouchableOpacity>
              {this.state.currentTab === 2 ? (
                <View style={styles.tabIndicator} />
              ) : null}
            </View>
            <View>
              <TouchableOpacity
                onPress={() => {
                  this.setState({currentTab: 3});
                }}
                style={styles.headerTabView}>
                <Icon name={'Checked'} size={normalize(24)} color={'#202124'} />
                <Text style={styles.tabTextStyle}>Resolved</Text>
              </TouchableOpacity>
              {this.state.currentTab === 3 ? (
                <View style={styles.tabIndicator} />
              ) : null}
            </View>
          </View>
          <View
            style={{
              borderWidth: 1,
              borderColor: '#E4E5E7',
            }}
          />
          {this.state.currentTab === 1 &&
            this.renderComments(this.state.openComments)}

          {this.state.currentTab === 2 &&
            this.renderComments(this.state.assignedComments)}

          {this.state.currentTab === 3 &&
            this.renderComments(this.state.resolvedComments)}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  flatlistStyle: {margin: 16, marginTop: 0, paddingTop: 10},
  main: {flex: 1, backgroundColor: 'white'},
  flexStyle: {
    flexDirection: 'row',
  },
  textStyle: {
    fontSize: normalize(16),
    marginLeft: 22,
  },
  commentCountView: {
    width: 18,
    height: 18,
    backgroundColor: '#FFDA2D',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 18,
    top: 1,
    zIndex: 1,
  },
  tabTextStyle: {
    paddingHorizontal: 4,
    fontSize: normalize(14),
    fontWeight: '500',
    color: '#202124',
  },
  headerTabView: {
    padding: 12,
    marginTop: 5,
    alignItems: 'center',
    flexDirection: 'row',
  },
  tabIndicator: {
    borderWidth: 1,
    borderColor: '#0D6EFD',
  },
  greyText: {
    color: '#5F6368',
    fontSize: normalize(14),
    fontWeight: '400',
  },
  noDataStyle: {marginTop: 20, alignItems: 'center'},
  commentText: {fontSize: 9, fontWeight: '500'},
  paddingStyle: {padding: 5},
  moreLessText: {color: '#0D6EFD', fontSize: normalize(16)},
});

const mapStateToProps = (state) => {
  const {knowledge} = state;
  return {
    comments: knowledge.docComments,
    commentCount: knowledge.docComments?.total,
  };
};

export default connect(mapStateToProps, {getComments, resolvePost})(
  DocComments,
);
