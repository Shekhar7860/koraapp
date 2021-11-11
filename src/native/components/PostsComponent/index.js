import React from 'react';
import { connect } from 'react-redux';
import Toast from 'react-native-simple-toast';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import {Text} from '../KoraText';
import { FlatList } from 'react-native';
import { TextInput } from 'react-native-paper';
import { DateChangeTimeline, HeaderDateChangeTimeline } from '../Chat/index.js';
import { PostComponent } from './Post';
import { Icon } from '../../components/Icon/Icon';
import { BottomUpModal } from './../BottomUpModal';
import * as Constants from '../KoraText';
import { withTranslation } from 'react-i18next';
import {
  getAllPosts,
  getComments,
} from '../../../shared/redux/actions/discussions.action';
import { LOADING_MORE_POSTS } from '../../../shared/redux/constants/native.constants';
import { getTimeline, normalize } from '../../utils/helpers';
import { navigate } from '../../navigation/NavigationService';
import { ROUTE_NAMES } from '../../navigation/RouteNames';
import userAuth from '../../../shared/utils/userAuth';
import { setActiveBoard } from '../../../shared/redux/actions/message-thread.action';
import { emptyArray } from '../../../shared/redux/constants/common.constants';
import TimelineEventItem, { CreatorEventItem } from '../Chat/TimelineEventItem';
import { isEqual, debounce } from 'lodash';
import { AudioPlayer } from '../Chat/AudioPlayer';
import { Q } from '@nozbe/watermelondb';
import database from '../../../native/realm';
import * as Entity from '../../../native/realm/dbconstants';
import { Loader } from '../../screens/ChatsThreadScreen/ChatLoadingComponent';
var indexOfSearchItems = [];
var currentIndex = 0;

const ItemSeparatorComponent = React.memo(() => (
  <View style={styles.itemSeparatoeStyle} />
));
const FooterComponent = React.memo(() => (
  <View style={styles.itemFooterStyle} />
));

class PostsComponent extends React.Component {
  audioPlayer = null;
  constructor(props) {
    super();
    this.state = {
      searchMode: false,
      selectedFilterMessageIndex: 0,
      filteredMesages: [],
      highlightedIndex: 0,
      highLightedPostId: '',
      searchResults: [],
      dataList: [],
      inputValue: '',
      offset: 0,
      headerCurrentDate: null,
      showStickyHeader: false,
      universalSearchMode: props?.universalSearch || false,
    };
    this.lastUnreadPostId = null;
    this.unreadMarkerShown = false;
    this.scrolledToUnread = false;
    this.initialLoad = true;
    if (props.id) {
      //this.loadPosts()
    }
  }

  filterActionClick() {
    this.filtersheet.openBottomDrawer();
  }
  updateStickyDate = ({ viewableItems, changed }) => {
    if (viewableItems.length) {
      const lastItem = viewableItems.pop();
      if (
        changed &&
        lastItem.item?.deliveredOn !== this.state.headerCurrentDate
      ) {
        this.setState({
          headerCurrentDate: lastItem.item.deliveredOn,
        });
      }
    }
  };

  renderStickyTimeline = () => {
    const { headerCurrentDate } = this.state;
    return headerCurrentDate ? (
      <View style={styles.stickyDate}>
        <HeaderDateChangeTimeline title={headerCurrentDate} />
      </View>
    ) : null;
  };
  searchFunctionCalled(inputValue, searchMode) {
    this.setState({ searchMode, inputValue });
    indexOfSearchItems.length = 0;
    currentIndex = 0;
    this.searchMessages(inputValue);
    // if (inputValue === undefined || inputValue.trim().length === 0) {
    //   this.setState({highlightedIndex: 0});
    //   this.setState({
    //     dataList: this.props.posts || emptyArray,
    //   });
    // } else {
    //   const postListData = (this.props.posts || emptyArray).map(
    //     (item, index) => {
    //       if (!item?.components || !item?.components[0]) {
    //         return item;
    //       }
    //       let i = 0;
    //       let itemData = '';
    //       for (i = 0; i < item.components.length; i++) {
    //         if (item.components[i].componentType === 'text') {
    //           itemData = item.components[i]?.componentBody?.toUpperCase();
    //           break;
    //         }
    //       }

    //       const textData = inputValue.toUpperCase();

    //       var flag = itemData?.indexOf(textData) > -1;

    //       if (flag) {
    //         indexOfSearchItems.push(index);
    //         // return item;
    //         const searchItem = {
    //           ...JSON.parse(JSON.stringify(item)),
    //           components: item.components.map((o) => o),
    //           like: item.like,
    //           unlike: item?.unlike || emptyArray,
    //           laugh: item?.laugh || emptyArray,
    //           sad: item?.sad || emptyArray,
    //           shock: item?.shock || emptyArray,
    //           anger: item?.anger || emptyArray,
    //           active: true,
    //           isValid: () => true,
    //         };
    //         return searchItem;
    //       }
    //       return item;
    //     },
    //   );

    //   if (indexOfSearchItems.length > 0) {
    //     //  console.log(indexOfSearchItems + '------+++----');
    //     this.goIndex(indexOfSearchItems[0]);
    //     this.setState({
    //       highlightedIndex: indexOfSearchItems.length - currentIndex,
    //     });
    //     this.setState({
    //       dataList: postListData,
    //     });
    //   } else {
    //     this.setState({
    //       dataList: this.props.posts || emptyArray,
    //     });
    //   }
    // }
  }

