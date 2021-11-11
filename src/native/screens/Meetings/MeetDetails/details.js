import React from 'react';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import moment from 'moment';
import {Header} from '../../../navigation/TabStacks';
import ReadMore from 'react-native-read-more-text';
import {goBack} from '../../../navigation/NavigationService';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Linking,
  ScrollView,
  Image,
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import Toast from 'react-native-simple-toast';
import {Icon} from '../../../components/Icon/Icon.js';
import {navigate} from '../../../navigation/NavigationService';
import {getTimeline, normalize} from '../../../utils/helpers';
import {
  updateEvent,
  deleteEvent,
} from '../../../../shared/redux/actions/meetings.action';
import {ROUTE_NAMES} from '../../../navigation/RouteNames';
import * as UsersDao from '../../../../dao/UsersDao';
import {Avatar} from '../../../components/Icon/Avatar';
import MeetMoreInfo from './moreInfo.js';
import EventDelete from './deleteEvent.js';
import {url_regex} from '../../../utils/regexconstants';
import * as ContactsDao from '../../../../dao/ContactsDao';
import {decode} from 'html-entities';
import HTML from 'react-native-render-html';

const moreInfo = React.createRef();
const deleteModal = React.createRef();
const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;
const footerOptions = [
  {
    name: 'Yes',
    icon: 'SingleTick',
  },
  {
    name: 'No',
    icon: 'cross',
  },
  {
    name: 'Maybe',
    icon: 'Error',
  },
];

const headerOptions = [
  {
    name: 'Edit',
    icon: 'edit',
  },
  {
    name: 'Delete',
    icon: 'Delete_T',
  },
  // {
  //   name: 'Options',
  //   icon: 'options',
  // },
];

const mappingOptions = new Map();
mappingOptions.set('Yes', 'accepted');
mappingOptions.set('No', 'declined');
mappingOptions.set('Maybe', 'tentative');
function getKey(val) {
  return [...mappingOptions].find(([key, value]) => val === value)[0];
}

class MeetDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      event: '',
      isOrganizer: false,
      attendeesListExpand: false,
      currentUserStatus: '',
      updatedStatus: '',
    };
  }

  componentDidMount() {
    this.updateState();
  }

  componentDidUpdate(prevProps, nextProps, prevState) {
    if (this.props.eventUpdated !== prevProps.eventUpdated) {
      if (this.props.eventUpdated) {
        this.updateState();
      }
    }
    if (this.props.eventDeleted !== prevProps.eventDeleted) {
      if (this.props.eventDeleted) {
        let {allEvents} = this.props;
        let index = allEvents.findIndex(
          (e) => e.eventId === this.props.route.params.eventId,
        );
        allEvents?.splice(index, 1);
        const {route} = this.props;
        navigate(ROUTE_NAMES.EVENTS, {event: allEvents});
        route.params.onSelect({updated: true});
      }
    }
  }

  onSelect = (data) => {
    this.props.route.params.onSelect({updated: true});
  };

  deleteEvent() {
    let payload = {
      eventIds: [this.state.event?.eventId],
    };
    let mailId = UsersDao.getEmailId();
    this.props.deleteEvent(payload, mailId);
  }

  updateState() {
    const {updatedStatus} = this.state;
    let {allEvents, route} = this.props;
    let index = allEvents.findIndex(
      (e) => e.eventId === this.props.route.params.eventId,
    );
    this.setState({event: allEvents[index]});
    let userIndex = allEvents[index]?.attendees?.findIndex((item) => {
      return item.emailId === UsersDao.getEmailId();
    });
    if (updatedStatus) {
      route.params.onSelect({updated: true});
      allEvents[index].attendees[userIndex].status = updatedStatus;
    }
    this.setState({
      currentUserStatus: allEvents[index]?.attendees[userIndex]?.status,
      isOrganizer: allEvents[index]?.isOrganizer,
    });
  }

  headerOnClickEvent(type) {
    if (type === 'Delete') {
      deleteModal.current.openModal(this.state.event);
    } else {
      // goBack();
      navigate(ROUTE_NAMES.NEW_MEETING, {
        onSelect: this.onSelect,
        eventId: this.state.event?.eventId,
        isNewMeeting: false,
        canEdit: this.state.isOrganizer,
        event: this.state.event,
      });
    }
  }
  renderHeaderIcons() {
    return (
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          onPress={() => this.headerOnClickEvent('Edit')}
          style={styles.paddingStyle}>
          <Icon name={'edit'} size={normalize(22)} color="#202124" />
        </TouchableOpacity>
        {this.state.isOrganizer ? (
          <TouchableOpacity
            onPress={() => this.headerOnClickEvent('Delete')}
            style={styles.paddingStyle}>
            <Icon name={'Delete_T'} size={normalize(22)} color="#202124" />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  updateMeet(option) {
    let flag;
    flag = mappingOptions.get(option);
    this.setState({updatedStatus: flag});
    const {event} = this.state;
    let payload = {
      eventId: event?.eventId,
      user: {
        email: UsersDao.getEmailId(),
        status: flag,
      },
    };
    let mailId = UsersDao.getEmailId();
    this.props.updateEvent(payload, mailId);
  }

  renderFooter() {
    const {currentUserStatus} = this.state;
    let optionHighlighted;
    if (currentUserStatus === 'accepted') {
      optionHighlighted = 'Yes';
    } else if (currentUserStatus === 'declined') {
      optionHighlighted = 'No';
    } else if (currentUserStatus === 'tentative') {
      optionHighlighted = 'Maybe';
    }
    return (
      <SafeAreaView style={styles.footer}>
        <View style={styles.flexStyle}>
          <Text style={styles.going}>Going?</Text>
        </View>
        <View style={styles.flex}>
          {footerOptions.map((ele, index) => {
            let bgColor = '#ffffff';
            let fontColor = '#5F6368';
            if (optionHighlighted === ele.name) {
              bgColor = '#e0eaf9';
              fontColor = '#0D6EFD';
            }
            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  this.updateMeet(ele?.name);
                }}
                style={[styles.goingOptions, {backgroundColor: bgColor}]}>
                {/* <Icon name={ele.icon} size={normalize(20)} color={fontColor} /> */}
                <Text style={[{color: fontColor}, styles.footerOptionStyle]}>
                  {ele.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    );
  }

  detailSection1() {
    let {title, attendees, duration} = this.state.event;
    if (title === undefined) {
      if (attendees?.length > 3 || attendees?.length === 1) {
        title = 'No title';
      } else {
        title = '';
        attendees?.map((item) => {
          const {self, name, emailId} = item;
          let attendeeName;
          if (self) {
            title = title + UsersDao.getUserName().split(' ', 1);
          } else if (!name) {
            title = title + emailId;
          } else {
            title = title + name.split(' ', 1);
          }
          title = title.concat(', ');
        });
        title = title + ' meet';
      }
    }
    let meetTime = getTimeline(moment(duration?.start), 'meetingInfo');
    const start = getTimeline(moment(duration?.start), 'time');
    const end = getTimeline(moment(duration?.end), 'time');
    meetTime = meetTime + ', ' + start + ' - ' + end;
    return (
      <View style={styles.section1}>
        <View style={styles.blueBoxStyle} />
        <View>
          <Text numberOfLines={2} style={styles.titleText}>
            {title}
          </Text>
          <Text numberOfLines={2} style={styles.meetTimeText}>
            {meetTime}
          </Text>
        </View>
      </View>
    );
  }
  renderAttendeeStatus(status) {
    let statusArray = [];
    if (status.accepted > 0) {
      statusArray.push(status.accepted + ' yes');
    }
    if (status.declined > 0) {
      statusArray.push(status.declined + ' no');
    }
    if (status.tentative > 0) {
      statusArray.push(status.tentative + ' maybe');
    }
    if (status.needsAction > 0) {
      statusArray.push(status.needsAction + ' awaiting');
    }
    return '(' + statusArray.join(', ') + ')';
  }

  renderParticipants(attendees) {
    const {attendeesListExpand} = this.state;
    let allAttendees = attendees;
    let lessAttendees = attendees?.slice(0, 4);
    let showAttendees = attendeesListExpand ? allAttendees : lessAttendees;
    let showText = attendeesListExpand ? 'See less' : 'See more';

    //let profileIcon = null;
    //let userId = null;
    return (
      <View style={{marginTop: 10}}>
        {showAttendees?.map((attendee, index) => {
          const {self, organizer, status} = attendee;
          let userDetail = ContactsDao.getContactFromEmailID(attendee.emailId);
          //const {icon, color, id} = userDetail;
          let avatarName = userDetail?.fN || attendee.emailId;
          let attendeeName;
          if (self || attendee.emailId === UsersDao.getEmailId()) {
            attendeeName = 'You';
          } else {
            if (userDetail?.fN) {
              attendeeName = userDetail?.fN + ' ' + userDetail?.lN;
            } else {
              attendeeName = attendee.emailId;
            }
          }
          return (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                marginVertical: 8,
              }}>
              <Avatar
                name={avatarName}
                status={status}
                meeting={true}
                profileIcon={userDetail?.icon || 'no-avatar'}
                color={userDetail?.color || ''}
                userId={userDetail?.id || ''}
              />
              <View style={{marginLeft: 8, margin: 3}}>
                <Text style={styles.GuestTextStyle}>{attendeeName}</Text>
                <Text style={styles.statusText}>
                  {organizer ? 'Organizer' : 'Required'}
                </Text>
              </View>
            </View>
          );
        })}
        {attendees?.length > 4 ? (
          <TouchableOpacity
            onPress={() => {
              this.setState({attendeesListExpand: !attendeesListExpand});
            }}>
            <Text style={styles.moreLessText}>{showText}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  detailSection2() {
    let {attendees} = this.state.event;
    let total = attendees?.length;
    var counts = {};
    attendees?.map((value) => {
      var status = value.status;
      counts[status] = counts[status] ? counts[status] + 1 : 1;
    });
    return (
      <View style={styles.sectionView}>
        <Icon name="Share" size={normalize(22)} color="#202124" />
        <View style={{marginLeft: 24}}>
          <Text style={styles.GuestTextStyle}>
            {total}
            {total > 1 ? ' Guests' : ' Guest'}
          </Text>

          <Text
            style={{
              color: '#9AA0A6',
              fontSize: normalize(16),
              paddingTop: 5,
            }}>
            {this.renderAttendeeStatus(counts)}
          </Text>
          {/* <TextInput
            placeholder="Type and enter a name to add"
            style={{
              marginLeft: -10,
              width: width - 100,
              marginVertical: 15,
              borderWidth: 1,
              borderColor: '#E4E5E7',
              fontSize: normalize(16),
              borderRadius: 4,
              padding: 10,
            }}
          /> */}
          {this.renderParticipants(attendees)}
        </View>
      </View>
    );
  }
  openURL(link) {
    try {
      Linking.canOpenURL(link).then((supported) => {
        if (supported) {
          Linking.openURL(link);
        } else {
          console.log('Error while opening : ' + link);
        }
      });
    } catch (e) {}
  }

  detailSection3() {
    const {where, conferenceData, meetJoin} = this.state.event;
    let {name, iconUri} = conferenceData;
    if (name === 'Google Meet') {
      name = 'Gmeet';
    } else {
      name = 'Zoom';
    }
    return (
      <View style={styles.sectionView}>
        <Icon
          name="link"
          size={normalize(22)}
          color="#202124"
          style={{marginTop: 5}}
        />
        <View style={styles.flexStyle}>
          <TouchableOpacity
            onPress={() => {
              this.openURL(meetJoin?.meetingUrl);
            }}
            onLongPress={() => {
              Clipboard.setString(meetJoin?.meetingUrl);
              Toast.showWithGravity('Copied', Toast.SHORT, Toast.BOTTOM);
            }}
            style={styles.meetLink}>
            <Text numberOfLines={1} style={styles.meetLinkText}>
              {meetJoin?.meetingUrl}
            </Text>
            {/* <TouchableOpacity
              style={{
                justifyContent: 'flex-end',
                //marginRight: 5,
                padding: 5,
              }}
              onPress={() => {}}>
              <Icon name="cross" size={normalize(22)} color="#202124" />
            </TouchableOpacity> */}
          </TouchableOpacity>
          <View style={styles.joinView}>
            <TouchableOpacity
              onPress={() => {
                this.openURL(meetJoin?.meetingUrl);
              }}
              style={styles.joinEvent}>
              <Image source={{uri: iconUri}} style={styles.meetImage} />
              <Text style={styles.joinEventText}>{'Join from ' + name}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                moreInfo.current.openModal(this.state.event);
              }}
              style={styles.moreInfoView}>
              <Icon name="Version" size={normalize(22)} color="#9AA0A6" />
              <Text style={styles.moreInfoText}>More Info</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  _renderTruncatedFooter = (handlePress) => {
    return (
      <Text style={styles.moreLessText} onPress={handlePress}>
        Read more
      </Text>
    );
  };

  _renderRevealedFooter = (handlePress) => {
    return (
      <Text style={styles.moreLessText} onPress={handlePress}>
        Read less
      </Text>
    );
  };

  renderDescription(description) {
    var isHTML = RegExp.prototype.test.bind(/(<([^>]+)>)/i);
    return (
      <View style={styles.descView}>
        <Icon name="ViewDetails" size={normalize(24)} color="#202124" />
        <View style={styles.readMoreView}>
          <ReadMore
            numberOfLines={3}
            renderTruncatedFooter={this._renderTruncatedFooter}
            renderRevealedFooter={this._renderRevealedFooter}>
            {isHTML(description) || description.indexOf('&lt') >= 0 ? (
              <HTML
                baseFontStyle={{fontSize: normalize(16)}}
                source={{html: decode(description)}}
              />
            ) : (
              <Text style={{fontSize: normalize(16)}}>
                {description.trim()}
              </Text>
            )}
          </ReadMore>
        </View>
      </View>
    );
  }

  renderLocation(location) {
    console.log('Location', location);
    var isLink = location.match(url_regex);
    return (
      <View style={styles.viewStyle}>
        <Icon name="location" size={normalize(22)} color="#202124" />
        <Text
          numberOfLines={1}
          style={isLink ? styles.meetLinkText : styles.textStyle}
          onPress={() => this.openURL(location)}>
          {location}
        </Text>
      </View>
    );
  }

  renderMeeetRoom(rooms) {
    return (
      <View style={styles.viewStyle}>
        <Icon name="Company" size={normalize(22)} color="#202124" />
        <Text numberOfLines={1} style={styles.textStyle}>
          {rooms[0]?.name}
        </Text>
      </View>
    );
  }
  meetingInfo() {
    let {isOnlineMeeting, location, rooms, description} = this.state.event;

    return (
      <View style={{margin: 15, marginLeft: 5}}>
        {this.detailSection1()}
        {this.detailSection2()}
        {isOnlineMeeting ? this.detailSection3() : null}
        {description ? this.renderDescription(description.trim()) : null}
        {location ? this.renderLocation(location) : null}
        {rooms?.length > 0 ? this.renderMeeetRoom(rooms) : null}
      </View>
    );
  }

  render() {
    const {event} = this.state;
    return (
      <View style={styles.main}>
        <MeetMoreInfo ref={moreInfo} />
        <EventDelete ref={deleteModal} deleteEvent={() => this.deleteEvent()} />
        <Header
          {...this.props}
          title={'Meeting Details'}
          goBack={true}
          rightContent={this.renderHeaderIcons()}
        />
        <ScrollView style={styles.flexStyle}>{this.meetingInfo()}</ScrollView>
        {this.renderFooter()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  main: {flex: 1, backgroundColor: 'white'},
  footer: {
    flexDirection: 'row',
    margin: 20,
    marginTop: 25,
    alignItems: 'center',
  },
  sectionView: {
    margin: 17,
    //marginRight: 0,
    flexDirection: 'row',
    //alignItems: 'center',
  },
  section1: {
    margin: 20,
    flexDirection: 'row',
  },
  GuestTextStyle: {
    fontWeight: '400',
    color: '#202124',
    fontSize: normalize(16),
  },
  joinEvent: {
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFF0F1',
    borderRadius: 4,
    flexDirection: 'row',
  },
  joinEventText: {
    padding: 10,
    fontSize: normalize(16),
    color: '#5F6368',
  },
  statusText: {
    marginTop: 3,
    fontWeight: '400',
    fontSize: normalize(14),
    color: '#5F6368',
  },
  moreInfoView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginLeft: 10,
    // alignContent: 'flex-end',
  },
  titleText: {
    marginRight: 20,
    fontWeight: '500',
    color: '#202124',
    fontSize: normalize(18),
  },
  meetTimeText: {
    fontWeight: '400',
    color: '#202124',
    fontSize: normalize(16),
    lineHeight: 26,
    marginTop: 20,
    width: width - 140,
  },
  moreInfoText: {
    color: '#9AA0A6',
    fontSize: normalize(16),
    marginLeft: 10,
  },
  joinView: {
    margin: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  meetImage: {width: 20, height: 20, marginLeft: 10},
  meetLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  meetLinkText: {
    flex: 1,
    color: '#0D6EFD',
    fontSize: normalize(16),
    marginLeft: 25,
  },
  going: {
    fontSize: normalize(16),
    color: '#202124',
  },
  flex: {
    flexDirection: 'row',
  },
  goingOptions: {
    padding: 5,
    borderRadius: 4,
    flexDirection: 'row',
    margin: 5,
  },
  viewStyle: {
    margin: 18,
    flexDirection: 'row',
  },
  textStyle: {
    fontSize: normalize(16),
    marginLeft: 22,
  },
  descView: {
    margin: 18,
    flexDirection: 'row',
    marginTop: 0,
  },
  blueBoxStyle: {
    marginTop: 4,
    marginRight: 28,
    width: 18,
    height: 18,
    backgroundColor: '#288CFA',
    borderRadius: 2,
  },
  footerOptionStyle: {
    fontSize: normalize(16),
    paddingLeft: 5,
    fontWeight: '500',
  },
  readMoreView: {marginHorizontal: 20},
  paddingStyle: {padding: 10},
  flexStyle: {flex: 1},
  moreLessText: {color: '#0D6EFD', fontSize: normalize(16)},
});

const mapStateToProps = (state) => {
  const {meetingsReducer} = state;
  return {
    eventDeleted: meetingsReducer.eventDeleted,
    eventUpdated: meetingsReducer.eventUpdated,
    meetEvents: meetingsReducer.meetEvents,
    allEvents: meetingsReducer.meetEvents?.events,
  };
};

export default connect(mapStateToProps, {updateEvent, deleteEvent})(
  MeetDetails,
);
