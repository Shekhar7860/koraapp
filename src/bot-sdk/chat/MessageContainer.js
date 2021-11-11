import PropTypes from 'prop-types';
import React from 'react';

import {
  FlatList,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';

import LoadEarlier from './LoadEarlier';
import Message from './Message';
import Color from './Color';
import {warning, StylePropType} from './utils';
import {emptyObject} from '../../shared/redux/constants/common.constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerAlignTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  contentContainerStyle: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  emptyChatContainer: {
    flex: 1,
    transform: [{scaleY: -1}],
  },
  headerWrapper: {
    flex: 1,
  },
  listStyle: {
    flex: 1,
  },
  scrollToBottomStyle: {
    opacity: 0.8,
    position: 'absolute',
    right: 10,
    bottom: 30,
    zIndex: 999,
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: Color.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Color.black,
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 1,
  },
});

export default class MessageContainer extends React.PureComponent {
  state = {
    showScrollBottom: false,
  };

  renderFooter = () => {
    if (this.props.renderFooter) {
      return this.props.renderFooter(this.props);
    }

    return null;
  };

  renderLoadEarlier = () => {
    if (this.props.loadEarlier === true) {
      const loadEarlierProps = {
        ...this.props,
      };
      if (this.props.renderLoadEarlier) {
        return this.props.renderLoadEarlier(loadEarlierProps);
      }
      return <LoadEarlier {...loadEarlierProps} />;
    }
    return null;
  };

  scrollTo(options) {
    if (this.props.forwardRef && this.props.forwardRef.current && options) {
      this.props.forwardRef.current.scrollToOffset(options);
    }
  }

  scrollToBottom = (animated) => {
    const {inverted} = this.props;
    if (inverted) {
      this.scrollTo({offset: 0, animated});
    } else if (this.props.forwardRef && this.props.forwardRef.current) {
      this.props.forwardRef?.current?.scrollToEnd({animated});
    }
  };

  handleOnScroll = (event) => {
    const {
      nativeEvent: {
        contentOffset: {y: contentOffsetY},
        contentSize: {height: contentSizeHeight},
        layoutMeasurement: {height: layoutMeasurementHeight},
      },
    } = event;
    const {scrollToBottomOffset} = this.props;
    if (this.props.inverted) {
      if (contentOffsetY > scrollToBottomOffset) {
        this.setState({showScrollBottom: true});
      } else {
        this.setState({showScrollBottom: false});
      }
    } else {
      if (
        contentOffsetY < scrollToBottomOffset &&
        contentSizeHeight - layoutMeasurementHeight > scrollToBottomOffset
      ) {
        this.setState({showScrollBottom: true});
      } else {
        this.setState({showScrollBottom: false});
      }
    }
  };

  renderRow = ({item, index}) => {
    const {messages, inverted, ...restProps} = this.props;
    if (messages) {
      const previousMessage =
        (inverted ? messages[index + 1] : messages[index - 1]) || emptyObject;
      const nextMessage =
        (inverted ? messages[index - 1] : messages[index + 1]) || emptyObject;

      var position = 'right';
      switch (item.type) {
        case 'bot_response':
          position = 'left';
          // let message = item?.message[0];
          // let payload = message?.component?.payload;
          // if (payload?.type == 'template') {
          //   position = 'center';
          // }

          if (
            item.message &&
            item.message[0] &&
            item.message[0].component &&
            item.message[0].component.payload &&
            item.message[0].component.payload.type &&
            item.message[0].component.type === 'template' &&
            item.message[0].component.payload.payload &&
            item.message[0].component.payload.payload.template_type &&
            item.message[0].component.payload.payload.template_type !==
              'start_timer' &&
            item.message[0].component.payload.payload.template_type !==
              'quick_replies'
          ) {
            position = 'center';
          }

          break;
        default:
          break;
      }
      item = {
        ...item,
        totalLenght: messages ? messages.length : 0,
        itemIndex: index,
        position: position,
      };
      const messageProps = {
        ...restProps,
        key: item._id,
        currentMessage: item,
        previousMessage,
        inverted,
        nextMessage,
        position: position,
      };

      if (this.props.renderMessage) {
        return this.props.renderMessage(messageProps);
      }
      return <Message {...messageProps} />;
    }
    return null;
  };

  renderChatEmpty = () => {
    if (this.props.renderChatEmpty) {
      return this.props.inverted ? (
        this.props.renderChatEmpty()
      ) : (
        <View style={styles.emptyChatContainer}>
          {this.props.renderChatEmpty()}
        </View>
      );
    }
    return <View style={styles.container} />;
  };

