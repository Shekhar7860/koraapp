import React from 'react';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Animated,
  Keyboard,
  FlatList,
  Alert,
} from 'react-native';
import {isIOS} from '../../../utils/PlatformCheck';
import * as UsersDao from '../../../../dao/UsersDao';
import {Icon} from '../../../components/Icon/Icon.js';
import {getTimeline, normalize} from '../../../utils/helpers';
import {Header} from '../../../navigation/TabStacks';
import moment from 'moment';
import DateTimePicker from './dateTimePicker';
import RepeatModal from './repeatModal';
import MeetTimeZone from './meetTimeZone';
import AddGuest from './addGuests';
//import ContactList from './contactList';
import MeetLink from './meetLinkModal';
import MeetLocation from './meetLocation';
import MeetRoom from './roomModal';
import {create, merge} from 'lodash';
import {
  getMemAvailability,
  createEvent,
  getAttendeeContact,
  getRoomList,
  rescheduleEvent,
  sendReminder,
} from '../../../../shared/redux/actions/meetings.action';
import {navigate} from '../../../navigation/NavigationService';
import {ROUTE_NAMES} from '../../../navigation/RouteNames';
import {Avatar} from '../../../components/Icon/Avatar';
import Toast from 'react-native-simple-toast';
import * as ContactsDao from '../../../../dao/ContactsDao';
import {
  // getContactList,
  selectedContactList,
  getRecentContactList,
} from '../../../../shared/redux/actions/create-message.action';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import EventAlert from '../MeetDetails/eventAlert.js';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;
const setMeetTime = React.createRef();
const setRepeatMode = React.createRef();
const addLink = React.createRef();
const addRoom = React.createRef();
const addLocation = React.createRef();
const nameInput = React.createRef();
const titleInput = React.createRef();
const addTimeZone = React.createRef();
const addGuest = React.createRef();
const alertModal = React.createRef();

