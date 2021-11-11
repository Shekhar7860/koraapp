import {Header as _Header} from '@react-navigation/stack';
import React, {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {View, TouchableOpacity, StyleSheet, SafeAreaView} from 'react-native';

import {Icon} from '../components/Icon/Icon';
import {ROUTE_NAMES} from './RouteNames';
import {setSearchHeaderMode} from '../../shared/redux/actions/native.action';
import {setSpeachToText} from '../../shared/redux/actions/findly_notifications.action';
import * as Constants from './../components/KoraText';
import {normalize} from '../utils/helpers';
import {isAndroid} from '../utils/PlatformCheck';
import SpeechToText from '../screens/SpeechToText';
import {FindlyIcon} from '../components/FindlyIcon';
import * as UsersDao from '../../dao/UsersDao';
import {SvgIcon} from '../components/Icon/SvgIcon.js';
import database from '../realm';
import * as Entity from '../realm/dbconstants';

export const CustomTabBar = ({state, descriptors, navigation}) => {
  const [showDND, setShowDND] = useState();
  const [profile, setProfile] = useState();
  const bottomTabs = useSelector((s) => s.bottomTab.selectedRoutes);
  const dispatch = useDispatch();
  const sttRef = React.useRef();
  let speechToText = '';

  let newStatesOrder = [];
  if (state.routes !== undefined) {
    for (let item of bottomTabs) {
      const index = state.routes.findIndex((o) => item.name === o.name);
      if (index !== -1) {
        newStatesOrder.push({route: state.routes[index], item: item});
      }
    }
  }

  useEffect(() => {
    subscribeProfile(UsersDao.getUserId());
    return () => {
      if (this.profileSubscription && this.profileSubscription.unsubscribe) {
        this.profileSubscription.unsubscribe();
      }
    };
  });
  // let showDND, profile;
  const subscribeProfile = async (userId) => {
    try {
      if (this.profileSubscription && this.profileSubscription.unsubscribe) {
        this.profileSubscription.unsubscribe();
      }
      const db = database.active;

      const profiles = await db.collections.get(Entity.Profiles).find(userId);

      const observable = profiles.observe();
      this.profileSubscription = observable.subscribe((data) => {
        setProfile(data);
        setShowDND(
          data?.nPrefs?.dndTill === -1 &&
            (data?.nPrefs?.dndTill !== 0 ||
              data?.nPrefs?.dndTill >= new Date().getTime()),
        );
      });
    } catch (e) {
      console.log('error in subscribeWorkspace', e);
    }
  };

  const unSelectedRoutes = useSelector((s) => s.bottomTab.unSelectedRoutes);
  const profileRefresh = useSelector((s) => s.auth.image_refresh_mode);
  var routeNames = [];
  newStatesOrder.forEach((object) => {
    routeNames.push(object.route.name);
  });
  const includes = routeNames.includes(state.routes[state.index].name);
  const tabNavigate = useCallback(
    (name, key) => {
      const isFocused = state.routes[state.index].name === name;
      if (!isFocused) {
        dispatch(setSearchHeaderMode(false));
      }
      const event = navigation.emit({
        type: 'tabPress',
        target: key,
      });
      if (!isFocused && !event.defaultPrevented) {
        switch (name) {
          case 'Findly':
            navigation.navigate(ROUTE_NAMES.FINDLY);
            break;
          default:
            navigation.navigate(name);
            break;
        }
      }
    },
    [state, navigation, dispatch],
  );

  const longPressEvent = useCallback(
    (name) => {
      switch (name) {
        case 'Findly':
          sttRef.current.showModal();
          break;
        default:
          break;
      }
    },
    [state, navigation, sttRef, dispatch],
  );

  return (
    <View style={styles.backgroundWhite}>
      <SpeechToText
        ref={sttRef}
        callback={(result) => {
          speechToText = result[0];
          console.log('From MainTabber ---------->> :', speechToText);
          dispatch(
            setSpeachToText({
              speechToText: speechToText,
            }),
          );
          navigation.navigate(ROUTE_NAMES.FINDLY, {
            speechToText: speechToText,
          });
        }}
      />
      <SafeAreaView style={styles.customTabSafeArea}>
        {newStatesOrder.map((object, index) => {
          const {options} = descriptors[object.route.key];
          const {key, name} = object.route;
          const isFocused = state.routes[state.index].name === name;
          const highlightMore = !includes && name === 'More';
          const onPress = () => {
            tabNavigate(name, key);
          };
          const onLongPress = () => {
            longPressEvent(name);
          };

          let profileIcon = profile?.icon;
          let userId = profile?.id;
          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityStates={isFocused ? ['selected'] : []}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}>
              <View style={styles.alignItemsCenter}>
                {object.item.icon === 'findly' ? (
                  <FindlyIcon number="0" size={32} />
                ) : name === 'Profile' ? (
                  <View
                    style={
                      showDND
                        ? {
                            flexDirection: 'row',
                            backgroundColor: 'rgba(184, 147, 242, 0.4)',
                            borderRadius: 18,
                            paddingVertical: 5,
                            width: isFocused ? 74 : 68,
                            padding: 13,
                            alignItems: 'center',
                          }
                        : null
                    }>
                    <Icon
                      profileRefresh={profileRefresh}
                      name={showDND ? 'UserProfileWithDND' : 'UserProfile'}
                      profileFilled={isFocused || highlightMore}
                      size={object.item.showTitle ? 24 : 34}
                      color={isFocused || highlightMore ? '#0D6EFD' : 'black'}
                      profileIcon={profileIcon}
                      userId={userId}
                    />
                    {showDND ? (
                      <View style={styles.showDNDStyle1}>
                        <SvgIcon
                          name="DNDPurple"
                          width={isFocused ? 29 : 26}
                          height={isFocused ? 29 : 26}
                        />
                      </View>
                    ) : null}
                  </View>
                ) : (
                  <Icon
                    name={
                      name
                    }
                    size={object.item.showTitle ? 24 : 34}
                    color={isFocused || highlightMore ? '#0D6EFD' : 'black'}
                  />
                )}
                {/* {object.item.showTitle ? (
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[
                      isFocused || highlightMore
                        ? styles.colorHighlight
                        : styles.colorBlack,
                      styles.textStyle,
                      styles.marginTop,
                    ]}
                    translate>
                    {name}
                  </Text>
                ) : null} */}
              </View>
            </TouchableOpacity>
          );
        })}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  alignItemsFlexEndSelfCenter: {
    alignItems: 'flex-end',
    alignSelf: 'center',
  },
  cancel: {
    color: '#0D6EFD',
    fontSize: normalize(16),
    fontWeight: '500',
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  placeInCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  backgroundWhite: {backgroundColor: 'white'},
  colorBlack: {color: 'black'},
  colorHighlight: {color: '#0D6EFD'},
  marginTop: {marginTop: normalize(8.5)},
  close: {
    minHeight: 24,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardTitle: {
    paddingHorizontal: 10,
    marginRight: -16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customTabSafeArea: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.8,
    shadowRadius: 1.2,
    paddingBottom: isAndroid ? normalize(7) : normalize(0),
    elevation: 10,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    marginTop: 15.5,
    marginBottom: isAndroid ? 3 : 11.5,
  },
  alignItemsCenter: {
    alignItems: 'center',
  },
  showDNDStyle1: {
    paddingLeft: 15,
  },
  backButton: {paddingRight: 0},
  drawer: {margin: -12, padding: 12, zIndex: 999},
  headerSearch: {
    flex: 1,
    fontSize: normalize(16),
    paddingTop: 0,
    paddingBottom: 0,
    marginBottom: 2,
    textAlignVertical: 'center',
    paddingHorizontal: 8,
  },
  mainHeader: {
    paddingHorizontal: 18,
    minHeight: 54,
    maxHeight: 60,
    paddingBottom: isAndroid ? 10 : 0,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: 'grey',
    borderBottomWidth: 0.5,
    borderBottomColor: 'grey',
    backgroundColor: 'white',
  },
  safeAreaStyle: {
    backgroundColor: 'white',
    paddingTop: isAndroid ? 10 : 0,
    paddingBottom: 0,
  },
  titleTextStyle: {
    lineHeight: normalize(24),
    fontWeight: 'bold',
    fontSize: normalize(19),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    textAlign: 'left',
    alignSelf: 'center',
    paddingLeft: 16,
    //minWidth: 200,
    flex: 1,
  },
  textStyle: {
    fontWeight: '400',
    fontSize: normalize(12),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  inputBorder: {
    alignItems: 'center',
    height: normalize(38),
    borderRadius: normalize(12),
    marginStart: normalize(10),
    borderWidth: 1,
    borderColor: '#E5E8EC',
    flexDirection: 'row',
    flex: 1,
    paddingStart: normalize(10),
    marginRight: 10,
    paddingEnd: 10,
  },
});
