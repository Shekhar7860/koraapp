import React from 'react';
import {Text, StyleSheet} from 'react-native';
import {of as of$} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import withObservables from '@nozbe/with-observables';

import * as Constants from '../KoraText';
import {normalize} from '../../utils/helpers';
import {msgTimelineObj} from '../Chat/helper';
import * as UsersDao from '../../../dao/UsersDao';

class MessageActivity extends React.Component {
  constructor(props) {
    super(props);
    this.currentUserId = UsersDao.getUserId();
  }

  getLastMessageText() {
    const {components, from} = this.props;
    // let account = AccountManager.getCurrentAccount();
    // let userId = account.getUser().id;
    const {state}=this.props?.message;
    let lastText = '';
    try {
      let sender = (from?.id === this.currentUserId) ? 'You' : from?.fN;
      let component = components[0];
      if(state!==undefined&&state!==null&&state==='recalled')
      {
        lastText=sender+': '+'This message was deleted'
      }
      else if (component.componentType === 'timeline') {
        const {actionTakerText, actionReceiverText, middleText, postText} =
          msgTimelineObj(components[0].componentData,this.currentUserId);
        lastText =
          actionTakerText +
          '' +
          middleText +
          '' +
          actionReceiverText +
          ' ' +
          postText;
      } else {
        lastText = '';
        if (from?.fN === undefined) {
        } else {
          if (
            component.componentType !== 'text' ||
            component.componentBody === undefined
          ) {
            lastText = '';
            let attachment = 0;
            let images = 0;
            let audio = 0;
            let video = 0;
            let msg = '';
            components?.forEach(function (value) {
              if (value.componentType === 'image') {
                images = images + 1;
              }
              if (value.componentType === 'attachment') {
                attachment = attachment + 1;
              }
              if (value.componentType === 'audio') {
                audio = audio + 1;
              }
              if (value.componentType === 'video') {
                video = video + 1;
              }
            });
            if (images > 0) {
              let img = images > 1 ? ' images' : ' image ';
              msg = msg + ' ' + images + img;
            }
            if (audio > 0) {
              let aud = audio > 1 ? ' audios' : ' audio ';
              msg = msg + ' ' + audio + aud;
            }
            if (attachment > 0) {
              let att = attachment > 1 ? ' attachments' : ' attachment ';
              msg = msg + ' ' + attachment + att;
            }
            if (video > 0) {
              let vid = video > 1 ? ' videos' : ' video ';
              msg = msg + ' ' + video + vid;
            }
            lastText = sender + ': Sent' + msg;
          } else if (component.componentBody) {
            lastText = sender + ': ' + components[0]?.componentBody;
          }
        }
      }
    } catch (e) {
      lastText = '';
    }
    return lastText;
  }

  render() {

    const lastMessageText = this.getLastMessageText();
    return (
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={styles.messageTextStyle}>
        {lastMessageText}
      </Text>
    );
  }
}

const enhance = withObservables(['message'], ({message}) => ({
  
  components: message.components ? message.components.observe() : null,
  from: message.from
  .observe()
  .pipe(switchMap((_from) => (_from ? _from.contact : of$(null)))),
}));

export default enhance(MessageActivity);

const styles = StyleSheet.create({
  messageTextStyle: {
    fontSize: normalize(14),
    flexShrink: 1,
    flex:1,
    marginEnd:20,
    fontWeight: '400',
    fontStyle: 'normal',
    color: '#5F6368',
    
    fontFamily: Constants.fontFamily,
  },
  draftMessageTextStyle: {
    flexDirection: 'row',
    maxWidth: '100%',
    flexShrink: 1,
  },
});
