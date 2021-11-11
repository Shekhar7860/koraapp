import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {Q} from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import {of as of$} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import database from '../../realm';
import {ResourceState} from '../../realm/dbconstants';
import * as Entity from '../../realm/dbconstants';

import {MessageView} from './MessageView';
import {DateChangeTimeline} from '.';
import TimelineEventItem from './TimelineEventItem';

class _MessagesListViewItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      replyMessage: null,
      replyFromMember: null,
      replyComponents: [],
    };
    this.replyTo();
  }

  replyTo = async () => {
    const {message} = this.props;
    if (this.isTimelineEvent()) {
      return;
    } else if (message?.replyTo) {
      const db = database.active;
      let replyTo = message?.replyTo;
      let messageId = replyTo.messageId;
      const msgCollection = db.collections.get(Entity.Messages);

      try {
        let messages = await msgCollection
          .query(Q.where('messageId', Q.eq(messageId)))
          .fetch();
        if (messages?.length > 0) {
          let replyMessage = messages[0];
          this.setState({replyMessage: replyMessage});

          const replyFrom = await replyMessage.from.fetch();
          const replyFromMember = await replyFrom.contact.fetch();
          if (replyFromMember) {
            this.setState({replyFromMember: replyFromMember});
          }

          const components = await replyMessage.components.fetch();
          if (components) {
            this.setState({replyComponents: components});
          }
        }
      } catch (e) {
        console.log('error in replyTo', e);
      }
    } else {
      return;
    }
  };

  componentDidMount() {}

  componentDidUpdate() {}

  componentWillUnmount() {}

  isTimelineEvent() {
    const {components} = this.props;
    return components?.length > 0 && components[0].componentType === 'timeline';
  }

  renderSectionFooter = ({section: {title}}) => {
    return (
      <View style={{paddingVertical: 5}}>
        <DateChangeTimeline title={title} />
      </View>
    );
  };

  messageRetry(item) {
    console.log("message retry", item, this.props);
    // this.props.messageRetry(item);
  }

  render() {
    let showUnread = this.props.unreadCountFlag;
    const {message, components, fromMember, unreadCountFlag} = this.props;
    const {replyMessage, replyComponents, replyFromMember} = this.state;
    if (this.isTimelineEvent()) {
      return (
      <>
          <View style={{paddingVertical: 2.5}}>
            <TimelineEventItem data={components[0]} />
          </View>
          {showUnread && this.renderSectionFooter({section: {title: 'Unread'}})}
        </>
      );
    } else if (message?.messageState !== ResourceState.DRAFT) {
      return (
        <>
          <MessageView
            item={message}
            components={components}
            index={this.props.index}
            fromMember={fromMember}
            replyMessage={replyMessage}
            replyComponents={replyComponents}
            replyFrom={replyFromMember}
            unreadCountFlag={unreadCountFlag}
            scrollTo={this.props.scrollTo}
            messageRetry={this.props.messageRetry}
            onLongPress={this.props.onLongPress}
            onEmojiClick={this.props.onEmojiClick}
            onCheckBoxPress={this.props.onCheckBoxPress}
            onReminderInfoPressed={this.props.onReminderInfoPressed}
            selectedIndex={this.props.selectedIndex}
            // isSelectedMessage={this.props.isSelectedMessage}
            // titleName={this.props.titleName}
            // replyToResolves={this.props.messageResolveResponse}
            multiSelectOn={this.props.multiSelectOn}
            highlighted={this.props.highlighted}
            // messageStatus={this.props.messageStatus}
            // universalSearch={this.props.universalSearch}
            // searchMessageId={this.props.searchMessageId}
          />
          {showUnread && this.renderSectionFooter({section: {title: 'Unread'}})}
        </>
      );
    } else {
      return <View />;
    }
  }
}

const enhance = withObservables(['message'], ({message}) => {
  return {
    message: message.observe(),
    components: message.components ? message.components.observe() : null,
    fromMember: message.from
      .observe()
      .pipe(switchMap((f) => (f ? f.contact : of$(null)))),
  };
});

export const MessagesListViewItem = enhance(_MessagesListViewItem);

MessagesListViewItem.defaultProps = {
  messageRetry: {},
  onLongPress: {},
  onEmojiClick: {},
  onCheckBoxPress: {},
  onReminderInfoPressed: {},
  isSelectedMessage: {},
  titleName: null,
  replyToResolves: null,
  multiSelectOn: false,
  highlighted: false,
  messageStatus: null,
  universalSearch: false,
  searchMessageId: null,
};

MessagesListViewItem.propTypes = {
  messageRetry: PropTypes.func,
  onLongPress: PropTypes.func,
  onEmojiClick: PropTypes.func,
  onCheckBoxPress: PropTypes.func,
  onReminderInfoPressed: PropTypes.func,
  isSelectedMessage: PropTypes.func,
  titleName: PropTypes.string,
  replyToResolves: PropTypes.object,
  multiSelectOn: PropTypes.boolean,
  highlighted: PropTypes.boolean,
  messageStatus: PropTypes.string,
  universalSearch: PropTypes.boolean,
  searchMessageId: PropTypes.string,
};