  searchMessages = async (query) => {
    // if(query.length < 3) {
    //   return;
    // }
    try {
      this.setState({ highlightedMessageId: '' });
      this.setState({ filteredMesages: [] });
      if (query !== null && query !== '') {
        let searchString = '%' + query + '%';
        // let searchString = '%' + query + '%';
        const db = database.active;
        const msgsCollection = db.collections.get(Entity.Messages);
        console.log('search string', searchString);
        await db.write(async () => {
          const msgs = await msgsCollection
            .query(
              Q.unsafeSqlQuery(
                'SELECT * from Posts m left join Components c on c.post_id == m.id where c.componentBody LIKE ? and c.componentType = ?',
                [searchString, 'text'],
              ),
            )
            .fetchIds();

          let filterMessages = msgs;
          let finalMessages = this.props.posts.filter((s) => {
            return filterMessages.includes(s.id);
          });
          // console.log("posts changed", filterMessages, finalMessages);

          // for (var j = 0; j < finalMessages.length; j++) {
          //   let index = this.props.posts.findIndex(function (item, i) {
          //     console.log("item inn posts id",item.id);
          //     return item.id === finalMessages[j].id;
          //   });
          //   console.log("index find", index);
          //   if(index >= 0) {
          //     indexOfSearchItems.push(index);
          //   }
          // }
          this.setState({highlightedIndex: 0});
          this.setState({filteredMesages: finalMessages});

          if (finalMessages.length > 0) {
            this.setState({highlightedMessageId: finalMessages[0].postId});
          }

          // let id = finalMessages[highlightedIndex - 1];
          // var index = this.props.posts.findIndex(function(item, i){
          //   return item.id === id;
          // }); 

          // if(filterMessages.length > 0) {
          //   this.setState({
          //     highlightedIndex: highlightedIndex,
          //     highLightedPostId: this.props.posts[index].postId,
          //     searchResults: finalMessages,
          //   });
          // }
        
          // console.log("highlighted post id", this.props.posts[index].postId);
          // this.setState({selectedFilterMessageIndex: 0});
          // this.setState({filteredMesages: finalMessages});

          // if(finalMessages.length > 0) {

          //   this.setState({highlightedMessageId: finalMessages[0].id});
          // }

        })
      }
    } catch (e) {
      console.log(e);
    }
  };

  scrollToPost = (id, index) => {
    this.flatList_Ref?.scrollToIndex({
      animated: true,
      index: index,
    });
    setTimeout(() => {
      this.setState({ universalSearchMode: false });
    }, 1000);
  };
  goIndex = (indexNumber) => {
    this.flatList_Ref.scrollToIndex({ animated: true, index: indexNumber });
  };
  componentDidMount() {
    this.initialLoad = true;
    this.audioPlayer = new AudioPlayer();
    currentIndex = 0;
    if (this.props.activeBoardId !== this.props.boardId) {
      this.props.setActiveBoard({ boardId: this.props.boardId });
    }
    indexOfSearchItems.length = 0;
    this.props.onRef(this);
    this.setState({
      dataList: this.props.posts || emptyArray,
    });
    this.fetchPosts();
    if (this.props.universalSearch) {
      this.setState({ universalSearchMode: true });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.boardId !== this.props.boardId) {
      console.log('BOARD ID', this.props.boardId);
      this.setState({
        offset: 0,
        dataList: emptyArray,
      });
      // //this.fetchPosts();
      // const {wsId, boardId} = this.props;
      // let _params = {
      //   wsId: wsId,
      //   rId: boardId,
      //   offset: this.state.offset,
      //   limit: 40,
      // };
      // this.props.getAllPosts(_params);
    }
    if (this.props.posts !== prevProps.posts) {
      if (prevProps.posts?.length !== this.props.posts?.length) {
        this.lastUnreadPostId = undefined;
      }
      if (!this.unreadMarkerShown) {
        this.setLastUnreadPostId();
      }
      this.setState({
        dataList: this.props.posts || emptyArray,
        offset: this.props.posts?.length,
      });
    }
  }

