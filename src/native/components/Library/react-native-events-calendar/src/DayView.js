// @flow
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import populateEvents from './Packer';
import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import {Icon} from '../../../../components/Icon/Icon.js';
import {getTimeline, normalize} from '../../../../utils/helpers';
import * as UsersDao from '../../../../../dao/UsersDao';
// import Gradient from 'react-native-css-gradient';
//import {LinearGradient} from 'expo-linear-gradient';
const LEFT_MARGIN = 60 - 1;
// const RIGHT_MARGIN = 10
const CALENDER_HEIGHT = 2400;
// const EVENT_TITLE_HEIGHT = 15
const TEXT_LINE_HEIGHT = 24.5;
// const MIN_EVENT_TITLE_WIDTH = 20
// const EVENT_PADDING_LEFT = 4
const offset = CALENDER_HEIGHT / 24;
const timeNowHour = moment().hour();
const timeNowMin = moment().minutes();
function range(from, to) {
  return Array.from(Array(to), (_, i) => from + i);
}

export default class DayView extends React.PureComponent {
  constructor(props) {
    super(props);
    const width = props.width - LEFT_MARGIN;

    let presentTime = offset * timeNowHour + (offset * timeNowMin) / 60;
    const packedEvents = populateEvents(props.events, width);
    var found = packedEvents.find(function (element) {
      return element.top >= presentTime;
    });
    let initPosition;
    if (found) {
      initPosition = found.top - CALENDER_HEIGHT / 24;
    } else {
      initPosition = presentTime - CALENDER_HEIGHT / 24;
    }
    initPosition = initPosition < 0 ? 0 : initPosition;
    this.state = {
      _scrollY: initPosition,
      packedEvents,
    };
  }

  componentDidUpdate(prevProps, prevState, nextProps) {
    let presentTime = offset * timeNowHour + (offset * timeNowMin) / 60;
    if (prevProps.events !== this.props.events) {
      const width = this.props.width - LEFT_MARGIN;
      this.setState({
        packedEvents: populateEvents(this.props.events, width),
      });

      setTimeout(() => {
        var found = this.state.packedEvents.find(function (element) {
          return element.top >= presentTime;
        });
        let initPosition;
        //console.log('Found', found);
        if (found) {
          initPosition = found.top - CALENDER_HEIGHT / 24;
        } else {
          initPosition = presentTime - CALENDER_HEIGHT / 24;
        }
        if (initPosition) {
          initPosition = initPosition < 0 ? 0 : initPosition;
          //console.log('Initial position', initPosition);
          this.setState({
            _scrollY: initPosition,
          });
          this.props.scrollToFirst && this.scrollToFirst();
        }
      }, 200);
    }
  }

  // UNSAFE_componentWillReceiveProps(nextProps, prevProps) {}

  componentDidMount() {
    this.props.scrollToFirst && this.scrollToFirst();
  }

  scrollToFirst() {
    setTimeout(() => {
      if (this.state && this.state._scrollY && this._scrollView) {
        this._scrollView.scrollTo({
          x: 0,
          y: this.state._scrollY,
          animated: true,
        });
      }
    }, 1);
  }

  _renderRedLine() {
    const {format24h} = this.props;
    const {width, styles} = this.props;
    let currentHour = timeNowHour > 12 ? timeNowHour - 12 : timeNowHour,
      currentMinute = timeNowMin;
    if (currentMinute < 10) {
      currentMinute = '0' + currentMinute;
    }
    return [
      <View
        key={`timeNow`}
        style={[
          styles.lineNow,
          {
            top: offset * timeNowHour + (offset * timeNowMin) / 60,
            width: width - 10,
          },
        ]}
      />,
      <View
        style={[
          styles.rectangleIndicator,
          {top: offset * timeNowHour + (offset * timeNowMin) / 60 - 9.5},
        ]}>
        <Text
          style={{
            fontSize: normalize(10),
            fontWeight: '500',
            color: '#ffffff',
            marginStart: 6,
          }}>
          {currentHour + ':' + currentMinute}
        </Text>
      </View>,
      <View
        style={[
          styles.arrowIndicator,
          {top: offset * timeNowHour + (offset * timeNowMin) / 60 - 29},
        ]}
      />,
    ];
  }

  _renderLines() {
    const {format24h} = this.props;

    return range(0, 25).map((item, i) => {
      let timeText;
      if (i === 0) {
        timeText = ``;
      } else if (i < 12) {
        timeText = !format24h ? `${i} AM` : i;
      } else if (i === 12) {
        timeText = !format24h ? `${i} PM` : i;
      } else if (i === 24) {
        timeText = !format24h ? `12 AM` : 0;
      } else {
        timeText = !format24h ? `${i - 12} PM` : i;
      }
      const {width, styles} = this.props;
      return [
        <Text
          key={`timeLabel${i}`}
          style={[styles.timeLabel, {top: offset * i - 6}]}>
          {timeText}
        </Text>,
        i === 0 ? null : (
          <View
            key={`line${i}`}
            style={[styles.line, {top: offset * i - 10, width: width - 20}]}
          />
        ),
        <View
          key={`lineHalf${i}`}
          style={[
            styles.halfLine,
            {top: offset * (i + 0.5) - 10, width: width - 20},
          ]}
        />,
      ];
    });
  }

