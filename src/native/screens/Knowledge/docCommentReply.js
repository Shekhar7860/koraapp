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
  KeyboardAvoidingView,
} from 'react-native';
import {isIOS} from '../../utils/PlatformCheck';
import {Icon} from '../../components/Icon/Icon.js';
import {navigate} from '../../navigation/NavigationService';
import {getTimeline, normalize} from '../../utils/helpers';
import {
  getReplies,
  addReply,
} from '../../../shared/redux/actions/knowledge.action';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
import {Avatar} from '../../components/Icon/Avatar';
import {decode} from 'html-entities';
import HTML from 'react-native-render-html';
import {Loader} from '../ChatsThreadScreen/ChatLoadingComponent';
import KoraKeyboardAvoidingView from '../../components/KoraKeyboardAvoidingView';
import userAuth from '../../../shared/utils/userAuth';

const windowHeight = Dimensions.get('window').height;

class DocCommentReply extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      inputTextValue: '',
      sendVisible: false,
      replies: {},
    };
    this.scrollRef = React.createRef();
  }

  componentDidMount() {
    // this.refs.input?.focus();
    let {commentData} = this.props.route?.params;
    let _params = {
      boardId: commentData.boardId,
      postId: commentData.postId,
    };
    this.props.getReplies(_params);
  }

  sendText = () => {
    let {commentData} = this.props.route?.params;

    let _params = {
      boardId: commentData.boardId,
      postId: commentData.postId,
    };
    let blocks = [
      {
        componentId: userAuth.generateId(),
        componentType: 'text',
        componentBody: this.state.inputTextValue,
      },
    ];
    let payload = {
      classification: 'POSTS',
      mentions: [],
      hashTag: [],
      linkPreviews: [],
      components: blocks,
    };
    this.props.addReply(_params, payload);
    this.refs.input?.clear();
    this.setState({sendVisible: false});
  };

  componentDidUpdate(prevProps) {
    if (prevProps.replies !== this.props.replies) {
      this.setState({loading: false, replies: this.props.replies});
      this.scrollRef?.current?.scrollToEnd();
    }
  }

  renderItem = ({item}) => {
    let replyCount;
    if (item.commentCount === 1) {
      replyCount = item.commentCount + ' reply';
    } else if (item.commentCount > 1) {
      replyCount = item.commentCount + ' replies';
    }
    if (item.postType !== 'timeline') {
      return (
        <View style={{flexDirection: 'row', paddingHorizontal: 16}}>
          <Avatar
            rad={32}
            name={item?.author?.fN}
            color={item?.author?.color || item?.author?.profColour}
            profileIcon={item?.author?.icon}
            userId={item?.author?.id}
          />
          <View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text
                style={{
                  fontWeight: '500',
                  fontSize: normalize(16),
                  color: '#202124',
                  marginHorizontal: 8,
                }}>
                {item?.author?.fN + ' ' + item?.author?.lN}
              </Text>
              <Text style={[styles.greyText]}>
                {getTimeline(item?.createdOn, 'thread')}
              </Text>
            </View>
            <View style={{padding: 7}}>
              <HTML
                baseFontStyle={{
                  fontSize: normalize(16),
                  fontWeight: '400',
                  color: '#202124',
                }}
                source={{
                  html: decode(item.components[0].componentBody),
                }}
              />
            </View>
          </View>
        </View>
      );
    }
  };

  renderNoData(text) {
    return (
      <View style={styles.noDataStyle}>
        <Text style={styles.greyText}>{text}</Text>
      </View>
    );
  }

  onCommentClick = (props) => {
    console.log('Reply clicked', props.showReplies);
  };

  itemSeperator = () => {
    return (
      <View
        style={{
          borderTopWidth: 1,
          borderColor: '#E4E5E7',
          marginTop: 10,
          marginBottom: 16,
        }}
      />
    );
  };

  onComposebarTextChange = (inputTextValue) => {
    if (inputTextValue !== '') {
      this.setState({sendVisible: true});
    } else {
      this.setState({sendVisible: false});
    }
    this.setState({inputTextValue});
  };

  render() {
    const {event} = this.state;
    return (
      <SafeAreaView style={styles.main}>
        <Header {...this.props} title={'Comments'} goBack={true} />
        <View style={{paddingTop: 10, flex: 1}}>
          <View style={{paddingHorizontal: 15}}>
            <DocCommentItem
              onCommentClick={this.onCommentClick}
              showReplies={false}
              item={this.props.route.params.commentData}
              replyCount={0}
            />
          </View>

          {this.state.loading ? (
            <View style={{paddingTop: 20}}>
              <Loader />
            </View>
          ) : (
            <FlatList
              ref={this.scrollRef}
              data={this.state.replies.comments}
              showsVerticalScrollIndicator={false}
              renderItem={this.renderItem}
              ItemSeparatorComponent={this.itemSeperator}
            />
          )}
        </View>
        <KeyboardAvoidingView
          enabled={true}
          keyboardVerticalOffset={10}
          behavior={isIOS ? 'padding' : null}
          style={{
            borderTopWidth: 1,
            borderColor: '#E4E5E7',
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Icon name={'Comment_Icon'} size={normalize(20)} color="#202124" />
          <TextInput
            ref="input"
            style={{
              flex: 1,
              fontSize: normalize(17),
              fontWeight: '400',
              marginLeft: 10,
              paddingBottom: 6,
            }}
            multiline
            placeholderTextColor="#BDC1C6"
            placeholder={'Add Reply'}
            onChangeText={this.onComposebarTextChange}
            value={this.state.inputTextValue}
          />
          {this.state.sendVisible && (
            <TouchableOpacity
              onPress={this.sendText}
              style={styles.sendViewStyle}>
              <Icon color={'#FFFFFF'} name={'SendIcon'} size={normalize(14)} />
            </TouchableOpacity>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  main: {flex: 1, backgroundColor: 'white'},
  greyText: {
    color: '#5F6368',
    fontSize: normalize(12),
    fontWeight: '500',
  },
  sendViewStyle: {
    backgroundColor: '#0D6EFD',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    height: 28,
    width: 28,
  },
});

const mapStateToProps = (state) => {
  const {knowledge} = state;
  return {
    replies: knowledge.docCommentReply,
  };
};

export default connect(mapStateToProps, {getReplies, addReply})(
  DocCommentReply,
);