  renderHeaderWrapper = () => (
    <View style={styles.headerWrapper}>{this.renderLoadEarlier()}</View>
  );

  renderScrollBottomComponent() {
    const {scrollToBottomComponent} = this.props;

    if (scrollToBottomComponent) {
      return scrollToBottomComponent();
    }

    return <Text>V</Text>;
  }

  renderScrollToBottomWrapper() {
    const propsStyle = this.props.scrollToBottomStyle || emptyObject;
    return (
      <View style={[styles.scrollToBottomStyle, propsStyle]}>
        <TouchableOpacity
          onPress={() => this.scrollToBottom()}
          hitSlop={{top: 5, left: 5, right: 5, bottom: 5}}>
          {this.renderScrollBottomComponent()}
        </TouchableOpacity>
      </View>
    );
  }

  onLayoutList = () => {
    if (
      !this.props.inverted &&
      !!this.props.messages &&
      this.props.messages?.length
    ) {
      setTimeout(
        () => this.scrollToBottom && this.scrollToBottom(false),
        15 * this.props.messages?.length,
      );
    }
  };

  onEndReached = (distanceFromEnd) => {
    const {
      loadEarlier,
      onLoadEarlier,
      infiniteScroll,
      isLoadingEarlier,
    } = this.props;
    if (
      infiniteScroll &&
      distanceFromEnd > 0 &&
      distanceFromEnd <= 100 &&
      loadEarlier &&
      onLoadEarlier &&
      !isLoadingEarlier &&
      Platform.OS !== 'web'
    ) {
      onLoadEarlier();
    }
  };

  getItemId = (pattern) => {
    var _pattern = pattern || 'xyxxyx';
    _pattern = _pattern.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    return _pattern;
  };

  keyExtractor = (item) => {
    if (item.itemId) {
      return item.itemId;
    } else {
      const itemId = this.getItemId();
      item = {
        ...item,
        itemId,
      };
      return item.itemId;
    }
  };

  render() {
    const {inverted} = this.props;
    return (
      <View
        style={
          this.props.alignTop ? styles.containerAlignTop : styles.container
        }>
        {this.state.showScrollBottom && this.props.scrollToBottom
          ? this.renderScrollToBottomWrapper()
          : null}
        <FlatList
          ref={this.props.forwardRef}
          extraData={[this.props.extraData, this.props.isTyping]}
          keyExtractor={this.keyExtractor}
          enableEmptySections
          automaticallyAdjustContentInsets={false}
          inverted={inverted}
          data={this.props.messages}
          style={styles.listStyle}
          contentContainerStyle={styles.contentContainerStyle}
          renderItem={this.renderRow}
          {...this.props.invertibleScrollViewProps}
          ListEmptyComponent={this.renderChatEmpty}
          ListFooterComponent={
            inverted ? this.renderHeaderWrapper : this.renderFooter
          }
          ListHeaderComponent={
            inverted ? this.renderFooter : this.renderHeaderWrapper
          }
          onScroll={this.handleOnScroll}
          scrollEventThrottle={100}
          onLayout={this.onLayoutList}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={0.1}
          {...this.props.listViewProps}
          nestedScrollEnabled={true}
        />
      </View>
    );
  }
}

MessageContainer.defaultProps = {
  messages: [],
  isTyping: false,
  renderChatEmpty: null,
  renderFooter: null,
  renderMessage: null,
  onLoadEarlier: () => {},
  onQuickReply: () => {},
  inverted: true,
  loadEarlier: false,
  listViewProps: {},
  invertibleScrollViewProps: {},
  extraData: null,
  scrollToBottom: false,
  scrollToBottomOffset: 0,
  alignTop: false,
  scrollToBottomStyle: {},
  infiniteScroll: false,
  isLoadingEarlier: false,
};

MessageContainer.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object),
  isTyping: PropTypes.bool,
  renderChatEmpty: PropTypes.func,
  renderFooter: PropTypes.func,
  renderMessage: PropTypes.func,
  renderLoadEarlier: PropTypes.func,
  onLoadEarlier: PropTypes.func,
  listViewProps: PropTypes.object,
  inverted: PropTypes.bool,
  loadEarlier: PropTypes.bool,
  invertibleScrollViewProps: PropTypes.object,
  extraData: PropTypes.object,
  scrollToBottom: PropTypes.bool,
  scrollToBottomOffset: PropTypes.number,
  scrollToBottomComponent: PropTypes.func,
  alignTop: PropTypes.bool,
  scrollToBottomStyle: StylePropType,
  infiniteScroll: PropTypes.bool,
};