  _renderTimeLabels() {
    const {styles} = this.props;
    return range(0, 24).map((item, i) => {
      return (
        <View key={`line${i}`} style={[styles.line, {top: offset * i - 10}]} />
      );
    });
  }

  _onEventTapped(event) {
    this.props.eventTapped(event);
  }

  titleAndSummary(eventType, status, event, type) {
    const {attendees} = event;
    const {styles} = this.props;
    let eventStyle;
    if (type === 'title') {
      eventStyle = styles.eventTitle;
    } else {
      eventStyle = styles.eventSummary;
    }
    //return [styles.eventTitle, {color: '#0D6EFD'}];
    if (eventType === 'pending') {
      return [eventStyle, {color: '#5F6368'}];
    }
    if (status === 'accepted') {
      return [eventStyle, styles.whiteText];
    } else if (status === 'declined') {
      return [eventStyle, styles.declinedText];
    } else if (status === 'tentative') {
      return [eventStyle, styles.blueText];
    } else if (status === 'needsAction') {
      return [eventStyle, styles.blueText];
    }
    return [eventStyle, styles.whiteText];
  }

  eventStyles(eventType, status, event) {
    const {attendees, color} = event;
    const style = {
      left: event.left,
      height: event.height,
      width: event.width,
      top: event.top - 10,
    };
    const {styles} = this.props;
    if (eventType === 'pending') {
      return [
        styles.event,
        style,
        {backgroundColor: '#EFF0F1', borderColor: '#5F6368'},
      ];
    }

    if (status === 'accepted') {
      return [styles.event, style, styles.acceptedEvent];
    } else if (status === 'declined') {
      return [styles.event, style, styles.declinedEvent];
    } else if (status === 'tentative') {
      return [styles.event, style, styles.tentativeEvent];
    } else if (status === 'needsAction') {
      return [styles.event, style, styles.notResponded];
    }
    return [styles.event, style, styles.acceptedEvent];
  }

  _renderVerticalLine() {
    return (
      <View style={{position: 'absolute'}}>
        {range(0, 50).map((item, i) => {
          const {width, styles} = this.props;
          return [
            <View
              style={{
                height: 49,
                borderLeftWidth: 2,
                borderColor: '#E4E5E7',
                left: 57,
              }}
            />,
          ];
        })}
      </View>
    );
  }

  _renderEvents() {
    const {styles} = this.props;
    const {packedEvents} = this.state;
    let events = packedEvents.map((event, i) => {
      const style = {
        left: event.left,
        height: event.height,
        width: event.width,
        top: event.top,
      };
      let location = '';
      let selfDetails;
      let icon = '';
      const {isOnlineMeeting, where, attendees, eventType} = event;
      selfDetails = attendees.find((participants) => {
        return participants.emailId === UsersDao.getEmailId();
      });
      if (isOnlineMeeting) {
        const {meetingUrl} = event?.meetJoin;
        location = meetingUrl;
        icon = 'link';
      } else if (where) {
        location = event?.where;
        icon = 'Location';
      }
      // Fixing the number of lines for the event title makes this calculation easier.
      // However it would make sense to overflow the title to a new line if needed
      const numberOfLines = Math.floor(event.height / TEXT_LINE_HEIGHT);
      const formatTime = this.props.format24h ? 'HH:mm' : 'hh:mm A';
      return (
        <TouchableOpacity
          key={i}
          activeOpacity={0.5}
          onPress={() => this._onEventTapped(this.props.events[event.index])}
          style={this.eventStyles(eventType, selfDetails?.status, event)}>
          {this.props.renderEvent ? (
            this.props.renderEvent(event)
          ) : (
            <View style={{margin: 5}}>
              <View style={{flexDirection: 'row'}}>
                {eventType === 'pending' ? (
                  <Icon
                    name={'Publish'}
                    size={normalize(18)}
                    color="#5F6368"
                    style={{marginRight: 6}}
                  />
                ) : null}
                <Text
                  numberOfLines={2}
                  style={this.titleAndSummary(
                    eventType,
                    selfDetails?.status,
                    event,
                    'title',
                  )}>
                  {event.title || '(No title)'}
                </Text>
              </View>
              {/* {numberOfLines > 1 ? (
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 3,
                  }}> */}
              {/* {icon ? (
                    <Icon
                      name={icon}
                      size={normalize(14)}
                      color={'#ffffff'}
                      style={{paddingTop: 2}}
                    />
                  ) : null} */}
              {/* {location ? (
                    <Text
                      numberOfLines={numberOfLines - 1}
                      style={this.titleAndSummary(
                        eventType,
                        selfDetails?.status,
                        event,
                        'summary',
                      )}>
                      {location}
                    </Text>
                  ) : null}
                </View>
              ) : null} */}
            </View>
          )}
        </TouchableOpacity>
      );
    });

    return (
      <View>
        <View style={{marginLeft: LEFT_MARGIN}}>{events}</View>
      </View>
    );
  }

  render() {
    const {styles} = this.props;
    return (
      <ScrollView
        bounces={false}
        ref={(ref) => (this._scrollView = ref)}
        contentContainerStyle={[
          styles.contentStyle,
          {width: this.props.width},
        ]}>
        {this._renderLines()}
        {this._renderEvents()}
        {this._renderVerticalLine()}
        {this._renderRedLine()}
      </ScrollView>
    );
  }
}
