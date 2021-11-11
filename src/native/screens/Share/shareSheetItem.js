import React from 'react';
import {
  View,
  TouchableHighlight,
  Image,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

import * as UsersDao from '../../../dao/UsersDao';
import {Icon} from '../../components/Icon/Icon.js';
import * as Constants from '../../components/KoraText';
import {Avatar} from '../../components/Icon/Avatar';
import {normalize} from '../../utils/helpers';
import { emptyArray } from '../../../shared/redux/constants/common.constants';
import {RoomAvatar} from '../../components/RoomAvatar';

export const shareSheetItem = ({
  item = {},
  index,
  generateSendAction = () => {},
  //here all props
}) => {
  var titleName =
    item.name !== '' && item.name !== undefined ? item.name : null;
  let recentMembers = item.recentMembers || emptyArray;
  const isDirectChat = item.type === 'directChat';
  const isGroupChat = item.type === 'groupChat';
  const isDiscussion = item.type === 'discussion';
  const isMessageSent = item.sent || false;
  let isMessageSending = false;
  let names = isDiscussion ? null : null;
  names = recentMembers
    ?.filter(
      (a) =>
        a.id !== undefined &&
        a.emailId !== undefined &&
        a.id !== UsersDao.getUserId(),
    )
    .map((a) => (a.fN !== undefined ? a.fN : a.emailId))
    .join(', ')
    .trim();

  if (names === '' && isDiscussion) names = '';

  if ((isDirectChat && titleName == null) || titleName === undefined) {
    titleName = recentMembers
      .filter((a) => a.id !== undefined && a.id !== UsersDao.getUserId())
      .map((a) => a.emailId)
      .join(', ')
      .trim();
    var temp = names;
    names = titleName;
    titleName = temp;
  }

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 10,
        minHeight: 45,

        justifyContent: 'center',
        alignContent: 'center',
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',

          flex: 1,
        }}>
        <View
          style={styles.r1}>
            {isDiscussion ? (
              <RoomAvatar boardIcon={''} />
            ) : (  
          <Avatar
            name={
              isDirectChat ? names?.toUpperCase() : titleName?.toUpperCase()
            }
            groupMembers={isDirectChat ? null : item.recentMembers || emptyArray}
            isGroupChat={
              isDirectChat
                ? false
                : isGroupChat
                ? true
                : item.membersCount > 1 || false
            }
            membersCount={item.membersCount}
          />
            )}
        </View>
        <View
          style={{
            flexDirection: 'column',

            flex: 1,
            padding: 5,
          }}>
          {titleName != null && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                numberOfLines={1}
                style={{
                  color: '#202124',
                  fontWeight: '600',
                  fontSize: normalize(14),
                  fontWeight: 'bold',
                  fontStyle: 'normal',
                  flexShrink: 1,
                  fontFamily: Constants.fontFamily,
                }}>
                {titleName}
              </Text>
              {/*  {isDiscussion && (
                <Text
                  style={{
                    color: '#FFFFFF',
                    backgroundColor: '#28A745',
                    fontWeight: '600',
                    padding: 4,
                    minWidth: 33,
                    borderRadius: 2,
                    textAlign: 'center',
                    fontSize: normalize(8),

                    marginStart: 10,
                  }}>
                  Room
                </Text>
              )} */}
            </View>
          )}
          {names !== null && names !== undefined && (
            <Text
              numberOfLines={1}
              style={
                titleName != null
                  ? {
                      marginTop: 2,

                      color: '#605E5C',
                      fontWeight: '400',
                      fontSize: normalize(12),

                      fontStyle: 'normal',

                      fontFamily: Constants.fontFamily,
                    }
                  : {
                      marginTop: 2,
                      color: '#202124',
                      fontWeight: '600',
                      fontSize: normalize(14),
                      fontWeight: 'bold',
                      fontStyle: 'normal',

                      fontFamily: Constants.fontFamily,
                    }
              }>
              {names}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => {
            isMessageSending = isMessageSent ? false : true;
            isMessageSent ? null : generateSendAction(item,index);
          }}
          style={
            isMessageSent
              ? styles.sentButtonBackground
              : styles.sendButtonBackground
          }>
          <Text
            style={{
              fontWeight: '400',
              fontSize: normalize(14),
              fontStyle: 'normal',
              fontFamily: Constants.fontFamily,
              color: isMessageSent ? '#9AA0A6' : '#07377F',
            }}>
            {isMessageSent ? 'Sent' : 'Send'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  r1:{
    justifyContent: 'center',
    alignContent: 'center',
    minWidth:normalize(60),
    marginEnd:normalize(2)
    //marginEnd: isDirectChat ? 12 : item.membersCount > 1 ? 9 : 12,
   
  },
  sendButtonBackground: {
    minHeight: 30,
    minWidth: 60,
    borderColor: '#85B7FE',
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#E7F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: 10,
  },
  sentButtonBackground: {
    minHeight: 30,
    minWidth: 60,
    borderColor: '#BDC1C6',
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#EFF0F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: 10,
  },
});

export default shareSheetItem;
