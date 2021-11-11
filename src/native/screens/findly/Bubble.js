import PropTypes from 'prop-types';
import React from 'react';
import {
  Text,
  Clipboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Animated,
} from 'react-native';

import MessageText from './views/MessageText';
import BotText from './views/BotText';
import {normalize} from '../../utils/helpers';
import Time from '../../../bot-sdk/chat/Time';
import Color from '../../../bot-sdk/chat/Color';
import MeetingsView from './views/MeetingsView';
import {TemplateType} from './views/TemplateType';

import {
  StylePropType,
  isSameUser,
  isSameDay,
} from '../../../bot-sdk/chat/utils';
import PickSlotView from './views/PickSlotView';
import MeetingConformationView from './views/MeetingConformationView';
import ButtonTemplate from './views/ButtonTemplate';
import TaskListPreviewView from './views/TaskListPreviewView';
import TaskListFullPreviewView from './views/TaskListfullPreviewView';
import ParsedTextView from './views/ParsedTextView';
import ContactLookupView from './views/ContactLookupView';
import EmailsView from './views/EmailsView';

import {Icon} from '../../components/Icon/Icon.js';
import SessionExpiredView from './views/SessionExpiredView';
import FilesView from './views/FilesView';
import AnnouncementCarouselView from './views/AnnouncementCarouselView';
import ArticlesCarouselView from './views/ArticlesCarouselView';
import KoraWelcomeSummaryView from './views/KoraWelcomeSummaryView';
import TimeLineView from './views/TimeLineView';
import TablesView from './views/TablesView';
import SkillResponseView from './views/SkillResponseView';
import MiniTableView from './views/MiniTableView';
import UniversalSearchView from './views/UniversalSearchView';
import BarChartView from './views/BarChartView';
import PieChartView from './views/PieChartView';
import LineChartView from './views/LineChartView';
import CarouselTemplate from './views/CarouselTemplate';
import ListTemplate from './views/ListTemplate';

const styles = {
  left: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-start',
    },
    wrapper: {
      // padding: 5,
      // borderRadius: 8,
      backgroundColor: 'white',
      // marginRight: 60,
      // minHeight: 20,
      // borderWidth: 1,
      // borderColor: '#E7F1FF',
      justifyContent: 'flex-end',
    },
    containerToNext: {
      borderBottomLeftRadius: 3,
    },
    containerToPrevious: {
      borderTopLeftRadius: 3,
    },
    bottom: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
  }),
  center: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'stretch',
    },
    wrapper: {
      // padding: 5,
      borderRadius: 8,
      backgroundColor: 'white',
      marginLeft: 10,
      marginRight: 10,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
    containerToNext: {
      borderBottomRightRadius: 3,
    },
    containerToPrevious: {
      borderTopRightRadius: 3,
    },
    bottom: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
  }),
  right: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-end',
    },
    wrapper: {
      padding: 5,
      borderRadius: 8,
      backgroundColor: '#E7F1FF',
      marginLeft: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
    containerToNext: {
      borderBottomRightRadius: 3,
    },
    containerToPrevious: {
      borderTopRightRadius: 3,
    },
    bottom: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
  }),
  content: StyleSheet.create({
    tick: {
      fontSize: normalize(10),
      backgroundColor: Color.backgroundTransparent,
      color: Color.white,
    },
    tickView: {
      flexDirection: 'row',
      marginRight: 10,
    },
    username: {
      top: -3,
      left: 0,
      fontSize: normalize(12),
      backgroundColor: 'transparent',
      color: '#aaa',
    },
    usernameView: {
      flexDirection: 'row',
      marginHorizontal: 10,
    },
  }),
};

const DEFAULT_OPTION_TITLES = ['Copy Text', 'Cancel'];

