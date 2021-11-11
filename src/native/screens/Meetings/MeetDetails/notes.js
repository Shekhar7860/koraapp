import React from 'react';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import moment from 'moment';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ViewStyle,
  Linking,
  ScrollView,
} from 'react-native';
import {Icon} from '../../../components/Icon/Icon.js';
import {getTimeline, normalize} from '../../../utils/helpers';
import EventCalendar from '../../../components/Library/react-native-events-calendar/src/EventCalendar';
import {getAllEvents} from '../../../../shared/redux/actions/meetings.action';
import * as UsersDao from '../../../../dao/UsersDao';
import {BottomUpModal} from '../../../components/BottomUpModal';
const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

class NotesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {event: '', meetingInfo: true};
  }

  openModal(event) {
    this.setState({event});
    this.details.openBottomDrawer();
  }

  header(event) {
    const {title, attendees} = event;
    return (
      <View style={styles.headerView}>
        <View style={styles.titleView}>
          <Text numberOfLines={2} style={styles.header}>
            {title || '(No title)'}
          </Text>
        </View>
        <View style={styles.participantsView}>
          {/* {attendees.map((participant) => {
            return (
              <Avatar
                name={participant.fN + ' ' + participant.lN}
                rad={20}
                type={'offline'}
              />
            );
          })} */}
          <Text>Participants</Text>

          <TouchableOpacity onPress={() => {}} style={styles.moreIcon}>
            <Icon name="options" size={normalize(16)} color="#202124" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderParticipants(attendees) {
    return (
      <View>
        <View style={styles.padding}>
          <Text style={styles.participantHeader}>Participants List</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            paddingLeft: 52,
            padding: 30,
            paddingBottom: 18,
            borderBottomColor: '#E4E5E7',
            borderBottomWidth: 1,
          }}>
          <Text style={[styles.columnHeader, {flex: 1}]}>ATTENDEE</Text>
          <Text style={[styles.columnHeader, {justifyContent: 'flex-end'}]}>
            PRESENCE
          </Text>
        </View>
      </View>
    );
  }

  meetingInfo(event) {
    const {where, duration, description} = event;
    let meet = getTimeline(moment(duration?.start), 'meetingInfo');
    let startTime = new Date(moment(duration?.start)).getHours();
    let endTime = new Date(moment(duration?.end)).getHours();
    var ampm = endTime >= 12 ? 'PM' : 'AM';
    startTime = startTime % 12;
    startTime = startTime ? startTime : 12;
    endTime = endTime % 12;
    endTime = endTime ? endTime : 12;
    meet = meet + startTime + ' - ' + endTime + ' ' + ampm;
    //console.log('Time', meet);
    return (
      <View style={styles.padding}>
        <View style={{marginTop: 10}}>
          <Text style={styles.infoTitles}>Meeting Time</Text>
          <Text style={styles.infoValues}>{meet}</Text>
        </View>
        {where ? (
          <View style={styles.margin}>
            <Text style={styles.infoTitles}>Meeting Link</Text>
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(where);
              }}>
              <Text style={styles.link}>{where}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        <View style={styles.margin}>
          <Text style={styles.infoTitles}>Meeting Room</Text>
          <Text style={styles.infoValues}>{}</Text>
        </View>
        <View style={styles.margin}>
          <Text style={styles.infoTitles}>Meeting description</Text>
          <Text style={[styles.infoValues, {fontWeight: '400'}]}>
            {description}
          </Text>
        </View>
      </View>
    );
  }

  content(event) {
    return (
      <ScrollView style={{flex: 1}}>
        <TouchableOpacity
          onPress={() => {
            this.setState({meetingInfo: !this.state.meetingInfo});
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
          }}>
          {this.state.meetingInfo ? (
            <Icon
              name="Dropdown_Down"
              size={normalize(16)}
              color="#202124"
              style={{margin: 12}}
            />
          ) : (
            <Icon
              name="Dropdown_Up"
              size={normalize(16)}
              color="#202124"
              style={{margin: 10}}
            />
          )}
          <Text
            style={{
              fontWeight: '600',
              fontSize: normalize(20.4615),
              color: '#292929',
            }}>
            Meeting Info
          </Text>
        </TouchableOpacity>
        {this.state.meetingInfo ? this.meetingInfo(event) : null}
        {this.renderParticipants(event?.attendees)}
      </ScrollView>
    );
  }

  render() {
    const {event} = this.state;
    return (
      <BottomUpModal
        ref={(ref) => {
          this.details = ref;
        }}
        height={700}>
        {this.header(event)}
        {this.content(event)}
      </BottomUpModal>
    );
  }
}
const styles = StyleSheet.create({
  header: {
    fontWeight: 'bold',
    fontSize: normalize(16),
    color: '#202124',
  },
  headerView: {
    paddingLeft: 20,
    paddingTop: 18,
    paddingBottom: 10,
    paddingRight: 5,
    flexDirection: 'row',
    borderBottomColor: '#E4E5E7',
    borderBottomWidth: 1,
  },
  titleView: {flex: 1, justifyContent: 'center'},
  participantsView: {
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreIcon: {
    justifyContent: 'flex-end',
    padding: 10,
    marginLeft: 20,
  },
  infoTitles: {
    fontWeight: '400',
    fontSize: normalize(14),
    color: '#202124',
  },
  infoValues: {
    fontWeight: '500',
    fontSize: normalize(14),
    color: '#9AA0A6',
    marginTop: 10,
  },
  link: {
    fontSize: normalize(14),
    marginTop: 10,
    color: '#0D6EFD',
    textDecorationLine: 'underline',
    fontWeight: '400',
  },
  participantHeader: {
    fontSize: normalize(18),
    marginTop: 30,
    color: '#292929',
    fontWeight: '600',
  },
  columnHeader: {
    fontSize: normalize(10),
    color: '#5F6368',
    fontWeight: '500',
    letterSpacing: 1,
  },
  margin: {marginTop: 20},
  padding: {paddingLeft: 52},
});

export default NotesList;