const row = [];
let prevOpenedRow = null;
class ScheduleMeeting extends React.Component {
  constructor(props) {
    super(props);
    let start = moment();
    const remainder = 30 - (start.minute() % 30);
    const dateTime = moment(start).add(remainder, 'minutes');
    const initialStartTime = new Date(dateTime);
    const initialEndTime = new Date(dateTime);
    initialEndTime.setHours(initialEndTime.getHours() + 1);
    this.state = {
      title: '',
      timeZone: 'Asia/Kolkata',
      timeZoneValue: '',
      searchName: '',
      startDate: initialStartTime,
      endDate: initialEndTime,
      allDay: false,
      repeat: 'No repeat',
      showMore: true,
      meetingLink: '',
      description: '',
      location: '',
      meetRoom: {},
      noteTemplate: '',
      showContactList: false,
      enableScrollViewScroll: true,
      attendees: [],
      guests: [],
      coordinates: {},
      descInputFocused: false,
      selectedSlot: '',
      shift: new Animated.Value(0),
      searchGuestName: '',
      canEdit: false,
    };
  }
  componentDidMount() {
    if (
      this.props?.route?.params?.isNewMeeting ||
      this.props?.route?.params?.canEdit
    ) {
      titleInput.current?.focus();
      this.setState({canEdit: true});
    }

    if (!this.props?.route?.params?.isNewMeeting) {
      this.updateState();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {event} = this.props?.route?.params;
    if (prevProps.memberStatus !== this.props.memberStatus) {
      this.setState({
        guests: this.mergeAttendees(this.state.guests, this.props.memberStatus),
      });
    }
    // if (
    //   prevState.guests.length !== this.state.guests.length &&
    //   this.state.guests.length
    // ) {
    //   this.checkAvailability(this.state.guests.filter((a) => !a.status));
    // }
    if (this.props?.eventCreated !== prevProps?.eventCreated) {
      if (this.props?.eventCreated) {
        if (event?.eventType === 'pending') {
          let {allEvents} = this.props;
          allEvents.map((item, index) => {
            if (item.mrIdOrEventId === this.props.route.params?.mrIdOrEventId) {
              console.log('matched', index);
              allEvents?.splice(index, 1);
            }
          });
          this.props.route.params.onSelect({updated: true});
        }
        navigate(ROUTE_NAMES.EVENTS);
        //route.params.onSelect({updated: true});
      }
    }
    if (this.props.edited !== prevProps.edited) {
      const {edited, editedEvent} = this.props;
      if (edited) {
        //console.log('Called edit');
        let {allEvents} = this.props;
        let index = allEvents.findIndex(
          (e) => e.eventId === this.props.route.params.eventId,
        );
        allEvents[index] = editedEvent;
        const {route} = this.props;
        navigate(ROUTE_NAMES.EVENTS, {event: allEvents});
        route.params.onSelect({updated: true});
      }
    }
    if (this.props.sentReminder !== prevProps.sentReminder) {
      if (this.props.sentReminder) {
        Toast.showWithGravity(
          'Request sent successfully',
          Toast.Long,
          Toast.CENTER,
        );
      }
    }
  }

  setTime(isAllDay, startDate, endDate) {
    //const {startDate, endDate} = this.state;
    if (!isAllDay) {
      var start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      this.setState({startDate: start});
      var end = endDate;
      end.setHours(23, 59, 59, 999);
      this.setState({endDate: end});
    } else {
      let start = moment();
      const remainder = 30 - (start.minute() % 30);
      const dateTime = moment(start).add(remainder, 'minutes');
      const initialStartTime = new Date(dateTime);
      const initialEndTime = new Date(dateTime);
      initialEndTime.setHours(initialEndTime.getHours() + 1);
      this.setState({startDate: initialStartTime, endDate: initialEndTime});
    }
  }

  updateState() {
    const {event} = this.props?.route?.params;
    let start = event?.duration?.start;
    let end = event?.duration?.end;
    let listOfParticipants;
    if (event.eventType === 'pending') {
      listOfParticipants = event?.placeHolderEvent?.invitees;
    } else {
      listOfParticipants = event?.attendees.map((item) => {
        let userDetail = ContactsDao.getContactFromEmailID(item?.emailId);
        let name;
        if (userDetail) {
          name = userDetail?.fN + ' ' + userDetail?.lN;
        } else {
          name = item?.emailId;
        }
        return {
          emailId: item?.emailId,
          optional: false,
          id: userDetail?.id || '',
          profileIcon: userDetail?.icon || '',
          color: userDetail?.color,
          name,
          self: item?.self || false,
        };
      });
    }
    let attendees = listOfParticipants.map((item) => {
      return {emailId: item.emailId, optional: false};
    });
    this.checkAvailability(attendees);
    //console.log('Attendees', attendees);
    this.setState({
      description: event?.description?.trim(),
      title: event?.title,
      allDay: event?.isAllDay,
      location: event?.location,
      startDate: new Date(start),
      endDate: new Date(end),
      meetRoom: event?.rooms[0],
      attendees,
      guests: listOfParticipants,
      meetingLink: event?.meetJoin?.meetingUrl,
    });
  }

  mergeAttendees(guests, updatedStatus) {
    return guests.map((obj) =>
      merge(
        obj,
        updatedStatus.find((user) => obj.emailId === user.emailId),
      ),
    );
  }

  renderHeader() {
    return (
      <Header
        {...this.props}
        title={'Schedule Meeting'}
        goBack={true}
        rightContent={this.renderSave()}
      />
    );
  }

  renderSave() {
    return (
      <TouchableOpacity
        onPress={() => this.createEvent()}
        style={{padding: 10}}>
        <Text style={{color: '#0D6EFD', fontSize: normalize(17)}}>Save</Text>
      </TouchableOpacity>
    );
  }

  // renderSave() {
  //   const {event} = this.props?.route?.params;
  //   let isPending = event?.eventType === 'pending';
  //   return (
  //     <SafeAreaView
  //       forceInset={{bottom: 'never'}}
  //       style={isPending ? styles.reminderFooter : styles.footer}>
  //       <TouchableOpacity
  //         onPress={() => this.createEvent()}
  //         style={isPending ? styles.pendingView : styles.saveView}>
  //         <Text style={styles.saveText}>Save</Text>
  //       </TouchableOpacity>
  //       {isPending ? (
  //         <TouchableOpacity
  //           onPress={() => this.sendReminder()}
  //           style={styles.reminderView}>
  //           <Text style={styles.reminderText}>Send reminder</Text>
  //         </TouchableOpacity>
  //       ) : null}
  //     </SafeAreaView>
  //   );
  // }

  sendReminder() {
    let payload = {
      mrId: this.props.route.params?.mrIdOrEventId,
    };
    this.props.sendReminder(payload);
  }

  createEvent() {
    const {
      title,
      startDate,
      endDate,
      allDay,
      repeat,
      meetingLink,
      description,
      location,
      meetRoom,
      noteTemplate,
      attendees,
      guests,
      timeZone,
    } = this.state;
    let createMeetPayload = {
      title: title,
      endTime: endDate.getTime(),
      startTime: startDate.getTime(),
      description: description,
      isAllDay: allDay,
      attendees: attendees,
      timeZone: timeZone,
    };
    if (meetRoom?.id) {
      createMeetPayload.rooms = [{id: meetRoom.email}];
    }
    if (location) {
      createMeetPayload.location = location;
    }
    if (meetingLink) {
      console.log('Meeting link', meetingLink);
      let isLink = false;
      if (meetingLink?.startsWith('https')) {
        isLink = true;
      }
      createMeetPayload.onlineMeeting = {
        url: isLink ? meetingLink : '',
        isOnlineMeeting: isLink ? false : true,
      };
    }
    if (!title?.trim() && guests.length) {
      let title =
        this.state.guests[0].name.split(' ')[0] +
        ' , ' +
        UsersDao.getUserName().split(' ')[0];
      createMeetPayload.title = guests.length === 1 ? title : '';
    }
    //if no attendee is selected, send only current user details
    if (!attendees.length) {
      createMeetPayload.attendees = [
        {emailId: UsersDao.getEmailId(), optional: false},
      ];
    }
    //temporarily-to be removed
    if (location) {
      createMeetPayload.location = {displayName: createMeetPayload.location};
    }
    //setting recurrence
    if (repeat !== 'No repeat') {
      createMeetPayload.recurrence = {
        frequency: repeat === 'Week days' ? 'daily' : repeat.toLowerCase(),
        byday:
          repeat === 'Weekly'
            ? [moment(startDate).format('dddd').toLowerCase()]
            : repeat === 'Week days'
            ? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
            : null,
      };
    }
    const {isNewMeeting, event} = this.props?.route?.params;
    const {selectedSlot} = this.state;
    //console.log('Meet payload', JSON.stringify(createMeetPayload));
    if (startDate >= endDate) {
      alertModal.current.openModal('Please enter a valid meeting time');
      //Alert.alert(null, 'Please enter a valid meeting time');
    } else {
      if (event?.eventType === 'pending') {
        createMeetPayload.mId = event?.mrIdOrEventId;
        createMeetPayload.startTime = selectedSlot.start;
        createMeetPayload.endTime = selectedSlot.end;
        this.props.createEvent(createMeetPayload);
      } else if (isNewMeeting) {
        this.props.createEvent(createMeetPayload);
      } else {
        createMeetPayload.eventId = event?.eventId;
        this.props.rescheduleEvent(createMeetPayload);
      }
    }
  }

  renderMemStatus(status) {
    switch (status) {
      case 'busy':
        return 'Unavailable';
      case 'available':
        return 'Available';
      case 'unknown':
        return 'Status unknown';
      case 'accepted':
        return 'Accepted';
      case 'needsAction':
        return 'Awaiting';
      case 'declined':
        return 'Declined';
      case 'tentative':
        return 'Maybe';
    }
  }

  renderStatusColor(status) {
    switch (status) {
      case 'busy':
        return '#DD3646'; //red
      case 'available':
        return '#28A745'; //green
      case 'unknown':
        return '#9AA0A6'; //grey
      case 'accepted':
        return '#28A745';
      case 'needsAction':
        return 'orange';
      case 'declined':
        return '#DD3646';
      case 'tentative':
        return 'grey';
    }
  }

  checkAvailability(members) {
    let emailIds = members.map((u) => u.emailId),
      payload = {
        emailIds,
        endTime: this.state.endDate.getTime(),
        startTime: this.state.startDate.getTime(),
        timeZone: this.state.timeZone,
      };
    this.props.getMemAvailability(payload);
  }

  setMeetTime(type, date) {
    if (this.state.allDay) {
      this.setState({startDate: date, endDate: date});
      this.setTime(!this.state.allDay, date, date);
    } else if (type === 'starting') {
      this.setState({startDate: date});
    } else if (type === 'ending') {
      this.setState({endDate: date});
    }
  }

  addAttendees(guestsList) {
    let guests = [],
      attendees = [];
    guestsList.map((item) => {
      let payloadFormat = {emailId: item.emailId, optional: false};
      let userDetail, name;
      if (item.source === 'profile') {
        userDetail = item;
        name = userDetail?.emailId;
      } else {
        userDetail = item;
        // ContactsDao.getContactFromEmailID(item.emailId);
        name = userDetail?.fN + ' ' + userDetail?.lN;
      }
      let members = {
        emailId: userDetail?.emailId,
        name: name,
        status: item?.status,
        id: userDetail?._id,
        profileIcon: userDetail?.icon,
        color: userDetail?.color,
      };
      let index = this.state.guests.findIndex(
        (t) => t.emailId === item.emailId,
      );
      //console.log('Index', index);
      if (index === -1) {
        guests = guests.concat([members]);
        attendees = attendees.concat([payloadFormat]);
      }
    });

    //console.log('Contact', JSON.stringify(payloadFormat));

    let attendiesTemp = this.state.attendees.concat([...attendees]);
    let guestsTemp = this.state.guests.concat([...guests]);
    this.setState({
      attendees: this.filterUsers(attendiesTemp, guestsList),
      guests: this.filterUsers(guestsTemp, guestsList),
    });
  }

  filterUsers(varAttendiesList, array2) {
    let attendies = [];
    let emailIds = [];
    for (let i = 0; i < varAttendiesList.length; i++) {
      for (let j = 0; j < array2.length; j++) {
        if (varAttendiesList[i].emailId === array2[j].emailId) {
          if (emailIds.indexOf(varAttendiesList[i].emailId) <= -1) {
            attendies.push(varAttendiesList[i]);
            emailIds.push(varAttendiesList[i].emailId);
          }
        }
      }
    }
    return attendies;
  }

  removeAttendees(contact) {
    const index = this.state.guests?.findIndex(
      (a) => a.emailId === contact.emailId,
    );
    let array1 = [...this.state.attendees];
    let array2 = [...this.state.guests];
    if (index >= 0) {
      array1.splice(index, 1);
      array2.splice(index, 1);
    }

    this.setState({
      attendees: array1,
      guests: array2,
    });
  }

  showMoreOptions() {
    let {repeat, allDay, timeZoneValue, timeZone} = this.state;
    return (
      <>
        <TouchableOpacity
          onPress={() => setRepeatMode.current?.openModal(repeat)}
          style={{paddingVertical: 5, marginVertical: 15}}>
          <Text style={styles.dateText}>{repeat}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => addTimeZone?.current.openModal(timeZone)}>
          <Text style={[styles.dateText, {marginVertical: 12}]}>
            {timeZoneValue ? timeZone : '(GMT+5:30) Indian Standard Time'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            this.setState({allDay: !allDay});
            this.setTime(
              this.state.allDay,
              this.state.startDate,
              this.state.endDate,
            );
          }}
          style={styles.allDayView}>
          <View style={styles.checkboxStyle}>
            {allDay ? (
              <View style={styles.selectedUI}>
                <Icon
                  name={'SingleTick'}
                  size={normalize(13)}
                  color={'#fff'}
                  style={styles.checkboxTickImg}
                />
              </View>
            ) : (
              <View style={styles.uncheckedCheckbox} />
            )}
          </View>
          <Text style={styles.dateText}>All Day Event</Text>
        </TouchableOpacity>
      </>
    );
  }

  renderMeetingTime(meetingType) {
    let {startDate, endDate, showMore, repeat, allDay} = this.state;
    let initialDate = getTimeline(startDate, 'meetingInfo');
    let finalDate = getTimeline(endDate, 'meetingInfo');
    let start = getTimeline(startDate, 'time');
    let end = getTimeline(endDate, 'time');
    return (
      <View style={styles.timeMainView}>
        <Icon
          name="Clock"
          size={normalize(23)}
          color="#202124"
          style={styles.clockIcon}
        />
        {meetingType === 'pending' ? (
          <View style={{paddingLeft: 30, paddingTop: 10}}>
            <Text style={styles.selectTextStyle}>
              Select a proposed time slot...
            </Text>
          </View>
        ) : (
          <View style={styles.timeView}>
            <TouchableOpacity
              onPress={() => {
                setMeetTime.current?.openModal('starting', startDate);
              }}
              style={styles.dateTimeView}>
              <Text numberOfLines={1} style={styles.dateText}>
                {initialDate}
              </Text>
              {this.state.allDay ? null : (
                <Text style={styles.timeText}>{start}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setMeetTime.current?.openModal('ending', endDate);
              }}
              style={[styles.dateTimeView, {marginTop: 10}]}>
              <Text numberOfLines={1} style={styles.dateText}>
                {finalDate}
              </Text>
              {this.state.allDay ? null : (
                <Text style={styles.timeText}>{end}</Text>
              )}
            </TouchableOpacity>
            {!showMore ? this.showMoreOptions() : null}
            <TouchableOpacity
              onPress={() => this.setState({showMore: !showMore})}
              style={styles.moreView}>
              <Text style={styles.moreText}>{showMore ? 'More' : 'Less'}</Text>
              <Icon
                name={showMore ? 'DownArrow' : 'UpArrow'}
                size={normalize(20)}
                color="#0D6EFD"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  swipeContent(progress, dragX, contact, isUser) {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [55, 0],
    });

    return !isUser ? (
      <View style={styles.swipeView}>
        <Animated.View
          style={{
            transform: [{translateX: trans}],
            width: 55,
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}>
          <TouchableOpacity
            style={styles.removeGuest}
            onPressIn={() => {
              if (prevOpenedRow) {
                prevOpenedRow.close();
              }
            }}
            onPress={() => {
              this.removeAttendees(contact);
            }}>
            <Icon name={'cross'} size={25} color={'#DD3646'} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    ) : null;
  }

  closeRow(index) {
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow.close();
    }

    if (index !== -1) {
      prevOpenedRow = row[index];
    } else {
      prevOpenedRow = null;
      for (let i = 0; i < row.length; i++) {
        if (row[i]) {
          row[i].close();
        }
      }
    }
  }

  renderItem = ({item, index}) => {
    const {
      self,
      name,
      id,
      organizer,
      status,
      emailId,
      profileIcon,
      color,
    } = item;
    let attendeeName, userDetail, isUser;
    let avatarName = item?.fN || item?.emailId;
    if (!this.props?.route?.params.isNewMeeting) {
      userDetail = ContactsDao.getContactFromEmailID(item.emailId);
    }
    if (self || emailId === UsersDao.getEmailId()) {
      isUser = true;
      attendeeName = 'You';
    } else {
      if (userDetail?.fN) {
        attendeeName = userDetail?.fN + ' ' + userDetail?.lN;
      } else {
        attendeeName = item.emailId;
      }
      isUser = false;
    }
    return (
      <Swipeable
        ref={(ref) => {
          row[index] = ref;
        }}
        renderRightActions={(progress, dragx) =>
          this.swipeContent(progress, dragx, item, isUser)
        }
        friction={2}
        leftThreshold={30}
        rightThreshold={10}
        useNativeAnimations={true}
        overshootLeft={false}
        overshootRight={true}
        // onSwipeableOpen={() => {
        //   this.closeRow(index);
        // }}
      >
        <TouchableOpacity
          key={index}
          style={styles.showGuestView}
          onPressIn={() => this.closeRow(index)}>
          <Avatar
            profileIcon={profileIcon}
            color={color}
            userId={id}
            name={avatarName}
          />
          <View
            style={{
              flexDirection: 'column',
              marginStart: 5,
              padding: 5,
            }}>
            <Text numberOfLines={1} style={styles.nameTextStyle}>
              {attendeeName}
            </Text>
            <Text
              style={{
                fontSize: normalize(14),
                fontWeight: '400',
                color: status ? this.renderStatusColor(status) : 'grey',
              }}>
              {status
                ? this.renderMemStatus(status)
                : 'Checking availability...'}
            </Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  renderGuests(guests) {
    return (
      <View style={{marginBottom: 5, marginLeft: -5}}>
        <FlatList
          data={guests}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => index}
        />
      </View>
    );
  }

  displayGuests() {
    const {showContactList, attendees, guests} = this.state;
    return (
      <View style={styles.guestMainView}>
        <Icon name="Share" size={normalize(22)} color="#202124" />
        <View style={{marginLeft: 21.5, marginRight: 20}}>
          <Text style={styles.dateText}>Guests</Text>
          <TouchableOpacity
            style={styles.textInputStyle}
            onPress={() => {
              this.props.getRecentContactList();
              addGuest?.current?.openModal();
            }}>
            <Text style={{fontSize: normalize(16), color: '#BDC1C6'}}>
              Type and enter a name to add
            </Text>
          </TouchableOpacity>

          {this.renderGuests(guests)}
        </View>
      </View>
    );
  }

  renderAddModal(type) {}

  renderDefaultAdd(text, type) {
    return (
      <TouchableOpacity
        onPress={() => this.renderAddModal(type)}
        style={styles.addView}>
        <Text style={styles.addText}>{text}</Text>
      </TouchableOpacity>
    );
  }

  renderMeetingLink() {
    const {meetingLink} = this.state;
    return (
      <View style={styles.addMainView}>
        <Icon name="link" size={normalize(22)} color="#202124" />
        <TouchableOpacity
          onPress={() => {
            meetingLink?.startsWith('http')
              ? addLink.current?.openModal(this.state.meetingLink)
              : addLink.current?.openModal();
          }}
          style={styles.addView}>
          {meetingLink ? (
            <Text style={styles.meetingText}>{meetingLink}</Text>
          ) : (
            <Text style={styles.addText}>Add meeting Link</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  renderDescription() {
    let {description, descInputFocused} = this.state;
    return (
      <View
        style={{
          flexDirection: 'row',
          marginVertical: 10,
        }}>
        <Icon
          name="ViewDetails"
          size={normalize(22)}
          color="#202124"
          style={{marginTop: 12}}
        />
        <View
          style={[
            styles.textInputBox,
            {borderWidth: descInputFocused ? 1 : 0},
          ]}>
          <TextInput
            multiline={true}
            onFocus={() => this.setState({descInputFocused: true})}
            onBlur={() => this.setState({descInputFocused: false})}
            onChangeText={(description) => this.setState({description})}
            value={description}
            style={{fontSize: normalize(16), color: '#202124'}}
            placeholder="Add a description"
            placeholderTextColor="#9AA0A6"
          />
        </View>
      </View>
    );
  }

  renderMeetingRoom() {
    const {meetRoom} = this.state;
    return (
      <View style={styles.addMainView}>
        <Icon name="Company" size={normalize(22)} color="#202124" />
        <TouchableOpacity
          onPress={() => {
            this.props.getRoomList('');
            addRoom.current?.openModal();
          }}
          style={styles.addView}>
          {meetRoom?.name ? (
            <Text style={styles.meetingText}>{meetRoom?.name}</Text>
          ) : (
            <Text style={styles.addText}>Add a room</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  renderMeetingLocation() {
    const {location, coordinates} = this.state;
    return (
      <View style={styles.addMainView}>
        <Icon name="location" size={normalize(22)} color="#202124" />
        <TouchableOpacity
          onPress={() => addLocation.current?.openModal(coordinates)}
          style={styles.addView}>
          {location ? (
            <Text style={styles.meetingText}>{location}</Text>
          ) : (
            <Text style={styles.addText}>Add location</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  displayAddOptions() {
    let {location, meetRoom, noteTemplate} = this.state;
    const {shift} = this.state;
    return (
      <>
        {this.renderMeetingLink()}
        <Animated.View
          style={[styles.container2, {transform: [{translateY: shift}]}]}>
          {this.renderDescription()}
        </Animated.View>
        {this.renderMeetingLocation()}
        {this.renderMeetingRoom()}
        <View style={styles.addMainView}>
          <Icon name="Notes" size={normalize(22)} color="#202124" />
          {noteTemplate
            ? null
            : this.renderDefaultAdd(
                'Select a meeting note template',
                'template',
              )}
        </View>
      </>
    );
  }

  render() {
    // console.log('events', this.props.allEvents?.length);
    const {shift} = this.state;
    const {event} = this.props?.route?.params;
    return (
      <View style={styles.container}>
        <EventAlert ref={alertModal} />
        <DateTimePicker
          ref={setMeetTime}
          isAllDay={this.state.allDay}
          setMinimumDate={this.props?.route?.params?.isNewMeeting}
          setDateTime={(type, date) => this.setMeetTime(type, date)}
        />
        <RepeatModal
          ref={setRepeatMode}
          setRepeat={(repeat) => this.setState({repeat})}
        />
        <MeetLink
          ref={addLink}
          setLink={(meetingLink) => this.setState({meetingLink})}
        />
        <MeetRoom
          ref={addRoom}
          roomsList={this.props.roomsList}
          getRoomList={(searchRoom) => this.props.getRoomList(searchRoom)}
          setRoom={(meetRoom) => this.setState({meetRoom})}
        />
        <MeetLocation
          ref={addLocation}
          setLocation={(location, coordinates) => {
            this.setState({location, coordinates});
          }}
        />
        <MeetTimeZone
          ref={addTimeZone}
          setTimeZone={(timeZone, timeZoneValue) => {
            this.setState({timeZone, timeZoneValue});
          }}
        />
        <AddGuest
          ref={addGuest}
          setTagsSelected={(contacts) => {
            if (contacts.length === 0) {
              this.setState({guests: [], attendees: []});
            } else {
              this.checkAvailability(contacts);
              this.addAttendees(contacts);
            }
            //this.setState({guests: contacts});
          }}
          tagsSelected={this.state.guests}
          data={
            this.state.searchGuestName === ''
              ? this.props.recentData
              : this.props.contactlistData
          }
          contactListData={(guestName) => {
            this.props.getAttendeeContact(guestName);
            //this.props.getContactList(guestName);
          }}
          setSearchGuest={(guestName) =>
            this.setState({searchGuestName: guestName})
          }
        />
        {this.renderHeader()}
        <KeyboardAvoidingView
          style={{flex: 1}}
          enabled={true}
          keyboardVerticalOffset={-30}
          behavior={isIOS ? 'padding' : null}>
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            scrollEnabled={this.state.enableScrollViewScroll}
            ref={(ref) => {
              this.scrollView = ref;
            }}
            onContentSizeChange={(w, h) => {
              if (this.state.descInputFocused) {
                this.scrollView.scrollTo({animated: true, x: 0, y: h - 600});
              }
            }}
            style={{marginBottom: 15}}>
            {this.state.canEdit ? (
              <TextInput
                ref={titleInput}
                value={this.state.title}
                placeholder="Enter meeting title"
                style={styles.titleInputStyle}
                onChangeText={(title) => this.setState({title})}
              />
            ) : (
              <View style={styles.section1}>
                <View
                  style={{
                    marginTop: 4,
                    marginRight: 28,
                    width: 18,
                    height: 18,
                    backgroundColor: '#288CFA',
                    borderRadius: 2,
                  }}
                />
                <Text
                  numberOfLines={2}
                  style={{
                    marginRight: 20,
                    fontWeight: '500',
                    color: '#202124',
                    fontSize: normalize(18),
                  }}>
                  {this.state.title}
                </Text>
              </View>
            )}
            {this.state.canEdit
              ? this.renderMeetingTime(event?.eventType)
              : null}
            {event?.eventType === 'pending' ? (
              <View
                style={{
                  marginHorizontal: 25,
                  marginTop: 10,
                }}>
                {Object.values(event?.placeHolderEvent?.slots).map(
                  (item, index) => {
                    let marked = this.state.selectedSlot === item;
                    let timeSlot = getTimeline(
                      moment(item?.start),
                      'meetingInfo',
                    );
                    timeSlot = timeSlot.slice(0, 7);
                    const start = getTimeline(moment(item?.start), 'time');
                    const end = getTimeline(moment(item?.end), 'time');
                    timeSlot = timeSlot + ' ' + start + ' - ' + end;
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() =>
                          marked
                            ? this.setState({selectedSlot: ''})
                            : this.setState({selectedSlot: item})
                        }
                        style={{
                          backgroundColor: marked ? '#E6F1FF' : '#F8F9FA',
                          marginVertical: 5,
                          padding: 10,
                          borderWidth: 1,
                          borderColor: marked ? '#0D6EFD' : '#E4E5E7',
                          borderRadius: 4,
                        }}>
                        <Text
                          style={{
                            fontSize: normalize(16),
                            color: marked ? '#0D6EFD' : '#5F6368',
                          }}>
                          {timeSlot}
                        </Text>
                      </TouchableOpacity>
                    );
                  },
                )}
              </View>
            ) : null}
            {this.displayGuests()}
            {this.state.canEdit ? (
              <View
                style={{
                  marginLeft: 33,
                  marginTop: -10,
                }}>
                {this.displayAddOptions()}
              </View>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
        {/* {event?.eventType === 'pending' && this.state.selectedSlot === ''
          ? null
          : this.renderSave()} */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  swipeView: {
    left: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  removeGuest: {
    top: 4,
    backgroundColor: '#FCEAED',
    width: 40,
    height: 40,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container2: {
    flex: 1,
    backgroundColor: '#fff',
  },
  timeText: {
    marginRight: 10,
    fontSize: normalize(16),
    color: '#202124',
  },
  titleInputStyle: {
    width: width - 50,
    margin: 25,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#9AA0A6',
    fontSize: normalize(16),
    borderRadius: 4,
    padding: 10,
  },
  textInputStyle: {
    marginLeft: -10,
    width: width - 100,
    marginTop: 15,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E4E5E7',
    fontSize: normalize(16),
    borderRadius: 4,
    padding: 10,
  },
  selectTextStyle: {
    marginLeft: -10,
    fontSize: normalize(16),
    color: '#9AA0A6',
  },
  dateText: {
    flex: 1,
    fontSize: normalize(16),
    color: '#202124',
  },
  footer: {
    marginHorizontal: 5,
  },
  alertTitleStyle: {
    fontSize: normalize(16),
    color: '#202124',
  },
  reminderFooter: {
    //marginHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  reminderView: {
    justifyContent: 'flex-end',
    alignContent: 'flex-end',
    borderRadius: 4,
    margin: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BDC1C6',
    width: '45%',
  },
  reminderText: {
    color: '#202124',
    fontSize: normalize(14),
    textAlign: 'center',
  },
  checkboxStyle: {
    height: 18,
    width: 18,
    marginRight: 10,
  },
  uncheckedCheckbox: {
    borderRadius: 2,
    flex: 1,
    backgroundColor: '#fff',
    borderColor: '#BDC1C6',
    borderWidth: 1,
  },
  selectedUI: {
    borderRadius: 2,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D6EFD',
  },
  checkboxTickImg: {
    width: '85%',
    height: '85%',
    tintColor: '#ffffff',
    resizeMode: 'contain',
  },
  timeMainView: {marginLeft: 31.6, flexDirection: 'row'},
  clockIcon: {paddingVertical: 8},
  timeView: {flex: 1, marginHorizontal: 21.5},
  dateTimeView: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    alignContent: 'center',
  },
  allDayView: {
    paddingVertical: 5,
    marginVertical: 18,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreText: {
    color: '#0D6EFD',
    fontSize: normalize(16),
    paddingRight: 8.75,
  },
  moreView: {
    flexDirection: 'row',
    marginTop: 10,
    paddingVertical: 10,
  },
  addText: {fontSize: normalize(16), color: '#9AA0A6'},
  addView: {marginLeft: 18, padding: 5, flex: 1},
  addMainView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  characterTextStyle: {
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    color: '#FFFFFF',
  },
  nameTextStyle: {
    color: '#202124',
    fontSize: normalize(16),
    fontStyle: 'normal',
    marginBottom: 3,
  },
  guestMainView: {
    marginLeft: 31.5,
    flexDirection: 'row',
    margin: 20,
    marginBottom: 0,
  },
  showGuestView: {
    paddingBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    width: '80%',
  },
  saveView: {
    justifyContent: 'flex-end',
    alignContent: 'flex-end',
    backgroundColor: '#0D6EFD',
    borderRadius: 4,
    margin: 10,
    padding: 14,
  },
  pendingView: {
    justifyContent: 'flex-end',
    alignContent: 'flex-end',
    backgroundColor: '#0D6EFD',
    borderRadius: 4,
    margin: 10,
    padding: 14,
    width: '45%',
  },
  saveText: {
    color: '#ffffff',
    fontSize: normalize(17),
    textAlign: 'center',
  },
  meetingText: {
    fontSize: normalize(16),
    color: '#202124',
  },
  textInputBox: {
    flex: 1,
    marginLeft: 12,
    marginRight: 20,
    borderColor: '#E4E5E7',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingBottom: 8,
    paddingTop: 7,
  },
  section1: {
    marginHorizontal: 34,
    marginTop: 25,
    marginBottom: 5,
    flexDirection: 'row',
  },
});

const mapStateToProps = (state) => {
  const {meetingsReducer, createMessage} = state;
  return {
    allEvents: meetingsReducer.meetEvents?.events,
    memberStatus: meetingsReducer.memberStatus,
    roomsList: meetingsReducer.roomsList,
    newEvent: meetingsReducer.newEvent,
    eventCreated: meetingsReducer.calendars,
    edited: meetingsReducer.edited,
    editedEvent: meetingsReducer.editedEvent,
    sentReminder: meetingsReducer.sentReminder,
    contactlistData: meetingsReducer.contactList,
    recentData: createMessage.recentData,
  };
};

export default connect(mapStateToProps, {
  getMemAvailability,
  createEvent,
  getAttendeeContact,
  getRoomList,
  rescheduleEvent,
  sendReminder,
  getRecentContactList,
  //getContactList,
})(ScheduleMeeting);
