import PropTypes from 'prop-types';
import React from 'react';
import {
  Platform,
  StyleSheet,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import uuid from 'react-native-uuid';
import {getBottomSpace} from 'react-native-iphone-x-helper';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

import * as utils from './utils';
import Actions from './Actions';
import Avatar from './Avatar';
import Bubble from './Bubble';
import MessageText from './MessageText';
import Composer from './Composer';
import Day from './Day';
import InputToolbar from './InputToolbar';
import LoadEarlier from './LoadEarlier';
import Message from './Message';
import MessageContainer from './MessageContainer';
import Send from './Send';
import Time from './Time';
import UserAvatar from './UserAvatar';
import {emptyArray} from '../../shared/redux/constants/common.constants';

import {
  MIN_COMPOSER_HEIGHT,
  MAX_COMPOSER_HEIGHT,
  DEFAULT_PLACEHOLDER2,
  TIME_FORMAT,
  DATE_FORMAT,
} from './Constant';

dayjs.extend(localizedFormat);

class KoraChat extends React.Component {
  isKeyboardOpened = false;
  isMounted = false;
  _keyboardHeight = 0;
  _bottomOffset = 0;
  _maxHeight = null;
  _isFirstLayout = true;
  _locale = 'en';
  invertibleScrollViewProps = null;
  _actionSheetRef = null;
  _messageContainerRef = React.createRef();
  _isTextInputWasFocused = false;
  textInput = null;

  state = {
    isInitialized: false,
    composerHeight: this.props.minComposerHeight,
    messagesContainerHeight: null,
    typingDisabled: false,
    text: null,
    messages: null,
  };

  constructor(props) {
    super(props);

    this.invertibleScrollViewProps = {
      inverted: this.props.inverted,
      keyboardShouldPersistTaps: this.props.keyboardShouldPersistTaps,
      onKeyboardWillShow: this.onKeyboardWillShow,
      onKeyboardWillHide: this.onKeyboardWillHide,
      onKeyboardDidShow: this.onKeyboardDidShow,
      onKeyboardDidHide: this.onKeyboardDidHide,
    };
  }

  static append(currentMessages = [], messages) {
    if (!Array.isArray(messages)) {
      messages = [messages];
    }
    return messages.concat(currentMessages);
  }

  getChildContext() {
    return {
      actionSheet:
        this.props.actionSheet || (() => this._actionSheetRef.getContext()),
      getLocale: this.getLocale,
    };
  }

  componentDidMount() {
    const {messages, text} = this.props;
    this.setIsMounted(true);
    this.initLocale();
    this.setMessages(messages || []);
    this.setTextFromProp(text);
  }

  componentWillUnmount() {
    this.setIsMounted(false);
  }

  componentDidUpdate(prevProps = {}) {
    const {messages, text, inverted} = this.props;

    if (this.props !== prevProps) {
      this.setMessages(messages || []);
    }

    if (
      inverted === false &&
      messages &&
      prevProps.messages &&
      messages.length !== prevProps.messages.length
    ) {
      setTimeout(() => this.scrollToBottom(false), 200);
    }

    if (text !== prevProps.text) {
      this.setTextFromProp(text);
    }
  }

  initLocale() {
    if (this.props.locale === null) {
      this.setLocale('en');
    } else {
      this.setLocale(this.props.locale || 'en');
    }
  }

  setLocale(locale) {
    this._locale = locale;
  }

  getLocale = () => this._locale;

  setTextFromProp(textProp) {
    // Text prop takes precedence over state.
    if (textProp !== undefined && textProp !== this.state.text) {
      this.setState({text: textProp});
    }
  }

  getTextFromProp(fallback) {
    if (this.props.text === undefined) {
      return fallback;
    }
    return this.props.text;
  }

  setMessages(messages) {
    this.setState({messages});
  }

  getMessages() {
    return this.state.messages;
  }

  setMaxHeight(height) {
    this._maxHeight = height;
  }

  getMaxHeight() {
    return this._maxHeight;
  }

  setKeyboardHeight(height) {
    this._keyboardHeight = height;
  }

  getKeyboardHeight() {
    if (Platform.OS === 'android' && !this.props.forceGetKeyboardHeight) {
      // For android: on-screen keyboard resized main container and has own height.
      // @see https://developer.android.com/training/keyboard-input/visibility.html
      // So for calculate the messages container height ignore keyboard height.
      return 0;
    }
    return this._keyboardHeight;
  }

  setBottomOffset(value) {
    this._bottomOffset = value;
  }

  getBottomOffset() {
    return this._bottomOffset;
  }

  setIsFirstLayout(value) {
    this._isFirstLayout = value;
  }

  getIsFirstLayout() {
    return this._isFirstLayout;
  }

  setIsTypingDisabled(value) {
    this.setState({
      typingDisabled: value,
    });
  }

  getIsTypingDisabled() {
    return this.state.typingDisabled;
  }

  setIsMounted(value) {
    this._isMounted = value;
  }

  getIsMounted() {
    return this._isMounted;
  }

  getMinInputToolbarHeight() {
    return this.props.renderAccessory
      ? this.props.minInputToolbarHeight * 2
      : this.props.minInputToolbarHeight;
  }

  calculateInputToolbarHeight(composerHeight) {
    return (
      composerHeight +
      (this.getMinInputToolbarHeight() - this.props.minComposerHeight)
    );
  }

  /**
   * Returns the height, based on current window size, without taking the keyboard into account.
   */
  getBasicMessagesContainerHeight1(composerHeight = this.state.composerHeight) {
    const toolbarheight =
      Platform.OS === 'android'
        ? this.calculateInputToolbarHeight(composerHeight)
        : 0;

    return this.getMaxHeight() - toolbarheight; //this.calculateInputToolbarHeight(composerHeight)
  }
  getBasicMessagesContainerHeight(composerHeight = this.state.composerHeight) {
    const toolbarheight =
      Platform.OS === 'android'
        ? this.calculateInputToolbarHeight(composerHeight)
        : 0;

    return (
      this.getMaxHeight() - this.calculateInputToolbarHeight(composerHeight)
    );
  }

  /**
   * Returns the height, based on current window size, taking the keyboard into account.
   */
  getMessagesContainerHeightWithKeyboard(
    composerHeight = this.state.composerHeight,
  ) {
    const offsetValue = Platform.OS === 'android' ? 0 : this.getBottomOffset();
    return (
      this.getBasicMessagesContainerHeight(composerHeight) -
      this.getKeyboardHeight() -
      offsetValue
    );
  }
  getMessagesContainerHeightWithKeyboard1(
    composerHeight = this.state.composerHeight,
  ) {
    const offsetValue = Platform.OS === 'android' ? 0 : this.getBottomOffset();
    return (
      this.getBasicMessagesContainerHeight1(composerHeight) -
      this.getKeyboardHeight() -
      offsetValue
    );
  }

  safeAreaSupport = (bottomOffset = 0) => {
    return bottomOffset != null ? bottomOffset : getBottomSpace();
  };

  /**
   * Store text input focus status when keyboard hide to retrieve
   * it after wards if needed.
   * `onKeyboardWillHide` may be called twice in sequence so we
   * make a guard condition (eg. showing image picker)
   */
  handleTextInputFocusWhenKeyboardHide() {
    if (!this._isTextInputWasFocused) {
      this._isTextInputWasFocused = this.textInput?.isFocused() || false;
    }
  }

  /**
   * Refocus the text input only if it was focused before showing keyboard.
   * This is needed in some cases (eg. showing image picker).
   */
  handleTextInputFocusWhenKeyboardShow() {
    if (
      this.textInput &&
      this._isTextInputWasFocused &&
      !this.textInput.isFocused()
    ) {
      this.textInput.focus();
    }

    // Reset the indicator since the keyboard is shown
    this._isTextInputWasFocused = false;
  }

  onKeyboardWillShow = (e) => {
    // console.log(' ------------>  3  <-------------------');
    this.handleTextInputFocusWhenKeyboardShow();
    this.isKeyboardOpened = true;
    if (this.props.isKeyboardInternallyHandled) {
      this.setIsTypingDisabled(true);
      this.setKeyboardHeight(
        e.endCoordinates ? e.endCoordinates.height : e.end.height,
      );
      this.setBottomOffset(this.safeAreaSupport(this.props.bottomOffset));
      const newMessagesContainerHeight =
        this.getMessagesContainerHeightWithKeyboard();
      this.setState({
        messagesContainerHeight: newMessagesContainerHeight,
      });
    }
  };

  onKeyboardWillHide = (_e) => {
    this.handleTextInputFocusWhenKeyboardHide();

    if (this.props.isKeyboardInternallyHandled) {
      this.setIsTypingDisabled(true);
      this.setKeyboardHeight(0);
      this.setBottomOffset(0);
      const newMessagesContainerHeight = this.getBasicMessagesContainerHeight();
      this.setState({
        messagesContainerHeight: newMessagesContainerHeight,
      });
    }
  };

  onKeyboardDidShow = (e) => {
    if (Platform.OS === 'android') {
      this.onKeyboardWillShow(e);
    }
    this.setIsTypingDisabled(false);
  };

  onKeyboardDidHide = (e) => {
    if (Platform.OS === 'android') {
      this.onKeyboardWillHide(e);
    }
    this.setIsTypingDisabled(false);
  };

  scrollToBottom(animated = true) {
    if (this._messageContainerRef && this._messageContainerRef.current) {
      const {inverted} = this.props;
      if (!inverted) {
        this._messageContainerRef.current.scrollToEnd({animated});
      } else {
        this._messageContainerRef.current.scrollToOffset({
          offset: 0,
          animated,
        });
      }
    }
  }

  renderMessages() {
    const {messagesContainerStyle, ...messagesContainerProps} = this.props;
    const fragment = (
      <View
        style={[
          {
            height: this.props.isTypingIndicator
              ? this.state.messagesContainerHeight - 30
              : this.state.messagesContainerHeight,
          },
          messagesContainerStyle,
        ]}>
        <MessageContainer
          {...messagesContainerProps}
          invertibleScrollViewProps={this.invertibleScrollViewProps}
          messages={this.getMessages()}
          forwardRef={this._messageContainerRef}
          isTyping={this.props.isTyping}
        />

        {this.renderChatFooter()}
      </View>
    );

    return this.props.isKeyboardInternallyHandled ? (
      <KeyboardAvoidingView enabled>{fragment}</KeyboardAvoidingView>
    ) : (
      fragment
    );
  }

  onSend = (message, shouldResetInputToolbar = false) => {
    if (shouldResetInputToolbar === true) {
      this.setIsTypingDisabled(true);
      this.resetInputToolbar();
    }
    if (this.props.onSend) {
      this.props.onSend(message.text);
    }

    if (shouldResetInputToolbar === true) {
      setTimeout(() => {
        if (this.getIsMounted() === true) {
          this.setIsTypingDisabled(false);
        }
      }, 100);
    }
  };

  resetInputToolbar() {
    //console.log(' ------------>  4  <-------------------');
    if (this.textInput) {
      this.textInput.clear();
    }
    this.notifyInputTextReset();
    const newComposerHeight = this.props.minComposerHeight;
    const newMessagesContainerHeight =
      this.getMessagesContainerHeightWithKeyboard1(newComposerHeight);
    this.setState({
      text: this.getTextFromProp(''),
      composerHeight: newComposerHeight,
      messagesContainerHeight: newMessagesContainerHeight,
    });
  }

  focusTextInput() {
    if (this.textInput) {
      this.textInput.focus();
    }
  }

  onInputSizeChanged = (size) => {
    //console.log(' ------------>  5  <-------------------');
    const newComposerHeight = Math.max(
      this.props.minComposerHeight,
      Math.min(this.props.maxComposerHeight, size.height),
    );
    const newMessagesContainerHeight = this.isKeyboardOpened
      ? this.getMessagesContainerHeightWithKeyboard1(newComposerHeight)
      : this.getMessagesContainerHeightWithKeyboard(newComposerHeight);
    this.setState({
      composerHeight: newComposerHeight,
      messagesContainerHeight: newMessagesContainerHeight,
    });
  };

  onInputTextChanged = (text) => {
    if (this.getIsTypingDisabled()) {
      return;
    }
    if (this.props.onInputTextChanged) {
      this.props.onInputTextChanged(text);
    }
    if (this.props.renderSuggestionsView) {
      this.props.renderSuggestionsView(text);
    }
    // Only set state if it's not being overridden by a prop.
    if (this.props.text === undefined) {
      this.setState({text});
    }
  };

  notifyInputTextReset() {
    if (this.props.onInputTextChanged) {
      this.props.onInputTextChanged('');
    }
  }

  onInitialLayoutViewLayout = (e) => {
    //console.log(' ------------>  1  <-------------------');
    const {layout} = e.nativeEvent;
    if (layout.height <= 0) {
      return;
    }
    this.notifyInputTextReset();
    this.setMaxHeight(layout.height);
    const newComposerHeight = this.props.minComposerHeight;
    const newMessagesContainerHeight =
      this.getMessagesContainerHeightWithKeyboard(newComposerHeight);
    const initialText = this.props.initialText || '';
    this.setState({
      isInitialized: true,
      text: this.getTextFromProp(initialText),
      composerHeight: newComposerHeight,
      messagesContainerHeight: newMessagesContainerHeight,
    });
  };

  onMainViewLayout = (e) => {
    //console.log(' ------------>  2 <-------------------');
    // fix an issue when keyboard is dismissing during the initialization
    const {layout} = e.nativeEvent;
    if (
      this.getMaxHeight() !== layout.height ||
      this.getIsFirstLayout() === true
    ) {
      this.setMaxHeight(layout.height);
      const isShow = true;
      this.setState({
        messagesContainerHeight:
          this._keyboardHeight > 0
            ? this.getMessagesContainerHeightWithKeyboard1()
            : this.getBasicMessagesContainerHeight(),
      });
    }
    if (this.getIsFirstLayout() === true) {
      this.setIsFirstLayout(false);
    }
  };

  renderInputToolbar() {
    const inputToolbarProps = {
      ...this.props,
      text: this.getTextFromProp(this.state.text),
      composerHeight: Math.max(
        this.props.minComposerHeight,
        this.state.composerHeight,
      ),
      onSend: this.onSend,
      onInputSizeChanged: this.onInputSizeChanged,
      onTextChanged: this.onInputTextChanged,
      textInputProps: {
        ...this.props.textInputProps,
        ref: (textInput) => (this.textInput = textInput),
        maxLength: this.getIsTypingDisabled() ? 0 : this.props.maxInputLength,
      },
    };
    if (this.props.renderInputToolbar) {
      return this.props.renderInputToolbar(inputToolbarProps);
    }
    return <InputToolbar {...inputToolbarProps} />;
  }

  renderChatFooter() {
    if (this.props.renderChatFooter) {
      return this.props.renderChatFooter();
    }
    return null;
  }

  renderLoading() {
    if (this.props.renderLoading) {
      return this.props.renderLoading();
    }
    return null;
  }
  renderTypingIndicator() {
    if (this.props.renderTypingIndicator) {
      return this.props.renderTypingIndicator(this.props);
    }

    return null;
  }

  render() {
    if (this.state.isInitialized === true) {
      const {wrapInSafeArea} = this.props;
      const Wrapper = wrapInSafeArea ? SafeAreaView : View;

      return (
        <Wrapper style={styles.safeArea}>
          <ActionSheetProvider
            ref={(component) => (this._actionSheetRef = component)}>
            <View style={styles.container} onLayout={this.onMainViewLayout}>
              {this.renderMessages()}
              {this.renderInputToolbar()}
              {this.renderTypingIndicator()}
            </View>
          </ActionSheetProvider>
        </Wrapper>
      );
    }
    return (
      <View style={styles.container} onLayout={this.onInitialLayoutViewLayout}>
        {this.renderLoading()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
});

KoraChat.childContextTypes = {
  actionSheet: PropTypes.func,
  getLocale: PropTypes.func,
};

KoraChat.defaultProps = {
  messages: [],
  messagesContainerStyle: null,
  text: null,
  placeholder: DEFAULT_PLACEHOLDER2,
  disableComposer: false,
  messageIdGenerator: () => uuid.v4(),
  user: {},
  onSend: () => {},
  locale: null,
  timeFormat: TIME_FORMAT,
  dateFormat: DATE_FORMAT,
  loadEarlier: false,
  onLoadEarlier: () => {},
  isLoadingEarlier: false,
  renderLoading: null,
  renderLoadEarlier: null,
  renderAvatar: null,
  showUserAvatar: false,
  actionSheet: null,
  onPressAvatar: null,
  onLongPressAvatar: null,
  renderUsernameOnMessage: false,
  renderAvatarOnTop: false,
  renderBubble: null,
  onLongPress: null,
  renderMessage: null,
  renderMessageText: null,
  imageProps: {},
  videoProps: {},
  audioProps: {},
  lightboxProps: {},
  textInputProps: {},
  listViewProps: {},
  renderCustomView: null,
  isCustomViewBottom: false,
  renderDay: null,
  renderTime: null,
  renderFooter: null,
  renderChatEmpty: null,
  renderChatFooter: null,
  renderInputToolbar: null,
  renderComposer: null,
  renderActions: null,
  renderSend: null,
  renderAccessory: null,
  isKeyboardInternallyHandled: true,
  onPressActionButton: null,
  bottomOffset: null,
  minInputToolbarHeight: 44,
  keyboardShouldPersistTaps: Platform.select({
    ios: 'never',
    android: 'always',
    default: 'never',
  }),
  onInputTextChanged: null,
  maxInputLength: null,
  forceGetKeyboardHeight: false,
  inverted: true,
  extraData: null,
  minComposerHeight: MIN_COMPOSER_HEIGHT,
  maxComposerHeight: MAX_COMPOSER_HEIGHT,
  wrapInSafeArea: true,
  renderSuggestionsView: null,
  Suggestions: [],
  renderQuickRepliesView: null,
  quickReplies: [],
  onFormAction: null,
  renderTypingIndicator: null,
  renderSpeechToText: null,
  clickSpeechToText: null,
};

KoraChat.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object),
  messagesContainerStyle: utils.StylePropType,
  text: PropTypes.string,
  initialText: PropTypes.string,
  placeholder: PropTypes.string,
  disableComposer: PropTypes.bool,
  messageIdGenerator: PropTypes.func,
  user: PropTypes.object,
  onSend: PropTypes.func,
  locale: PropTypes.string,
  timeFormat: PropTypes.string,
  dateFormat: PropTypes.string,
  isKeyboardInternallyHandled: PropTypes.bool,
  loadEarlier: PropTypes.bool,
  onLoadEarlier: PropTypes.func,
  isLoadingEarlier: PropTypes.bool,
  renderLoading: PropTypes.func,
  renderLoadEarlier: PropTypes.func,
  renderAvatar: PropTypes.func,
  showUserAvatar: PropTypes.bool,
  actionSheet: PropTypes.func,
  onPressAvatar: PropTypes.func,
  onLongPressAvatar: PropTypes.func,
  renderUsernameOnMessage: PropTypes.bool,
  renderAvatarOnTop: PropTypes.bool,
  isCustomViewBottom: PropTypes.bool,
  renderBubble: PropTypes.func,
  onLongPress: PropTypes.func,
  renderMessage: PropTypes.func,
  renderMessageText: PropTypes.func,
  imageProps: PropTypes.object,
  videoProps: PropTypes.object,
  audioProps: PropTypes.object,
  lightboxProps: PropTypes.object,
  renderCustomView: PropTypes.func,
  renderDay: PropTypes.func,
  renderTime: PropTypes.func,
  renderFooter: PropTypes.func,
  renderChatEmpty: PropTypes.func,
  renderChatFooter: PropTypes.func,
  renderInputToolbar: PropTypes.func,
  renderComposer: PropTypes.func,
  renderActions: PropTypes.func,
  renderSend: PropTypes.func,
  renderAccessory: PropTypes.func,
  onPressActionButton: PropTypes.func,
  bottomOffset: PropTypes.number,
  minInputToolbarHeight: PropTypes.number,
  listViewProps: PropTypes.object,
  keyboardShouldPersistTaps: PropTypes.oneOf(['always', 'never', 'handled']),
  onInputTextChanged: PropTypes.func,
  maxInputLength: PropTypes.number,
  forceGetKeyboardHeight: PropTypes.bool,
  inverted: PropTypes.bool,
  textInputProps: PropTypes.object,
  extraData: PropTypes.object,
  minComposerHeight: PropTypes.number,
  maxComposerHeight: PropTypes.number,
  alignTop: PropTypes.bool,
  wrapInSafeArea: PropTypes.bool,
  renderSuggestionsView: PropTypes.func,
  renderQuickRepliesView: PropTypes.func,
  renderSpeechToText: PropTypes.func,
  clickSpeechToText: PropTypes.func,
  onFormAction: PropTypes.func,
  renderTypingIndicator: PropTypes.func,
};

export {
  KoraChat,
  Actions,
  Avatar,
  Bubble,
  MessageText,
  Composer,
  Day,
  InputToolbar,
  LoadEarlier,
  Message,
  MessageContainer,
  Send,
  Time,
  UserAvatar,
  utils,
};
