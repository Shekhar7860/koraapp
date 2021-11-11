import React from 'react';
import {Text, StyleSheet} from 'react-native';
import withObservables from '@nozbe/with-observables';
import {of as of$} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import * as Constants from '../KoraText';
import {getNameFromUserObject, normalize} from '../../utils/helpers';
import {msgTimelineObj} from '../Chat/helper';
import * as UsersDao from '../../../dao/UsersDao';

class PostActivity extends React.Component {
  constructor(props) {
    super(props);
    this.currentUserId = UsersDao.getUserId();
  }

  getLastPostText() {
    const {components,  creator,from} = this.props;
    let lastText = '';
    try {
      let sender = from?.id === this.currentUserId ? 'You' : from?.fN;
      let component = components[0];
      if (component?.componentType === 'timeline') {
        const {actionTakerText, actionReceiverText, middleText, postText} =
          msgTimelineObj(component.componentData,this.currentUserId);
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
            let attachment = 0,
              images = 0,
              audio = 0,
              video = 0;
            let msg = '';
            components.forEach(function (value) {
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
            lastText = sender + ': ' + component.componentBody;
          }
        }
      }
    } catch (e) {
      console.log('e', e);
      lastText = '';
    }
    if (lastText === '') {
      let creatorObj = creator;
      if (typeof creator === 'string') {
        creatorObj = ContactsDao.getContact(creator);
      }
      const creatorName = getNameFromUserObject(creatorObj);
      lastText = `${creatorName} created this room`;
    }
    return lastText;
  }

  render() {
    const lastMessageText = this.getLastPostText();
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

const enhance = withObservables(['post'], ({post}) => ({
  components: post?.components ? post.components.observe() : of$(null),
  from: post?.from ? post?.from
    .observe()
    .pipe(switchMap((_from) => (_from ? _from.contact : of$(null)))):of$(null), 
}));

export default enhance(PostActivity);

const styles = StyleSheet.create({
  messageTextStyle: {
    fontSize: normalize(14),
    flexShrink: 1,
    paddingRight: 50,
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
