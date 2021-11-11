import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native';
import withObservables from '@nozbe/with-observables';
import {normalize} from '../../utils/helpers';
import {navigate, goBack} from '../../navigation/NavigationService';
import {Icon} from '../../components/Icon/Icon';
import BackButton from '../../components/BackButton';
import * as UsersDao from '../../../dao/UsersDao';
import {ROUTE_NAMES} from '../../navigation/RouteNames';

export const getTitleName = (board, members = [], recentMembers = []) => {
  var tName = board?.name;
  var directChat = board?.type == 'directChat' ? true : false;
  if (tName == null || tName === undefined || tName === '') {
    tName = (directChat
      ? members
      : recentMembers || members
    )
      .filter((a) => (a && directChat ? a.id !== UsersDao.getUserId() : true))
      .map((a) =>
        members?.length > 1
          ? a?.fN !== null
            ? a?.fN
            : a?.lN
          : a?.fN + ' ' + a?.lN,
      )
      .join(', ');
    if (
      tName !== null &&
      tName !== undefined &&
      tName !== '' &&
      board?.membersCount > 3 &&
      recentMembers
    ) {
      tName +=
        ' and ' +
        (board?.membersCount - recentMembers?.length) +
        ' others';
    }
  }
  if (tName !== null && tName !== undefined && tName.endsWith(', '))
    tName = tName.substring(0, tName.length - 1);
  let topicName = tName == null || tName == undefined ? 'New Chat' : tName;

  return topicName;
};

const _MessagesHeaderView = (props) => {
  const {
    board,
    members,
    recentMembers,
    enableTouch = false,
    isFromNotificationTab = false,
  } = props;
  let topicName = getTitleName(board, members, recentMembers);
  return (
    <SafeAreaView forceInset={{bottom: 'never'}} style={styles.mainStyle}>
      <View style={styles.messageHeaderOuterContainer}>
        <View style={styles.messageHeaderContainer}>
          <BackButton
            onPress={() => {
              if (isFromNotificationTab) {
                goBack();
                //navigate(ROUTE_NAMES.FINDLY, {});
                navigate(ROUTE_NAMES.FINDLY, {
                  screen:ROUTE_NAMES.KORA_NOTIFICATIONS
                });
              } else {
                goBack();
              }
            }}
            viewStyle={styles.backButtonStyle}
            color="#292929"
          />
          <TouchableOpacity
            style={styles.boardType}
            onPress={() => {
              //to check wether user part of conversation & handle click
              if (enableTouch) {
                if (board?.type !== 'directChat') {
                  navigate('Group_Details', {board_id: board?.id});
                } else {
                  navigate('Contact_Details', {board});
                }
              }
            }}>
            <Text
              numberOfLines={1}
              style={[
                styles.headerTopicName,
                styles.topicNameStyle,
                {width: '100%'},
              ]}>
              {topicName}
            </Text>
          </TouchableOpacity>
        </View>

        {props.multiSelectMode ? (
          <TouchableOpacity
            style={styles.multiSelect1}
            onPress={() => {
              props.onCancelPressOptoions();
            }}>
            <Text style={styles.text}>Cancel</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.multiSelect2}
            onPress={() => {
              props.onPressOptions();
            }}>
            <View style={styles.multiSelect3}>
              <Icon name={'options'} size={24} color="#202124" />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const enhance = withObservables(['board'], ({board}) => ({
  board: board.observe(),
  members: board.members.observe(),
  recentMembers: board.recentMembers.observe(),
}));

export const MessagesHeaderView = enhance(_MessagesHeaderView);

const styles = StyleSheet.create({
  headerTopicName: {
    fontSize: normalize(19),
    fontWeight: 'bold',
    marginLeft: 10,
  },
  mainStyle1: {flex: 1, backgroundColor: 'white'},
  mainStyle2: {flex: 1, flexDirection: 'column', backgroundColor: 'white'},
  muteStyle1: {
    borderRadius: 4,
    flexDirection: 'row',
    paddingVertical: 16,
  },
  topicNameStyle: {flexShrink: 1, paddingRight: 10},
  text: {
    color: '#0D6EFD',
    fontSize: normalize(16),
    fontWeight: '500',
  },
  textStyle: {
    fontWeight: '500',
    fontSize: normalize(16),
    color: '#202124',
  },
  cancelTextStyle: {
    color: '#DD3646',
    fontWeight: '400',
    fontSize: normalize(16),
  },
  messageHeaderContainer: {
    padding: 18,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    // shadowColor: 'grey',
    // borderBottomWidth: 0.25,
    // borderBottomColor: 'grey',
    height: 54,
    width: '85%',
    justifyContent: 'flex-start',
  },
  backButtonStyle: {paddingRight: 6},
  boardType: {flexDirection: 'row', alignItems: 'center', flexShrink: 1},
  mainStyle: {
    backgroundColor: 'white',
    paddingTop: 0,
  },
  optionsStyle1: {
    margin: 4,
    minHeight: 40,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRadius: 5,
  },
  optionStyles2: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionStyles3: {
    marginRight: 10,
    minWidth: 30,
    marginLeft: 8,
    alignItems: 'center',
  },
  multiSelect1: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '15%',
    borderBottomWidth: 0.25,
    borderBottomColor: 'grey',
    justifyContent: 'center',
    height: 54,
  },
  multiSelect2: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '15%',
    justifyContent: 'center',
    height: 54,
  },
  multiSelect3: {paddingLeft: 10},
  messageHeaderOuterContainer: {
    marginRight: 5,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: 'grey',
    borderBottomWidth: 0.25,
    borderBottomColor: 'grey',
    justifyContent: 'space-between',
    height: 54,
  },
  headerContactName: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    marginLeft: 10,
  },
  participantStyle: {
    width: '100%',
    flexShrink: 1,
    position: 'absolute',
    bottom: 0,
  },
});
