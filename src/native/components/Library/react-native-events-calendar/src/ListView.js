import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import populateEvents from './Packer';
import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import {Icon} from '../../../Icon/Icon.js';
import {connect} from 'react-redux';
import {Loader} from '../../../../screens/ChatsThreadScreen/ChatLoadingComponent';
import {normalize} from 'react-native-elements';
const LEFT_MARGIN = 60 - 1;
const CALENDER_HEIGHT = 2400;
const TEXT_LINE_HEIGHT = 17;
//const width = props.width - LEFT_MARGIN;
class ListView extends React.PureComponent {
  constructor(props) {
    super(props);
    //filter events by unique Id's for pending events
    let events = props.events;
    events = _.uniqBy(events, 'mrIdOrEventId');
    const packedEvents = populateEvents(events);
    this.state = {
      loading: true,
      packedEvents,
    };
  }

  compoenetDidMount() {
    console.log('Mounted');
  }
  componentDidUpdate(prevProps) {
    if (prevProps.events !== this.props.events) {
      const width = this.props.width - LEFT_MARGIN;
      let events = this.props.events;
      events = _.uniqBy(events, 'mrIdOrEventId');
      this.setState({
        packedEvents: populateEvents(events),
        loading: false,
      });
    }
  }

  _onEventTapped(event) {
    this.props.eventTapped(event);
  }
  eventBar(eventType, status, event) {
    const {styles} = this.props;
    const {attendees, color} = event;
    if (eventType === 'pending') {
      return [
        {
          width: 7,
          marginRight: 10,
          borderColor: '#5F6368',
          borderWidth: 1,
          backgroundColor: 'transparent',
        },
      ];
    }
    if (status === 'declined' || status === 'needsAction') {
      return [styles.eventBar, {backgroundColor: '#D7ECFF'}];
    }
    return [styles.eventBar];
  }

  eventTextStyle(status, event) {
    const {styles} = this.props;
    if (status === 'declined') {
      return [
        styles.listEventTitle,
        {
          textDecorationLine: 'line-through',
          textDecorationStyle: 'solid',
          color: '#9AA0A6',
        },
      ];
    }
    return [styles.listEventTitle];
  }

  renderSlot(start, end, color) {
    const {styles} = this.props;
    const formatTime = this.props.format24h ? 'HH:mm' : 'hh:mm A';
    return (
      <>
        <Icon name={'Clock'} size={18} color={color} />
        <Text style={[styles.eventText, {color: color}]} numberOfLines={1}>
          {moment(start).format(formatTime)} - {moment(end).format(formatTime)}
        </Text>
      </>
    );
  }

  renderTasks() {
    const {tasks, styles} = this.props;
    tasks.map((item) => {
      console.log('Tasks', item);
      return (
        <TouchableOpacity style={styles.taskMainView}>
          <Text style={styles.taskText}>{item?.title}</Text>
        </TouchableOpacity>
      );
    });
  }

  renderEvents() {
    const {styles} = this.props;
    const {packedEvents} = this.state;
    let events = packedEvents.map((event, i) => {
      const numberOfLines = Math.floor(event.height / TEXT_LINE_HEIGHT);
      let location = '';
      let icon = '';
      let color = '#5F6368';
      let selfDetails;
      const {isOnlineMeeting, where, attendees, eventType} = event;
      selfDetails = attendees.find((participants) => {
        return participants.self === true;
      });
      if (selfDetails?.status === 'declined') {
        color = '#9AA0A6';
      }
      if (isOnlineMeeting) {
        const {meetingUrl} = event?.meetJoin;
        location = meetingUrl;
        icon = 'link';
      } else if (where) {
        location = event?.where;
        icon = 'Location';
      }
      if (location.length > 38) {
        location = location.substring(0, 36) + '...';
      }
      const formatTime = this.props.format24h ? 'HH:mm' : 'hh:mm A';
      return (
        <View
          key={i}
          style={
            eventType !== 'pending' ? styles.listViewEvent : styles.pendingEvent
          }>
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.eventStyle}
            onPress={() => this._onEventTapped(this.props.events[event.index])}>
            <View
              style={this.eventBar(eventType, selfDetails?.status, event)}
            />
            <View>
              <View style={{flexDirection: 'row'}}>
                {eventType === 'pending' ? (
                  <Icon
                    name={'Publish'}
                    size={18}
                    color={color}
                    style={{marginRight: 6}}
                  />
                ) : null}
                <Text
                  numberOfLines={1}
                  style={this.eventTextStyle(selfDetails?.status)}>
                  {event.title || '(No title)'}
                </Text>
              </View>
              {eventType === 'pending' ? (
                <View>
                  {Object.values(event?.placeHolderEvent?.slots).map(
                    (item, index) => {
                      return (
                        <View style={styles.timeView} key={index}>
                          {this.renderSlot(item.start, item.end, color)}
                        </View>
                      );
                    },
                  )}
                </View>
              ) : (
                <View style={styles.timeView}>
                  {this.renderSlot(
                    event?.duration?.start,
                    event?.duration?.end,
                    color,
                  )}
                </View>
              )}
              {location != '' ? (
                <View style={styles.locationView}>
                  {icon ? <Icon name={icon} size={18} color={color} /> : null}

                  <Text
                    numberOfLines={1}
                    style={[styles.eventText, {color: color}]}>
                    {location}
                  </Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        </View>
      );
    });

    let tasks = this.props?.tasks?.map((task, i) => {
      return (
        <TouchableOpacity
          style={styles.taskMainView}
          onPress={() => Alert.alert('Viewing task is not yet enabled')}>
          <View style={styles.taskBar} />
          <View style={{flexDirection: 'column'}}>
            <View style={styles.taskView2}>
              <View style={{marginRight: 5}}>
                <Icon name={'Tasks'} size={18} color={'#202124'} />
              </View>
              <Text style={styles.taskText}>{task?.title}</Text>
            </View>
            <View style={styles.taskView2}>
              <Icon
                name={'Clock'}
                size={18}
                color={'#5F6368'}
                style={{marginRight: 5}}
              />
              <Text
                style={{
                  color: '#5F6368',
                  fontSize: normalize(14),
                  fontWeight: '500',
                }}>
                Today
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    });

    return (
      <View>
        <View style={styles.mainListView}>
          {events}
          {tasks}
        </View>
      </View>
    );
  }

  render() {
    const {styles} = this.props;
    return (
      <ScrollView
        ref={(ref) => (this._scrollView = ref)}
        //style={{width:this.props.width,flex:1}}
        contentContainerStyle={[
          styles.listContentStyle,
          {width: this.props.width},
        ]}>
        {!this.props.showLoader ? (
          this.renderEvents()
        ) : (
          <View
            style={{
              justifyContent: 'center',
              padding: 20,
            }}>
            <Loader />
          </View>
        )}
      </ScrollView>
    );
  }
}

const mapStateToProps = (state) => {
  const {home} = state;
  return {
    showLoader: home.showLoader,
  };
};

export default connect(mapStateToProps, null)(ListView);
