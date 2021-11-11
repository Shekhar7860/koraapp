import React from 'react';
import {View, FlatList, StyleSheet, ActivityIndicator} from 'react-native';
import PropTypes from 'prop-types';
import {Q} from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';

import {ThreadsListViewItem} from './chats-thread';
import * as Entity from '../../../native/realm/dbconstants';
import database from '../../../native/realm';

class _ThreadsListView extends React.Component {
  constructor(props) {
    super(props);
    // this.flatListRef = React.createRef();
    this.state = {
      openIndex: 0,
      data: [],
      isFetching: false,
    };
  }

  subscribeBoards = (queryItem) => {
    try {
      const db = database.active;

      if (this.boardsSubscription && this.boardsSubscription.unsubscribe) {
        this.boardsSubscription.unsubscribe();
      }

      let types = ['directChat', 'groupChat', 'discussion'];
      const whereClause = [
        Q.where('type', Q.oneOf(types)),
        Q.experimentalSortBy('sortTime', Q.desc),
      ];

      this.boardsObservable = db.collections
        .get(Entity.Boards)
        .query(...whereClause)
        .observeWithColumns(['updated_at']);
      this.boardsSubscription = this.boardsObservable.subscribe((boards) => {
        const displayingBoards = this.getFilteredBoards(boards, queryItem);

        this.setState({
          boards: boards,
          displayingBoards: displayingBoards,
          queryItem: queryItem,
        });
      });
    } catch (e) {
      console.log('ThreadListView error : ', e);
    }
  };

  loadMoreBoards = () => {
    const {displayingBoards} = this.state;
    let offset = 0;
    if (displayingBoards) {
      offset = displayingBoards.length;
    }
    if (this.props.loadMoreBoards) {
      this.props.loadMoreBoards(offset);
    }
  };

  getFilteredBoards = (allBoards, queryItem) => {
    if (!queryItem) {
      return allBoards;
    }

    var filter = queryItem?.id || 'everything';
    let boards = allBoards.filter((board) => {
      return (
        board.sortTime.getTime() >= queryItem?.lastBoardSortTime?.getTime()
      );
    });
    switch (filter) {
      case 'starred':
        return boards.filter((board) => {
          return board?.star == true;
        });
      case 'chat':
      case 'chats':
        return boards.filter((board) => {
          return board?.type !== 'discussion';
        });
      case 'discussion':
        return boards.filter((board) => {
          return board?.type === 'discussion';
        });
      case 'unread':
        return boards.filter((board) => {
          return board?.unreadCount > 0;
        });
      case 'muted':
        return boards.filter((board) => {
          return board?.notifications?.mute?.till > new Date().getTime();
        });
      case 'share':
        let types = ['directChat', 'groupChat', 'discussion'];
        return boards.filter((board) => {
          return types.includes(board?.type);
        });
      case 'all':
      case 'everything':
      default:
        return boards;
    }
  };

  componentDidMount() {
    const {queryItem} = this.props;
    this.subscribeBoards(queryItem);
  }

  componentWillUnmount() {
    if (this.boardsSubscription && this.boardsSubscription.unsubscribe) {
      this.boardsSubscription.unsubscribe();
    }
  }

  componentDidUpdate(prevProps) {
    const {queryItem} = this.props;
    // if (prevProps.queryItem?.id !== queryItem?.id) {
    //   this.flatListRef.current.scrollToOffset({animated: true, offset: 0});
    // }
    if (
      prevProps.queryItem?.id !== queryItem?.id ||
      prevProps.queryItem?.lastBoardSortTime !== queryItem?.lastBoardSortTime
    ) {
      this.setState({queryItem}, () => this.subscribeBoards(queryItem));
    }
  }

  callOnpullrefesh() {
    setTimeout(
      function () {
        this.setState({isFetching: false});
      }.bind(this),
      1000,
    );
  }

  onRefresh = () => {};

  renderFooter() {
    let queryItem = this.props.queryItem;
    const moreAvailable = queryItem?.moreAvailable || false;
    if (moreAvailable) {
      return (
        <View style={styles.footerContainer}>
          <ActivityIndicator color="#517BD2" size="small" />
        </View>
      );
    } else {
      return null;
    }
  }

  onThreadClick = (data) => {
    if (this.props.sendButton && this.props.sendShareButton) {
      this.props.sendShareButton(data);
    } else {
      this.props.onThreadClick(data);
    }
  };

  buttonAction = (data) => {
    switch (data.action) {
      case 'muteAction':
        this.props.onMuteClicked(
          data.payload?.boardId,
          data.payload?.requestObj,
        );
        break;
      case 'starAction':
        this.props.onStarButtonClick(
          data.payload?.boardId,
          data.payload?.starStatus,
        );
        break;
      case 'deleteAction':
        this.props.onDeleteButtonClick(
          data.payload?.boardId,
          data?.payload?.type,
        );
      case 'unmuteAction':
        this.props.onMuteClicked(
          data.payload?.boardId,
          data.payload?.requestObj,
          'unmuteAction',
        );
        break;
    }
  };

  muteAction = (data) => {
    this.props.onMuteClicked(data);
  };

  renderItem = (props) => {
    const {item, index} = props;
    return (
      <ThreadsListViewItem
        board={item}
        index={index}
        onThreadClick={this.onThreadClick}
        buttonAction={this.buttonAction}
        muteButtonClicked={this.muteAction}
      />
    );
  };

  keyExtractor = (item, index) => {
    if (typeof item?.isValid === 'function' && !item?.isValid()) {
      return index;
    }

    return item?.id || index;
  };

  renderList() {
    const {displayingBoards} = this.state;
    // if (!loading && data.length === 0) {
    //   return null;
    // }
    // if (loading && data.length === 0) {
    //   return <Loader />;
    // }
    return (
      <FlatList
        removeClippedSubviews={true}
        // ref={this.flatListRef}
        contentContainerStyle={styles.containerStyle}
        data={displayingBoards}
        extraData={this.state}
        initialNumToRender={10}
        onEndReachedThreshold={0.1}
        maxToRenderPerBatch={10}

        windowSize={30}
        refreshing={this.state.isFetching}
        onEndReached={this.loadMoreBoards}
        style={styles.listBackGround}
        renderItem={this.renderItem}
        ListFooterComponent={this.renderFooter.bind(this)}
        ListFooterComponentStyle={styles.listFooterStyle}
        keyExtractor={this.keyExtractor}
      />
    );
  }

  render() {
    // console.log('=================ThreadsListView.js================');
    return <View style={styles.listStyle}>{this.renderList()}</View>;
  }
}

export const ThreadsListView = React.memo(_ThreadsListView);

ThreadsListView.propTypes = {
  onStarButtonClick: PropTypes.func,
  onMuteClicked: PropTypes.func,
  queryItem: PropTypes.object,
};

ThreadsListView.defaultProps = {
  onStarButtonClick: () => {},
  onMuteClicked: () => {},
};

const styles = StyleSheet.create({
  containerStyle: {flexGrow: 1},
  listFooterStyle: {height: 44},
  listStyle: {flex: 1},
  listBackGround: {
    backgroundColor: 'white',
  },
  footerContainer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'white',
  },
});
