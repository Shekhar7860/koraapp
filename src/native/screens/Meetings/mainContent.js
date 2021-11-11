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
} from 'react-native';
import {Icon} from '../../components/Icon/Icon.js';
import {getTimeline, normalize} from '../../utils/helpers';
import EventCalendar from '../../components/Library/react-native-events-calendar';
import {
  getAllEvents,
  getAllTasks,
} from '../../../shared/redux/actions/meetings.action';
import * as UsersDao from '../../../dao/UsersDao';
import {Calendar} from 'react-native-calendars';
import {emptyArray} from '../../../shared/redux/constants/common.constants.js';
import MeetDetails from './MeetDetails/details';
import {navigate} from '../../navigation/NavigationService';
import {ROUTE_NAMES} from '../../navigation/RouteNames';

//import {Calendar} from 'react-native-big-calendar';
//import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

class ContentView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allEvents: '',
      updated: false,
      allTasks: [],
    };
  }

  onSelect = (data) => {
    this.setState(data);
  };

  componentDidMount() {
    this.getEvents(new Date());
    this.getTasks();
  }

  componentDidUpdate(prevProps) {
    if (prevProps?.tasks !== this.props?.tasks) {
      if (this.props.tasks) {
        let tasks = this.props?.tasks?.filter(
          (item) => item?.assignTo === UsersDao.getUserId() && !item?.dOn,
        );
        this.setState({allTasks: tasks});
      }
    }
  }

  eventClicked(event) {
    // console.log('Event type', event?.eventType);
    if (event?.eventType === 'pending') {
      navigate(ROUTE_NAMES.NEW_MEETING, {
        onSelect: this.onSelect,
        mrIdOrEventId: event?.mrIdOrEventId,
        isNewMeeting: false,
        event: event,
      });
    } else {
      navigate(ROUTE_NAMES.MEETING_DETAILS, {
        onSelect: this.onSelect,
        eventId: event?.eventId,
        event: event,
      });
    }
  }
  getEvents(date) {
    //console.log('Get events called');
    let _params = {
      userId: UsersDao.getUserId(),
    };

    var now = new Date(date).getTime();
    var endOfDay = moment(now).endOf('day').toDate();
    var startOfDay = moment(now).startOf('day').toDate();
    let payload = {
      singleEvent: false,
      maxResults: 100,
      endtime: endOfDay,
      starttime: startOfDay,
      timeZone: 'Asia/Kolkata',
    };
    this.props.getAllEvents(_params, payload);
  }

  getTasks() {
    this.props.getAllTasks();
  }

  render() {
    return (
      <View style={styles.container}>
        <EventCalendar
          eventTapped={(event) => this.eventClicked(event)}
          getEvents={(date) => this.getEvents(date)}
          events={this.props?.allEvents}
          tasks={this.state.allTasks}
          width={width}
          size={30}
          type={this.props.type}
          contentType={this.props.contentType}
          //headerStyle={{backgroundColor: 'blue', fontSize: normalize(30)}}
          //renderEvent={(event) => this.renderEvent(event)}
          //number of date will render before and after initDate
          //(default is 30 will render 30 day before initDate and 29 day after initDate)
          styles={{
            event: {
              //backgroundColor: '#288CFA',
              opacity: 1,
            },
          }}
          todayTapped={() => this.props.todayTapped()}
          selected={this.props.selected}
          initDate={this.props.selectedDate}
          scrollToFirst
          cancelShowCalendar={() => this.props.dismissCalendar()}
          showCalendar={this.props.showCalendar}
        />
      </View>
    );
  }
}

const mapStateToProps = (state, meetEvents) => {
  const {meetingsReducer} = state;
  return {
    eventDeleted: meetingsReducer.eventDeleted,
    allEvents: meetingsReducer.meetEvents?.events,
    tasks: meetingsReducer.allTasks?.tasks,
  };
};

export default connect(mapStateToProps, {getAllEvents, getAllTasks})(
  ContentView,
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
