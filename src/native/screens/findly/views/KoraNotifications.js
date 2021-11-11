import React from 'react';
import {
  View,
  TouchableOpacity,
  SafeAreaView,
  TouchableHighlight,
  Switch,
  SectionList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import HTML from 'react-native-render-html';
import { Text } from '../../../components/KoraText';
import moment from 'moment';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { decode } from 'html-entities';
import { Q } from '@nozbe/watermelondb';
import { getTimeline } from '../../../components/Chat/helper';
import { Icon } from '../../../components/Icon/Icon.js';
import ParentView from './ParentView';
import { normalize } from '../../../../native/utils/helpers';
import * as Constants from '../../../components/KoraText';
import uuid from 'react-native-uuid';
import {
  readNotification,
  resolveNotification,
  resolvePostNotification,
} from '../../../../shared/redux/actions/message-thread.action';
import { Loader } from '../../ChatsThreadScreen/ChatLoadingComponent';
import { ROUTE_NAMES } from '../../../navigation/RouteNames';
import { navigate } from '../../../navigation/NavigationService';
import { emptyObject } from '../../../../shared/redux/constants/common.constants';
import { getFindlyNotifications } from '../../../../shared/redux/actions/findly_notifications.action';
import database from '../../../realm';
import * as Entity from '../../../realm/dbconstants';
import { BottomUpModal } from '../../../components/BottomUpModal';

const options = [
  // {
  //   id: 'action_needed',
  //   entity: 'isActionable=true',
  //   text: 'Action Needed',
  //   icon: 'Shape',
  // },
  {
    id: 'everything',
    entity: '',
    text: 'Everything',
    icon: 'DR_Everything',
  },
  {
    id: 'priority',
    entity: 'priority',
    text: 'Priority Alerts',
    icon: 'Tip',
  },
  {
    id: 'posts',
    entity: 'posts',
    text: 'Discussion Rooms',
    icon: 'Discussion_Icon',
  },
  {
    id: 'ws',
    entity: 'ws',
    text: 'Workspaces',
    icon: 'Workspaces',
  },
  // {
  //   id: 'tasks',
  //   entity: 'tasks',
  //   text: 'Tasks',
  //   icon: 'Tasks',
  // },
  // {
  //   id: 'boards',
  //   entity: 'boards',
  //   text: 'Meetings',
  //   icon: 'Contact_VCall',
  // },
  // {
  //   id: 'boards_1',
  //   entity: 'boards',
  //   text: 'Knowledge',
  //   icon: 'Files',
  // },
];

const NOT_FOUND_ERROR='Resource not found';
class KoraNotifications extends ParentView {
  navigation = null;
  isActionNeeded = false;
  limit = 20;
  state = {
    notifications: [],
    notifPayload: null,
    isActionNeeded: false,
    selectedOption: null,
    showLoader: false,
    offset: 20,
    allread:false,
  };

  getItemIcon = (entity) => {
    if (!entity) {
      return 'image';
    }

    switch (entity) {
      case 'ws':
        return 'Workspaces';
      case 'messages':
        return 'Discussion_Icon';
      case 'posts':
        return 'Discussion_Icon';
      case 'board':
        return 'Files';
      default:
        return 'image';
    }
  };

  componentDidMount() {
    // this.callNotificationsAPI();
    const { navigation } = this.props;

    this.navigation = navigation;
    this.setNotificationHeader(options[0]);
  }

  onEndReached = (distanceFromEnd) => {
    console.log('end reached called', distanceFromEnd);
    if (this.props.notif.hasMore === true) {
      this.callNotificationsPaginationAPI(this.state.selectedOption);
    }
  };

  callNotificationsPaginationAPI(option = null) {
    if (!option) {
      return;
    }
    // console.log("option  ============> :", option);
    let params = '';
    switch (option.id) {
      case 'everything':
        if (this.state.isActionNeeded) {
          params =
            '?isActionable=true&offSet=' + this.state.offset + '&limit=20';
        } else {
          params = '?offSet=' + this.state.offset + '&limit=20';
        }
        break;
      // case 'action_needed':
      //     // if (!thisisActionNeeded) {
      //     //     isActionNeeded = true;
      //     // }
      //     params = '?isActionable=true';
      //     break;
      default:
        params = '?entity=' + option.entity;
        if (this.state.isActionNeeded) {
          params =
            '?isActionable=true&offSet=' + this.state.offset + '&limit=20';
        } else {
          params += '&offSet=' + this.state.offset + '&limit=20';
        }
        break;
    }

    const payload = {
      params: params,
    };

    this.props.getFindlyNotifications(payload);
    this.setState({ offset: this.state.offset + 20 });
    //  console.log("callNotificationsAPI -----> end called  :", payload);
  }

  setNotificationHeader(option = null) {
    if (!this.navigation) {
      return;
    }
    this.setState({
      showLoader: true,
      selectedOption: option,
      allread:false,
    });
    if (option) {
      this.callNotificationsAPI(option);
    }
    const navigation = this.navigation;
    navigation.setOptions({
      title: '',
      titleColor: 'red',
      headerTitle: () => null,
      headerLeft: () => (
        <View style={styles.navigation1}>
          <TouchableOpacity
            style={styles.navigation2}
            onPress={() => {
              navigation.goBack();
            }}>
            <View style={styles.navigation3}>
              <Icon name={'kr-left_direction'} size={24} color="black" />
            </View>
          </TouchableOpacity>

          {/* <View style={{ justifyContent: 'center', marginStart: 10 }}> */}
          {option && (
            <TouchableOpacity
              style={styles.navigation4}
              onPress={() => {
                this.refs.messageOptions.openBottomDrawer();
              }}>
              <View style={styles.navigation5}>
                <View style={styles.navigation6}>
                  <Icon name={option?.icon} size={20} color="#202124" />
                </View>
                <Text style={styles.navigation7}>{option?.text}</Text>
                {this.state.isActionNeeded && (
                  <View style={styles.navigation8}>
                    <Icon name={'Shape'} size={16} color="blue" />
                  </View>
                )}
                <View style={styles.navigation9}>
                  <Icon name={'Down'} size={14} color="#202124" />
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
      ),

      headerRight: () => (
        <View style={styles.headerRight1}>
          <TouchableOpacity
            style={styles.headerRight2}
            onPress={() => {
              this.refs.notifificationRef.openBottomDrawer();
              // this.refs.messageOptions.openBottomDrawer();
            }}>
            <View style={styles.headerRight3}>
              <Icon name={'options'} size={24} color="black" />
            </View>
          </TouchableOpacity>
        </View>
      ),

      headerStyle: {
        backgroundColor: 'white',
      },
      color: 'red',
      headerTintColor: 'black',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerTitleAlign: 'left',
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.notif !== this.props.notif) {
      if (this.props.notif?.hasMore === false) {
        this.setState({
          showLoader: false,
          notifPayload: this.props.notif,
          notifications: [
            ...this.state.notifications,
            ...this.props.notif?.notifications,
          ],
          offset: 20,
        });
      } else {
        this.setState({
          showLoader: false,
          notifPayload: this.props.notif,
          notifications: [
            ...this.state.notifications,
            ...this.props.notif?.notifications,
          ],
        });
      }
    }
  }

  callNotificationsAPI(option = null) {
    if (!option) {
      return;
    }
    // console.log("option  ============> :", option);
    let params = '';
    switch (option.id) {
      case 'everything':
        if (this.state.isActionNeeded) {
          params = '?isActionable=true';
        }
        break;
      // case 'action_needed':
      //     // if (!thisisActionNeeded) {
      //     //     isActionNeeded = true;
      //     // }
      //     params = '?isActionable=true';
      //     break;
      default:
        params = '?entity=' + option.entity;
        if (this.state.isActionNeeded) {
          params = params + '&isActionable=true';
        }
        break;
    }

    const payload = {
      params: params,
    };

    this.props.getFindlyNotifications(payload);
    //  console.log("callNotificationsAPI -----> end called  :", payload);
  }

  toggleSwitch = (value, option) => {
    this.setState({
      isActionNeeded: value,
    });
    this.optionSelected(option);
    //setIsEnabled(previousState => !previousState)
  };

  renderOptions() {
    const ModalOption = ({ id, text, icon, entity }) => {
      return (
        <TouchableHighlight
          onPress={() => {
            if (id === 'action_needed') {
              this.toggleSwitch(!this.state.isActionNeeded, {
                id,
                text,
                icon,
                entity,
              });
              return;
            }

            this.optionSelected({ id, text, icon, entity });
          }}
          style={styles.optionsStyle1}
          underlayColor="rgba(0,0,0,0.05)">
          <View style={styles.optionsStyle2}>
            <View style={styles.optionsStyle3}>
              <Icon size={21} name={icon} />
            </View>
            <Text style={styles.optionsStyle4}>{text}</Text>
            {id === 'action_needed' && (
              <Switch
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={this.state.isActionNeeded ? 'white' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={(value) =>
                  this.toggleSwitch(value, { id, text, icon, entity })
                }
                value={this.state.isActionNeeded}
              />
            )}
          </View>
        </TouchableHighlight>
      );
    };
    return (
      <SafeAreaView>
        <BottomUpModal ref="messageOptions" height={450}>
          {/* <View style={{height: 20}}></View> */}
          <View style={styles.bottomStyle1}></View>
          {options.map((option) => (
            <ModalOption {...option} key={option.id} />
          ))}
        </BottomUpModal>
      </SafeAreaView>
    );
  }

  optionSelected = (option) => {
    setTimeout(() => {
      this.setState({
        notifPayload: [],
        notifications: [],
      });
      // this.deleteMessage(focusedMessage.messageId, focusedMessage.isSender);
      // this.callNotificationsAPI();
      if (option.id === 'action_needed') {
        let preOption = this.state.selectedOption;
        if (!preOption) {
          preOption = options[1];
        }
        this.setNotificationHeader(preOption);
      } else {
        this.setNotificationHeader(option);
      }
    }, 250);

    this.refs.messageOptions.closeBottomDrawer();
  };

  renderTabsOptions = () => {
    if (this.state.showLoader) {
      return <Loader />;
    }

    let notifications = [];

    if (this.state.notifications) {
      notifications = this.state.notifications;
    }
    return (
      <View style={styles.tabStyle1}>
        {/* <ScrollView horizontal={true} style={{ flex}} > */}

        {/* </ScrollView> */}
        {notifications && notifications.length <= 0 && (
          <View style={styles.tabStyle2}>
            <Text style={styles.tabStyle3}>No Notifications to show</Text>
          </View>
        )}
        {this.renderNotifications(notifications)}
      </View>
    );
  };

  groupData = (notifications) => {
    let groups = [];
    if (!notifications || notifications.length === 0) {
      groups[0] = {
        title: null,
        data: [],
      };
      return groups;
    }

    for (let i = 0; i < notifications.length; i++) {
      let obj = notifications[i];

      const key = obj?.viewedAt ? 1 : 0; //
      if (!groups[key]) {
        groups[key] = {
          title: obj?.viewedAt ? 'Earlier' : 'New',
          data: [],
        };
      }

      groups[key].data.push(obj);
    }
    return groups;
  };

  resolveNotificationData = async (cd) => {
    if (!cd) {
      return;
    }
    const t = cd.t;
    const ed = cd.ed;
    if (!t || !ed) {
      return;
    }

    const db = database.active;
    const boardsCollection = db.collections.get(Entity.Boards);
    switch (t) {
      case 'mt':
      case 'm':
      case 'mm':
        if (ed?.boardId) {
          let boardId = ed?.boardId;
          const results = await boardsCollection
            .query(Q.where('_id', Q.eq(boardId)))
            .fetch();
          if (results?.length > 0) {
            let board = results[0];
            this.navigateToScreen(t, board, ed?.type, ed?.boardId);
          } else {
            let _params = { boardId: ed?.boardId };
            this.props.resolveNotification(_params, (type, data) => {
              if (!type || !(type === 'SUCCESS')) {
                alert(NOT_FOUND_ERROR)
                return;
              }
              this.navigateToScreen(t, data, ed?.type, ed?.boardId);
            });
          }
        }
        break;
      case 'med':
      case 'me':
      case 'md':
      case 'p':
      case 'pm':
      case 'bam':
      case 'bc':
      case 'pem':
      case 'bar':
      case 'baa':
      case 'bne':
        if (ed?.boardId) {
          let boardId = ed?.boardId;
          const results = await boardsCollection
            .query(Q.where('_id', Q.eq(boardId)))
            .fetch();
          if (results?.length > 0) {
            let board = results[0];
            this.navigateToScreen(t, board, ed?.type, ed?.boardId);
          } else {
            let _params = { boardId: ed?.boardId };
            this.props.resolveNotification(_params, (type, data) => {
              if (!type || !(type === 'SUCCESS')) {
                alert(NOT_FOUND_ERROR)
                return;
              }
              this.navigateToScreen(t, data, ed?.type, ed?.boardId);
            });
          }
        }
        break;
      case 'pc':
      case 'pcm':
        if (ed?.postId && ed?.boardId) {
          let _params = {
            postId: ed?.postId,
            boardId: ed?.boardId,
          };
          this.props.resolvePostNotification(_params, (type, boardData) => {
         
          if (!type || !(type === 'SUCCESS')) {
              alert(NOT_FOUND_ERROR)
              return;
            }
           this.navigateToScreen(t, boardData, ed?.type, ed?.boardId);
          });
        }

        break;
      case 'wen':
        console.log('Do nothing type: wen');
        break;
      // case 'bar':
      //   let type = 'SUCCESS';
      //   this.threadCB(type, data, null, jsonObj.t);
      //   break;
      default:
        console.log('Not impimeted type: ', t);
        return;
    }
  };

  navigateToScreen(t, board, subType, boardId) {
    switch (t) {
      case 'mt':
      case 'm':
      case 'mm':
        navigate(ROUTE_NAMES.CHAT, {
          board_id: board?.id,
          isNewChat: false,
          isFromNotification: true,
          isFromNotificationTab: true,
        });
        break;
      case 'med':
      case 'me':
      case 'md':
        navigate(ROUTE_NAMES.CHAT, {
          board_id: board?.id,
          isNewChat: false,
          isFromNotification: true,
          isFromNotificationTab: true,
        });
        break;
      case 'p':
      case 'pm':
      case 'discussion':
      case 'pem':
        navigate(ROUTE_NAMES.DISCUSSION, {
          board: board,
          isFromNotificationTab: true,
        });
        break;
      case 'bam':
      case 'bc':
      case 'bar':
      case 'baa':
      case 'bne':
        if (subType === 'groupChat') {
          navigate(ROUTE_NAMES.CHAT, {
            board_id: board?.id,
            isNewChat: false,
            isFromNotification: true,
            isFromNotificationTab: true,
          });
        } else {
          navigate(ROUTE_NAMES.DISCUSSION, {
            board: board,
            isFromNotificationTab: true,
          });
        }
        break;
      case 'pc':
      case 'pcm':
       
        setTimeout(() => {   navigate(ROUTE_NAMES.COMMENT_SECTION, {
          post: board || emptyObject,
          boardId: boardId,
          isFromNotificationTab: true,
        });}, 200);
        break;
      default:
        return;
    }
  }

  renderFooter() {
    const hasMore = this.props.notif.hasMore === true;
    if (hasMore) {
      return (
        //Footer View with Load More button
        <View style={styles.footerContainer}>
          <ActivityIndicator color="#517BD2" />
        </View>
      );
    } else {
      return null;
    }
  }
  callReadAllApi = () => {
    this.refs?.notifificationRef?.closeBottomDrawer();

    if (this.state.notifications?.length > 0) {
      const firstItem = this.state.notifications[0];
      if (firstItem?._id) {
        let param = {
          readTill: firstItem?._id
        }
        this.props.readNotification(param,(readStatus) => {

          if(readStatus)
          {
            this.setState({allread:true})
          }
        });

      }


    }
  }
  renderOptions2 = () => {
    return (
      <SafeAreaView>
        <BottomUpModal ref="notifificationRef" height={230}>
          {/* <View style={{height: 20}}></View> */}
          <View
            style={{
              padding: 6,
            }}>

            <TouchableHighlight
              onPress={() => {
                this.callReadAllApi();
              }}
              style={{
                marginHorizontal: 4,
                margin: 4,
                padding: 15,
                paddingVertical: 10,
                borderRadius: 5,
              }}
              underlayColor="rgba(0,0,0,0.05)">
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ paddingRight: 23 }}>
                  <Icon size={21} name={'Unsee'} />
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#202124',
                    fontFamily: 'inter',
                    fontStyle: 'normal',
                    fontWeight: '500',
                  }}>
                  Mark All as read
                </Text>
              </View>
            </TouchableHighlight>

          </View>

        </BottomUpModal>
      </SafeAreaView>
    );
  }
  renderNotifications = (notifications) => {
    if (!notifications || notifications.length === 0) {
      return null;
    }
    const sections = this.groupData(notifications);

    // for (let i = 0; i < sections.length; i++) {
    //   if (!sections[i] || !sections[i].data || sections[i].data.length === 0) {
    //     return null;
    //   }
    // }
    var filtered = sections.filter(function (x) {
      return x !== undefined;
    });

    return (
      <View style={styles.container}>
        <SectionList
          sections={filtered}
          // keyExtractor={(item, index) => item + index}
          keyExtractor={(item) => item._id}
          keyboardShouldPersistTaps={'handled'}
          keyboardDismissMode={'on-drag'}
          initialNumToRender={10}
          onEndReachedThreshold={0.1}
          maxToRenderPerBatch={10}
          ListFooterComponent={this.renderFooter.bind(this)}
          windowSize={10}
          renderItem={this.renderSingleNotification}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={0.1}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeaderText}>{title}</Text>
          )}
        />

        {/* <FlatList
                    data={notifications}
                    renderItem={this.renderSingleNotification}
                    keyExtractor={(item) => item._id}
                /> */}
        <View style={styles.sectionHeaderText1}></View>
        {this.renderOptions2()}
      </View>
    );
  };

  dateToFromNowDaily = (myDate) => {
    //2021-02-10T14:13:51.000Z
    var date = new Date(myDate).getTime(); //format(new Date(myDate), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''));

    return moment(date).calendar(null, {
      lastWeek: '[Last] dddd',
      lastDay: '[Yesterday]',
      sameDay: '[Today]',
      nextDay: '[Tomorrow]',
      nextWeek: 'dddd',
      sameElse: function () {
        return format(new Date(date), 'dd/MM/yyyy'); //new Date(myDate).toLocaleDateString();
      },
    });
  };

  getButtonsList = (list, item) => {
    if (!list || list.length === 0) {
      return null;
    }
    //console.log('Buttons list -------->:', JSON.stringify(list));

    return (
      <View key={uuid.v4()} style={styles.buttonList1}>
        {list.map((button) => {
          return (
            <TouchableOpacity
              key={uuid.v4()}
              style={styles.buttonList2}
              onPress={() => {
                console.log('Clicked  : ', button?.title);
                if (item) {
                  if (item?.item?._id && !item.item?.isRead) {
                    let param = {
                      read: item?.item?._id,
                    };
                    this.props.readNotification(param);
                  }
                  this.resolveNotificationData(item);
                }
              }}>
              <Text style={styles.buttonList3}>{button?.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  renderSingleNotification = (item) => {
    return (
      <View key={uuid.v4()} style={styles.notificationStyle1}>
        <TouchableOpacity>
          <View style={styles.notificationStyle2}>
            <View style={styles.notificationStyle3}>
              <View style={styles.notificationStyle4}>
                <Icon
                  size={22}
                  name={this.getItemIcon(item.item?.entity)}
                  color={'black'}
                />
              </View>
            </View>
            <View style={styles.notificationStyle5}>
              <TouchableOpacity
                onPress={() => {
                  if (item?.item?.cd) {
                    if (item?.item?._id && !item?.item?.isRead) {
                      let param = {
                        read: item?.item?._id,
                      };
                      this.props.readNotification(param);
                    }
                    this.resolveNotificationData(item?.item?.cd);
                  }
                  // console.log('Clicked : ', item?.item?.cd);
                }}>
                <View style={styles.notificationStyle6}>
                  <View style={styles.notificationStyle7}>
                    <Text style={styles.notificationStyle8}>
                      {decode(item.item?.message?.title)}
                    </Text>
                    {/* <TouchableOpacity
                                onPress={() => {
                                    console.log("Clicked : ", item.item?.message);
                                }}
                            >
                                <View style={{ marginEnd: 10 }}>
                                    <Icon name={'options'} size={20} color="black" />
                                </View>
                            </TouchableOpacity> */}
                    {(!item.item?.isRead && !this.state.allread) && (
                      <View style={styles.notificationStyle9}></View>
                    )}
                  </View>
                  {/* <Text
                    style={[
                      {
                        color: '#202124',
                        fontSize: normalize(16),
                        marginEnd: 5,
                        fontFamily: Constants.fontFamily,
                        fontStyle: 'normal',
                      },
                    ]}>
                    {decode(item.item?.message?.body)}
                  </Text> */}
                  <View style={styles.notificationStyle10}>
                    <HTML
                      baseFontStyle={styles.baseFontStyle}
                      source={{ html: decode(item.item?.message?.displayText) }}
                    />
                  </View>
                  <Text style={styles.notificationStyle11}>
                    {getTimeline(item.item?.cOn,'message')}{' '}
                    {format(new Date(item.item?.cOn).getTime(), 'hh:mm a')}
                  </Text>
                </View>
              </TouchableOpacity>
              {item.item?.cd?.buttons &&
                this.getButtonsList(item.item?.cd?.buttons, item.item?.cd)}
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.notificationStyle12}></View>
      </View>
    );
  };

  render() {
    return (
      <SafeAreaView style={styles.options1}>
        {this.renderOptions()}
        {this.renderTabsOptions()}
        {/* {this.state.showLoader && <ActivityIndicator />} */}
      </SafeAreaView>
    );
  }
}

KoraNotifications.propTypes = {
  onClick: PropTypes.func,
  onViewMoreClick: PropTypes.func,
  onListItemClick: PropTypes.func,
  callGoBack: PropTypes.func,
};
KoraNotifications.defaultProps = {
  onClick: () => { },
  onViewMoreClick: () => { },
  onListItemClick: () => { },
  callGoBack: () => { },
};
const mapStateToProps = (state) => {
  const { findlyNotifications } = state;
  return {
    notif: findlyNotifications.findlyNotif,
  };
};

export default connect(mapStateToProps, {
  getFindlyNotifications,
  readNotification,
  resolveNotification,
  resolvePostNotification,
})(withTranslation()(KoraNotifications));
//export default KoraNotifications;

const styles = StyleSheet.create({
  footerContainer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  container: { flexDirection: 'column', marginBottom: 5 },
  sectionHeaderText: {
    width: '100%',
    backgroundColor: '#F2F2F2',
    paddingStart: 15,
    paddingTop: 5,
    paddingBottom: 5,
    color: '#202124',
    alignSelf: 'flex-start',
    //marginTop: 5,
    marginBottom: 5,
    fontSize: normalize(16),
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    fontWeight: 'bold',
  },
  baseFontStyle: {
    marginEnd: 5,
    color: '#202124',
    fontSize: normalize(16),
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
  },
  sectionHeaderText1: { width: 80, backgroundColor: '#DD3646' },
  navigation1: { flexDirection: 'row' },
  navigation2: { padding: 5 },
  navigation3: { flex: 1, justifyContent: 'center', marginStart: 10 },
  navigation4: {
    flex: 1,
    flexDirection: 'row',
  },
  navigation5: {
    flex: 1,
    flexDirection: 'row',
    minWidth: 120,
    backgroundColor: 'white',
    padding: 10,
  },
  navigation6: { marginEnd: 6, justifyContent: 'center' },
  navigation7: {
    flex: 1,
    color: '#292929',
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: normalize(18),
    minWidth: 70,
    marginEnd: 14,
  },
  navigation8: { marginEnd: 5, justifyContent: 'center' },
  navigation9: { marginEnd: 2, justifyContent: 'center' },
  headerRight1: { flexDirection: 'row' },
  headerRight2: { padding: 5 },
  headerRight3: { marginEnd: 10 },
  optionsStyle1: {
    marginHorizontal: 4,
    margin: 4,
    padding: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
  optionsStyle2: { flexDirection: 'row', alignItems: 'center' },
  optionsStyle3: { paddingRight: 23 },
  optionsStyle4: {
    flex: 1,
    fontSize: normalize(16),
    color: '#202124',
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    fontWeight: '500',
  },
  bottomStyle1: { padding: 6 },
  tabStyle1: { flexDirection: 'column' },
  tabStyle2: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabStyle3: {
    fontSize: normalize(18),
    color: '#202124',
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
  },
  buttonList1: { flexDirection: 'row' },
  buttonList2: { marginTop: 10 },
  buttonList3: {
    color: '#0D6EFD',

    fontSize: normalize(16),
    marginEnd: 15,
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    fontWeight: 'normal',
  },
  notificationStyle1: {
    backgroundColor: 'white',
    flexDirection: 'column',
    marginStart: 5,
    marginEnd: 5,
    padding: 8,
  },
  notificationStyle2: { flexDirection: 'row' },
  notificationStyle3: {
    width: 25,
    justifyContent: 'flex-start',
    marginEnd: 13,
  },
  notificationStyle4: {
    borderColor: 'red',
    backgroundColor: 'white',
    borderWidth: 0.1,
    height: 25,
    width: 25,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationStyle5: { flex: 1, flexDirection: 'column' },
  notificationStyle6: { flex: 1, flexDirection: 'column' },
  notificationStyle7: { flexDirection: 'row' },
  notificationStyle8: {
    flex: 1,
    color: '#202124',
    fontSize: normalize(16),
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    fontWeight: 'bold',
  },
  notificationStyle9: {
    backgroundColor: 'red',
    borderRadius: 10 / 2,
    height: 10,
    margin: 6,
    width: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationStyle10: { flex: 1 },
  notificationStyle11: {
    color: '#9AA0A6',
    fontSize: normalize(12),
    marginEnd: 10,
    marginTop: 5,
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
  },
  notificationStyle12: {
    justifyContent: 'center',
    alignSelf: 'center',
    opacity: 0.08,
    height: 1,
    width: '98%',
    backgroundColor: 'black',
    marginTop: 5,
  },
  options1: { flex: 1, flexDirection: 'column', backgroundColor: 'white' },
});
