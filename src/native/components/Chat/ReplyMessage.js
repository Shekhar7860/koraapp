import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';

import database from '../../realm';
import * as Entity from '../../realm/dbconstants';
import {ReplyComponent} from './ReplyComponent';

class ReplyMessage extends React.Component {
  constructor(props) {
    super(props);
    this.getMessage();
    this.state = {
      message: undefined,
    };
    this.props = props; 
  }

  scrollTo(key) {
    if (this.props?.scrollTo) {
      this.props?.scrollTo(key);
    }
  }

  setReplyToMessage = (message = null) => {
    if (this.props?.setReplyToMessage) {
      this.props?.setReplyToMessage?.(message);
    }
  };

  getMessage = async () => {
    try {
      const {messageId} = this.props;
      const db = database.active;

      const message = await db.collections.get(Entity.Messages).find(messageId);
      if (message) {
        this.setState({message: message});
      }
    } catch (e) {
      console.log('error in getMessage', e);
    }
  };

  render() {
    const {message} = this.state;
    if (message) {
      return (
        <ReplyComponent
          message={message}
          scrollTo={this.scrollTo.bind(this)}
          setReplyToMessage={this.setReplyToMessage}
        />
      );
    } else {
      return <View />;
    }
  }
}

ReplyMessage.propTyypes = {
  setReplyToMessage: PropTypes.func,
  scrollTo: PropTypes.func,
};

ReplyMessage.defaultProps = {
  setReplyToMessage: () => {},
  scrollTo: () => {},
};

export default ReplyMessage;
