import React from 'react';
import {View, Image, StyleSheet} from 'react-native';
import UserAvatar from '../Library/react-native-user-avatar/src';
import {normalize} from '../../utils/helpers';
import {Icon} from './Icon.js';

const _Avatar = (props) => {
  const {
    active,
    src,
    name,
    membersCount,
    isGroupChat,
    groupMembers,
    color,
    meeting,
    type,
    status,
    fromShareExternal = false,
    fromShareExternalMemberCount = 0,
    profileIcon,
    updateProfile = '',
    userId,
    textSize = null,
  } = props;
  const radius = props.rad ? props.rad : 48;
  const innerCircleRadius = radius * 0.62;
  const circleStyle = {
    borderColor: '#ffffff',
    //borderWidth: 0.7,
    borderRadius: innerCircleRadius,
    overflow: 'hidden',
  };
  const smallCircleStyle = {
    borderColor: '#ffffff',
    borderWidth: 0.7,
    borderRadius: radius / 2,
    overflow: 'hidden',
  };
  const marginTopBottom = normalize(-15);
  const heightRadius = {
    height: innerCircleRadius,
    width: innerCircleRadius,
  };
  // console.log('isGroupChat', isGroupChat);
  if (src === undefined && isGroupChat) {
    const total = membersCount;
    switch (fromShareExternal ? fromShareExternalMemberCount : total) {
      case 1:
        return (
          <View style={circleStyle}>
            <UserAvatar
              color={groupMembers[0]?.color}
              name={groupMembers[0]?.fN}
              size={radius}
              borderRadius={radius}
              style={circleStyle}
              textStyle={{fontSize: normalize(18)}}
              profileIcon={groupMembers[0]?.icon}
              userId={groupMembers[0]?.id}
            />
          </View>
        );
      case 2:
        return (
          <View style={styles.style1}>
            <View style={styles.style2}>
              <View style={styles.style3}>
                <View style={[heightRadius, styles.style5]}>
                  <UserAvatar
                    color={groupMembers[0]?.color}
                    name={groupMembers[0]?.fN}
                    style={circleStyle}
                    profileIcon={groupMembers[0]?.icon}
                    userId={groupMembers[0]?.id}
                  />
                </View>
                <View style={[heightRadius, styles.style4]}>
                  <UserAvatar
                    color={groupMembers[1]?.color}
                    name={groupMembers[1]?.fN}
                    style={circleStyle}
                    profileIcon={groupMembers[1]?.icon}
                    userId={groupMembers[1]?.id}
                  />
                </View>
              </View>
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.style1}>
            <View style={styles.style2}>
              <View
                style={[
                  {
                    marginTop: marginTopBottom,
                  },
                  styles.style3,
                ]}>
                <View style={[heightRadius, styles.style5]}>
                  <UserAvatar
                    color={groupMembers[0]?.color}
                    name={groupMembers[0]?.fN}
                    style={circleStyle}
                    profileIcon={groupMembers[0]?.icon}
                    userId={groupMembers[0]?.id}
                  />
                </View>
                <View style={[heightRadius, styles.style4]}>
                  <UserAvatar
                    color={groupMembers[1]?.color}
                    name={groupMembers[1]?.fN}
                    style={circleStyle}
                    profileIcon={groupMembers[1]?.icon}
                    userId={groupMembers[1]?.id}
                  />
                </View>
              </View>
              <View
                style={[
                  {
                    marginTop: marginTopBottom + marginTopBottom,
                    top: radius / 2 + 14,
                    zIndex: 2,
                  },
                  styles.style6,
                ]}>
                <UserAvatar
                  size={radius / 2}
                  color={groupMembers[2]?.color}
                  name={groupMembers[2]?.fN}
                  style={smallCircleStyle}
                  profileIcon={groupMembers[2]?.icon}
                  userId={groupMembers[2]?.id}
                />
              </View>
            </View>
          </View>
        );
      default:
        return (
          <View style={styles.style1}>
            <View style={styles.style2}>
              <View
                style={[
                  {
                    marginTop: marginTopBottom,
                  },
                  styles.style3,
                ]}>
                <View style={[heightRadius, styles.style5]}>
                  <UserAvatar
                    color={groupMembers[0]?.color}
                    name={groupMembers[0]?.fN}
                    style={circleStyle}
                    profileIcon={groupMembers[0]?.icon}
                    userId={groupMembers[0]?.id}
                  />
                </View>
                <View style={[heightRadius, styles.style4]}>
                  <UserAvatar
                    color={groupMembers[1]?.color}
                    name={groupMembers[1]?.fN}
                    style={circleStyle}
                    profileIcon={groupMembers[1]?.icon}
                    userId={groupMembers[1]?.id}
                  />
                </View>
              </View>
              <View
                style={[
                  {
                    marginTop: marginTopBottom + marginTopBottom,
                    top: radius / 2 + 14,
                    zIndex: 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    position: 'absolute',
                  },
                ]}>
                <UserAvatar
                  color={'#135423'}
                  name={
                    fromShareExternal
                      ? fromShareExternalMemberCount - 2 + ''
                      : total - 2 + ''
                  }
                  size={radius / 2}
                  displayFullText={true}
                  style={smallCircleStyle}
                  backgroundColor={'#EAF6EC'}
                />
              </View>
            </View>
          </View>
        );
    }
  }
  let _color =
    groupMembers && groupMembers.length > 0 && groupMembers[0]
      ? groupMembers[0]?.color
      : color;
  //console.log(name);
  let bgColor, icon, iconColor;
  if (status === 'accepted') {
    bgColor = '#93D3A2';
    icon = 'SingleTick';
    iconColor = '#135423';
  } else if (status === 'declined') {
    bgColor = '#FFBCA5';
    icon = 'cross';
    iconColor = '#59141C';
  } else if (status === 'tentative') {
    bgColor = '#9AA0A6';
    icon = 'Question';
    iconColor = '#FFFFFF';
  }
  return (
    <View>
      <View style={circleStyle}>
        <UserAvatar
          src={src}
          name={name}
          style={circleStyle}
          color={_color}
          size={radius}
          updateProfile={updateProfile}
          borderRadius={radius}
          profileIcon={profileIcon}
          userId={userId}
          textStyle={{fontSize: textSize || normalize(18)}}
        />
      </View>
      {meeting && status !== 'needsAction' ? (
        <View
          style={{
            alignSelf: 'flex-end',
            position: 'absolute',
            borderWidth: 1.5,
            borderColor: '#ffffff',
            width: 18,
            height: 18,
            borderRadius: 18 / 2,
            backgroundColor: bgColor,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Icon name={icon} size={normalize(10)} color={iconColor} />
        </View>
      ) : null}
      {/* {type !== 'offline' ? (
        <Image
          style={styles.imageStyle}
          source={require('../../assets/contact/availability.png')}
        />
      ) : null} */}
    </View>
  );
};
export const Avatar = React.memo(_Avatar);
const styles = StyleSheet.create({
  style6: {
    flexDirection: 'row',
    position: 'absolute',
    overflow: 'visible',
  },
  style5: {
    flexDirection: 'row',
    zIndex: 2,
  },
  style4: {
    flexDirection: 'row',
    marginLeft: -6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  style3: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'flex-start',

    overflow: 'visible',
  },
  style2: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  style1: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  userAvatarCount: {
    position: 'absolute',
    overflow: 'visible',
    flexDirection: 'row',
  },
  imageStyle: {
    alignSelf: 'flex-end',
    marginTop: -1,
    position: 'absolute',
    zIndex: 999,
  },
});