  setLastUnreadPostId() {
    if (this.props.unreadCount == 0 || !this.props.unreadCount) {
      this.lastUnreadPostId = null;
    } else {
      const posts = this.props.posts?.filter(
        ({ type }) => type !== 'clientSideTimeline',
      );
      if (posts)
        this.lastUnreadPostId = posts[Number(this.props.unreadCount)]?.postId;
    }
    this.unreadMarkerShown = true;
    if (!this.scrolledToUnread) {
      // this.scrollToUnreadMarker();
      setTimeout(() => this.scrollToUnreadMarker(), 1000);
    }
  }

  scrollToUnreadMarker() {
    let item = this.props.posts?.filter(
      ({ postId }) => postId === this.lastUnreadPostId,
    );
    this.flatList_Ref?.scrollToItem({
      animated: true,
      item: item[0],
      viewPosition: 1,
    });

    // this.scrollToPost(this.lastUnreadPostId, Number(this.props.unreadCount));
    this.scrolledToUnread = true;
  }

  fetchPosts = (loadMore = false) => {
    console.log(
      'Calling posts pagination',
      this.props.moreAvailable !== false,
      this.state.offset,
    );
    if (
      this.state.offset > 0 &&
      (this.initialLoad || this.props.moreAvailable !== false)
    ) {
      if (this.initialLoad) {
        this.initialLoad = false;
      }
      const { wsId, boardId } = this.props;
      let _params = {
        wsId: wsId,
        rId: boardId,
        offset: this.state.offset,
        limit: 40,
      };
      this.props.getAllPosts(_params);
    }
  };

  // loadMore() {}

  componentWillUnmount() {
    this.props.onRef(undefined);
    if (this.audioPlayer) {
      this.audioPlayer?.stop();
      // this.audioPlayer?.destroy();
    }
    this.scrolledToUnread = false;
  }


  gotoNextSearchItem = (goUp = true) => {
    return () => {
      let {highlightedIndex, filteredMesages} = this.state;
      let total = filteredMesages.length;
      if (goUp) {
        if (highlightedIndex + 1 >= total) {
        } else {
          highlightedIndex += 1;
        }
      } else {
        if (highlightedIndex - 1 < 0) {
        } else {
          highlightedIndex -= 1;
        }
      }
      let idOfSelected = filteredMesages[highlightedIndex].id;
      var index = this.props.posts.findIndex(function (item, i) {
        return item.id === idOfSelected;
      });
      this.setState({
        highlightedIndex: highlightedIndex,
        highlightedMessageId: filteredMesages[highlightedIndex].postId,
      });
      this.scrollToPost(
        filteredMesages[highlightedIndex].postId,
        highlightedIndex,
      );
    };
  };

  // gotoNextSearchItem(goUp) {
  //   console.log(currentIndex + '----------Before---------------');
  //   if (goUp) {
  //     if (currentIndex === -1) {
  //       currentIndex = currentIndex + 2;
  //     }
  //     if (currentIndex < indexOfSearchItems.length) {
  //       var itemIndex = indexOfSearchItems[currentIndex];
  //       this.goIndex(itemIndex);
  //       console.log('Current index', currentIndex);
  //       this.setState({
  //         highlightedIndex: indexOfSearchItems.length - currentIndex,
  //       });
  //       currentIndex = currentIndex + 1;
  //     } else {
  //       Toast.showWithGravity(
  //         'You reached top item',
  //         Toast.SHORT,
  //         Toast.BOTTOM,
  //       );
  //     }
  //      console.log(currentIndex + '--next');
  //   } else {
  //     if (currentIndex === -1) {
  //       Toast.showWithGravity(
  //         'You reached bottom item',
  //         Toast.SHORT,
  //         Toast.BOTTOM,
  //       );
  //     } else {
  //       if (currentIndex !== 0) {
  //         currentIndex = currentIndex - 1;
  //       }
  //       var itemIndex = indexOfSearchItems[currentIndex];
  //       this.goIndex(itemIndex);
  //       this.setState({
  //         highlightedIndex: indexOfSearchItems.length - currentIndex,
  //       });
  //       if (currentIndex === 0) {
  //         currentIndex = currentIndex - 1;
  //       }
  //     }
  //     console.log(currentIndex + '--prev');
  //   }
  //       console.log(this.state.highlightedIndex);