export default class Bubble extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    fadeAnimation: new Animated.Value(0),
  };

  fadeIn = () => {
    Animated.timing(this.state.fadeAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true, // <-- Add this
    }).start();
  };

  fadeOut = () => {
    Animated.timing(this.state.fadeAnimation, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true, // <-- Add this
    }).start();
  };

  startAnimation = () => {
    Animated.timing(this.state.fadeAnimation, {
      toValue: 0,
      timing: 1000,
      useNativeDriver: true, // <-- Add this
    }).start(() => {
      Animated.timing(this.state.fadeAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true, // <-- Add this
      }).start();
    });
  };

  onLongPress = () => {
    const {currentMessage} = this.props;
    if (this.props.onLongPress) {
      this.props.onLongPress(this.context, this.props.currentMessage);
    } else if (currentMessage && currentMessage.text) {
      const {optionTitles} = this.props;
      const options =
        optionTitles && optionTitles.length > 0
          ? optionTitles.slice(0, 2)
          : DEFAULT_OPTION_TITLES;
      const cancelButtonIndex = options.length - 1;
      this.context.actionSheet().showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              Clipboard.setString(currentMessage.text);
              break;
            default:
              break;
          }
        },
      );
    }
  };

  styledBubbleToNext() {
    const {
      currentMessage,
      nextMessage,
      position,
      containerToNextStyle,
    } = this.props;
    if (
      currentMessage &&
      nextMessage &&
      position &&
      isSameUser(currentMessage, nextMessage) &&
      isSameDay(currentMessage, nextMessage)
    ) {
      return [
        styles[position].containerToNext,
        containerToNextStyle && containerToNextStyle[position],
      ];
    }
    return null;
  }

  styledBubbleToPrevious() {
    const {
      currentMessage,
      previousMessage,
      position,
      containerToPreviousStyle,
    } = this.props;
    if (
      currentMessage &&
      previousMessage &&
      position &&
      isSameUser(currentMessage, previousMessage) &&
      isSameDay(currentMessage, previousMessage)
    ) {
      return [
        styles[position].containerToPrevious,
        containerToPreviousStyle && containerToPreviousStyle[position],
      ];
    }
    return null;
  }
  renderBotText(template_type = null) {
    let text = null;
    if (this.props.currentMessage && this.props.currentMessage.message) {
      // && !this.props.currentMessage.message?.type === 'onTaskUpdate') {

      let message = this.props.currentMessage.message[0];
      text = message?.component?.payload?.text;
      text = text ? text : message?.component?.payload?.payload?.text;
      if (template_type !== TemplateType.QUICK_REPLIES)
        text = text ? text : message?.component?.payload;
    }
    if (!text) {
      return null;
    }
    // if (typeof text !== 'string') {
    //    console.error('value is not a string type   : ', JSON.stringify(text));
    //   return <></>;
    // }
    return (
      <BotText {...this.props} template_type={template_type} text={text} />
    );
  }

  renderMessageText() {
    if (this.props.currentMessage && this.props.currentMessage.message) {
      // && !this.props.currentMessage.message?.type === 'onTaskUpdate') {
      const {
        containerStyle,
        wrapperStyle,
        optionTitles,
        ...messageTextProps
      } = this.props;
      if (this.props.renderMessageText) {
        return this.props.renderMessageText(messageTextProps);
      }
      return <MessageText {...messageTextProps} />;
    }
    return <Text>Empty1</Text>;
  }

  renderCalenderEventsView(template_type, payload) {
    return (
      <MeetingsView
        {...this.props}
        template_type={template_type}
        meetingsPayload={payload}
      />
    );
  }

  renderPickSlotTemplate(template_type, payload) {
    return (
      <PickSlotView
        {...this.props}
        template_type={template_type}
        pickSlotPayload={payload}
      />
    );
  }

  renderMeetingConformationTemplate(template_type, payload) {
    return (
      <MeetingConformationView
        {...this.props}
        template_type={template_type}
        meetingsPayload={payload}
      />
    );
  }

  renderButtonsTemplate(template_type, payload) {
    return (
      <ButtonTemplate
        {...this.props}
        template_type={template_type}
        buttonPayload={payload}
      />
    );
  }

  renderTaskListPreviewTemplate(template_type, payload) {
    return (
      <TaskListPreviewView
        {...this.props}
        template_type={template_type}
        taskListPreviewPayload={payload}
      />
    );
  }
  renderParrsedTextTemplate(template_type, payload) {
    return (
      <ParsedTextView
        {...this.props}
        template_type={template_type}
        parsedTextPayload={payload}
      />
    );
  }

  renderTaskListFullPreviewTemplate(template_type, payload) {
    return (
      <TaskListFullPreviewView
        {...this.props}
        template_type={template_type}
        taskListFullPreviewPayload={payload}
      />
    );
  }

  renderFormActionTemplate(template_type, payload) {
    if (this.props.onFormAction) {
      this.props.onFormAction(template_type, payload);
    } else {
      console.log('this.props.onFormAction ---->: ', this.props.onFormAction);
    }
  }
  renderHiddenDialogTemplate(template_type, payload) {
    if (this.props.onHiddenDialog) {
      this.props.onHiddenDialog(template_type, payload);
    } else {
      console.log(
        'this.props.onHiddenDialog ---->: ',
        this.props.onHiddenDialog,
      );
    }
  }

  renderContactLookupTemplate(template_type, payload) {
    return (
      <ContactLookupView
        {...this.props}
        template_type={template_type}
        contactLookupPayload={payload}
      />
    );
  }

  renderSearchCarouselTemplate(template_type, payload) {
    return (
      <EmailsView
        {...this.props}
        template_type={template_type}
        emailsPayload={payload}
      />
    );
  }

  renderSessionExpiredTemplate(template_type, payload) {
    return (
      <TimeLineView
        {...this.props}
        template_type={template_type}
        switchPayload={payload}
      />
    );

    // return <SessionExpiredView
    //   {...this.props}

    //   template_type={template_type}
    //   sessionPayload={payload} />
  }

  renderSwitchSkillTemplate(template_type, payload) {
    return (
      <TimeLineView
        {...this.props}
        template_type={template_type}
        switchPayload={payload}
      />
    );
  }

  renderTableTemplate(template_type, payload) {
    return (
      <TablesView
        {...this.props}
        template_type={template_type}
        tablesPayload={payload}
      />
    );
  }
  renderMiniTableTemplate(template_type, payload) {
    return (
      <MiniTableView
        {...this.props}
        template_type={template_type}
        tablesPayload={payload}
      />
    );
  }

  renderBarChartTemplate(template_type, payload) {
    return (
      <BarChartView
        {...this.props}
        template_type={template_type}
        barchartPayload={payload}
      />
    );
  }

  renderPieChatTemplate(template_type, payload) {
    return (
      <PieChartView
        {...this.props}
        template_type={template_type}
        piechartPayload={payload}
      />
    );
  }

  renderLineChatTemplate(template_type, payload) {
    return (
      <LineChartView
        {...this.props}
        template_type={template_type}
        lineChartPayload={payload}
      />
    );
  }

  renderCarousel(template_type, payload) {
    return (
      <CarouselTemplate
        {...this.props}
        template_type={template_type}
        corosalPayload={payload}
      />
    );
  }
  renderList(template_type, payload) {
    return (
      <ListTemplate
        {...this.props}
        template_type={template_type}
        listPayload={payload}
      />
    );
  }

  renderUniversalSearchTemplate(template_type, payload) {
    return (
      <UniversalSearchView
        {...this.props}
        template_type={template_type}
        searchPayload={payload}
      />
    );
  }

  renderSkillResponseTemplate(template_type, payload) {
    return (
      <SkillResponseView
        {...this.props}
        template_type={template_type}
        skillResponsePayload={payload}
      />
    );
  }

  renderFilesSearchTemplate(template_type, payload) {
    return (
      <FilesView
        {...this.props}
        template_type={template_type}
        filesPayload={payload}
      />
    );
  }

  renderAnnouncementTemplate(template_type, payload) {
    return (
      <AnnouncementCarouselView
        {...this.props}
        template_type={template_type}
        announcementPayload={payload}
      />
    );
  }

  renderArticlesTemplate(template_type, payload) {
    return (
      <ArticlesCarouselView
        {...this.props}
        template_type={template_type}
        articlesPayload={payload}
      />
    );
  }

  renderWelcomeSummaryTemplate(template_type, payload) {
    return (
      <KoraWelcomeSummaryView
        {...this.props}
        template_type={template_type}
        summaryPayload={payload}
      />
    );
  }

  renderTicks() {
    const {currentMessage, renderTicks, user} = this.props;
    if (renderTicks && currentMessage) {
      return renderTicks(currentMessage);
    }
    if (
      currentMessage &&
      user &&
      currentMessage.user &&
      currentMessage.user._id !== user._id
    ) {
      return null;
    }
    if (
      currentMessage &&
      (currentMessage.sent || currentMessage.received || currentMessage.pending)
    ) {
      return (
        <View style={styles.content.tickView}>
          {!!currentMessage.sent && (
            <Text style={[styles.content.tick, this.props.tickStyle]}>✓</Text>
          )}
          {!!currentMessage.received && (
            <Text style={[styles.content.tick, this.props.tickStyle]}>✓</Text>
          )}
          {!!currentMessage.pending && (
            <Text style={[styles.content.tick, this.props.tickStyle]}>🕓</Text>
          )}
        </View>
      );
    }
    return null;
  }

  renderTime() {
    if (this.props.currentMessage && this.props.currentMessage.createdAt) {
      const {
        containerStyle,
        wrapperStyle,
        textStyle,
        ...timeProps
      } = this.props;
      if (this.props.renderTime) {
        return this.props.renderTime(timeProps);
      }
      return <Time {...timeProps} />;
    }
    return null;
  }

  renderUsername() {
    const {currentMessage, user} = this.props;
    if (this.props.renderUsernameOnMessage && currentMessage) {
      if (user && currentMessage.user._id === user._id) {
        return null;
      }
      return (
        <View style={styles.content.usernameView}>
          <Text style={[styles.content.username, this.props.usernameStyle]}>
            ~ {currentMessage.user.name}
          </Text>
        </View>
      );
    }
    return null;
  }

  renderCustomView() {
    if (this.props.renderCustomView) {
      return this.props.renderCustomView(this.props);
    }
    return null;
  }

  renderIcon() {
    let data = this.props.currentMessage;
    if (data) {
      let position = data.position || 'right';
      let index = data.itemIndex;
      // console.log("index ---------> ", index);

      if (!(position === 'right')) {
        // let totalLenght = this.props.totalLenght;

        // console.log("position ---------> ", position);
        // console.log("totalLenght ---------> ", totalLenght);

        if (index === 0) {
          this.startAnimation();
          return (
            <Animated.View style={{opacity: this.state.fadeAnimation}}>
              <View
                style={{
                  justifyContent: 'center',
                  marginStart: 5,
                  marginTop: 3,
                }}>
                <Icon name={'findly'} size={20} color="black" />
              </View>
            </Animated.View>
          );
        }
      } else if (index === 0) {
        //setTimeout(() => this.fadeOut(), 2000)
        // this.startAnimation();
      }
    }

    // return null;
  }

  renderBubbleContent() {
    this.props = {
      ...this.props,
      isDisable: this.props.currentMessage?.itemIndex !== 0,
    };

    let data = this.props.currentMessage;
    if (data) {
      if (data.type === 'user_message') {
        return this.renderMessageText();
      } else if (data.type === 'bot_response') {
        if (
          data.message &&
          data.message[0] &&
          data.message[0].component &&
          data.message[0].component.type === 'template' &&
          data.message[0].component.payload &&
          data.message[0].component.payload.payload &&
          data.message[0].component.payload.payload.template_type
        ) {
          const payload = data.message[0].component.payload.payload;
          const template_type = payload.template_type;

          // const flag = true;

          // if (flag) {
          //   return this.renderWelcomeSummaryTemplate(TemplateType.KORA_WELCOME_SUMMARY, payload);
          // }

          switch (template_type) {
            case TemplateType.CALENDAR_EVENTS:
            case TemplateType.CANCEL_CALENDAR_EVENTS:
              return this.renderCalenderEventsView(template_type, payload);

            case TemplateType.START_TIMER:
              return this.renderBotText();

            case TemplateType.PICK_SLOT_TEMPLATE:
              return this.renderPickSlotTemplate(template_type, payload);

            case TemplateType.MEETING_CONFIRMATION:
              return this.renderMeetingConformationTemplate(
                template_type,
                payload,
              );

            case TemplateType.FORM_ACTIONS:
              return this.renderFormActionTemplate(template_type, payload);

            case TemplateType.BUTTON:
              return this.renderButtonsTemplate(template_type, payload);

            case TemplateType.TASK_LIST_PREVIEW:
              return this.renderTaskListPreviewTemplate(template_type, payload);

            case TemplateType.TASK_LIST_FULL_PREVIEW:
              return this.renderTaskListFullPreviewTemplate(
                template_type,
                payload,
              );

            case TemplateType.QUICK_REPLIES:
              return this.renderBotText(template_type);
            // return this.renderParrsedTextTemplate(template_type, payload);

            case TemplateType.HIDDEN_DIALOG:
              return this.renderHiddenDialogTemplate(template_type, payload);

            case TemplateType.KORA_CONTACT_LOOKUP:
              return this.renderContactLookupTemplate(template_type, payload);

            case TemplateType.KORA_SEARCH_CAROUSEL:
              return this.renderSearchCarouselTemplate(template_type, payload);

            case TemplateType.SESSION_EXPIRED:
              return this.renderSessionExpiredTemplate(template_type, payload);

            case TemplateType.FILES_SEARCH_CAROUSEL:
              return this.renderFilesSearchTemplate(template_type, payload);

            case TemplateType.ANNOUNCEMENT_CAROUSEL:
              return this.renderAnnouncementTemplate(template_type, payload);

            case TemplateType.ARTICLES_KORA_CAROUSEL:
              return this.renderArticlesTemplate(template_type, payload);

            case TemplateType.KORA_WELCOME_SUMMARY:
              return this.renderWelcomeSummaryTemplate(template_type, payload);

            case TemplateType.KA_SWITCH_SKILL:
              return this.renderSwitchSkillTemplate(template_type, payload);

            case TemplateType.TABLE:
              return this.renderTableTemplate(template_type, payload);

            case TemplateType.KA_SKILL_RESPONSE:
              return this.renderSkillResponseTemplate(template_type, payload);

            // case TemplateType.KORA_UNIVERSAL_SEARCH:
            //   return <Text>----- KORA_UNIVERSAL_SEARCH template pending-----------</Text>

            case TemplateType.KORA_UNIVERSAL_SEARCH:
              return this.renderUniversalSearchTemplate(template_type, payload);

            // case TemplateType.TABLE_LIST:
            //   return <Text>----- TABLE_LIST template pending-----------</Text>;

            case TemplateType.MINI_TABLE:
              return this.renderMiniTableTemplate(template_type, payload);

            case TemplateType.BAR_CHART:
              return this.renderBarChartTemplate(template_type, payload);

            case TemplateType.PIE_CHART:
              return this.renderPieChatTemplate(template_type, payload);

            case TemplateType.LINE_CHART:
              return this.renderLineChatTemplate(template_type, payload);

            case TemplateType.CAROUSEL:
              return this.renderCarousel(template_type, payload);
            case TemplateType.LIST:
              return this.renderList(template_type, payload);

            default:

            return null;
              // return (
              //   <Text>{JSON.stringify(data.message[0].component.payload)}</Text>
              // );
          }
        }
      }
    }

    return this.renderBotText();
  }

  render() {
    const {
      position,
      containerStyle,
      wrapperStyle,
      bottomContainerStyle,
    } = this.props;

    const componentView = this.renderBubbleContent();
    if (!componentView) {
      return null;
    }
    return (
      // <View style={{}} >
      <View
        style={[
          styles[position].container,
          containerStyle && containerStyle[position],
        ]}>
        <View
          style={[
            styles[position].wrapper,
            this.styledBubbleToNext(),
            this.styledBubbleToPrevious(),
            wrapperStyle && wrapperStyle[position],
          ]}>
          <TouchableWithoutFeedback
            onLongPress={this.onLongPress}
            accessibilityTraits="text"
            {...this.props.touchableProps}>
            <View>
              {componentView}
              <View
                style={[
                  styles[position].bottom,
                  bottomContainerStyle && bottomContainerStyle[position],
                ]}>
                {this.renderUsername()}
                {this.renderTime()}
                {this.renderTicks()}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
        {this.renderIcon()}
      </View>

      //   {/* {this.renderIcon()}

      // </View> */}
    );
  }
}

