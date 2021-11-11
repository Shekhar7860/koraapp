import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {TouchableHighlight} from 'react-native';
import {Icon} from '../Icon/Icon';
import * as Constants from '../KoraText';
import {msgTimelineObj} from './helper';
import {getNameFromUserObject, normalize} from '../../utils/helpers';
import {Avatar} from '../Icon/Avatar';
import {isEqual} from 'lodash';
import {TouchableOpacity} from 'react-native-gesture-handler';
import * as UsersDao from '../../../dao/UsersDao';

class _CreatorEventItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {creator, t} = this.props;
    let avatarName = creator?.fN + ' ' + creator?.lN;
    const name = getNameFromUserObject(creator);
    return (
      <View style={styles.avatarStyle}>
        <Avatar
          profileIcon={creator?.icon}
          textSize={normalize(13)}
          color={creator?.color}
          userId={creator?.id}
          name={avatarName}
          type={'offline'}
          rad={normalize(24)}
        />
        <View style={styles.avatarStyle1} />
        {this.props.wsName ? (
          <Text style={styles.createdTimelineText}>
            <Text style={styles.createdTimelineTextBold}>{name}</Text>{' '}
            {t('created this discussion room for Workspace - ')}
            <Text style={styles.createdTimelineTextBold}>
              {this.props.wsName}
            </Text>
          </Text>
        ) : (
          <Text style={styles.createdTimelineText}>
            <Text style={styles.createdTimelineTextBold}>{name}</Text>{' '}
            {t('created this discussion room')}
          </Text>
        )}
      </View>
    );
  }
}

export const CreatorEventItem = React.memo(_CreatorEventItem, isEqual);

class _TimelineEventItem extends React.Component {
  constructor(props) {
    super(props);
    const {data} = props;
    const {eventInitiator, eventType, resources} = data.componentData;

    this.state = {
      hasMore: resources.length > 1,
      expanded: false,
    };
    this.currentUserId = UsersDao.getUserId();
  }

  renderSubSection() {
    const {
      eventInitiator,
      eventType,
      resources,
    } = this.props.data.componentData;
    return resources.map((resource) => {
      const {
        actionTakerText,
        actionReceiverText,
        middleText,
        postText,
      } = msgTimelineObj({eventInitiator, eventType, resources: [resource]},this.currentUserId);
      return (
        <>
          <View style={styles.subSection5} />
          <View style={styles.subSection6}>
            <View style={styles.msgTimeLine1}>
              <Text style={[styles.textStyle, {textAlign: 'center'}]}>
                <Text style={styles.subSection3}>{actionTakerText}</Text>
                <Text>{middleText}</Text>
                <Text style={styles.subSection3}>{actionReceiverText}</Text>
                <Text>{postText}</Text>
              </Text>
            </View>
          </View>
        </>
      );
    });
  }

  _onPress = () => {
    this.setState({expanded: !this.state.expanded});
  };
  render() {
    // console.log('=================TimeLineEventItem.js================');
    const {text, data} = this.props;
    const {eventInitiator, eventType, resources} = data.componentData;

    const {
      actionTakerText,
      actionReceiverText,
      middleText,
      postText,
    } = msgTimelineObj({eventInitiator, eventType, resources},this.currentUserId);
    const color = '#5F6368';
    return (
      <View>
        <View style={styles.msgTimeLine8}>
          <View style={styles.msgTimeLine1}>
            <Text style={[styles.textStyle, {textAlign: 'center'}]}>
              <Text style={styles.subSection3}>{actionTakerText}</Text>
              <Text style={styles.subSection4}>{middleText}</Text>
              <Text style={styles.subSection3}>{actionReceiverText}</Text>
              <Text style={styles.subSection4}>{postText}</Text>
            </Text>
            <View style={styles.msgTimeLine9} />
            {resources.length > 1 && (
              <TouchableOpacity
                underlayColor="rgba(0,0,0,0.05)"
                onPress={this._onPress}
                style={styles.msgTimeLine6}>
                <View
                  style={{
                    transform: [
                      {rotate: this.state.expanded ? '180deg' : '0deg'},
                    ],
                  }}>
                  <Icon color={color} size={20} name={'DownArrow'} />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {this.state.expanded ? (
          <View style={styles.msgTimeLine7}>{this.renderSubSection()}</View>
        ) : null}
      </View>
    );
  }
}

export default React.memo(_TimelineEventItem);

const styles = StyleSheet.create({
  textStyle: {
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    flexShrink: 1,
    color: '#9AA0A6',
  },
  subSection1: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 4,
  },
  subSection2: {marginRight: 8, minWidth: 26},
  subSection3: {fontWeight: '500', color: '#5F6368'},
  subSection4: {color: '#5F6368'},
  msgTimeLine1: {
    // display: 'flex',
    // justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: 4,
    backgroundColor: '#E7F1FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignItems: 'center',
    // flexShrink: 1,
    // marginVertical: 15,
    // flex: 0,
    // justifyContent: 'center',
    //   marginHorizontal: 10,
    //   marginVertical: 5,
    //
  },
  msgTimeLine2: {flexDirection: 'row'},
  msgTimeLine3: {marginRight: 8, minWidth: 26},
  msgTimeLine4: {fontWeight: '600'},
  msgTimeLine5: {flex: 1},
  msgTimeLine6: {marginRight: 5},
  msgTimeLine7: {flexDirection: 'column'},
  createdTimelineText: {
    fontSize: normalize(14),
    lineHeight: normalize(17),
    fontWeight: '400',
    color: '#5F6368',
    flexShrink: 1,
  },
  createdTimelineTextBold: {
    fontWeight: '700',
  },
  avatarStyle: {
    paddingVertical: 8,
    paddingHorizontal: 13.5,
    borderRadius: 10,
    backgroundColor: '#FFF1ED',
    flexDirection: 'row',
    maxWidth: '80%',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 5,
    flexShrink: 1,
    top: 5,
  },
  avatarStyle1: {width: 5},
  subSection5: {height: 5},
  subSection6: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    // textAlign: 'center',
  },
  msgTimeLine8: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  msgTimeLine9: {width: 5},
});