  //   // this.setState({
  //   //   highLightedPostId:
  //   //     this.props.posts[indexOfSearchItems[currentIndex]].postId,
  //   // });

  // }

  getResult = (filteredMesages,highlightedIndex) =>{
    if(!filteredMesages || !highlightedIndex){
      return 'No Results';
    }
    return filteredMesages?.length > 0
      ? highlightedIndex +
        1 +
        '/' +
        filteredMesages.length
      : 'No Results'
  }

  renderSearchFooter() {
    let {highlightedIndex, filteredMesages} = this.state;
    let total = filteredMesages.length;
    let showUpArrow = highlightedIndex < total - 1;
    let showDownArrow = highlightedIndex >= 1;
    return (
      <View style={styles.searchFooter1}>
          <Text>
            {this.getResult(this.state?.filteredMesages,this.state?.highlightedIndex)}
          </Text>
        <View style={styles.searchFooter2}>
          {showUpArrow && (
            <View style={styles.searchFooter3}>
              <TouchableOpacity onPress={this.gotoNextSearchItem()}>
                <Icon name={'Up'} size={15} color={'#202124'} />
              </TouchableOpacity>
            </View>
          )}
          {showDownArrow && (
            <View style={styles.searchFooter4}>
              <TouchableOpacity onPress={this.gotoNextSearchItem(false)}>
                <Icon name={'Down'} size={15} color={'#202124'} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

  onCommentClicked = (post) => {
    // console.log('POST', post);
    // if (post.components[0]?.componentFileId === null) {
    //   return;
    // }
    navigate(ROUTE_NAMES.COMMENT_SECTION, {
      post,
      boardId: this.props.boardId,
    });
  };

  refHelper = (ref) => {
    this.flatList_Ref = ref;
  };

  keyExtractor = (item, index) => {
    if (typeof item?.isValid === 'function' && !item?.isValid()) {
      return index;
    }
    return item.id || index;
  };

  onEndReached = () => {
    // console.log('Called pagination for posts');
    this.fetchPosts(true);
  };

  onPress = (post) => {
    var fileIdNot = true;
    console.log('POST CLICKED', post);
    post?.components.map?.((data) => {
      if (
        data.componentType === 'image' ||
        data.componentType === 'video' ||
        data.componentType === 'audio' ||
        data.componentType === 'attachment'
      ) {
        if (data.componentFileId === null) {
          fileIdNot = false;
        }
      }
    });
    if (fileIdNot) {
      this.onCommentClicked(post);
    }
  };

  renderItem = ({ item, index }) => {
    if (item?.type === 'clientSideTimeline') {
      return <DateChangeTimeline title={item.deliveredOn} />;
    }
    var searchPostId = '';
    if (
      this.props.universalSearch &&
      item?.postId === this.props.searchPostId &&
      this.state.universalSearchMode
    ) {
      searchPostId = item?.postId;
      this.scrollToPost(item?.postId, index);
    }
    if (
      this.state.searchMode &&
      item?.postId === this.state.highlightedMessageId
    ) {
      searchPostId = item?.postId;
      // this.scrollToPost(item?.postId, index);
    }
    

    const list = this.state?.dataList;
    let showHeader = true;
    try {
      if (list[index + 1]) {
        let prevPost = list[index + 1];
        if (
          prevPost.postId &&
          item.postId &&
          prevPost?.from?.id &&
          item?.from?.id &&
          prevPost.from?.id === item.from?.id &&
          prevPost?.postType === item?.postType
        ) {
          const oldTimeline = getTimeline(prevPost?.deliveredOn, 'post');
          const newTimeline = getTimeline(item.deliveredOn, 'post');
          showHeader = oldTimeline !== newTimeline;
        }
      }
    } catch (e) {
      console.log('E', e?.message);
    }
    try {
      let showUnread = false;
      if (this.lastUnreadPostId === item.postId) {
        showUnread = true;
      }
      return (
        <>
          {showUnread && (
            <>
              <DateChangeTimeline title={'Unread'} />
              <ItemSeparatorComponent />
            </>
          )}
          <PostComponent
            showHeader={showHeader}
            onPress={this.onPress}
            post={item}
            boardId={this.props.boardId}
            titleName={this.props.titleName}
            itemIndex={index}
            onCommentClicked={this.onCommentClicked}
            onEditClicked={this.onEditClicked(index)}
            audioPlayer={this.audioPlayer}
            universalSearch={true}
            searchPostId={searchPostId}
            fromCommentSection={false}
            onRetryClick={this.props.onRetryClick}
          />
        </>
      );
    } catch (e) {
      console.log('RENDER ITEM', e);
      return null;
    }
  };

  onEditClicked = (index) => (post) => {
    this.props.onEditClicked(post, index);
  };

  renderListFooterComponent = () => {
    if (this.props.loadingMore) {
      return (
        <View style={styles.listFooter1}>
          <Loader size="small" />
        </View>
      );
    }
    if (this.props.moreAvailable === false) {
      return (
        <>
          <CreatorEventItem
            t={this.props.t}
            creator={this.props.creator}
            wsName={this.props.wsName}
          />
          <View style={{ height: 5 }} />
        </>
      );
    }
    return null;
    // return <FooterComponent />;
  };

  onScrollBeginDrag = () => {
    if (!this.state.showStickyHeader) {
      this.setState({ showStickyHeader: true });
    }
  };

  onMomentumScrollEnd = () => {
    if (this.state.showStickyHeader) {
      this.setState({ showStickyHeader: false });
    }
  };

  render() {
    if (this.props.showLoader) {
      return (
        <View style={styles.activityIndicator1}>
          <Loader size="small" />
        </View>
      );
    }

    // console.log('UNREAD COUNT', this.lastUnreadPostId);

    // if (this.props.posts?.length === 0) {
    //   return (
    //     <View
    //       style={{
    //         flex: 1,
    //         padding: 10,
    //         flexDirection: 'column-reverse',
    //         alignItems: 'center',
    //       }}>
    //       <Text>No posts yet</Text>
    //     </View>
    //   );
    // }
    let stickyIndices = [];
    // const l = this.props.posts.length;
    // this.props.posts.forEach((item, index) => {
    //   if (item.type === 'clientSideTimeline') {
    //     stickyIndices.push(index);
    //   }
    // });
    // console.log(this.state.dataList);
    return (
      <View style={styles.flatListParent}>
        <FlatList
          inverted
          keyboardShouldPersistTaps={'handled'}
          scrollEnabled={true}
          onScrollBeginDrag={this.onScrollBeginDrag}
          onMomentumScrollEnd={this.onMomentumScrollEnd}
          onViewableItemsChanged={this.updateStickyDate}
          removeClippedSubviews={true}
          extraData={this.lastUnreadPostId}
          data={this.state.dataList}
          keyExtractor={this.keyExtractor}
          onEndReached={this.onEndReached}
          stickyHeaderIndices={stickyIndices}
          ItemSeparatorComponent={ItemSeparatorComponent}
          onEndReachedThreshold={0.1}
          renderItem={this.renderItem}
          ListFooterComponent={this.renderListFooterComponent}
          ListHeaderComponent={FooterComponent}
          onScrollToIndexFailed={(info) => {
            const wait = new Promise((resolve) => setTimeout(resolve, 100));
            wait.then(() => {
              this.flatList_Ref.current?.scrollToIndex({
                index: info.index,
                animated: true,
              });
            });
          }}
          ref={this.refHelper}
        />
        {this.state.showStickyHeader ? this.renderStickyTimeline() : null}
        {this.state.searchMode ? this.renderSearchFooter(): null}

        <BottomUpModal
          ref={(ref) => {
            this.filtersheet = ref;
          }}>
          <View style={styles.bottomUpModal1}>
            <View style={styles.bottomUpModal2}>
              <Text style={styles.filtersTextStyle}>Filters</Text>
              <TouchableOpacity>
                <Text style={styles.resetTextStyle}>Reset</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomUpModal3} />

            <View style={styles.bottomUpModal4}>
              <Text style={styles.fromTextStyle}>From</Text>
              <TextInput
                style={styles.textInputStyle}
                placeholder="Type a name"
                placeholderTextColor="#BDC1C6"
              />
            </View>

            <View style={styles.bottomUpModal5}>
              <Text style={styles.dateRangeTextStyle}>Date Range</Text>
              <TextInput
                style={styles.dateTextInputStyle}
                placeholder="Select a Date"
                placeholderTextColor="#BDC1C6"
              />
            </View>

            <TouchableOpacity style={styles.bottomUpModal6}>
              <Text style={styles.textStyle}>Apply</Text>
            </TouchableOpacity>
          </View>
        </BottomUpModal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  unreadTextStyle: {
    fontSize: normalize(12),
    fontWeight: '400',
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
  },
  textStyle: {
    fontSize: normalize(12),
    fontWeight: '400',
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    color: 'white',
    textAlign: 'center',
  },
  dateTextInputStyle: {
    fontSize: normalize(12),
    fontWeight: '400',
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    borderColor: '#BDC1C6',
    borderRadius: 5,
    borderWidth: 1,
    height: 40,
    backgroundColor: '#FFF',
  },
  filtersTextStyle: {
    flex: 1,
    fontSize: normalize(12),
    fontWeight: '400',
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
  },
  stickyDate: {
    marginTop: 5,
    alignSelf: 'center',
    textAlign: 'center',
    height: 30,
    width: '100%',
    position: 'absolute',
  },
  mainContainer: {},
  resetTextStyle: {
    color: '#0D6EFD',
    fontSize: normalize(12),
    fontWeight: '400',
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
  },
  fromTextStyle: {
    fontSize: normalize(12),
    fontWeight: '400',
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    marginBottom: 10,
    color: 'black',
  },
  textInputStyle: {
    fontSize: normalize(12),
    fontWeight: '400',
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    borderColor: '#BDC1C6',
    borderRadius: 5,
    borderWidth: 1,
    height: 40,
    backgroundColor: '#FFF',
  },
  dateRangeTextStyle: {
    fontSize: normalize(12),
    fontWeight: '400',
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    marginBottom: 10,
    color: 'black',
    marginTop: 30,
  },
  itemSeparatoeStyle: { height: 5 },
  itemFooterStyle: { height: 10 },
  searchFooter1: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderColor: '#E4E5E7',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchFooter2: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  searchFooter3: { paddingHorizontal: 5 },
  searchFooter4: { paddingHorizontal: 5, marginStart: 10 },
  searchFooter5: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderColor: '#E4E5E7',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listFooter1: { padding: 10 },
  activityIndicator1: { flex: 1, padding: 10, flexDirection: 'column-reverse' },
  flatListParent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  bottomUpModal1: { flexDirection: 'column', padding: 10 },
  bottomUpModal2: {
    flexDirection: 'row',
    minHeight: 50,
    alignItems: 'center',
  },
  bottomUpModal3: {
    height: 1,
    backgroundColor: '#BDC1C6',
    marginTop: 10,
    marginBottom: 20,
  },
  bottomUpModal4: { flexDirection: 'column' },
  bottomUpModal5: { flexDirection: 'column' },
  bottomUpModal6: {
    backgroundColor: '#0D6EFD',
    minHeight: 40,
    justifyContent: 'center',
    marginTop: 20,
  },
});

export function addMessageTimelines(posts = [], unreadCount = 0) {
  if (unreadCount === 0) {
    unreadCount = -1;
  }
  if (!Array.isArray(posts)) {
    return [];
  }
  if (posts?.length === 0) {
    return [];
  }
  let newPosts = [];
  let lastDate = null;
  for (let i = 0; i < posts.length; i++) {
    const oldDate = new Date(lastDate);
    const newDate = new Date(posts[i].deliveredOn);
    let oldDateString =
      oldDate.getDate() + '' + oldDate.getMonth() + '' + oldDate.getFullYear();
    let newDateString =
      newDate.getDate() + '' + newDate.getMonth() + '' + newDate.getFullYear();

    if (lastDate && oldDateString !== newDateString) {
      newPosts.push({
        id: userAuth.generateId(),
        postId: userAuth.generateId(),
        type: 'clientSideTimeline',
        deliveredOn: lastDate,
      });
    }
    newPosts.push(posts[i]);
    lastDate = posts[i].deliveredOn;
  }

  newPosts.push({
    id: userAuth.generateId(),
    postId: userAuth.generateId(),
    type: 'clientSideTimeline',
    deliveredOn: lastDate,
  });
  return newPosts;
}

export default withTranslation()(PostsComponent);