Bubble.contextTypes = {
  actionSheet: PropTypes.func,
};

Bubble.defaultProps = {
  touchableProps: {},
  onLongPress: null,
  renderMessageText: null,
  renderCustomView: null,
  renderUsername: null,
  renderTicks: null,
  renderTime: null,
  onQuickReply: null,
  position: 'left',
  optionTitles: DEFAULT_OPTION_TITLES,
  currentMessage: {
    text: null,
    createdAt: null,
    image: null,
  },
  nextMessage: {},
  previousMessage: {},
  containerStyle: {},
  wrapperStyle: {},
  bottomContainerStyle: {},
  tickStyle: {},
  usernameStyle: {},
  containerToNextStyle: {},
  containerToPreviousStyle: {},
};

Bubble.propTypes = {
  user: PropTypes.object.isRequired,
  touchableProps: PropTypes.object,
  onLongPress: PropTypes.func,
  renderMessageText: PropTypes.func,
  renderCustomView: PropTypes.func,
  isCustomViewBottom: PropTypes.bool,
  renderUsernameOnMessage: PropTypes.bool,
  renderUsername: PropTypes.func,
  renderTime: PropTypes.func,
  renderTicks: PropTypes.func,
  onQuickReply: PropTypes.func,
  position: PropTypes.oneOf(['left', 'right', 'center']),
  optionTitles: PropTypes.arrayOf(PropTypes.string),
  currentMessage: PropTypes.object,
  nextMessage: PropTypes.object,
  previousMessage: PropTypes.object,
  containerStyle: PropTypes.shape({
    left: StylePropType,
    right: StylePropType,
  }),
  wrapperStyle: PropTypes.shape({
    left: StylePropType,
    right: StylePropType,
  }),
  bottomContainerStyle: PropTypes.shape({
    left: StylePropType,
    right: StylePropType,
  }),
  tickStyle: StylePropType,
  usernameStyle: StylePropType,
  containerToNextStyle: PropTypes.shape({
    left: StylePropType,
    right: StylePropType,
  }),
  containerToPreviousStyle: PropTypes.shape({
    left: StylePropType,
    right: StylePropType,
  }),
};
