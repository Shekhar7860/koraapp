// @flow
import {
  VirtualizedList,
  View,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import _ from 'lodash';
import {connect} from 'react-redux';
import moment from 'moment';
import React from 'react';
import {getTimeline, normalize} from '../../../../utils/helpers';
import styleConstructor from './style';
import * as UsersDao from '../../../../../dao/UsersDao';
import {emptyArray} from '../../../../../shared/redux/constants/common.constants';

import DayView from './DayView';
import ListView from './ListView';
import {Icon} from '../../../../components/Icon/Icon.js';
let allDayEventsAndTasks,
  allEvents,
  showEventsAndTasks = false;
class EventCalendar extends React.Component {
  constructor(props) {
    super(props);
    this.styles = styleConstructor(props.styles);
    this.state = {
      date: moment(this.props.initDate),
      index: this.props.size,
      allDayEvents: [],
      showAllEvents: false,
    };
  }
  componentDidMount() {
    // console.log('Event calendar mounted');
    allDayEventsAndTasks = emptyArray;
  }

  // static defaultProps = {
  //   size: 30,
  //   initDate: new Date(),
  //   formatHeader: 'DD MMMM YYYY',
  // };
  componentDidUpdate(prevProps, prevState) {
    if (prevState.date !== this.state.date) {
      allDayEventsAndTasks = emptyArray;
      this.props.getEvents(this.state.date);
    }
    if (prevProps.initDate !== this.props.initDate && this.props.selected) {
      this._goToPage(this.props.size);
    }
    if (
      this.props.eventChanged !== prevProps.eventChanged &&
      this.props.eventChanged
    ) {
      let a = new Date(this.props.eventChanged?.meeting.duration?.start);
      let eventDate = getTimeline(a, 'numberDate');
      let currentCalendarDate = getTimeline(this.state.date, 'numberDate');
      if (eventDate === currentCalendarDate) {
        this.props.getEvents(this.state.date);
      }
    }
    if (this.props.calendars !== prevProps.calendars) {
      if (this.props.calendars) {
        this.props.getEvents(this.state.date);
      }
    }
  }

  _getItemLayout(data, index) {
    const {width} = this.props;
    return {length: width, offset: width * index, index};
  }

  _getItem(events, index) {
    const date = moment(this.props.initDate).add(
      index - this.props.size,
      'days',
    );
    return _.filter(events, (event) => {
      const eventStartTime = moment(event?.duration?.start);
      return (
        eventStartTime >= date.clone().startOf('day') &&
        eventStartTime <= date.clone().endOf('day')
      );
    });
  }

  filterEvents(events, type) {
    //filter events based on event type
    let finalEvents = events;
    if (type === 'day') {
      finalEvents = events?.filter((e) => e.isAllDay !== true) || emptyArray;
    }
    let pendingEvents, defaultEvents;
    if (this.props.contentType === 'Pending Events') {
      pendingEvents =
        finalEvents.filter((e) => e.eventType === 'pending') || emptyArray;
      return [...pendingEvents];
    } else if (this.props.contentType === 'Meetings') {
      defaultEvents =
        finalEvents.filter((e) => e.eventType !== 'pending') || emptyArray;
      return [...defaultEvents];
    }
    return [...finalEvents];
  }

  _renderItem({index, item}) {
    const {width, format24h, initDate, scrollToFirst} = this.props;
    const date = moment(initDate).add(index - this.props.size, 'days');
    return (
      <View>
        {this.props.type ? (
          <DayView
            date={date}
            index={index}
            format24h={format24h}
            formatHeader={this.props.formatHeader}
            headerStyle={this.props.headerStyle}
            eventTapped={this.props.eventTapped}
            events={this.filterEvents(item, 'day')}
            width={width}
            styles={this.styles}
            scrollToFirst={scrollToFirst}
          />
        ) : (
          <ListView
            index={index}
            date={date}
            events={this.filterEvents(item, 'list')}
            tasks={this.props.tasks}
            eventTapped={this.props.eventTapped}
            width={width}
            styles={this.styles}
          />
        )}
      </View>
    );
  }

  _goToPage(index) {
    if (index <= 0 || index >= this.props.size * 2) {
      return;
    }
    const date = moment(this.props.initDate).add(
      index - this.props.size,
      'days',
    );
    this.refs.calendar.scrollToIndex({index, animated: true});
    this.setState({index, date});
  }
  renderEventsAndTasks() {
    let eventsAndTasks = [allEvents[0], this.props.tasks[0]];
    //console.log('Events and tasks', eventsAndTasks);
    return (
      <>
        {allEvents?.length > 2 ? (
          <TouchableOpacity
            style={[
              {
                marginLeft: -10,
                paddingRight: 10,
              },
              styles.arrowView,
            ]}
            onPress={() =>
              this.setState({
                showAllEvents: !this.state.showAllEvents,
              })
            }>
            <Icon name={'DownArrow'} size={15} color={'#202124'} />
            <Text style={styles.eventCountText}>+{allEvents?.length - 2}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{padding: 20}} />
        )}
        <View
          style={{
            width: '40.5%',
            paddingBottom: 7,
            flexDirection: 'row',
          }}>
          {eventsAndTasks?.map((item) => {
            return (
              <>
                <TouchableOpacity
                  style={[
                    {width: '100%'},
                    item?.type === 'task' || item?.type === 'subtask'
                      ? styles.taskView
                      : styles.allDayEventsView,
                  ]}
                  onPress={() => {
                    if (item?.type === 'task' || item?.type === 'subtask') {
                      Alert.alert('Viewing task is not yet enabled');
                    } else {
                      this.props.eventTapped(item);
                    }
                  }}>
                  <Text
                    numberOfLines={1}
                    style={
                      item?.type === 'task' || item?.type === 'subtask'
                        ? styles.taskText
                        : styles.allDayEventText
                    }>
                    {item?.title}
                  </Text>
                </TouchableOpacity>
                <View style={{padding: 5}} />
              </>
            );
          })}
        </View>
      </>
    );
  }

  render() {
    const {
      width,
      virtualizedListProps,
      events,
      initDate,
      formatHeader,
    } = this.props;
    let [dd, currentMonth] = getTimeline(this.state.date, 'meetings');
    let currentDay = getTimeline(this.state.date, 'message');
    allEvents = '';
    showEventsAndTasks = false;
    allEvents =
      this.props.events?.filter((e) => e.isAllDay === true) || emptyArray;
    if (this.props.tasks.length > 0 && allEvents.length > 0) {
      if (!this.state.showAllEvents) {
        showEventsAndTasks = true;
      } else {
        showEventsAndTasks = false;
      }
    }
    if (this.props.tasks) {
      allEvents = allEvents.concat(this.props.tasks);
    }
    if (this.state.showAllEvents) {
      allDayEventsAndTasks = allEvents;
    } else {
      if (allEvents.length > 0) {
        allDayEventsAndTasks = [allEvents[0]];
      }
    }

    console.log('showEventsAndTasks', showEventsAndTasks);
    return (
      <View>
        <View
          style={{
            overflow: 'hidden',
            paddingBottom: 5,
          }}>
          <View
            style={[
              styles.viewShadow,
              // this.props.type ? {height: 85} : {height: 55},
            ]}>
            <View style={styles.view1Style}>
              <View style={styles.view2Style}>
                <View
                  style={
                    currentDay !== 'Today'
                      ? styles.dateStyle
                      : styles.currentDateStyle
                  }>
                  <Text
                    style={
                      currentDay !== 'Today'
                        ? styles.dateTextStyle
                        : styles.currentDateTextStyle
                    }>
                    {dd}
                  </Text>
                </View>
                <View style={styles.monthDayStyle}>
                  <Text style={styles.monthDayText}>{currentMonth}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  this.props.todayTapped();
                }}
                style={styles.boxViewStyle}>
                <View style={styles.boxStyle}>
                  <Text style={styles.todayTextStyle}>Today</Text>
                </View>
              </TouchableOpacity>
            </View>
            {this.props.type ? (
              <View style={{flexDirection: 'row'}}>
                {showEventsAndTasks ? (
                  this.renderEventsAndTasks()
                ) : (
                  <>
                    {allEvents?.length > 1 ? (
                      <TouchableOpacity
                        style={[
                          {
                            marginLeft: !this.state.showAllEvents ? -10 : 0,
                            paddingRight: !this.state.showAllEvents ? 10 : 24,
                          },
                          styles.arrowView,
                        ]}
                        onPress={() =>
                          this.setState({
                            showAllEvents: !this.state.showAllEvents,
                          })
                        }>
                        <Icon
                          name={
                            !this.state.showAllEvents ? 'DownArrow' : 'UpArrow'
                          }
                          size={15}
                          color={'#202124'}
                        />
                        {!this.state.showAllEvents ? (
                          <Text style={styles.eventCountText}>
                            +{allEvents?.length - 1}
                          </Text>
                        ) : null}
                      </TouchableOpacity>
                    ) : (
                      <View style={{padding: 20}} />
                    )}
                    <View style={styles.view3Style}>
                      {allEvents &&
                        allDayEventsAndTasks?.map((item) => {
                          return (
                            <TouchableOpacity
                              style={
                                item?.type === 'task' ||
                                item?.type === 'subtask'
                                  ? styles.taskView
                                  : styles.allDayEventsView
                              }
                              onPress={() => {
                                if (
                                  item?.type === 'task' ||
                                  item?.type === 'subtask'
                                ) {
                                  Alert.alert(
                                    'Viewing task is not yet enabled',
                                  );
                                } else {
                                  this.props.eventTapped(item);
                                }
                              }}>
                              <Text
                                style={
                                  item?.type === 'task' ||
                                  item?.type === 'subtask'
                                    ? styles.taskText
                                    : styles.allDayEventText
                                }>
                                {item?.title}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                    </View>
                  </>
                )}
              </View>
            ) : null}
          </View>

          {/* {this.props.type ? (
            <View style={{height: '100%'}}>
              {allDayEvents?.map((item) => {
                return (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'column',
                      marginTop: 35,
                      marginLeft: 40,
                      width: '83%',
                      borderRadius: 4,
                      backgroundColor: '#288CFA',
                    }}
                    onPress={() => {}}>
                    <Text style={{padding: 5}}>{item?.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null} */}
        </View>
        <VirtualizedList
          ref="calendar"
          windowSize={2}
          initialNumToRender={2}
          initialScrollIndex={this.props.size}
          data={events}
          getItemCount={() => this.props.size * 2}
          getItem={this._getItem.bind(this)}
          onTouchStart={() => {
            this.props.showCalendar ? this.props.cancelShowCalendar() : null;
          }}
          keyExtractor={(item, index) => index.toString()}
          getItemLayout={this._getItemLayout.bind(this)}
          horizontal
          pagingEnabled
          renderItem={this._renderItem.bind(this)}
          onChange={(event) => {
            console.log('On change', event);
          }}
          style={{width: width}}
          onMomentumScrollEnd={(event) => {
            //console.log('Scroll started', event);
            const index = parseInt(event.nativeEvent.contentOffset.x / width);
            const date = moment(this.props.initDate).add(
              index - this.props.size,
              'days',
            );
            let initialDate = new Date(date).getDate(),
              afterScrollDate = new Date(this.state.date).getDate();
            if (initialDate !== afterScrollDate) {
              this.setState({index, date});
            }
          }}
          {...virtualizedListProps}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const {meetingsReducer} = state;
  return {
    allEvents: meetingsReducer.meetEvents?.items,
    calendars: meetingsReducer.calendars,
    eventChanged: meetingsReducer.eventChanged,
  };
};

export default connect(mapStateToProps, {})(EventCalendar);

const styles = StyleSheet.create({
  viewShadow: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    //flexDirection: 'row',
    paddingLeft: 20,
  },
  currentDateStyle: {
    width: 29.7,
    height: 29.7,
    justifyContent: 'center',
    borderRadius: 29.7 / 2,
    marginEnd: 10,
    //paddingVertical: 5,
    alignItems: 'center',
    backgroundColor: '#0D6EFD',
    padding: 2,
  },
  view1Style: {flexDirection: 'row', height: 45},
  view2Style: {flexDirection: 'row', flex: 1, alignItems: 'center'},
  view3Style: {width: '84%', paddingBottom: 7},
  allDayEventText: {
    paddingLeft: 10,
    paddingTop: 5,
    paddingBottom: 7,
    fontWeight: '500',
    fontSize: normalize(14),
    color: '#FFFFFF',
  },
  taskText: {
    paddingLeft: 10,
    paddingTop: 5,
    paddingBottom: 7,
    fontWeight: '500',
    fontSize: normalize(14),
    color: '#FF784B',
  },
  allDayEventsView: {
    marginTop: 5,
    borderRadius: 4,
    backgroundColor: '#288CFA',
  },
  taskView: {
    marginTop: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FF784B',
    backgroundColor: '#FFF1ED',
  },
  arrowView: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventCountText: {
    fontSize: normalize(16),
    fontWeight: '500',
    marginLeft: 3,
  },
  dateStyle: {
    width: 29.7,
    height: 29.7,
    justifyContent: 'center',
    borderRadius: 29.7 / 2,
    marginEnd: 10,
    //paddingVertical: 5,
    alignItems: 'center',
    backgroundColor: '#EFF0F1',
    //padding: 2,
  },
  currentDateTextStyle: {
    color: '#FFFFFF',
    fontSize: normalize(16),
  },
  dateTextStyle: {
    color: '#202124',
    fontSize: normalize(16),
  },
  monthDayText: {
    fontWeight: '500',
    fontSize: normalize(16),
    color: '#202124',
  },
  monthDayStyle: {
    flex: 0,
    padding: 4,
    paddingLeft: 0,
  },
  boxStyle: {
    borderColor: '#E4E5E7',
    borderWidth: 1,
    padding: 15,
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: 4,
    marginBottom: 8,
    justifyContent: 'center',
  },
  boxViewStyle: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginEnd: 18,
  },
  todayTextStyle: {
    color: '#202124',
    fontSize: normalize(14),
    fontWeight: '400',
    padding: 5,
  },
});
